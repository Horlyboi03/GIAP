from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models import Applicant, Document
import os
from werkzeug.utils import secure_filename
from datetime import datetime

bp = Blueprint('documents', __name__, url_prefix='/api/documents')

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_document():
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'applicant':
        return jsonify({'message': 'Unauthorized'}), 403
        
    applicant = Applicant.query.filter_by(user_id=int(identity)).first_or_404()
    
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{applicant.id}_{datetime.utcnow().timestamp()}_{file.filename}")
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        document = Document(
            applicant_id=applicant.id,
            document_type=request.form.get('document_type', 'other'),
            file_path=file_path,
            file_name=file.filename
        )
        db.session.add(document)
        db.session.commit()
        
        return jsonify({'message': 'File uploaded successfully', 'document_id': document.id, 'file_path': filename}), 201
        
    return jsonify({'message': 'Invalid file type'}), 400

@bp.route('/uploads/<filename>', methods=['GET'])
def serve_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
