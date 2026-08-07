import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ApplicantDashboard from './pages/ApplicantDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ApplicationForm from './pages/ApplicationForm'
import SubmittedApplicationReview from './pages/SubmittedApplicationReview'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/" />
  
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/apply" element={
        <ProtectedRoute role="applicant">
          <ApplicationForm />
        </ProtectedRoute>
      } />
      <Route path="/applications/:applicationId" element={
        <ProtectedRoute role="applicant">
          <SubmittedApplicationReview />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute role="applicant">
          <ApplicantDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
