import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, Users, TrendingUp, Award, CheckCircle, ChevronRight, ArrowRight, Briefcase, BookOpen, Sprout, Users as UsersIcon, Building, GraduationCap, Mail, MapPin, Facebook, Instagram } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])

  return <span>{count}{suffix}</span>
}

export default function Home() {
  const { user } = useAuth() // Get authentication status
  const supportEmail = 'maryygeorge193@gmail.com'
  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/profile.php?id=61573275546877',
      icon: Facebook,
      iconWrapperClass: 'bg-[#1877F2] shadow-[0_10px_30px_rgba(24,119,242,0.24)]',
      iconClass: 'text-white',
      titleClass: 'text-[#1877F2]',
      cardClass: 'border-blue-100 bg-blue-50/80 hover:border-blue-200 hover:bg-blue-50',
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/___agentmarygeorge?igsh=aHZvbHZwbmZob3Mw',
      icon: Instagram,
      iconWrapperClass: 'bg-[linear-gradient(135deg,#F58529_0%,#DD2A7B_52%,#8134AF_78%,#515BD4_100%)] shadow-[0_10px_30px_rgba(221,42,123,0.24)]',
      iconClass: 'text-white',
      titleClass: 'text-[#DD2A7B]',
      cardClass: 'border-pink-100 bg-rose-50/80 hover:border-pink-200 hover:bg-rose-50',
    },
  ]
  const [categories, setCategories] = useState([])
  const [faqs, setFaqs] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [openFaq, setOpenFaq] = useState(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [cookieConsent, setCookieConsent] = useState(null)
  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  })
  const [contactStatus, setContactStatus] = useState('')

  useEffect(() => {
    api.get('/grants/categories')
      .then(res => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.warn('Failed to load categories:', err)
        setCategories([])
      })
    api.get('/grants/faqs')
      .then(res => setFaqs(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.warn('Failed to load FAQs:', err)
        setFaqs([])
      })
    api.get('/grants/testimonials')
      .then(res => setTestimonials(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.warn('Failed to load testimonials:', err)
        setTestimonials([])
      })
  }, [])

  useEffect(() => {
    if (testimonials.length > 0) {
      const timer = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [testimonials])

  useEffect(() => {
    // Check if cookie consent has been saved
    const savedConsent = localStorage.getItem('giap_cookie_consent')
    
    if (user) {
      // User is logged in - don't show banner
      setCookieConsent('logged_in')
    } else if (savedConsent) {
      // User has already made a choice - don't show banner
      setCookieConsent(savedConsent)
    } else {
      // First visit and not logged in - show banner
      setCookieConsent(null)
    }
  }, [user])

  const applyPath = '/register'

  const handleCookieConsent = (choice) => {
    // Save choice to localStorage so it persists
    localStorage.setItem('giap_cookie_consent', choice)
    setCookieConsent(choice)
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()

    const { fullName, email, phone, message } = contactForm
    if (!fullName || !email || !message) {
      setContactStatus('Please complete your name, email, and message before sending.')
      return
    }

    const subject = encodeURIComponent(`GIAP Website Inquiry from ${fullName}`)
    const body = encodeURIComponent(
      `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`
    )

    setContactStatus('Opening your email app so you can send your message to GIAP.')
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm mb-6 backdrop-blur-sm">
              <Globe className="w-4 h-4 mr-2" />
              Operating in 40+ Countries
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Empowering Dreams Through
              <span className="text-gold-400 block">Global Financial Assistance</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Providing life-changing funding opportunities to individuals, businesses, students, farmers, and organizations worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={applyPath} className="bg-gradient-to-r from-gold-500 to-gold-400 text-primary-950 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-gold-500/30 transition-all transform hover:scale-105">
                Apply Now
              </Link>
              <a href="#about" className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all">
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { number: 2.5, suffix: 'B+', label: 'Distributed', icon: TrendingUp },
              { number: 120, suffix: 'K+', label: 'Beneficiaries', icon: Users },
              { number: 40, suffix: '+', label: 'Countries', icon: Globe },
              { number: 11, suffix: '+', label: 'Years of Impact', icon: Award }
            ].map((stat, i) => (
              <div key={i} className="text-center glass-dark rounded-2xl p-6">
                <stat.icon className="w-8 h-8 text-gold-400 mx-auto mb-3" />
                <div className="text-4xl font-bold text-white mb-1">
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-gray-300">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">About GIAP</h2>
              <p className="text-gray-600 mb-4 text-lg">
                Established in 2015, the Global International Assistance Program has been at the forefront of providing financial empowerment opportunities worldwide.
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                Our mission is to support citizens suffering from diseases, health issues, cancer, disabilities, poverty, widows, widowers, divorced individuals, those needing surgery, retired, married, single, young, old, semi-retired, self-employed, and many others facing life's challenges through non-repayable grants. Qualified applicants will be able to receive between the ranges of $100,000 to $450,000.
              </p>
              <div className="space-y-3">
                {['Transparent Process', 'Global Reach', 'Fast Approval', 'Expert Support'].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-gold-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-50 rounded-3xl p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full">
                  {[2015, 2018, 2021, 2024].map((year, i) => (
                    <div key={i} className="glass bg-white rounded-2xl p-6 text-center">
                      <div className="text-3xl font-bold text-primary-700">{year}</div>
                      <div className="text-sm text-gray-500 mt-1">Milestone {i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative overflow-hidden py-16 sm:py-18 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_30%)]" />
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute -top-20 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-gold-500/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/10 bg-white/10 text-xs sm:text-sm text-white/80 backdrop-blur-sm mb-5">
              Grant Journey
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto">Simple 6-step process to get your grant</p>
          </div>
          
          <div className="grid sm:grid-cols-2 xl:grid-cols-6 gap-4">
            {[
              { step: 1, title: 'Submit Application' },
              { step: 2, title: 'Eligibility Review' },
              { step: 3, title: 'Background Verification' },
              { step: 4, title: 'Committee Evaluation' },
              { step: 5, title: 'Approval Process' },
              { step: 6, title: 'Grant Disbursement' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                animate={{ scale: [1, 1.02, 1], opacity: [0.92, 1, 0.92] }}
                viewport={{ once: true }}
                transition={{
                  opacity: {
                    duration: 5.8 + (i % 3) * 0.5,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  },
                  scale: {
                    duration: 5.8 + (i % 3) * 0.5,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  },
                }}
                className="relative"
              >
                <div className="h-full rounded-xl border border-white/10 bg-white/10 p-5 text-center shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-2xl hover:shadow-primary-950/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-gold-500 rounded-full flex items-center justify-center text-white text-base font-bold mx-auto mb-3 shadow-lg shadow-primary-950/30">
                    {item.step}
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">{item.title}</h3>
                </div>
                {i < 5 && <ChevronRight className="hidden xl:block absolute -right-2 top-1/2 transform -translate-y-1/2 text-white/35 w-6 h-6" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Benefits of GIAP Grants</h2>
            <p className="text-xl text-gray-600">Transform your future with our comprehensive support</p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: Briefcase, title: 'Business Growth', desc: 'Scale your business' },
              { icon: BookOpen, title: 'Educational Advancement', desc: 'Invest in learning' },
              { icon: Sprout, title: 'Agricultural Expansion', desc: 'Boost farming' },
              { icon: UsersIcon, title: 'Job Creation', desc: 'Create employment' },
              { icon: Building, title: 'Community Development', desc: 'Build communities' },
              { icon: GraduationCap, title: 'Financial Independence', desc: 'Achieve freedom' }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 text-center hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Grant Categories */}
      <section className="py-20 bg-gradient-to-br from-primary-950 to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Grant Categories</h2>
            <p className="text-xl text-gray-300">Choose the grant that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-dark rounded-2xl p-8 hover:bg-white/10 transition-all"
              >
                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                <div className="text-gold-400 text-xl font-semibold mb-4">
                  ${category.min_amount.toLocaleString()} - ${category.max_amount.toLocaleString()}
                </div>
                <p className="text-gray-300 mb-6">{category.description}</p>
                <Link to={applyPath} className="inline-flex items-center text-white font-semibold hover:text-gold-400 transition-colors">
                  Apply Now <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Hear from our beneficiaries</p>
          </div>

          {testimonials.length > 0 && (
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-gold-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Users className="w-12 h-12 text-white" />
              </div>
              <p className="text-2xl text-gray-700 mb-6 italic">"{testimonials[currentTestimonial].story}"</p>
              <div className="font-semibold text-gray-900 text-lg">{testimonials[currentTestimonial].name}</div>
              <div className="text-gray-500">{testimonials[currentTestimonial].country} • ${testimonials[currentTestimonial].grant_amount.toLocaleString()} Grant</div>
            </motion.div>
          )}

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === currentTestimonial ? 'bg-primary-600 w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Find answers to common questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === faq.id ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === faq.id && (
                  <div className="px-6 pb-5 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Get In Touch</h2>
              <p className="text-gray-600 mb-8 text-lg">Have questions? We're here to help.</p>
              
              <div className="space-y-6">
                {/* Program Coordinator Info */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">Program Coordinator</h4>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xl">MG</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 text-lg">Mary George</h5>
                      <p className="text-gray-600 mb-2">Program Coordinator</p>
                      <a href="mailto:maryygeorge193@gmail.com" className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>maryygeorge193@gmail.com</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">{supportEmail}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p className="flex items-center gap-2 text-gray-600">
                      <Globe className="w-4 h-4 text-primary-600" />
                      <span>Global Headquarters</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="space-y-3">
                    {socialLinks.map(({ name, href, icon: Icon, iconWrapperClass, iconClass, titleClass, cardClass }) => (
                      <a
                        key={name}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-gray-700 transition-all hover:-translate-y-0.5 ${cardClass}`}
                      >
                        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconWrapperClass}`}>
                          <Icon className={`h-5 w-5 ${iconClass}`} />
                        </span>
                        <span>
                          <span className={`block text-sm font-semibold ${titleClass}`}>{name}</span>
                          <span className="block text-xs text-gray-500">Open official profile</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-950 to-primary-900 rounded-3xl p-8">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={contactForm.fullName}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, fullName: e.target.value })
                      setContactStatus('')
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={contactForm.email}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, email: e.target.value })
                      setContactStatus('')
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={contactForm.phone}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, phone: e.target.value })
                      setContactStatus('')
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, message: e.target.value })
                      setContactStatus('')
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 resize-none"
                  />
                </div>
                {contactStatus && (
                  <p className="text-sm text-gold-300">{contactStatus}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-primary-950 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {!cookieConsent && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-x-0 bottom-4 z-[60] px-4 sm:px-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-[28px] border border-white/10 bg-[#0b0b0b]/95 px-5 py-5 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-400">Cookie Preferences</p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">
                  We use cookies to improve your experience, remember your preferences, and keep the GIAP website running smoothly.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => handleCookieConsent('allow')}
                className="rounded-full border border-gold-400/30 bg-gold-400/10 px-5 py-2.5 text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-400/20"
              >
                Allow Cookies
              </button>
              <button
                type="button"
                onClick={() => handleCookieConsent('approve_all')}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary-950 transition-colors hover:bg-gold-100"
              >
                Approve All
              </button>
              <button
                type="button"
                onClick={() => handleCookieConsent('reject_all')}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Reject All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
