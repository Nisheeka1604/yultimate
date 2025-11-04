import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Navigation() {
  const { user, userProfile, isAuthenticated, signout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignout = async () => {
    await signout()
    navigate('/login')
  }

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Login', href: '/login' },
        { label: 'Sign Up', href: '/signup' },
      ]
    }

    const baseLinks = [
      { label: 'Dashboard', href: '/dashboard' },
    ]

    if (userProfile?.role === 'admin') {
      return [
        ...baseLinks,
        { label: 'Tournaments', href: '/tournaments' },
        { label: 'Coaching', href: '/coaching' },
        { label: 'Users', href: '/users' },
      ]
    }

    if (userProfile?.role === 'coach') {
      return [
        ...baseLinks,
        { label: 'Sessions', href: '/sessions' },
        { label: 'Students', href: '/students' },
        { label: 'Reports', href: '/reports' },
      ]
    }

    if (userProfile?.role === 'student') {
      return [
        ...baseLinks,
        { label: 'My Events', href: '/my-events' },
        { label: 'Tournaments', href: '/tournaments' },
        { label: 'Progress', href: '/progress' },
      ]
    }

    return baseLinks
  }

  const navLinks = getNavLinks()

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg text-secondary-800">
              Y-Management
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="text-secondary-600 hover:text-primary-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <div className="flex items-center space-x-2 text-sm text-secondary-600">
                  <User size={16} />
                  <span>{userProfile?.full_name || user?.email}</span>
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                    {userProfile?.role}
                  </span>
                </div>
                <button
                  onClick={handleSignout}
                  className="flex items-center space-x-2 text-secondary-600 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-secondary-600"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-secondary-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-3 py-2 rounded-md text-secondary-700 hover:bg-secondary-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={() => {
                  handleSignout()
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
