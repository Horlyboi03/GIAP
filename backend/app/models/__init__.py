from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='applicant', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    applicant = db.relationship('Applicant', backref='user', uselist=False, lazy=True)
    admin = db.relationship('Admin', backref='user', uselist=False, lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Applicant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    nationality = db.Column(db.String(100))
    marital_status = db.Column(db.String(50))
    phone_number = db.Column(db.String(50))
    residential_address = db.Column(db.Text)
    employment_status = db.Column(db.String(100))
    employer_name = db.Column(db.String(200))
    monthly_income = db.Column(db.Float)
    occupation = db.Column(db.String(100))
    id_front_path = db.Column(db.String(256))
    id_back_path = db.Column(db.String(256))
    id_number = db.Column(db.String(100))
    id_expiry_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    applications = db.relationship('GrantApplication', backref='applicant', lazy=True)
    documents = db.relationship('Document', backref='applicant', lazy=True)
    notifications = db.relationship('Notification', backref='applicant', lazy=True)

class GrantCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    min_amount = db.Column(db.Float, default=100000)
    max_amount = db.Column(db.Float, default=450000)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    applications = db.relationship('GrantApplication', backref='category', lazy=True)

class GrantApplication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(20), index=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey('applicant.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('grant_category.id'), nullable=False)
    purpose = db.Column(db.Text, nullable=False)
    impact = db.Column(db.Text, nullable=False)
    requested_amount = db.Column(db.Float, nullable=False)
    fund_usage = db.Column(db.Text, nullable=False)
    expected_outcomes = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='pending', nullable=False)
    digital_signature = db.Column(db.Text)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('admin.id'))
    
    documents = db.relationship('Document', backref='application', lazy=True)

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey('applicant.id'), nullable=False)
    application_id = db.Column(db.Integer, db.ForeignKey('grant_application.id'))
    document_type = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(256), nullable=False)
    file_name = db.Column(db.String(256), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey('applicant.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)

class FAQ(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Testimonial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    grant_amount = db.Column(db.Float, nullable=False)
    story = db.Column(db.Text, nullable=False)
    photo_url = db.Column(db.String(256))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class EmailLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipient = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
