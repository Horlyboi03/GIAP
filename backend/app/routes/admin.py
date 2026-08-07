from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models import Admin, User, Applicant, GrantApplication, Notification
from app.email_utils import send_application_status_email, format_application_reference, _report_debug_event
from datetime import datetime

bp = Blueprint('admin', __name__, url_prefix='/api/admin')
VALID_APPLICATION_STATUSES = {'pending', 'under_review', 'approved', 'rejected'}

@bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    total_applications = GrantApplication.query.count()
    approved = GrantApplication.query.filter_by(status='approved').count()
    rejected = GrantApplication.query.filter_by(status='rejected').count()
    pending = GrantApplication.query.filter_by(status='pending').count()
    under_review = GrantApplication.query.filter_by(status='under_review').count()
    
    return jsonify({
        'total_applications': total_applications,
        'approved': approved,
        'rejected': rejected,
        'pending': pending,
        'under_review': under_review
    })

@bp.route('/applications', methods=['GET'])
@jwt_required()
def get_all_applications():
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    applications = GrantApplication.query.order_by(GrantApplication.submitted_at.desc()).all()
    
    return jsonify([{
        'id': a.id,
        'application_reference': a.reference,
        'applicant': {
            'id': a.applicant.id,
            'name': f"{a.applicant.first_name} {a.applicant.last_name}",
            'email': a.applicant.user.email
        },
        'category': a.category.name if a.category else 'Unknown Category',
        'requested_amount': a.requested_amount,
        'status': a.status,
        'submitted_at': a.submitted_at.isoformat()
    } for a in applications])

@bp.route('/applications/<int:id>', methods=['GET'])
@jwt_required()
def get_application(id):
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    a = GrantApplication.query.get_or_404(id)
    return jsonify({
        'id': a.id,
        'application_reference': a.reference,
        'applicant': {
            'id': a.applicant.id,
            'first_name': a.applicant.first_name,
            'last_name': a.applicant.last_name,
            'email': a.applicant.user.email,
            'phone_number': a.applicant.phone_number,
            'nationality': a.applicant.nationality,
            'date_of_birth': a.applicant.date_of_birth.isoformat() if a.applicant.date_of_birth else None,
            'gender': a.applicant.gender,
            'marital_status': a.applicant.marital_status,
            'residential_address': a.applicant.residential_address,
            'employment_status': a.applicant.employment_status,
            'employer_name': a.applicant.employer_name,
            'monthly_income': a.applicant.monthly_income,
            'occupation': a.applicant.occupation,
            'id_number': a.applicant.id_number,
            'id_expiry_date': a.applicant.id_expiry_date.isoformat() if a.applicant.id_expiry_date else None,
            'id_front_path': a.applicant.id_front_path,
            'id_back_path': a.applicant.id_back_path
        },
        'category': a.category.name if a.category else 'Unknown Category',
        'purpose': a.purpose,
        'impact': a.impact,
        'requested_amount': a.requested_amount,
        'fund_usage': a.fund_usage,
        'expected_outcomes': a.expected_outcomes,
        'status': a.status,
        'submitted_at': a.submitted_at.isoformat(),
        'digital_signature': a.digital_signature
    })

@bp.route('/applications/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(id):
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    admin = Admin.query.filter_by(user_id=int(identity)).first_or_404()
    application = GrantApplication.query.get_or_404(id)
    data = request.get_json() or {}
    status = data.get('status')

    if status not in VALID_APPLICATION_STATUSES:
        return jsonify({'message': 'Invalid application status'}), 400

    application.status = status
    application.reviewed_at = datetime.utcnow()
    application.reviewed_by = admin.id
    
    application_reference = format_application_reference(application.id)
    notification = Notification(
        applicant_id=application.applicant_id,
        title=f'Application {status.replace("_", " ").title()}',
        message=(
            f'Your grant application {application_reference} for '
            f'{application.category.name if application.category else "your selected grant"} '
            f'has been {status.replace("_", " ")}.'
        )
    )
    db.session.add(notification)
    
    db.session.commit()

    if status in {'approved', 'rejected'}:
        # #region debug-point C:status-email-callsite
        _report_debug_event(
            'pre-fix',
            'C',
            'backend/app/routes/admin.py:update_application_status',
            '[DEBUG] Admin status flow is calling application status email helper',
            {
                'application_id': application.id,
                'status': status,
                'recipient': application.applicant.user.email,
            },
        )
        # #endregion
        send_application_status_email(
            recipient=application.applicant.user.email,
            applicant_name=f'{application.applicant.first_name} {application.applicant.last_name}'.strip() or 'Applicant',
            category_name=application.category.name if application.category else 'your grant application',
            status=status,
            application_id=application.id
        )

    return jsonify({'message': 'Application status updated'})
