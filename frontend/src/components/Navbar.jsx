import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { useState } from 'react'
import BrandLogo from './BrandLogo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [showMobileLogoutConfirm, setShowMobileLogoutConfirm] = useState(false)
  const applicantApplyPath = location.pathname === '/' ? '/register' : '/apply'

  const handleLogout = () => {
    logout()
    setShowMobileLogoutConfirm(false)
    setIsOpen(false)
    navigate('/')
  }

  return (
    <nav className="fixed w-full z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3">
            <BrandLogo />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-700 font-medium">Home</Link>
            {user?.role === 'applicant' && (
              <>
                <Link to={applicantApplyPath} className="text-gray-700 hover:text-primary-700 font-medium">Apply Now</Link>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-700 font-medium">Dashboard</Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 hover:text-primary-700 font-medium">Admin Dashboard</Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-700 hover:text-red-600">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary-700 font-medium">Login</Link>
                <Link to="/register" className="bg-gradient-to-r from-primary-700 to-gold-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all">Register</Link>
              </div>
            )}
          </div>

          <motion.button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.94 }}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-100 bg-gradient-to-br from-white to-primary-50 text-primary-900 shadow-lg shadow-primary-900/10 transition-all hover:shadow-xl md:hidden"
          >
            <span className="pointer-events-none relative h-5 w-6">
              <span className={`absolute left-0 h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${isOpen ? 'top-2 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 top-2 h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${isOpen ? 'top-2 -rotate-45' : 'top-4'}`} />
            </span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="border-t border-primary-100 bg-white/95 shadow-xl shadow-primary-900/5 backdrop-blur-xl md:hidden"
        >
          <div className="max-w-7xl mx-auto space-y-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link to="/" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary-700 font-medium">Home</Link>
            {user?.role === 'applicant' && (
              <>
                <Link to={applicantApplyPath} onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary-700 font-medium">Apply Now</Link>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary-700 font-medium">Dashboard</Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary-700 font-medium">Admin Dashboard</Link>
            )}
            {user ? (
              <div className="space-y-3 rounded-2xl border border-red-100 bg-red-50/70 p-4">
                <button
                  type="button"
                  onClick={() => setShowMobileLogoutConfirm(true)}
                  className="flex items-center space-x-2 text-red-600 transition-colors hover:text-red-700"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
                <AnimatePresence>
                  {showMobileLogoutConfirm && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm"
                    >
                      <p className="text-sm font-medium text-gray-900">Are you sure you want to logout?</p>
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowMobileLogoutConfirm(false)}
                          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          No
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-primary-700 font-medium">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block bg-gradient-to-r from-primary-700 to-gold-500 text-white px-6 py-2 rounded-full font-medium text-center">Register</Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </nav>
  )
}
