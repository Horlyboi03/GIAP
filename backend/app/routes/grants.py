from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models import GrantCategory, GrantApplication, Applicant, Notification, FAQ, Testimonial
from app.email_utils import (
    _report_debug_event,
    generate_application_reference,
    send_application_submitted_email,
    send_internal_application_alert,
    format_application_reference,
)
from datetime import datetime, timedelta

bp = Blueprint('grants', __name__, url_prefix='/api/grants')


def serialize_application(application):
    return {
        'id': application.id,
        'application_reference': application.reference or format_application_reference(application.id),
        'category_id': application.category_id,
        'category': application.category.name if application.category else 'Unknown Category',
        'requested_amount': application.requested_amount,
        'status': application.status,
        'submitted_at': application.submitted_at.isoformat(),
        'purpose': application.purpose,
        'impact': application.impact,
        'fund_usage': application.fund_usage,
        'expected_outcomes': application.expected_outcomes,
        'digital_signature': application.digital_signature
    }

@bp.route('/categories', methods=['GET'])
def get_categories():
    categories = GrantCategory.query.all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'description': c.description,
        'min_amount': c.min_amount,
        'max_amount': c.max_amount
    } for c in categories])

@bp.route('/applications', methods=['POST'])
@jwt_required()
def submit_application():
    try:
        identity = get_jwt_identity()
        claims = get_jwt()
        print(f"DEBUG: JWT Identity: {identity}")
    except Exception as e:
        print(f"DEBUG: JWT Error: {str(e)}")
        return jsonify({'message': f'Authentication error: {str(e)}'}), 422
        
    if claims.get('role') != 'applicant':
        return jsonify({'message': 'Unauthorized'}), 403
        
    applicant = Applicant.query.filter_by(user_id=int(identity)).first_or_404()
    data = request.get_json() or {}
    
    print(f"DEBUG: Received application data: {data}")

    latest_application = GrantApplication.query.filter_by(applicant_id=applicant.id).order_by(GrantApplication.submitted_at.desc()).first()
    if latest_application:
        can_reapply_at = latest_application.submitted_at + timedelta(hours=48)
        if can_reapply_at > datetime.utcnow():
            remaining_seconds = (can_reapply_at - datetime.utcnow()).total_seconds()
            remaining_hours = max(1, int((remaining_seconds + 3599) // 3600))
            return jsonify({
                'message': 'You submitted an application recently. Please wait 48 hours before starting a new one.',
                'can_reapply_at': can_reapply_at.isoformat(),
                'latest_application_id': latest_application.id,
                'remaining_hours': remaining_hours
            }), 429
    
    # Validate required fields
    required_fields = ['category_id', 'purpose', 'impact', 'requested_amount', 'fund_usage', 'expected_outcomes']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({'message': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    try:
        # Convert category_id to int if it's a string
        category_id = int(data['category_id']) if data['category_id'] else None
        requested_amount = float(data['requested_amount']) if data['requested_amount'] else None

        category = GrantCategory.query.get(category_id)
        if not category:
            return jsonify({'message': 'Selected grant category does not exist'}), 400
        
        application = GrantApplication(
            reference=generate_application_reference(),
            applicant_id=applicant.id,
            category_id=category_id,
            purpose=data['purpose'],
            impact=data['impact'],
            requested_amount=requested_amount,
            fund_usage=data['fund_usage'],
            expected_outcomes=data['expected_outcomes'],
            digital_signature=data.get('digital_signature', '')
        )
        db.session.add(application)
        
        notification = Notification(
            applicant_id=applicant.id,
            title='Application Submitted',
            message='Your grant application has been successfully submitted and is pending review.'
        )
        db.session.add(notification)
        
        db.session.commit()
        
        # Note: Email notifications disabled to prevent timeout on free tier
        # Emails can be sent manually by admin or via scheduled job
        
        print(f"DEBUG: Application created successfully with ID: {application.id}")
        return jsonify({
            'message': 'Application submitted successfully',
            'application_id': application.id,
            'application_reference': application.reference
        }), 201
    except ValueError as e:
        print(f"DEBUG: ValueError: {str(e)}")
        return jsonify({'message': f'Invalid data format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        print(f"DEBUG: Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Error submitting application: {str(e)}'}), 500

@bp.route('/applications', methods=['GET'])
@jwt_required()
def get_applications():
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'applicant':
        return jsonify({'message': 'Unauthorized'}), 403
        
    applicant = Applicant.query.filter_by(user_id=int(identity)).first_or_404()
    applications = GrantApplication.query.filter_by(applicant_id=applicant.id).order_by(GrantApplication.submitted_at.desc()).all()
    
    return jsonify([serialize_application(application) for application in applications])


@bp.route('/applications/<int:application_id>', methods=['GET'])
@jwt_required()
def get_application(application_id):
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'applicant':
        return jsonify({'message': 'Unauthorized'}), 403

    applicant = Applicant.query.filter_by(user_id=int(identity)).first_or_404()
    application = GrantApplication.query.filter_by(id=application_id, applicant_id=applicant.id).first_or_404()
    return jsonify(serialize_application(application))

@bp.route('/faqs', methods=['GET'])
def get_faqs():
    faqs = FAQ.query.order_by(FAQ.order).all()
    return jsonify([{
        'id': f.id,
        'question': f.question,
        'answer': f.answer
    } for f in faqs])

@bp.route('/testimonials', methods=['GET'])
def get_testimonials():
    testimonials = Testimonial.query.order_by(Testimonial.created_at.desc()).all()
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'country': t.country,
        'grant_amount': t.grant_amount,
        'story': t.story,
        'photo_url': t.photo_url
    } for t in testimonials])
