import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)

        if (currentUser) {
          const profile = await authService.getUserProfile(currentUser.id)
          setUserProfile(profile)
        }
      } catch (err) {
        console.error('Error checking user:', err)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          const profile = await authService.getUserProfile(session.user.id)
          setUserProfile(profile)
        } else {
          setUser(null)
          setUserProfile(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signup = async (email, password, fullName, role) => {
    try {
      setError(null)
      await authService.signup(email, password, fullName, role)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const signin = async (email, password) => {
    try {
      setError(null)
      await authService.signin(email, password)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const signout = async () => {
    try {
      setError(null)
      await authService.signout()
      setUser(null)
      setUserProfile(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signup,
    signin,
    signout,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'admin',
    isCoach: userProfile?.role === 'coach',
    isStudent: userProfile?.role === 'student',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
