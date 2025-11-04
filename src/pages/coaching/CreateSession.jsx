import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { coachingService } from '../../services/coachingService'
import { AlertCircle } from 'lucide-react'

export function CreateSession() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    duration_minutes: 60,
    location: '',
    max_attendees: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await coachingService.createCoachingSession({
        ...formData,
        coach_id: user.id,
        duration_minutes: parseInt(formData.duration_minutes),
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
      })
      navigate('/sessions')
    } catch (err) {
      setError(err.message || 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-secondary-800 mb-8">Schedule Coaching Session</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-2">
                Session Title
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., Basketball Skills Training"
              />
            </div>

            <div>
              <label htmlFor="scheduled_date" className="block text-sm font-medium text-secondary-700 mb-2">
                Date & Time
              </label>
              <input
                id="scheduled_date"
                type="datetime-local"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="duration_minutes" className="block text-sm font-medium text-secondary-700 mb-2">
                Duration (minutes)
              </label>
              <input
                id="duration_minutes"
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                min="15"
                step="15"
                required
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-2">
                Location
              </label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., Sports Complex"
              />
            </div>

            <div>
              <label htmlFor="max_attendees" className="block text-sm font-medium text-secondary-700 mb-2">
                Max Attendees (optional)
              </label>
              <input
                id="max_attendees"
                type="number"
                name="max_attendees"
                value={formData.max_attendees}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Describe the session content and objectives..."
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? 'Scheduling...' : 'Schedule Session'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/sessions')}
              className="flex-1 bg-secondary-200 hover:bg-secondary-300 text-secondary-800 font-medium py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
