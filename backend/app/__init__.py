from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from sqlalchemy import inspect, text
from config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()


def bootstrap_default_data():
    from app.models import User, Admin, GrantCategory, GrantApplication, FAQ, Testimonial

    if not GrantCategory.query.first():
        categories = [
            GrantCategory(name="Medical & Health Grant", description="Financial support for medical bills, surgeries, cancer treatment, and health-related expenses.", min_amount=100000, max_amount=450000),
            GrantCategory(name="Disability Support Grant", description="Funding for individuals with disabilities to improve quality of life and accessibility.", min_amount=100000, max_amount=450000),
            GrantCategory(name="Widow & Widower Support Grant", description="Assistance for widows and widowers to rebuild their lives and support their families.", min_amount=100000, max_amount=450000),
            GrantCategory(name="Divorced Individuals Grant", description="Support for divorced individuals to start fresh and achieve financial stability.", min_amount=100000, max_amount=450000),
            GrantCategory(name="Poverty Alleviation Grant", description="Financial aid for individuals and families living in poverty to meet basic needs and improve livelihoods.", min_amount=100000, max_amount=450000),
            GrantCategory(name="Retirement & Senior Citizens Grant", description="Support for retired and senior citizens to enhance their quality of life.", min_amount=100000, max_amount=450000),
            GrantCategory(name="Single Parent & Family Grant", description="Assistance for single parents and families in need of financial support.", min_amount=100000, max_amount=450000),
            GrantCategory(name="Youth Empowerment Grant", description="Funding for young people to pursue education, start businesses, and achieve their goals.", min_amount=100000, max_amount=450000),
            GrantCategory(name="Elderly Care & Support Grant", description="Support for the elderly with caregiving, medical needs, and daily living expenses.", min_amount=100000, max_amount=450000),
            GrantCategory(name="Semi-Retired & Self-Employed Grant", description="Funding for semi-retired and self-employed individuals to maintain or grow their income.", min_amount=100000, max_amount=450000)
        ]
        db.session.add_all(categories)

    other_categories = sorted(
        [category for category in GrantCategory.query.all() if category.name.strip().lower() == "others"],
        key=lambda category: category.id
    )

    if other_categories:
        primary_other = other_categories[0]
        primary_other.name = "Others"
        primary_other.description = "Flexible support for applicants whose needs do not fit neatly into the listed grant categories."
        primary_other.min_amount = 100000
        primary_other.max_amount = 450000

        for duplicate_other in other_categories[1:]:
            GrantApplication.query.filter_by(category_id=duplicate_other.id).update(
                {"category_id": primary_other.id}
            )
            db.session.delete(duplicate_other)
    else:
        db.session.add(
            GrantCategory(
                name="Others",
                description="Flexible support for applicants whose needs do not fit neatly into the listed grant categories.",
                min_amount=100000,
                max_amount=450000
            )
        )

    if not FAQ.query.first():
        faqs = [
            FAQ(question="Who can apply?", answer="Citizens suffering from diseases, health issues, cancer, disabilities, poverty, widows, widowers, divorced individuals, those needing surgery, retired, married, single, young, old, semi-retired, self-employed, and many others facing life's challenges are eligible to apply.", order=1),
            FAQ(question="How much funding is available?", answer="Grants range from $100,000 to $450,000 depending on the category and project scope.", order=2),
            FAQ(question="Is repayment required?", answer="No, GIAP grants are non-repayable financial assistance.", order=3),
            FAQ(question="How long does approval take?", answer="The approval process typically takes 4-8 weeks from submission.", order=4),
            FAQ(question="Which countries are eligible?", answer="GIAP operates in over 40 countries worldwide. Please check our eligibility criteria for details.", order=5)
        ]
        db.session.add_all(faqs)

    if not Testimonial.query.first():
        testimonials = [
            Testimonial(name="Sarah Johnson", country="United States", grant_amount=250000, story="GIAP's grant helped me expand my women-owned tech startup, creating 15 new jobs in our community."),
            Testimonial(name="Ahmed Hassan", country="Egypt", grant_amount=180000, story="Thanks to GIAP, our agricultural cooperative increased production by 300% and improved food security for 500 families."),
            Testimonial(name="Maria Garcia", country="Brazil", grant_amount=320000, story="The educational grant allowed me to complete my PhD and establish a scholarship program for underprivileged students.")
        ]
        db.session.add_all(testimonials)

    if not User.query.filter_by(role='admin').first():
        admin_user = User(email='giapgrantteam@gmail.com', role='admin')
        admin_user.set_password('Olawale1607!')
        db.session.add(admin_user)
        db.session.flush()
        admin = Admin(user_id=admin_user.id, first_name='GIAP', last_name='Admin')
        db.session.add(admin)

    db.session.commit()


def ensure_applicant_schema():
    inspector = inspect(db.engine)
    applicant_columns = {column['name'] for column in inspector.get_columns('applicant')}

    if 'id_number' not in applicant_columns:
        db.session.execute(text('ALTER TABLE applicant ADD COLUMN id_number VARCHAR(100)'))

    if 'id_expiry_date' not in applicant_columns:
        db.session.execute(text('ALTER TABLE applicant ADD COLUMN id_expiry_date DATE'))

    db.session.commit()


def ensure_grant_application_schema():
    from app.email_utils import generate_application_reference
    from app.models import GrantApplication

    inspector = inspect(db.engine)
    grant_application_columns = {column['name'] for column in inspector.get_columns('grant_application')}

    if 'reference' not in grant_application_columns:
        db.session.execute(text('ALTER TABLE grant_application ADD COLUMN reference VARCHAR(20)'))
        db.session.commit()

    applications_without_reference = GrantApplication.query.filter(
        (GrantApplication.reference.is_(None)) | (GrantApplication.reference == '')
    ).all()

    for application in applications_without_reference:
        application.reference = generate_application_reference()

    if applications_without_reference:
        db.session.commit()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    CORS(app, resources={r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "https://profound-belekoy-6ce8db.netlify.app"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }})
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'message': 'Token has expired', 'error': 'token_expired'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'message': 'Signature verification failed. Please log out and log in again.', 'error': 'invalid_token'}, 422
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {'message': 'Request does not contain an access token', 'error': 'authorization_required'}, 401
    
    from app.routes import auth, applicants, admin, grants, documents
    app.register_blueprint(auth.bp)
    app.register_blueprint(applicants.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(grants.bp)
    app.register_blueprint(documents.bp)

    with app.app_context():
        db.create_all()
        ensure_applicant_schema()
        ensure_grant_application_schema()
        bootstrap_default_data()
    
    return app
