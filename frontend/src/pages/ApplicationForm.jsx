import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ArrowLeft, ArrowRight, Upload, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import AuthButtonLoader from '../components/AuthButtonLoader'
import api from '../services/api'

const steps = [
  { id: 1, title: 'Personal Information' },
  { id: 2, title: 'ID Upload' },
  { id: 3, title: 'Employment Information' },
  { id: 4, title: 'Grant Details' },
  { id: 5, title: 'Agreement' }
]

const emptyFormData = {
  email: '',
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  nationality: '',
  marital_status: '',
  phone_number: '',
  residential_address: '',
  employment_status: '',
  employer_name: '',
  monthly_income: '',
  occupation: '',
  category_id: '',
  purpose: '',
  impact: '',
  requested_amount: '',
  fund_usage: '',
  expected_outcomes: '',
  digital_signature: '',
  id_front_path: '',
  id_back_path: '',
  id_number: '',
  id_expiry_date: ''
}

const getDocumentUrl = (filePath) => (filePath ? `/api/documents/uploads/${filePath}` : null)

function RequiredMark() {
  return <span className="ml-1 text-rose-500">*</span>
}

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-sm font-medium text-gray-700">
      {children}
      {required && <RequiredMark />}
    </label>
  )
}

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [categories, setCategories] = useState([])
  const [idFront, setIdFront] = useState(null)
  const [idBack, setIdBack] = useState(null)
  const [idFrontPreview, setIdFrontPreview] = useState(null)
  const [idBackPreview, setIdBackPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loadingForm, setLoadingForm] = useState(true)
  const [stepError, setStepError] = useState('')
  const [submissionSuccess, setSubmissionSuccess] = useState(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState(emptyFormData)
  const applicationId = searchParams.get('applicationId')
  const isViewingSubmittedApplication = Boolean(applicationId)
  const title = isViewingSubmittedApplication ? 'Submitted Application' : steps.find(s => s.id === currentStep)?.title
  const normalizedFirstName = formData.first_name.trim().toLowerCase()
  const normalizedDigitalSignature = formData.digital_signature.trim().toLowerCase()

  useEffect(() => {
    if (applicationId) {
      navigate(`/applications/${applicationId}`, { replace: true })
    }
  }, [applicationId, navigate])

  useEffect(() => {
    let isMounted = true

    const loadFormData = async () => {
      if (applicationId) {
        return
      }

      setLoadingForm(true)
      setStepError('')

      try {
        const requests = [
          api.get('/grants/categories'),
          api.get('/applicants/profile')
        ]

        if (applicationId) {
          requests.push(api.get(`/grants/applications/${applicationId}`))
        }

        const [categoriesRes, profileRes, applicationRes] = await Promise.all(requests)
        if (!isMounted) return

        setCategories(categoriesRes.data)

        const profileData = profileRes.data || {}
        const nextFormData = {
          ...emptyFormData,
          ...profileData,
          date_of_birth: profileData.date_of_birth || '',
          monthly_income: profileData.monthly_income ?? '',
          id_front_path: profileData.id_front_path || '',
          id_back_path: profileData.id_back_path || ''
        }

        if (applicationRes) {
          const applicationData = applicationRes.data || {}
          nextFormData.category_id = applicationData.category_id ? String(applicationData.category_id) : ''
          nextFormData.purpose = applicationData.purpose || ''
          nextFormData.impact = applicationData.impact || ''
          nextFormData.requested_amount = applicationData.requested_amount ? String(applicationData.requested_amount) : ''
          nextFormData.fund_usage = applicationData.fund_usage || ''
          nextFormData.expected_outcomes = applicationData.expected_outcomes || ''
          nextFormData.digital_signature = applicationData.digital_signature || ''
        }

        setFormData(nextFormData)
        setIdFrontPreview(getDocumentUrl(nextFormData.id_front_path))
        setIdBackPreview(getDocumentUrl(nextFormData.id_back_path))
      } catch (err) {
        if (!isMounted) return
        setStepError(err.response?.data?.message || 'Failed to load your application details.')
      } finally {
        if (isMounted) {
          setLoadingForm(false)
        }
      }
    }

    loadFormData()

    return () => {
      isMounted = false
    }
  }, [applicationId])

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      if (type === 'front') {
        setIdFront(file)
        const reader = new FileReader()
        reader.onload = () => setIdFrontPreview(reader.result)
        reader.readAsDataURL(file)
      } else {
        setIdBack(file)
        const reader = new FileReader()
        reader.onload = () => setIdBackPreview(reader.result)
        reader.readAsDataURL(file)
      }
    }
  }

  const uploadFile = async (file, type) => {
    const formDataFile = new FormData()
    formDataFile.append('file', file)
    formDataFile.append('document_type', type === 'front' ? 'id_front' : 'id_back')

    const res = await api.post('/documents/upload', formDataFile, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.file_path
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (
          !formData.email ||
          !formData.first_name ||
          !formData.last_name ||
          !formData.date_of_birth ||
          !formData.gender ||
          !formData.nationality ||
          !formData.marital_status ||
          !formData.phone_number ||
          !formData.residential_address
        ) {
          return 'Please complete your personal information before continuing.'
        }
        return ''
      case 2:
        if (
          !(idFront || formData.id_front_path) ||
          !(idBack || formData.id_back_path)
        ) {
          if (!formData.id_number || !formData.id_expiry_date) {
            return 'Please upload both sides of your ID or provide your ID number and expiry date before continuing.'
          }
        }
        return ''
      case 3:
        if (!formData.employment_status || !formData.employer_name || !formData.monthly_income || !formData.occupation) {
          return 'Please complete your employment information before continuing.'
        }
        return ''
      case 4:
        if (!formData.category_id || !formData.purpose || !formData.impact || !formData.requested_amount || !formData.fund_usage || !formData.expected_outcomes) {
          return 'Please complete all grant details before continuing.'
        }
        return ''
      case 5:
        if (!formData.digital_signature.trim()) {
          return 'Please type your first name as your digital signature before submitting.'
        }
        if (normalizedDigitalSignature !== normalizedFirstName) {
          return 'Your digital signature must match the first name you entered in your personal information.'
        }
        return ''
      default:
        return ''
    }
  }

  const handleNext = () => {
    const error = validateStep(currentStep)
    if (error) {
      setStepError(error)
      return
    }

    setStepError('')
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setStepError('')
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isViewingSubmittedApplication) {
      return
    }

    const error = validateStep(5)
    if (error) {
      setStepError(error)
      return
    }

    setStepError('')
    setLoading(true)
    setUploading(true)

    try {
      let frontPath = formData.id_front_path
      let backPath = formData.id_back_path

      console.log("Uploading ID files...")
      if (idFront) {
        console.log("Uploading front ID...")
        frontPath = await uploadFile(idFront, 'front')
        console.log("Front ID uploaded:", frontPath)
      }

      if (idBack) {
        console.log("Uploading back ID...")
        backPath = await uploadFile(idBack, 'back')
        console.log("Back ID uploaded:", backPath)
      }

      setUploading(false)

      const updatedFormData = {
        ...formData,
        id_front_path: frontPath,
        id_back_path: backPath,
        requested_amount: formData.requested_amount ? Number(formData.requested_amount) : null
      }
      
      console.log("Updating profile with data:", updatedFormData)
      // Update profile first
      await api.put('/applicants/profile', updatedFormData)
      console.log("Profile updated successfully")
      
      console.log("Submitting application...")
      // Submit application
      const submitResponse = await api.post('/grants/applications', updatedFormData)
      console.log("Application submitted successfully:", submitResponse.data)
      setSubmissionSuccess({
        reference: submitResponse.data.application_reference || '',
        phone: updatedFormData.phone_number?.trim() || '',
        email: updatedFormData.email?.trim?.() || ''
      })
    } catch (err) {
      console.error("Full error object:", err)
      console.error("Error response:", err.response)
      setStepError(err.response?.data?.message || err.message || 'Failed to submit application.')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  if (applicationId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-600">
            Opening your submitted application review...
          </div>
        </div>
      </div>
    )
  }

  if (loadingForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-600">
            Loading application details...
          </div>
        </div>
      </div>
    )
  }

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pb-12 pt-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[32px] bg-white p-8 text-center shadow-sm sm:p-10"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-100/70">
              <Check className="h-10 w-10" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Application Sent</p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">Congratulations!</h1>
            {submissionSuccess.reference && (
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary-600">
                Application ID: {submissionSuccess.reference}
              </p>
            )}
            <p className="mt-4 text-base leading-7 text-gray-600">
              Your application has been submitted successfully. Our agent will contact you on your phone number
              {' '}
              <span className="font-semibold text-gray-900">{submissionSuccess.phone || 'Not provided'}</span>
              {' '}
              or email address
              {' '}
              <span className="font-semibold text-gray-900">{submissionSuccess.email || 'Not provided'}</span>
              {' '}
              with the next update.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        {!isViewingSubmittedApplication && (
          <div className="mb-10">
            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-[640px] items-start justify-between gap-4 mb-4">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep > step.id
                      ? 'bg-gold-500 text-white'
                      : currentStep === step.id
                      ? 'bg-primary-600 text-white scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <p className={`text-xs mt-2 text-center ${
                    currentStep >= step.id ? 'text-gray-900 font-medium' : 'text-gray-400'
                  }`}>
                    {step.title}
                    <RequiredMark />
                  </p>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}

        <motion.div
          key={isViewingSubmittedApplication ? 'submitted-application' : currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative bg-white rounded-2xl p-5 sm:p-8 shadow-sm"
        >
          {currentStep === 1 && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="absolute left-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <h2 className={`text-2xl font-bold text-gray-900 mb-2 ${currentStep === 1 || isViewingSubmittedApplication ? 'pl-14' : ''}`}>
            {title}
            {!isViewingSubmittedApplication && <RequiredMark />}
          </h2>
          {!isViewingSubmittedApplication && (
            <p className={`mb-6 text-sm text-gray-500 ${currentStep === 1 ? 'pl-14' : ''}`}>
              Sections and fields marked with * are compulsory before you can continue.
            </p>
          )}

          {isViewingSubmittedApplication && (
            <div className="mb-6 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
              Viewing your submitted application details.
            </div>
          )}

          {stepError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {stepError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={isViewingSubmittedApplication} className="space-y-6">
            {/* Step 1: Personal */}
            {(isViewingSubmittedApplication || currentStep === 1) && (
              <div className="grid md:grid-cols-2 gap-6">
                {isViewingSubmittedApplication && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information<RequiredMark /></h3>
                  </div>
                )}
                <div>
                  <FieldLabel required>First Name</FieldLabel>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <FieldLabel required>Last Name</FieldLabel>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel required>Email Address</FieldLabel>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <FieldLabel required>Date of Birth</FieldLabel>
                  <input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <FieldLabel required>Gender</FieldLabel>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <FieldLabel required>Nationality</FieldLabel>
                  <input
                    type="text"
                    required
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <FieldLabel required>Marital Status</FieldLabel>
                  <select
                    required
                    value={formData.marital_status}
                    onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widow">Widow</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <FieldLabel required>Phone Number</FieldLabel>
                  <input
                    type="tel"
                    required
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel required>Residential Address</FieldLabel>
                  <textarea
                    rows={3}
                    required
                    value={formData.residential_address}
                    onChange={(e) => setFormData({ ...formData, residential_address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: ID Upload */}
            {(isViewingSubmittedApplication || currentStep === 2) && (
              <div className="space-y-6">
                {isViewingSubmittedApplication && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900">ID Upload<RequiredMark /></h3>
                  </div>
                )}
                <div>
                  <FieldLabel required>ID Front</FieldLabel>
                  {idFrontPreview ? (
                    <div className="relative">
                      <img src={idFrontPreview} alt="ID Front" className="w-full h-48 sm:h-64 object-cover rounded-xl border" />
                      <button
                        type="button"
                        onClick={() => {
                          setIdFront(null)
                          setIdFrontPreview(null)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload ID front</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'front')}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <FieldLabel required>ID Back</FieldLabel>
                  {idBackPreview ? (
                    <div className="relative">
                      <img src={idBackPreview} alt="ID Back" className="w-full h-48 sm:h-64 object-cover rounded-xl border" />
                      <button
                        type="button"
                        onClick={() => {
                          setIdBack(null)
                          setIdBackPreview(null)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload ID back</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'back')}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <FieldLabel required>ID Number</FieldLabel>
                  <input
                    type="text"
                    required={!(idFront || formData.id_front_path) || !(idBack || formData.id_back_path)}
                    value={formData.id_number}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your ID number if you cannot upload it"
                  />
                </div>
                <div>
                  <FieldLabel required>ID Expiry Date</FieldLabel>
                  <input
                    type="date"
                    required={!(idFront || formData.id_front_path) || !(idBack || formData.id_back_path)}
                    value={formData.id_expiry_date}
                    onChange={(e) => setFormData({ ...formData, id_expiry_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  If you cannot upload your ID documents right now, you can provide your ID number and expiry date instead.
                </p>
              </div>
            )}

            {/* Step 3: Employment */}
            {(isViewingSubmittedApplication || currentStep === 3) && (
              <div className="space-y-6">
                {isViewingSubmittedApplication && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900">Employment Information<RequiredMark /></h3>
                  </div>
                )}
                <div>
                  <FieldLabel required>Employment Status</FieldLabel>
                  <select
                    required
                    value={formData.employment_status}
                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select</option>
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self-employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="student">Student</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div>
                  <FieldLabel required>Employer Name</FieldLabel>
                  <input
                    type="text"
                    required
                    value={formData.employer_name}
                    onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <FieldLabel required>Monthly Income</FieldLabel>
                  <input
                    type="number"
                    required
                    value={formData.monthly_income}
                    onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <FieldLabel required>Occupation</FieldLabel>
                  <input
                    type="text"
                    required
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Grant */}
            {(isViewingSubmittedApplication || currentStep === 4) && (
              <div className="space-y-6">
                {isViewingSubmittedApplication && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900">Grant Details<RequiredMark /></h3>
                  </div>
                )}
                <div>
                  <FieldLabel required>Grant Category</FieldLabel>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name} (${cat.min_amount.toLocaleString()} - ${cat.max_amount.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel required>Why are you applying for this grant?</FieldLabel>
                  <textarea
                    required
                    rows={4}
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <FieldLabel required>What impact will this grant have?</FieldLabel>
                  <textarea
                    required
                    rows={4}
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <FieldLabel required>Requested Amount ($)</FieldLabel>
                  <select
                    required
                    value={formData.requested_amount}
                    onChange={(e) => setFormData({ ...formData, requested_amount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select an amount</option>
                    {[100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000].map(amount => (
                      <option key={amount} value={amount}>${amount.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel required>How will you use the funds?</FieldLabel>
                  <textarea
                    required
                    rows={4}
                    value={formData.fund_usage}
                    onChange={(e) => setFormData({ ...formData, fund_usage: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <FieldLabel required>Expected Outcomes</FieldLabel>
                  <textarea
                    required
                    rows={4}
                    value={formData.expected_outcomes}
                    onChange={(e) => setFormData({ ...formData, expected_outcomes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Agreement */}
            {(isViewingSubmittedApplication || currentStep === 5) && (
              <div className="space-y-6">
                {isViewingSubmittedApplication && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900">Agreement<RequiredMark /></h3>
                  </div>
                )}
                <div className="bg-yellow-50 border-2 border-yellow-300 p-6 rounded-xl">
                  <div className="flex items-start space-x-3">
                    {/* Triangle */}
                    <svg width="24" height="24" viewBox="0 0 24 24" className="flex-shrink-0 mt-1">
                      <polygon points="12,4 4,20 20,20" fill="#eab308" stroke="#eab308" strokeWidth="2"/>
                    </svg>
                    <p className="text-yellow-600 font-semibold text-lg">
                      You'll pay a processing fee before your claim can be released to your doorstep
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
                  <div className="text-gray-600 text-sm space-y-3 max-h-64 overflow-y-auto">
                    <p>1. I confirm that all information provided is accurate and true to the best of my knowledge.</p>
                    <p>2. I understand that providing false information may result in disqualification and legal action.</p>
                    <p>3. I agree to use the grant funds solely for the purpose stated in this application.</p>
                    <p>4. I understand that GIAP reserves the right to verify all information provided.</p>
                    <p>5. I agree to cooperate with any monitoring or evaluation activities.</p>
                    <p>6. I understand that meeting eligibility criteria does not guarantee grant approval.</p>
                  </div>
                </div>
                <div>
                  <FieldLabel required>Digital Signature</FieldLabel>
                  <p className="mb-2 text-sm text-gray-500">
                    Type your first name exactly as entered above to sign this application.
                  </p>
                  <input
                    type="text"
                    required
                    placeholder={formData.first_name ? `Type "${formData.first_name}" to sign` : 'Type your first name to sign'}
                    value={formData.digital_signature}
                    onChange={(e) => setFormData({ ...formData, digital_signature: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}
            </fieldset>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse gap-3 pt-6 border-t border-gray-200 sm:flex-row sm:justify-between">
              {!isViewingSubmittedApplication && currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex w-full items-center justify-center px-6 py-3 text-gray-700 font-medium hover:text-gray-900 sm:w-auto"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
              ) : !isViewingSubmittedApplication ? (
                <div className="hidden sm:block" />
              ) : null}
              
              {!isViewingSubmittedApplication && currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex w-full items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors sm:w-auto"
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              ) : isViewingSubmittedApplication ? (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex w-full items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors sm:w-auto"
                >
                  Back to Dashboard
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center bg-gradient-to-r from-gold-500 to-gold-400 text-primary-950 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:cursor-wait disabled:opacity-75 sm:w-auto"
                >
                  {loading ? <AuthButtonLoader label={uploading ? 'Uploading files...' : 'Submitting...'} /> : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
