import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import Navbar from '../components/Navbar'
import BrandLogo from '../components/BrandLogo'
import AuthButtonLoader from '../components/AuthButtonLoader'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setStatus('')

    try {
      const res = await api.post('/auth/forgot-password', { email })
      setStatus(res.data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center px-4 pb-10 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="relative rounded-3xl glass-dark p-6 sm:p-8">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
              <svg width="400" height="400" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="url(#bgGradientForgot)" />
                <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
                <path d="M24 6C28.5 9 31.5 14.5 31.5 21s-3 12-7.5 15" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
                <path d="M24 6C19.5 9 16.5 14.5 16.5 21s3 12 7.5 15" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
                <line x1="6" y1="24" x2="42" y2="24" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <path d="M18 20L21 23L27 17" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M24 28C24 28 20 31 16 28C14 26.5 14 23 16 22C18 21 24 24 24 24C24 24 30 21 32 22C34 23 34 26.5 32 28C28 31 24 28 24 28Z" fill="#FFD700" fillOpacity="0.9" />
                <defs>
                  <linearGradient id="bgGradientForgot" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="relative text-center mb-8">
              <BrandLogo
                align="center"
                className="mb-4"
                iconClassName="w-16 h-16"
                titleClassName="text-2xl font-bold text-white"
                subtitleClassName="text-xs text-gray-400"
              />
              <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
              <p className="text-gray-400">Enter your email and we&apos;ll send you a reset link.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/20 px-4 py-3 text-red-200">
                {error}
              </div>
            )}

            {status && (
              <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-200">
                {status}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:border-gold-400 focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 py-3 text-lg font-semibold text-primary-950 transition-all hover:shadow-lg disabled:cursor-wait disabled:opacity-75"
              >
                <span className="relative z-10">
                  {loading ? <AuthButtonLoader label="Sending Reset Link..." /> : 'Send Reset Link'}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-500"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-400">
              <Link to="/login" className="font-semibold text-gold-400 hover:text-gold-300">
                Back to Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
