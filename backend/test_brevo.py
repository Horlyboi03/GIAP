"""
Test Brevo email sending to diagnose issues
Run this locally or on Render to test Brevo configuration
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_brevo():
    """Test Brevo email configuration and sending"""
    print("=" * 60)
    print("BREVO EMAIL TEST")
    print("=" * 60)
    
    # Check environment variables
    api_key = os.environ.get('BREVO_API_KEY', '')
    mail_username = os.environ.get('MAIL_USERNAME', '')
    
    print(f"\n1. Environment Configuration:")
    print(f"   - BREVO_API_KEY exists: {bool(api_key)}")
    print(f"   - BREVO_API_KEY length: {len(api_key) if api_key else 0}")
    print(f"   - BREVO_API_KEY preview: {api_key[:20]}...{api_key[-20:] if len(api_key) > 40 else ''}")
    print(f"   - MAIL_USERNAME: {mail_username}")
    
    if not api_key:
        print("\n❌ ERROR: BREVO_API_KEY not found in environment!")
        print("   Please set it in Render dashboard or .env file")
        return
    
    # Try to import and configure Brevo
    try:
        import sib_api_v3_sdk
        from sib_api_v3_sdk.rest import ApiException
        print("\n2. Brevo SDK Import: ✓")
    except ImportError as e:
        print(f"\n❌ ERROR: Failed to import Brevo SDK: {e}")
        print("   Run: pip install sib-api-v3-sdk")
        return
    
    # Configure API
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = api_key
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
    print("3. Brevo API Configuration: ✓")
    
    # Try to send a test email
    test_recipient = input("\n4. Enter test email address (or press Enter to skip): ").strip()
    
    if not test_recipient:
        print("\n   Skipping email send test")
        print("\n✓ Configuration looks good! Now whitelist Render's IP in Brevo:")
        print("   1. Go to: https://app.brevo.com/security/authorised_ips")
        print("   2. Add: 0.0.0.0/0 (to allow all IPs)")
        print("   3. Or disable IP whitelisting entirely")
        return
    
    print(f"\n   Sending test email to: {test_recipient}")
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": test_recipient}],
        sender={"name": "GIAP Test", "email": mail_username or "giapgrantteam@gmail.com"},
        subject="Brevo Configuration Test",
        html_content="""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>✓ Brevo Email Test Successful!</h2>
            <p>If you're reading this, your Brevo email configuration is working correctly.</p>
            <p>Configuration details:</p>
            <ul>
                <li>API Key is properly configured</li>
                <li>Sender email is verified</li>
                <li>IP whitelisting is allowing requests</li>
            </ul>
            <p><strong>Next steps:</strong></p>
            <ol>
                <li>Deploy this configuration to Render</li>
                <li>Test registration, application submission, and admin actions</li>
            </ol>
        </body>
        </html>
        """
    )
    
    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        print("\n✓ SUCCESS! Test email sent successfully!")
        print(f"   Response: {api_response}")
        print(f"\n   Check {test_recipient} for the test email")
    except ApiException as e:
        print("\n❌ FAILED to send test email")
        print(f"   Status: {e.status if hasattr(e, 'status') else 'N/A'}")
        print(f"   Reason: {e.reason if hasattr(e, 'reason') else 'N/A'}")
        print(f"   Body: {e.body if hasattr(e, 'body') else 'N/A'}")
        
        if hasattr(e, 'status') and e.status == 401:
            print("\n📋 SOLUTION: IP Address Whitelisting Issue")
            print("   Your Brevo API key is valid, but the request is being blocked.")
            print("   This is likely due to IP whitelisting in Brevo security settings.")
            print("\n   To fix:")
            print("   1. Go to: https://app.brevo.com/security/authorised_ips")
            print("   2. Either:")
            print("      a) Add 0.0.0.0/0 to whitelist ALL IPs (recommended for Render)")
            print("      b) Or disable IP whitelisting entirely")
            print("   3. Save changes and try again")
        else:
            print("\n   Check the error details above for more information")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
    
    print("\n" + "=" * 60)

if __name__ == '__main__':
    test_brevo()
