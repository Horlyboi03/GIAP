import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff } from 'lucide-react'
import Navbar from '../components/Navbar'
import BrandLogo from '../components/BrandLogo'
import AuthButtonLoader from '../components/AuthButtonLoader'
import api from '../services/api'

export default function ResetPassword() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await api.post('/auth/reset-password', { token, password })
      setStatus(res.data.message)
      window.setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
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
          <div className="rounded-3xl glass-dark p-6 sm:p-8">
            <div className="text-center mb-8">
              <BrandLogo
                align="center"
                className="mb-4"
                iconClassName="w-16 h-16"
                titleClassName="text-2xl font-bold text-white"
                subtitleClassName="text-xs text-gray-400"
              />
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-gray-400">Create a new password for your GIAP account.</p>
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:border-gold-400 focus:outline-none"
                    placeholder="Enter a new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:border-gold-400 focus:outline-none"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 py-3 text-lg font-semibold text-primary-950 transition-all hover:shadow-lg disabled:cursor-wait disabled:opacity-75"
              >
                <span className="relative z-10">
                  {loading ? <AuthButtonLoader label="Updating Password..." /> : 'Reset Password'}
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
