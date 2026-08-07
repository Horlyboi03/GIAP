import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Navbar from '../components/Navbar'
import BrandLogo from '../components/BrandLogo'
import AuthButtonLoader from '../components/AuthButtonLoader'

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20 px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="relative glass-dark rounded-3xl p-8">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
              <svg width="400" height="400" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="url(#bgGradient)" />
                <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
                <path d="M24 6C28.5 9 31.5 14.5 31.5 21s-3 12-7.5 15" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
                <path d="M24 6C19.5 9 16.5 14.5 16.5 21s3 12 7.5 15" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
                <line x1="6" y1="24" x2="42" y2="24" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <path d="M18 20L21 23L27 17" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M24 28C24 28 20 31 16 28C14 26.5 14 23 16 22C18 21 24 24 24 24C24 24 30 21 32 22C34 23 34 26.5 32 28C28 31 24 28 24 28Z" fill="#FFD700" fillOpacity="0.9" />
                <defs>
                  <linearGradient id="bgGradient" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <Link
              to="/"
              aria-label="Go back to home"
              className="absolute left-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-all hover:bg-white/15 hover:text-gold-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="text-center mb-8">
              <BrandLogo
                align="center"
                className="mb-4"
                iconClassName="w-16 h-16"
                titleClassName="text-2xl font-bold text-white"
                subtitleClassName="text-xs text-gray-400"
              />
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-gray-400">Join GIAP today</p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link to="/forgot-password" className="text-sm font-medium text-gold-400 hover:text-gold-300">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-gold-500 to-gold-400 text-primary-950 py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:cursor-wait disabled:opacity-75"
              >
                <span className="relative z-10">
                  {loading ? <AuthButtonLoader label="Creating Account..." /> : 'Create Account'}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-500"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-gold-400 font-semibold hover:text-gold-300">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
