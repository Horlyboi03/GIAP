import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, XCircle, Clock, ArrowLeft, ChevronDown } from 'lucide-react'
import AuthButtonLoader from '../components/AuthButtonLoader'
import Navbar from '../components/Navbar'
import api from '../services/api'

// Get API base URL for constructing image URLs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-black p-4 text-white shadow-lg shadow-black/20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-white/95">{value || 'Not provided'}</p>
    </div>
  )
}

function DetailSection({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111111] p-6 text-white shadow-xl shadow-black/20">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [applications, setApplications] = useState([])
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionTarget, setActionTarget] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [showApplicationsList, setShowApplicationsList] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/applications')
    ]).then(([dashRes, appsRes]) => {
      setDashboard(dashRes.data)
      setApplications(appsRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const loadApplicationDetails = async (id) => {
    try {
      const res = await api.get(`/admin/applications/${id}`)
      setSelectedApplication(res.data)
    } catch (err) {
      console.error('Error loading application details:', err)
      alert('Failed to load application details')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(true)
      setActionTarget(status)
      await api.put(`/admin/applications/${id}/status`, { status })
      setApplications(applications.map(app =>
        app.id === id ? { ...app, status } : app
      ))
      if (selectedApplication?.id === id) {
        setSelectedApplication({ ...selectedApplication, status })
      }
      const dashRes = await api.get('/admin/dashboard')
      setDashboard(dashRes.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status')
    } finally {
      setActionLoading(false)
      setActionTarget('')
    }
  }

  const showReviewActions = selectedApplication && ['pending', 'under_review'].includes(selectedApplication.status)
  const filteredApplications = applications.filter((app) => activeFilter === 'all' || app.status === activeFilter)
  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/')
  }
  const handleFilterChange = (filter) => {
    setActiveFilter((currentFilter) => (
      currentFilter === filter && filter !== 'all' ? 'all' : filter
    ))
  }
  const stats = [
    {
      label: 'Total Applications',
      value: dashboard?.total_applications,
      icon: FileText,
      color: 'from-primary-600 via-primary-500 to-gold-500',
      filter: 'all',
      description: 'View every grant application'
    },
    {
      label: 'Pending',
      value: dashboard?.pending,
      icon: Clock,
      color: 'from-yellow-500 via-amber-400 to-yellow-300',
      filter: 'pending',
      description: 'Awaiting first review'
    },
    {
      label: 'Approved',
      value: dashboard?.approved,
      icon: CheckCircle,
      color: 'from-emerald-500 via-green-500 to-lime-400',
      filter: 'approved',
      description: 'Applications already approved'
    },
    {
      label: 'Rejected',
      value: dashboard?.rejected,
      icon: XCircle,
      color: 'from-rose-500 via-red-500 to-orange-400',
      filter: 'rejected',
      description: 'Applications declined'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (selectedApplication) {
    const applicantName = `${selectedApplication.applicant.first_name} ${selectedApplication.applicant.last_name}`.trim()
    const ReviewStatusIcon =
      selectedApplication.status === 'approved'
        ? CheckCircle
        : selectedApplication.status === 'rejected'
          ? XCircle
          : Clock
    const reviewStatusClasses =
      selectedApplication.status === 'approved'
        ? 'bg-green-500/20 text-green-300'
        : selectedApplication.status === 'rejected'
          ? 'bg-red-500/20 text-red-300'
          : 'bg-yellow-500/20 text-yellow-200'
    const reviewStatusPanelClasses =
      selectedApplication.status === 'approved'
        ? 'border-green-500/30 bg-green-500/10 text-green-300'
        : selectedApplication.status === 'rejected'
          ? 'border-red-500/30 bg-red-500/10 text-red-300'
          : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200'

    return (
      <div className="min-h-screen bg-[#050505]">
        <Navbar />
        <div className="pt-24 pb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedApplication(null)}
            className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Applications
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111111] via-[#0b0b0b] to-black p-6 shadow-2xl shadow-black/30 sm:p-8"
          >
            <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.35em] text-gold-400">Application Review</p>
                <h1 className="mt-3 text-3xl font-bold text-white">Application for {applicantName}</h1>
                <p className="mt-2 text-sm text-white/60">
                  {selectedApplication.category} • Submitted {new Date(selectedApplication.submitted_at).toLocaleDateString()}
                </p>
                <p className="mt-2 text-sm font-semibold text-gold-300">
                  Application ID: {selectedApplication.application_reference || `APP-${selectedApplication.id}`}
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold capitalize ${reviewStatusClasses}`}>
                  <ReviewStatusIcon className="h-4 w-4" />
                  <span>{selectedApplication.status.replace('_', ' ')}</span>
                </div>
                {(selectedApplication.status === 'approved' || selectedApplication.status === 'rejected') && (
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full border ${reviewStatusPanelClasses}`}>
                    <ReviewStatusIcon className="h-7 w-7" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <DetailSection title="Applicant Information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoCard label="Name" value={applicantName} />
                  <InfoCard label="Email" value={selectedApplication.applicant.email} />
                  <InfoCard label="Phone" value={selectedApplication.applicant.phone_number} />
                  <InfoCard label="Address" value={selectedApplication.applicant.residential_address} />
                  <InfoCard label="Nationality" value={selectedApplication.applicant.nationality} />
                  <InfoCard label="Date of Birth" value={selectedApplication.applicant.date_of_birth ? new Date(selectedApplication.applicant.date_of_birth).toLocaleDateString() : 'Not provided'} />
                  <InfoCard label="Gender" value={selectedApplication.applicant.gender} />
                  <InfoCard label="Marital Status" value={selectedApplication.applicant.marital_status} />
                </div>
              </DetailSection>

              <DetailSection title="Grant Overview">
                <div className="grid gap-4">
                  <InfoCard label="Grant Category" value={selectedApplication.category} />
                  <InfoCard label="Requested Amount" value={`$${selectedApplication.requested_amount.toLocaleString()}`} />
                  <InfoCard label="Employment Status" value={selectedApplication.applicant.employment_status} />
                  <InfoCard label="Occupation" value={selectedApplication.applicant.occupation} />
                  <InfoCard label="Employer Name" value={selectedApplication.applicant.employer_name} />
                  <InfoCard label="Monthly Income" value={selectedApplication.applicant.monthly_income ? `$${Number(selectedApplication.applicant.monthly_income).toLocaleString()}` : 'Not provided'} />
                </div>
              </DetailSection>
            </div>

            {/* ID Information */}
            {(selectedApplication.applicant.id_number || selectedApplication.applicant.id_expiry_date || selectedApplication.applicant.id_front_path || selectedApplication.applicant.id_back_path) && (
              <div className="mt-8">
                <DetailSection title="ID Information">
                {(selectedApplication.applicant.id_number || selectedApplication.applicant.id_expiry_date) && (
                  <div className="mb-6 grid gap-4 sm:grid-cols-2">
                    <InfoCard label="ID Number" value={selectedApplication.applicant.id_number} />
                    <InfoCard
                      label="ID Expiry Date"
                      value={selectedApplication.applicant.id_expiry_date ? new Date(selectedApplication.applicant.id_expiry_date).toLocaleDateString() : 'Not provided'}
                    />
                  </div>
                )}
                <div className="grid gap-6 md:grid-cols-2">
                  {selectedApplication.applicant.id_front_path && (
                    <div>
                      {(() => {
                        const frontDocumentUrl = `${API_BASE_URL.replace('/api', '')}/api/documents/uploads/${selectedApplication.applicant.id_front_path}`
                        return (
                          <>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="block text-sm text-white/55">ID Front</span>
                        <a
                          href={frontDocumentUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          Download
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewDocument({ url: frontDocumentUrl, label: 'ID Front' })}
                        className="block w-full overflow-hidden rounded-2xl"
                      >
                        <img
                          src={frontDocumentUrl}
                          alt="ID Front"
                          className="h-64 w-full cursor-pointer rounded-2xl border border-white/10 object-cover transition-transform duration-300 hover:scale-[1.02]"
                        />
                      </button>
                          </>
                        )
                      })()}
                    </div>
                  )}
                  {selectedApplication.applicant.id_back_path && (
                    <div>
                      {(() => {
                        const backDocumentUrl = `${API_BASE_URL.replace('/api', '')}/api/documents/uploads/${selectedApplication.applicant.id_back_path}`
                        return (
                          <>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="block text-sm text-white/55">ID Back</span>
                        <a
                          href={backDocumentUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          Download
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewDocument({ url: backDocumentUrl, label: 'ID Back' })}
                        className="block w-full overflow-hidden rounded-2xl"
                      >
                        <img
                          src={backDocumentUrl}
                          alt="ID Back"
                          className="h-64 w-full cursor-pointer rounded-2xl border border-white/10 object-cover transition-transform duration-300 hover:scale-[1.02]"
                        />
                      </button>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
                </DetailSection>
              </div>
            )}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <DetailSection title="Purpose">
                <p className="text-sm leading-7 text-white/75">{selectedApplication.purpose}</p>
              </DetailSection>
              <DetailSection title="Impact">
                <p className="text-sm leading-7 text-white/75">{selectedApplication.impact}</p>
              </DetailSection>
              <DetailSection title="Fund Usage">
                <p className="text-sm leading-7 text-white/75">{selectedApplication.fund_usage}</p>
              </DetailSection>
              <DetailSection title="Expected Outcomes">
                <p className="text-sm leading-7 text-white/75">{selectedApplication.expected_outcomes}</p>
              </DetailSection>
            </div>

            {showReviewActions && (
              <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row">
                <button
                  onClick={() => updateStatus(selectedApplication.id, 'under_review')}
                  disabled={actionLoading || selectedApplication.status === 'under_review'}
                  className="flex-1 rounded-xl bg-yellow-500/20 py-3 font-semibold text-yellow-200 transition-colors hover:bg-yellow-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {selectedApplication.status === 'under_review'
                    ? 'Already Under Review'
                    : actionLoading && actionTarget === 'under_review'
                      ? <AuthButtonLoader label="Marking Under Review..." />
                      : 'Mark as Under Review'}
                </button>
                <button
                  onClick={() => updateStatus(selectedApplication.id, 'approved')}
                  disabled={actionLoading}
                  className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading && actionTarget === 'approved'
                    ? <AuthButtonLoader label="Approving..." />
                    : 'Approve'}
                </button>
                <button
                  onClick={() => updateStatus(selectedApplication.id, 'rejected')}
                  disabled={actionLoading}
                  className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading && actionTarget === 'rejected'
                    ? <AuthButtonLoader label="Rejecting..." />
                    : 'Reject'}
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {previewDocument && (
          <div className="fixed inset-0 z-50 bg-black">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                aria-label="Go back"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="text-sm font-medium text-white/80">{previewDocument.label}</div>
              <a
                href={previewDocument.url}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                Download
              </a>
            </div>
            <div className="flex h-[calc(100vh-76px)] items-center justify-center px-4 pb-6 sm:px-6">
              <img
                src={previewDocument.url}
                alt={previewDocument.label}
                className="max-h-full max-w-full rounded-2xl object-contain"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111111] via-[#090909] to-black p-6 shadow-2xl shadow-black/30 sm:p-8"
        >
          <button
            type="button"
            onClick={handleBackNavigation}
            aria-label="Go back"
            className="absolute left-6 top-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-all hover:bg-white/15 hover:text-gold-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 right-[-60px] h-40 w-40 rounded-full bg-gold-500/20 blur-3xl"
            animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-30px] left-[-40px] h-36 w-36 rounded-full bg-primary-500/20 blur-3xl"
            animate={{ scale: [1.04, 1, 1.04], opacity: [0.4, 0.25, 0.4] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative z-10 grid gap-8 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-gold-400">Grant Command Center</p>
              <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Admin Dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                Monitor grant activity, review applicants faster, and move qualified submissions through approval with a cleaner premium workflow.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Review Focus</p>
                <p className="mt-3 text-2xl font-semibold text-white">{dashboard?.pending ?? 0}</p>
                <p className="mt-2 text-sm text-white/60">Applications waiting for the first decision</p>
              </motion.div>
              <motion.div
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Portfolio Value</p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  ${applications.reduce((sum, app) => sum + (app.requested_amount || 0), 0).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-white/60">Combined amount requested across all applications</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="relative z-10 mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <button
                type="button"
                onClick={() => handleFilterChange(stat.filter)}
                className={`w-full cursor-pointer rounded-[28px] border p-6 text-left text-white shadow-xl transition-all ${
                  activeFilter === stat.filter
                    ? 'border-white/25 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`inline-flex rounded-2xl bg-gradient-to-br ${stat.color} p-3 shadow-lg`}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="mt-5 text-3xl font-bold">{stat.value}</div>
                <div className="mt-1 text-base font-semibold">{stat.label}</div>
                <div className="mt-2 text-sm text-white/65">{stat.description}</div>
                <div className="mt-4 text-xs font-medium uppercase tracking-[0.3em] text-gold-300">
                  {activeFilter === stat.filter
                    ? stat.filter === 'all'
                      ? 'Showing Everything'
                      : 'Click To Clear'
                    : 'Click To Filter'}
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/30"
        >
          <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => setShowApplicationsList((current) => !current)}
                className="inline-flex items-center gap-2 text-left text-xl font-semibold text-white transition-colors hover:text-gold-300"
              >
                <span>Applications</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${showApplicationsList ? 'rotate-0' : '-rotate-90'}`} />
              </button>
              <p className="mt-1 text-sm text-white/55">
                {activeFilter === 'all'
                  ? 'Viewing all grant applications'
                  : `Viewing ${activeFilter.replace('_', ' ')} applications`}
              </p>
            </div>
            {activeFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Clear Filter
              </button>
            )}
          </div>
          {!showApplicationsList ? (
            <div className="p-6 text-sm text-white/55">
              Submitted applications are hidden. Click <span className="font-medium text-white">Applications</span> to show the list.
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <FileText className="h-8 w-8 text-white/40" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">No applications in this view</h3>
              <p className="mt-2 text-sm text-white/55">Try another stat card or clear the active filter.</p>
            </div>
          ) : (
          <div className="divide-y divide-white/10">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                onClick={() => loadApplicationDetails(app.id)}
                className="cursor-pointer p-6 transition-colors hover:bg-white/[0.03]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">
                        {app.applicant.name} - {app.category}
                      </h3>
                      {app.status === 'pending' && (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-gold-500"></span>
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
                      {app.application_reference || `APP-${app.id}`}
                    </p>
                    <p className="mt-1 text-sm text-white/55">
                      ${app.requested_amount.toLocaleString()} • Submitted {new Date(app.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
                    app.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                    app.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                    app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-200' :
                    'bg-primary-500/20 text-primary-200'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
