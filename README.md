# GIAP - Global International Assistance Program

A modern, futuristic grant funding platform connecting individuals, entrepreneurs, and communities with life-changing financial assistance.

## Features

### 🌍 Public Homepage
- Animated hero section with global network background
- Statistics dashboard with animated counters
- About section with timeline
- How it works (6-step process)
- Benefits cards with hover animations
- Grant categories with funding ranges ($100k - $450k)
- Success stories carousel
- FAQ accordion
- Contact form

### 👤 Applicant Portal
- Multi-step application form
- Applicant dashboard
- Profile management
- Application tracking
- Notifications system

### 🛡️ Admin Dashboard
- Application management
- Review and approve/reject applications
- Dashboard statistics
- Applicant search/filter

## Tech Stack

### Backend
- **Flask** - Web framework
- **Flask-SQLAlchemy** - ORM
- **Flask-JWT-Extended** - Authentication
- **Flask-CORS** - CORS support
- **SQLite** (dev) / **PostgreSQL** (prod) - Database

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Axios** - HTTP client
- **React Router** - Routing

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

6. Run the backend server:
```bash
python app.py
```
The backend will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`

## Demo Credentials

### Admin User
- **Email**: admin@giap.org
- **Password**: Admin123!

## Default Data

The application automatically seeds:
- 6 grant categories
- 5 FAQ items
- 3 success stories
- 1 admin user

## Project Structure

```
GIAP/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   └── templates/
│   ├── uploads/
│   ├── app.py
│   ├── config.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   └── services/
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## License

MIT
