import json
import secrets
import string
import urllib.request

from flask import current_app
from flask_mail import Message

from app import db, mail
from app.models import EmailLog, GrantApplication


# #region debug-point A:report-helper
def _report_debug_event(run_id, hypothesis_id, location, msg, data=None):
    payload = {
        'sessionId': 'smtp-email-failure',
        'runId': run_id,
        'hypothesisId': hypothesis_id,
        'location': location,
        'msg': msg,
        'data': data or {},
    }

    url = 'http://127.0.0.1:7777/event'
    try:
        with open('.dbg/smtp-email-failure.env', 'r', encoding='utf-8') as env_file:
            for line in env_file:
                if line.startswith('DEBUG_SERVER_URL='):
                    url = line.split('=', 1)[1].strip() or url
    except Exception:
        pass

    try:
        request = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
        )
        urllib.request.urlopen(request, timeout=2).read()
    except Exception:
        pass
# #endregion


def generate_application_reference(length=8):
    """Generate unique application reference like GIAP-A1B2C3D4"""
    alphabet = string.ascii_uppercase + string.digits
    while True:
        reference = 'GIAP-' + ''.join(secrets.choice(alphabet) for _ in range(length))
        if not GrantApplication.query.filter_by(reference=reference).first():
            return reference


def format_application_reference(application_id):
    """Format application reference - returns existing reference or generates new format"""
    if application_id is None:
        return None

    if isinstance(application_id, str):
        return application_id

    application = GrantApplication.query.get(int(application_id))
    if application and getattr(application, 'reference', None):
        return application.reference

    # Fallback format for old applications without reference
    return f'GIAP-{int(application_id):08d}'


def _send_email(recipient, subject, body, html_body=None):
    if not recipient:
        return False

    sender_email = current_app.config.get('MAIL_USERNAME') or current_app.config.get('MAIL_DEFAULT_SENDER')
    # #region debug-point A:send-email-entry
    _report_debug_event(
        'pre-fix',
        'A',
        'backend/app/email_utils.py:_send_email:entry',
        '[DEBUG] Entered email send helper',
        {
            'recipient': recipient,
            'subject': subject,
            'mail_server': current_app.config.get('MAIL_SERVER'),
            'mail_port': current_app.config.get('MAIL_PORT'),
            'mail_use_tls': current_app.config.get('MAIL_USE_TLS'),
            'mail_username': current_app.config.get('MAIL_USERNAME'),
            'mail_default_sender': current_app.config.get('MAIL_DEFAULT_SENDER'),
            'sender_email': sender_email,
        },
    )
    # #endregion
    message = Message(
        subject=subject,
        recipients=[recipient],
        body=body,
        sender=sender_email,
        reply_to=current_app.config.get('MAIL_DEFAULT_SENDER') or sender_email
    )
    if html_body:
        message.html = html_body

    try:
        # #region debug-point B:before-mail-send
        _report_debug_event(
            'pre-fix',
            'B',
            'backend/app/email_utils.py:_send_email:before_mail_send',
            '[DEBUG] About to call Flask-Mail send',
            {
                'recipient': recipient,
                'subject': subject,
            },
        )
        # #endregion
        mail.send(message)
        # #region debug-point B:after-mail-send
        _report_debug_event(
            'pre-fix',
            'B',
            'backend/app/email_utils.py:_send_email:after_mail_send',
            '[DEBUG] Flask-Mail send returned successfully',
            {
                'recipient': recipient,
                'subject': subject,
            },
        )
        # #endregion
        db.session.add(EmailLog(recipient=recipient, subject=subject))
        # #region debug-point D:before-email-log-commit
        _report_debug_event(
            'pre-fix',
            'D',
            'backend/app/email_utils.py:_send_email:before_log_commit',
            '[DEBUG] About to commit EmailLog entry',
            {
                'recipient': recipient,
                'subject': subject,
            },
        )
        # #endregion
        db.session.commit()
        # #region debug-point D:after-email-log-commit
        _report_debug_event(
            'pre-fix',
            'D',
            'backend/app/email_utils.py:_send_email:after_log_commit',
            '[DEBUG] EmailLog commit completed',
            {
                'recipient': recipient,
                'subject': subject,
            },
        )
        # #endregion
        return True
    except Exception as exc:
        # #region debug-point B:send-email-exception
        _report_debug_event(
            'pre-fix',
            'B',
            'backend/app/email_utils.py:_send_email:exception',
            '[DEBUG] Email send helper raised an exception',
            {
                'recipient': recipient,
                'subject': subject,
                'error_type': type(exc).__name__,
                'error_message': str(exc),
            },
        )
        # #endregion
        db.session.rollback()
        current_app.logger.warning('Failed to send email to %s: %s', recipient, exc)
        return False


def send_application_submitted_email(recipient, applicant_name, category_name, application_id):
    application_reference = format_application_reference(application_id)
    subject = 'GIAP Application Received'
    body = (
        f'Hello {applicant_name},\n\n'
        f'Your GIAP application has been received successfully.\n\n'
        f'Application ID: {application_reference}\n'
        f'Grant Category: {category_name}\n\n'
        'Our team will review your application and notify you as soon as there is an update.\n\n'
        'Thank you for applying to GIAP.'
    )
    return _send_email(recipient, subject, body)


def send_registration_welcome_email(recipient, first_name):
    subject = 'Welcome to GIAP'
    body = (
        f'Hello {first_name or "Applicant"},\n\n'
        'Your GIAP account has been created successfully.\n\n'
        'You can now sign in, complete your profile, and submit your grant application.\n\n'
        'Thank you for joining GIAP.'
    )
    return _send_email(recipient, subject, body)


def send_password_reset_email(recipient, first_name, reset_url):
    subject = 'Reset your GIAP password'
    body = (
        f'Hello {first_name or "Applicant"},\n\n'
        'We received a request to reset your GIAP account password.\n\n'
        f'Reset Link: {reset_url}\n\n'
        'This link will expire in 1 hour. If you did not request a password reset, you can ignore this email.\n\n'
        'Thank you for using GIAP.'
    )
    html_body = (
        f'<p>Hello {first_name or "Applicant"},</p>'
        '<p>We received a request to reset your GIAP account password.</p>'
        f'<p><a href="{reset_url}" '
        'style="display:inline-block;padding:12px 20px;background:#1d4ed8;color:#ffffff;'
        'text-decoration:none;border-radius:10px;font-weight:600;">Reset Password</a></p>'
        f'<p>If the button does not open, use this link:<br><a href="{reset_url}">{reset_url}</a></p>'
        '<p>This link will expire in 1 hour. If you did not request a password reset, you can ignore this email.</p>'
        '<p>Thank you for using GIAP.</p>'
    )
    return _send_email(recipient, subject, body, html_body=html_body)


def send_password_changed_email(recipient, first_name):
    subject = 'Your GIAP password was updated'
    body = (
        f'Hello {first_name or "Applicant"},\n\n'
        'This is a confirmation that your GIAP account password has been updated successfully.\n\n'
        'If you did not make this change, please reset your password immediately and contact support.\n\n'
        'Thank you for using GIAP.'
    )
    html_body = (
        f'<p>Hello {first_name or "Applicant"},</p>'
        '<p>This is a confirmation that your GIAP account password has been updated successfully.</p>'
        '<p>If you did not make this change, please reset your password immediately and contact support.</p>'
        '<p>Thank you for using GIAP.</p>'
    )
    return _send_email(recipient, subject, body, html_body=html_body)


def send_internal_application_alert(recipient, applicant_name, applicant_email, applicant_phone, category_name, application_id):
    application_reference = format_application_reference(application_id)
    subject = f'New GIAP Application: {category_name}'
    body = (
        'A new GIAP application has been submitted.\n\n'
        f'Applicant: {applicant_name}\n'
        f'Email: {applicant_email or "Not provided"}\n'
        f'Phone: {applicant_phone or "Not provided"}\n'
        f'Grant Category: {category_name}\n'
        f'Application ID: {application_reference}\n\n'
        'Please log in to the admin dashboard to review the submission.'
    )
    return _send_email(recipient, subject, body)


def send_application_status_email(recipient, applicant_name, category_name, status, application_id=None):
    normalized_status = 'Declined' if status == 'rejected' else status.replace('_', ' ').title()
    application_reference = format_application_reference(application_id) if application_id else None

    if status == 'approved':
        subject = 'GIAP Application Approved'
        ref_line = f"Application ID: {application_reference}\n" if application_reference else ""
        body = (
            f'Hello {applicant_name},\n\n'
            f'We are pleased to let you know that your GIAP application for {category_name} has been approved.\n\n'
            f'Application Status: {normalized_status}\n'
            f'{ref_line}'
            '\n'
            'Your submitted details have been reviewed and approved by our team. '
            'Please keep an eye on this email address for any next-step instructions from GIAP.\n\n'
            'If you have any questions, you can reply to this email or contact giapteam@outlook.com.\n\n'
            'Thank you for choosing GIAP.'
        )
    elif status == 'rejected':
        subject = 'GIAP Application Declined'
        ref_line = f"Application ID: {application_reference}\n" if application_reference else ""
        body = (
            f'Hello {applicant_name},\n\n'
            f'This is to let you know that your GIAP application for {category_name} was not approved at this time.\n\n'
            f'Application Status: {normalized_status}\n'
            f'{ref_line}'
            '\n'
            'Please log in to your dashboard to review the latest update. '
            'If you need assistance, contact giapteam@outlook.com.\n\n'
            'Thank you for using GIAP.'
        )
    else:
        subject = f'GIAP Application {normalized_status}'
        ref_line = f"Application ID: {application_reference}\n" if application_reference else ""
        body = (
            f'Hello {applicant_name},\n\n'
            f'There is an update on your GIAP application for {category_name}.\n\n'
            f'Current Status: {normalized_status}\n'
            f'{ref_line}'
            '\n'
            'Please log in to your dashboard to view the latest details.\n\n'
            'Thank you for using GIAP.'
        )

    return _send_email(recipient, subject, body)
