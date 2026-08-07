import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { FileText, Bell, User, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'

export default function ApplicantDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [recentApplicationMessage, setRecentApplicationMessage] = useState('')
  const [statusPopupNotification, setStatusPopupNotification] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/grants/applications'),
      api.get('/applicants/notifications')
    ]).then(([appsRes, notifsRes]) => {
      setApplications(appsRes.data)
      setNotifications(notifsRes.data)
      const latestDecisionNotification = notifsRes.data.find((notification) => {
        if (notification.read) return false
        const normalizedTitle = (notification.title || '').toLowerCase()
        return normalizedTitle.includes('approved') || normalizedTitle.includes('rejected')
      })
      setStatusPopupNotification(latestDecisionNotification || null)
    }).finally(() => setLoading(false))
  }, [])

  const markAsRead = async (id) => {
    await api.put(`/applicants/notifications/${id}/read`)
    setNotifications((currentNotifications) => currentNotifications.map((n) => (
      n.id === id ? { ...n, read: true } : n
    )))
  }

  const dismissStatusPopup = async () => {
    if (!statusPopupNotification) return

    try {
      if (!statusPopupNotification.read) {
        await markAsRead(statusPopupNotification.id)
      }
    } finally {
      setStatusPopupNotification(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-500 bg-green-100'
      case 'rejected': return 'text-red-500 bg-red-100'
      case 'under_review': return 'text-yellow-500 bg-yellow-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return CheckCircle
      case 'rejected': return XCircle
      default: return Clock
    }
  }

  const latestApplication = applications[0] || null
  const popupStatus = (statusPopupNotification?.title || '').toLowerCase().includes('approved') ? 'approved' : 'rejected'
  const PopupIcon = popupStatus === 'approved' ? CheckCircle : XCircle
  const reapplyWindowMs = 48 * 60 * 60 * 1000
  const latestApplicationTime = latestApplication ? new Date(latestApplication.submitted_at).getTime() : 0
  const isWithinReapplyWindow = latestApplication ? Date.now() - latestApplicationTime < reapplyWindowMs : false
  const remainingHours = latestApplication
    ? Math.max(1, Math.ceil((reapplyWindowMs - (Date.now() - latestApplicationTime)) / (60 * 60 * 1000)))
    : 0

  const handleStartApplication = () => {
    if (isWithinReapplyWindow && latestApplication) {
      setRecentApplicationMessage(`You just applied recently. Please wait ${remainingHours} more hour${remainingHours === 1 ? '' : 's'} before starting a new application.`)
      return
    }

    navigate('/apply')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.applicant?.first_name || 'Applicant'}</h1>
          <p className="text-gray-600 mt-1">Manage your applications and profile</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <button
                type="button"
                onClick={handleStartApplication}
                className="inline-flex items-center bg-gradient-to-r from-primary-600 to-gold-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Start New Application <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </motion.div>

            {/* Applications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Applications</h2>
              
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No applications yet</p>
                  <Link to="/apply" className="inline-block mt-4 text-primary-600 font-semibold hover:text-primary-700">
                    Apply for a grant →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => {
                    const StatusIcon = getStatusIcon(app.status)
                    return (
                      <Link
                        key={app.id}
                        to={`/applications/${app.id}`}
                        className="block border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:bg-primary-50/40 transition-colors"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{app.category}</h3>
                            <p className="text-primary-600 text-xs font-semibold mt-1">
                              Application ID: {app.application_reference || `APP-${app.id}`}
                            </p>
                            <p className="text-gray-500 text-sm mt-1">${app.requested_amount.toLocaleString()} requested</p>
                            <p className="text-gray-400 text-xs mt-1">Submitted {new Date(app.submitted_at).toLocaleDateString()}</p>
                            <p className="text-primary-600 text-xs font-medium mt-2">Open review view</p>
                          </div>
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="capitalize">{app.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-gold-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user?.applicant?.first_name} {user?.applicant?.last_name}
                  </h3>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
              </div>
              {latestApplication ? (
                <Link
                  to={`/applications/${latestApplication.id}`}
                  className="block w-full bg-gray-100 text-center text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Review Latest Application
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="block w-full bg-gray-100 text-center text-gray-400 py-2 rounded-xl font-medium cursor-not-allowed"
                >
                  Complete or Update Profile
                </button>
              )}
              {!latestApplication && (
                <p className="mt-3 text-sm text-gray-500">Apply first before you can review a submitted application.</p>
              )}
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </h2>
              
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                      className={`p-3 rounded-xl cursor-pointer ${notif.read ? 'bg-gray-50' : 'bg-primary-50'}`}
                    >
                      <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                      <p className="text-gray-500 text-xs mt-1">{notif.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {recentApplicationMessage && latestApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900">Application Recently Submitted</h2>
            <p className="mt-3 text-sm text-gray-600">{recentApplicationMessage}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(`/applications/${latestApplication.id}`)}
                className="rounded-xl bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700 transition-colors"
              >
                Review Submitted Application
              </button>
              <button
                type="button"
                onClick={() => setRecentApplicationMessage('')}
                className="rounded-xl bg-gray-100 px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {statusPopupNotification && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
                popupStatus === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <PopupIcon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-600">Application Update</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">{statusPopupNotification.title}</h2>
                <p className="mt-3 text-sm leading-7 text-gray-600">{statusPopupNotification.message}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  dismissStatusPopup()
                  if (latestApplication) {
                    navigate(`/applications/${latestApplication.id}`)
                  }
                }}
                className="rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
              >
                View Application
              </button>
              <button
                type="button"
                onClick={dismissStatusPopup}
                className="rounded-xl bg-gray-100 px-5 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
