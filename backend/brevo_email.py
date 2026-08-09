"""
Brevo email integration for sending transactional emails
"""
import os
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

# Configure Brevo API
configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = os.environ.get('BREVO_API_KEY')

api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

def send_brevo_email(recipient, subject, html_content, sender_name="GIAP Grant Team"):
    """Send email using Brevo API"""
    sender_email = os.environ.get('MAIL_USERNAME', 'giapgrantteam@gmail.com')
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": recipient}],
        sender={"name": sender_name, "email": sender_email},
        subject=subject,
        html_content=html_content
    )
    
    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"✓ Brevo email sent successfully to {recipient}: {api_response}")
        return True
    except ApiException as e:
        print(f"✗ Failed to send Brevo email to {recipient}: {e}")
        return False

def send_welcome_email(recipient, first_name):
    """Send welcome email"""
    subject = "Welcome to GIAP - Your Grant Application Journey Starts Here"
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Welcome to GIAP, {first_name}!</h2>
        <p>Thank you for registering with the Grant Impact Assistance Program (GIAP).</p>
        <p>We're excited to have you as part of our community dedicated to making positive change through grant funding.</p>
        <h3>What's Next?</h3>
        <ul>
            <li>Complete your profile information</li>
            <li>Browse available grant categories</li>
            <li>Submit your grant application</li>
        </ul>
        <p>If you have any questions, feel free to reply to this email or contact us at giapteam@outlook.com.</p>
        <p>Best regards,<br>The GIAP Team</p>
    </body>
    </html>
    """
    return send_brevo_email(recipient, subject, html_content)

def send_application_submitted_email(recipient, applicant_name, category_name, application_reference):
    """Send application submission confirmation"""
    subject = f"GIAP Application Received - {application_reference}"
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Application Submitted Successfully</h2>
        <p>Hello {applicant_name},</p>
        <p>We have successfully received your GIAP grant application.</p>
        <h3>Application Details:</h3>
        <ul>
            <li><strong>Application Reference:</strong> {application_reference}</li>
            <li><strong>Grant Category:</strong> {category_name}</li>
            <li><strong>Status:</strong> Pending Review</li>
        </ul>
        <p>Our team will review your application and get back to you soon.</p>
        <p>You can track your application status by logging into your dashboard.</p>
        <p>Thank you for applying!</p>
        <p>Best regards,<br>The GIAP Team</p>
    </body>
    </html>
    """
    return send_brevo_email(recipient, subject, html_content)

def send_status_update_email(recipient, applicant_name, category_name, status, application_reference):
    """Send application status update"""
    status_text = "Approved" if status == "approved" else "Declined"
    subject = f"GIAP Application {status_text} - {application_reference}"
    
    if status == "approved":
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #28a745;">Congratulations, {applicant_name}!</h2>
            <p>We are pleased to inform you that your GIAP application for {category_name} has been <strong>approved</strong>.</p>
            <h3>Application Details:</h3>
            <ul>
                <li><strong>Application Reference:</strong> {application_reference}</li>
                <li><strong>Grant Category:</strong> {category_name}</li>
                <li><strong>Status:</strong> Approved</li>
            </ul>
            <p>Our team will contact you soon with next steps regarding your grant disbursement.</p>
            <p>Thank you for choosing GIAP!</p>
            <p>Best regards,<br>The GIAP Team</p>
        </body>
        </html>
        """
    else:
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Application Status Update</h2>
            <p>Hello {applicant_name},</p>
            <p>Thank you for your interest in the GIAP grant program.</p>
            <p>After careful review, we regret to inform you that your application for {category_name} has not been approved at this time.</p>
            <h3>Application Details:</h3>
            <ul>
                <li><strong>Application Reference:</strong> {application_reference}</li>
                <li><strong>Grant Category:</strong> {category_name}</li>
                <li><strong>Status:</strong> Declined</li>
            </ul>
            <p>We encourage you to review our grant criteria and consider reapplying in the future.</p>
            <p>If you have any questions, please contact us at giapteam@outlook.com.</p>
            <p>Best regards,<br>The GIAP Team</p>
        </body>
        </html>
        """
    return send_brevo_email(recipient, subject, html_content)
