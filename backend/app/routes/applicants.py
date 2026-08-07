from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models import Applicant, Notification, User
from datetime import datetime

bp = Blueprint('applicants', __name__, url_prefix='/api/applicants')


def serialize_applicant(applicant):
    return {
        'id': applicant.id,
        'email': applicant.user.email if applicant.user else None,
        'first_name': applicant.first_name,
        'last_name': applicant.last_name,
        'date_of_birth': applicant.date_of_birth.isoformat() if applicant.date_of_birth else None,
        'gender': applicant.gender,
        'nationality': applicant.nationality,
        'marital_status': applicant.marital_status,
        'phone_number': applicant.phone_number,
        'residential_address': applicant.residential_address,
        'employment_status': applicant.employment_status,
        'employer_name': applicant.employer_name,
        'monthly_income': applicant.monthly_income,
        'occupation': applicant.occupation,
        'id_front_path': applicant.id_front_path,
        'id_back_path': applicant.id_back_path,
        'id_number': applicant.id_number,
        'id_expiry_date': applicant.id_expiry_date.isoformat() if applicant.id_expiry_date else None
    }


@bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'applicant':
        return jsonify({'message': 'Unauthorized'}), 403

    applicant = Applicant.query.filter_by(user_id=int(identity)).first_or_404()
    return jsonify(serialize_applicant(applicant))

@bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'applicant':
        return jsonify({'message': 'Unauthorized'}), 403
        
    applicant = Applicant.query.filter_by(user_id=int(identity)).first_or_404()
    data = request.get_json()
    
    try:
        user = applicant.user
        next_email = (data.get('email') or '').strip().lower()
        if next_email:
            existing_user = User.query.filter(User.email == next_email, User.id != user.id).first()
            if existing_user:
                return jsonify({'message': 'That email address is already in use.'}), 400
            user.email = next_email

        applicant.first_name = data.get('first_name', applicant.first_name)
        applicant.last_name = data.get('last_name', applicant.last_name)
        if data.get('date_of_birth'):
            applicant.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        applicant.gender = data.get('gender', applicant.gender)
        applicant.nationality = data.get('nationality', applicant.nationality)
        applicant.marital_status = data.get('marital_status', applicant.marital_status)
        applicant.phone_number = data.get('phone_number', applicant.phone_number)
        applicant.residential_address = data.get('residential_address', applicant.residential_address)
        applicant.employment_status = data.get('employment_status', applicant.employment_status)
        applicant.employer_name = data.get('employer_name', applicant.employer_name)
        applicant.monthly_income = data.get('monthly_income', applicant.monthly_income)
        applicant.occupation = data.get('occupation', applicant.occupation)
        applicant.id_front_path = data.get('id_front_path', applicant.id_front_path)
        applicant.id_back_path = data.get('id_back_path', applicant.id_back_path)
        applicant.id_number = data.get('id_number', applicant.id_number)
        if data.get('id_expiry_date'):
            applicant.id_expiry_date = datetime.strptime(data['id_expiry_date'], '%Y-%m-%d').date()
        
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'applicant': serialize_applicant(applicant)
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating profile: {str(e)}'}), 500

@bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'applicant':
        return jsonify({'message': 'Unauthorized'}), 403
        
    applicant = Applicant.query.filter_by(user_id=int(identity)).first_or_404()
    notifications = Notification.query.filter_by(applicant_id=applicant.id).order_by(Notification.created_at.desc()).all()
    
    return jsonify([{
        'id': n.id,
        'title': n.title,
        'message': n.message,
        'read': n.read,
        'created_at': n.created_at.isoformat()
    } for n in notifications])

@bp.route('/notifications/<int:id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(id):
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'applicant':
        return jsonify({'message': 'Unauthorized'}), 403
        
    notification = Notification.query.get_or_404(id)
    applicant = Applicant.query.filter_by(user_id=int(identity)).first_or_404()
    
    if notification.applicant_id != applicant.id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    notification.read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read'})
