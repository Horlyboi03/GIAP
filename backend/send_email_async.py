"""
Async email sending using Brevo API
"""
import threading
from brevo_email import send_welcome_email, send_application_submitted_email, send_status_update_email

def send_welcome_email_async(app, recipient, first_name):
    """Send welcome email in background thread"""
    def send():
        with app.app_context():
            try:
                send_welcome_email(recipient, first_name)
            except Exception as e:
                print(f"✗ Failed to send welcome email to {recipient}: {str(e)}")
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()

def send_application_email_async(app, recipient, applicant_name, category_name, application_id):
    """Send application submitted email in background thread"""
    def send():
        with app.app_context():
            try:
                application_reference = f"GIAP-{application_id:06d}"
                send_application_submitted_email(recipient, applicant_name, category_name, application_reference)
            except Exception as e:
                print(f"✗ Failed to send application email to {recipient}: {str(e)}")
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()

def send_internal_alert_async(app, recipient, applicant_name, applicant_email, applicant_phone, category_name, application_id):
    """Send internal alert email in background thread"""
    def send():
        with app.app_context():
            try:
                from brevo_email import send_brevo_email
                application_reference = f"GIAP-{application_id:06d}"
                subject = f"New Application Submitted - {application_reference}"
                html_content = f"""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>New Grant Application Received</h2>
                    <h3>Applicant Information:</h3>
                    <ul>
                        <li><strong>Name:</strong> {applicant_name}</li>
                        <li><strong>Email:</strong> {applicant_email}</li>
                        <li><strong>Phone:</strong> {applicant_phone}</li>
                    </ul>
                    <h3>Application Details:</h3>
                    <ul>
                        <li><strong>Reference:</strong> {application_reference}</li>
                        <li><strong>Category:</strong> {category_name}</li>
                    </ul>
                    <p>Please review this application in the admin dashboard.</p>
                </body>
                </html>
                """
                send_brevo_email(recipient, subject, html_content, "GIAP System")
            except Exception as e:
                print(f"✗ Failed to send internal alert to {recipient}: {str(e)}")
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()

def send_status_email_async(app, recipient, applicant_name, category_name, status, application_id):
    """Send status update email in background thread"""
    def send():
        with app.app_context():
            try:
                application_reference = f"GIAP-{application_id:06d}"
                send_status_update_email(recipient, applicant_name, category_name, status, application_reference)
            except Exception as e:
                print(f"✗ Failed to send status email to {recipient}: {str(e)}")
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()
