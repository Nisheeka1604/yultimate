import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-secondary-800 mb-4">404</h1>
        <p className="text-xl text-secondary-600 mb-8">Page not found</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <Home size={20} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  )
}
