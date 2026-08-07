import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch((err) => {
          const status = err.response?.status
          if (status === 401 || status === 404 || status === 422) {
            localStorage.removeItem('access_token')
            setUser(null)
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      localStorage.removeItem('last_activity_at')
      return undefined
    }

    let timeoutId

    const handleAutoLogout = () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('last_activity_at')
      setUser(null)
    }

    const scheduleLogoutCheck = () => {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        const lastActivityAt = Number(localStorage.getItem('last_activity_at') || Date.now())
        if (Date.now() - lastActivityAt >= INACTIVITY_TIMEOUT_MS) {
          handleAutoLogout()
          return
        }

        scheduleLogoutCheck()
      }, INACTIVITY_TIMEOUT_MS)
    }

    const markActivity = () => {
      localStorage.setItem('last_activity_at', String(Date.now()))
      scheduleLogoutCheck()
    }

    markActivity()
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, true)
    })

    return () => {
      window.clearTimeout(timeoutId)
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity, true)
      })
    }
  }, [user])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('access_token', res.data.access_token)
    localStorage.setItem('last_activity_at', String(Date.now()))
    setUser(res.data.user)
    return res.data
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    localStorage.setItem('access_token', res.data.access_token)
    localStorage.setItem('last_activity_at', String(Date.now()))
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('last_activity_at')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
