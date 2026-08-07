import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    localStorage.setItem('cookie_consent', 'rejected')
    setShowBanner(false)
  }

  const handleClose = () => {
    // If they close without choosing, treat as rejected
    localStorage.setItem('cookie_consent', 'rejected')
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="relative">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-gold-500 rounded-2xl flex items-center justify-center">
                        <Cookie className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        We Value Your Privacy
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base">
                        We use cookies to enhance your browsing experience, provide personalized content, 
                        and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
                        You can manage your preferences or reject all non-essential cookies.
                      </p>
                      <a 
                        href="#" 
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center mt-2"
                      >
                        Learn more about our privacy policy →
                      </a>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:flex-shrink-0">
                      <button
                        onClick={handleRejectAll}
                        className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all whitespace-nowrap"
                      >
                        Reject All
                      </button>
                      <button
                        onClick={handleAcceptAll}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-gold-500 text-white font-semibold hover:shadow-lg transition-all whitespace-nowrap"
                      >
                        Accept All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom decorative bar */}
                <div className="h-1 bg-gradient-to-r from-primary-600 via-gold-500 to-primary-600"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
