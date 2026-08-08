#!/usr/bin/env python
"""Initialize database tables for production deployment."""
from app import create_app, db

app = create_app()

with app.app_context():
    # Create all tables
    db.create_all()
    print("Database tables created successfully!")
