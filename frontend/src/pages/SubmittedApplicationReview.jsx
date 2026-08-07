import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  FileBadge2,
  ShieldCheck
} from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'

const getDocumentUrl = (filePath) => (filePath ? `/api/documents/uploads/${filePath}` : null)

const formatDate = (value) => {
  if (!value) return 'Not provided'

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleDateString()
}

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return 'Not provided'

  return `$${Number(value).toLocaleString()}`
}

const formatStatusLabel = (status) => (status || 'pending').replace('_', ' ')

const getStatusClasses = (status) => {
  switch (status) {
    case 'approved':
      return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
    case 'rejected':
      return 'border-rose-400/30 bg-rose-500/15 text-rose-200'
    case 'under_review':
      return 'border-amber-400/30 bg-amber-500/15 text-amber-100'
    default:
      return 'border-white/10 bg-white/10 text-white/80'
  }
}

function ReviewField({ label, value, wide = false }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{label}</p>
      <p className="mt-2 text-sm leading-7 text-white/90">{value || 'Not provided'}</p>
    </div>
  )
}

function ReviewSection({ title, description, children }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-black/40 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description && <p className="mt-2 text-sm text-white/55">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-gold-400">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

export default function SubmittedApplicationReview() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [application, setApplication] = useState(null)
  const [viewingDocument, setViewingDocument] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadApplication = async () => {
      setLoading(true)
      setError('')

      try {
        const [profileRes, applicationRes] = await Promise.all([
          api.get('/applicants/profile'),
          api.get(`/grants/applications/${applicationId}`)
        ])

        if (!isMounted) return

        setProfile(profileRes.data || null)
        setApplication(applicationRes.data || null)
      } catch (err) {
        if (!isMounted) return
        setError(err.response?.data?.message || 'Failed to load the submitted application.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadApplication()

    return () => {
      isMounted = false
    }
  }, [applicationId])

  // Handle ESC key to close document viewer
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && viewingDocument) {
        setViewingDocument(null)
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [viewingDocument])

  const documents = useMemo(() => ([
    {
      label: 'Front of ID',
      url: getDocumentUrl(profile?.id_front_path)
    },
    {
      label: 'Back of ID',
      url: getDocumentUrl(profile?.id_back_path)
    }
  ]).filter((item) => item.url), [profile])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-white/10 bg-black/40 p-8 text-center text-white/70">
            Loading submitted application...
          </div>
        </div>
      </div>
    )
  }

  if (error || !application || !profile) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8 text-center">
            <h1 className="text-2xl font-semibold text-white">Unable to open application</h1>
            <p className="mt-3 text-sm text-rose-100/80">{error || 'This application could not be found.'}</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-6 inline-flex items-center rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition-colors hover:bg-white/90"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.28),_transparent_38%),radial-gradient(circle_at_right,_rgba(245,158,11,0.14),_transparent_28%)]">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-6 shadow-2xl shadow-black/25 backdrop-blur sm:p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to dashboard
                </Link>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.34em] text-gold-400">Submitted Application</p>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                  {profile.first_name} {profile.last_name}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
                  A clean review copy of your submitted grant application, with your profile details, supporting ID information, and grant responses grouped for quick review.
                </p>
              </div>

              <div className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold capitalize ${getStatusClasses(application.status)}`}>
                {formatStatusLabel(application.status)}
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard icon={FileBadge2} label="Application ID" value={application.application_reference || `APP-${application.id}`} />
              <SummaryCard icon={CircleDollarSign} label="Requested Amount" value={formatCurrency(application.requested_amount)} />
              <SummaryCard icon={CalendarDays} label="Submitted On" value={formatDate(application.submitted_at)} />
              <SummaryCard icon={Clock3} label="Grant Category" value={application.category || 'Not provided'} />
            </div>
          </motion.div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <ReviewSection title="Personal Information" description="Identity and contact details captured at the time of submission.">
                <div className="grid gap-6 sm:grid-cols-2">
                  <ReviewField label="First Name" value={profile.first_name} />
                  <ReviewField label="Last Name" value={profile.last_name} />
                  <ReviewField label="Email Address" value={profile.email} />
                  <ReviewField label="Phone Number" value={profile.phone_number} />
                  <ReviewField label="Date of Birth" value={formatDate(profile.date_of_birth)} />
                  <ReviewField label="Gender" value={profile.gender} />
                  <ReviewField label="Nationality" value={profile.nationality} />
                  <ReviewField label="Marital Status" value={profile.marital_status} />
                  <ReviewField label="Residential Address" value={profile.residential_address} wide />
                </div>
              </ReviewSection>

              <ReviewSection title="Employment Information" description="Current work and income details attached to this application.">
                <div className="grid gap-6 sm:grid-cols-2">
                  <ReviewField label="Employment Status" value={profile.employment_status} />
                  <ReviewField label="Occupation" value={profile.occupation} />
                  <ReviewField label="Employer Name" value={profile.employer_name} />
                  <ReviewField label="Monthly Income" value={formatCurrency(profile.monthly_income)} />
                </div>
              </ReviewSection>

              <ReviewSection title="Grant Request" description="Your submitted grant intent and how the funding will be used.">
                <div className="grid gap-6 sm:grid-cols-2">
                  <ReviewField label="Grant Category" value={application.category} />
                  <ReviewField label="Requested Amount" value={formatCurrency(application.requested_amount)} />
                  <ReviewField label="Purpose" value={application.purpose} wide />
                  <ReviewField label="Expected Impact" value={application.impact} wide />
                  <ReviewField label="Fund Usage" value={application.fund_usage} wide />
                  <ReviewField label="Expected Outcomes" value={application.expected_outcomes} wide />
                </div>
              </ReviewSection>
            </div>

            <div className="space-y-6">
              <ReviewSection title="Verification" description="Submission identity references and acknowledgement details.">
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
                  <ReviewField label="Application ID" value={application.application_reference || `APP-${application.id}`} />
                  <ReviewField label="ID Number" value={profile.id_number} />
                  <ReviewField label="ID Expiry Date" value={formatDate(profile.id_expiry_date)} />
                  <ReviewField label="Digital Signature" value={application.digital_signature || profile.first_name} />
                </div>
              </ReviewSection>

              <ReviewSection title="Submitted Documents" description="Any uploaded identity documents associated with your profile.">
                {documents.length > 0 ? (
                  <div className="space-y-5">
                    {documents.map((document) => (
                      <div key={document.label} className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04]">
                        <img src={document.url} alt={document.label} className="h-52 w-full object-cover" />
                        <div className="flex items-center justify-between gap-3 p-4">
                          <div>
                            <p className="text-sm font-semibold text-white">{document.label}</p>
                            <p className="mt-1 text-xs text-white/45">Uploaded identity document</p>
                          </div>
                          <a
                            href={document.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              e.preventDefault()
                              setViewingDocument(document)
                            }}
                            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
                          >
                            Open
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-white/55">
                    No uploaded ID images were found for this application.
                  </div>
                )}
              </ReviewSection>

              <ReviewSection title="Acknowledgement" description="The submission was signed against the applicant first name on record.">
                <div className="rounded-[24px] border border-amber-400/20 bg-amber-500/10 p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-100">Applicant acknowledgement captured</p>
                      <p className="mt-2 text-sm leading-7 text-amber-50/80">
                        This application was submitted with the digital signature "{application.digital_signature || profile.first_name || 'Not provided'}".
                      </p>
                    </div>
                  </div>
                </div>
              </ReviewSection>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-white transition-colors hover:bg-white/[0.08]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-4xl">
            {/* Header with Back Button */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Viewing Document</p>
                <h2 className="mt-1 text-xl font-semibold text-white">{viewingDocument.label}</h2>
              </div>
              <button
                onClick={() => setViewingDocument(null)}
                className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>

            {/* Image Viewer */}
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-black/40 shadow-2xl">
              <img
                src={viewingDocument.url}
                alt={viewingDocument.label}
                className="w-full max-h-[80vh] object-contain"
              />
            </div>

            {/* Close hint */}
            <p className="mt-4 text-center text-sm text-white/50">
              Click "Back" or press ESC to close
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
