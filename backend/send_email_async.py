"""
Async email sending to prevent timeouts
"""
import threading
from app.email_utils import (
    send_registration_welcome_email,
    send_application_submitted_email,
    send_application_status_email,
    send_internal_application_alert
)

def send_welcome_email_async(recipient, first_name):
    """Send welcome email in background thread"""
    def send():
        try:
            send_registration_welcome_email(recipient, first_name)
            print(f"Welcome email sent successfully to {recipient}")
        except Exception as e:
            print(f"Failed to send welcome email to {recipient}: {str(e)}")
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()

def send_application_email_async(recipient, applicant_name, category_name, application_id):
    """Send application submitted email in background thread"""
    def send():
        try:
            send_application_submitted_email(recipient, applicant_name, category_name, application_id)
            print(f"Application email sent successfully to {recipient}")
        except Exception as e:
            print(f"Failed to send application email to {recipient}: {str(e)}")
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()

def send_internal_alert_async(recipient, applicant_name, applicant_email, applicant_phone, category_name, application_id):
    """Send internal alert email in background thread"""
    def send():
        try:
            send_internal_application_alert(
                recipient, applicant_name, applicant_email, 
                applicant_phone, category_name, application_id
            )
            print(f"Internal alert sent successfully to {recipient}")
        except Exception as e:
            print(f"Failed to send internal alert to {recipient}: {str(e)}")
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()

def send_status_email_async(recipient, applicant_name, category_name, status, application_id):
    """Send status update email in background thread"""
    def send():
        try:
            send_application_status_email(
                recipient, applicant_name, category_name, 
                status, application_id
            )
            print(f"Status email sent successfully to {recipient}")
        except Exception as e:
            print(f"Failed to send status email to {recipient}: {str(e)}")
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()
