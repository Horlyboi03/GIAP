from app import create_app, db
from app.models import User, Applicant, Admin, GrantCategory, FAQ, Testimonial

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Applicant': Applicant,
        'Admin': Admin,
        'GrantCategory': GrantCategory,
        'FAQ': FAQ,
        'Testimonial': Testimonial
    }

@app.route('/')
def index():
    return "GIAP Backend API is running!"

if __name__ == '__main__':
    app.run(debug=True, port=3000)
