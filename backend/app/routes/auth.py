from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, Applicant, Admin
from app.email_utils import (
    send_password_reset_email,
    send_password_changed_email,
)
from send_email_async import send_welcome_email_async
from datetime import timedelta
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def create_user_token(user):
    return create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role},
        expires_delta=timedelta(days=7)
    )


def serialize_user(user):
    response = {
        'id': user.id,
        'email': user.email,
        'role': user.role
    }

    if user.role == 'applicant' and user.applicant:
        response['applicant'] = {
            'id': user.applicant.id,
            'first_name': user.applicant.first_name,
            'last_name': user.applicant.last_name,
            'date_of_birth': user.applicant.date_of_birth.isoformat() if user.applicant.date_of_birth else None,
            'gender': user.applicant.gender,
            'nationality': user.applicant.nationality,
            'marital_status': user.applicant.marital_status,
            'phone_number': user.applicant.phone_number,
            'residential_address': user.applicant.residential_address,
            'employment_status': user.applicant.employment_status,
            'employer_name': user.applicant.employer_name,
            'monthly_income': user.applicant.monthly_income,
            'occupation': user.applicant.occupation,
            'id_front_path': user.applicant.id_front_path,
            'id_back_path': user.applicant.id_back_path
        }
    elif user.role == 'admin' and user.admin:
        response['admin'] = {
            'id': user.admin.id,
            'first_name': user.admin.first_name,
            'last_name': user.admin.last_name
        }

    return response


def get_password_reset_serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'], salt='giap-password-reset')

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    normalized_email = (data.get('email') or '').strip().lower()
    print(f"DEBUG: Registration attempt for email: {normalized_email}")

    if not normalized_email:
        return jsonify({'message': 'Email is required'}), 400
    
    if User.query.filter_by(email=normalized_email).first():
        print(f"DEBUG: Email already exists: {normalized_email}")
        return jsonify({'message': 'Email already registered'}), 400
        
    try:
        user = User(email=normalized_email, role='applicant')
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush()
        
        applicant = Applicant(
            user_id=user.id,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )
        db.session.add(applicant)
        db.session.commit()
        
        print(f"DEBUG: User created successfully with ID: {user.id}")
        
        access_token = create_user_token(user)
        
        # Send welcome email asynchronously (won't block response)
        send_welcome_email_async(user.email, applicant.first_name)
        
        print(f"DEBUG: Token generated successfully")
        
        return jsonify({
            'access_token': access_token,
            'user': serialize_user(user)
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"DEBUG: Registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    normalized_email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    user = User.query.filter_by(email=normalized_email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    access_token = create_user_token(user)
    
    return jsonify({
        'access_token': access_token,
        'user': serialize_user(user)
    })


@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        serializer = get_password_reset_serializer()
        token = serializer.dumps({'user_id': user.id})
        reset_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:5173')}/reset-password/{token}"
        first_name = ''
        if user.role == 'applicant' and user.applicant:
            first_name = user.applicant.first_name
        elif user.role == 'admin' and user.admin:
            first_name = user.admin.first_name

        send_password_reset_email(user.email, first_name, reset_url)

    return jsonify({
        'message': 'If an account exists for that email, a password reset link has been sent.'
    })


@bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token')
    password = data.get('password') or ''

    if not token:
        return jsonify({'message': 'Reset token is required'}), 400

    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400

    serializer = get_password_reset_serializer()

    try:
        payload = serializer.loads(
            token,
            max_age=current_app.config.get('PASSWORD_RESET_TOKEN_MAX_AGE', 3600)
        )
    except SignatureExpired:
        return jsonify({'message': 'This reset link has expired. Please request a new one.'}), 400
    except BadSignature:
        return jsonify({'message': 'Invalid reset link. Please request a new one.'}), 400

    user = User.query.get(payload.get('user_id'))
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user.set_password(password)
    db.session.commit()
    first_name = ''
    if user.role == 'applicant' and user.applicant:
        first_name = user.applicant.first_name
    elif user.role == 'admin' and user.admin:
        first_name = user.admin.first_name

    send_password_changed_email(user.email, first_name)

    return jsonify({'message': 'Password updated successfully'})

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    identity = get_jwt_identity()
    user = User.query.get(int(identity))
    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify(serialize_user(user))
