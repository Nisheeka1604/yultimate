import React, { useEffect, useState } from 'react'
import { tournamentService } from '../../services/tournamentService'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { Plus, Calendar, MapPin, Users, Eye } from 'lucide-react'
import { format } from 'date-fns'

export function TournamentList() {
  const { userProfile } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const data = await tournamentService.getTournaments()
        setTournaments(data)
      } catch (err) {
        console.error('Error loading tournaments:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTournaments()
  }, [])

  const filteredTournaments = tournaments.filter(t => {
    if (filter === 'all') return true
    return t.status === filter
  })

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-800">Tournaments</h1>
            <p className="text-secondary-600 mt-2">Manage and view tournaments</p>
          </div>
          {userProfile?.role === 'admin' && (
            <Link
              to="/tournaments/create"
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span>Create Tournament</span>
            </Link>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          {['all', 'draft', 'registration_open', 'in_progress', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-secondary-700 hover:bg-secondary-100'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary-600 text-lg">No tournaments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TournamentCard({ tournament }) {
  return (
    <Link
      to={`/tournaments/${tournament.id}`}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-secondary-200 overflow-hidden"
    >
      {tournament.banner_url && (
        <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden">
          <img
            src={tournament.banner_url}
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-lg text-secondary-800 flex-1">{tournament.title}</h3>
          <span className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${
            tournament.status === 'completed' ? 'bg-secondary-200 text-secondary-800' :
            tournament.status === 'in_progress' ? 'bg-green-200 text-green-800' :
            tournament.status === 'registration_open' ? 'bg-blue-200 text-blue-800' :
            tournament.status === 'draft' ? 'bg-yellow-200 text-yellow-800' :
            'bg-gray-200 text-gray-800'
          }`}>
            {tournament.status.replace(/_/g, ' ')}
          </span>
        </div>

        <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
          {tournament.description}
        </p>

        <div className="space-y-2 text-sm text-secondary-600">
          <div className="flex items-center space-x-2">
            <MapPin size={16} />
            <span>{tournament.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={16} />
            <span>
              {format(new Date(tournament.start_date), 'MMM dd')} - {format(new Date(tournament.end_date), 'MMM dd')}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-2 text-primary-600 font-medium text-sm">
          <Eye size={16} />
          <span>View Details</span>
        </div>
      </div>
    </Link>
  )
}
