import React, { useEffect, useState } from 'react'
import { coachingService } from '../../services/coachingService'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { Plus, Calendar, Clock, Users } from 'lucide-react'
import { format } from 'date-fns'

export function CoachingSessions() {
  const { user, userProfile } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming')

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await coachingService.getCoachingSessions(
          userProfile?.role === 'coach' ? { coachId: user.id } : {}
        )
        setSessions(data)
      } catch (err) {
        console.error('Error loading sessions:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userProfile) {
      loadSessions()
    }
  }, [user, userProfile])

  const now = new Date()
  const filteredSessions = sessions.filter(s => {
    if (filter === 'upcoming') {
      return new Date(s.scheduled_date) > now && s.status === 'scheduled'
    } else if (filter === 'completed') {
      return s.status === 'completed'
    }
    return true
  })

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-800">Coaching Sessions</h1>
            <p className="text-secondary-600 mt-2">Manage and schedule coaching sessions</p>
          </div>
          {userProfile?.role === 'coach' && (
            <Link
              to="/sessions/create"
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span>Schedule Session</span>
            </Link>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          {['all', 'upcoming', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-secondary-700 hover:bg-secondary-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-secondary-600 text-lg">No sessions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionCard({ session }) {
  return (
    <Link
      to={`/sessions/${session.id}`}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-secondary-200 p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-secondary-800">{session.title}</h3>
          <p className="text-secondary-600 text-sm mt-1">{session.description}</p>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-secondary-600">
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>{format(new Date(session.scheduled_date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <span>{format(new Date(session.scheduled_date), 'HH:mm')} ({session.duration_minutes} min)</span>
            </div>
            {session.location && (
              <div className="flex items-center space-x-2">
                <Users size={16} />
                <span>{session.location}</span>
              </div>
            )}
          </div>
        </div>

        <span className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ml-4 ${
          session.status === 'completed' ? 'bg-secondary-200 text-secondary-800' :
          session.status === 'in_progress' ? 'bg-green-200 text-green-800' :
          'bg-blue-200 text-blue-800'
        }`}>
          {session.status}
        </span>
      </div>
    </Link>
  )
}
