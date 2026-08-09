"""
Update old application references to new GIAP-XXXXXXXX format
Run this once to update existing applications
"""
from app import create_app, db
from app.models import GrantApplication
from app.email_utils import generate_application_reference

def update_old_application_references():
    """Update applications with old format references to new alphanumeric format"""
    app = create_app()
    
    with app.app_context():
        # Find applications with old format or no reference
        applications = GrantApplication.query.all()
        updated_count = 0
        
        for application in applications:
            # Check if reference is None, empty, or in old format (GIAP-000001 to GIAP-999999)
            if (not application.reference or 
                application.reference.startswith('GIAP-0') or 
                application.reference.startswith('GA')):
                
                old_reference = application.reference
                # Generate new alphanumeric reference
                application.reference = generate_application_reference()
                updated_count += 1
                print(f"Updated application ID {application.id}: {old_reference} → {application.reference}")
        
        if updated_count > 0:
            db.session.commit()
            print(f"\n✓ Successfully updated {updated_count} application reference(s)")
        else:
            print("\n✓ No applications needed updating")

if __name__ == '__main__':
    update_old_application_references()
