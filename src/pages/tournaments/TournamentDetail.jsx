import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tournamentService } from '../../services/tournamentService'
import { useAuth } from '../../context/AuthContext'
import { Calendar, MapPin, Users, Award, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export function TournamentDetail() {
  const { id } = useParams()
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const loadTournament = async () => {
      try {
        const [tourData, teamsData, matchesData] = await Promise.all([
          tournamentService.getTournamentById(id),
          tournamentService.getTeamsByTournament(id),
          tournamentService.getMatchesByTournament(id),
        ])

        setTournament(tourData)
        setTeams(teamsData)
        setMatches(matchesData)
      } catch (err) {
        console.error('Error loading tournament:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTournament()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600 text-lg">Tournament not found</p>
      </div>
    )
  }

  const approvedTeams = teams.filter(t => t.registration_status === 'approved')
  const pendingTeams = teams.filter(t => t.registration_status === 'pending')

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tournament.banner_url && (
          <div className="mb-8 h-64 rounded-lg overflow-hidden">
            <img
              src={tournament.banner_url}
              alt={tournament.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-800">{tournament.title}</h1>
            <div className="flex items-center space-x-4 mt-4 text-secondary-600">
              <div className="flex items-center space-x-2">
                <MapPin size={18} />
                <span>{tournament.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={18} />
                <span>
                  {format(new Date(tournament.start_date), 'MMM dd, yyyy')} - {format(new Date(tournament.end_date), 'MMM dd, yyyy')}
                </span>
              </div>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                tournament.status === 'completed' ? 'bg-secondary-200 text-secondary-800' :
                tournament.status === 'in_progress' ? 'bg-green-200 text-green-800' :
                tournament.status === 'registration_open' ? 'bg-blue-200 text-blue-800' :
                'bg-yellow-200 text-yellow-800'
              }`}>
                {tournament.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {userProfile?.role === 'admin' && (
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Edit size={18} />
                <span>Edit</span>
              </button>
              <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Trash2 size={18} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex border-b border-secondary-200 mb-8 overflow-x-auto">
          {['overview', 'teams', 'schedule', 'standings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-secondary-600 hover:text-secondary-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-secondary-800 mb-4">About</h2>
              <p className="text-secondary-700 mb-6">{tournament.description}</p>
              <h3 className="font-bold text-secondary-800 mb-2">Rules</h3>
              <p className="text-secondary-700 whitespace-pre-wrap">{tournament.rules}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-secondary-800 mb-4 flex items-center space-x-2">
                  <Users size={20} />
                  <span>Teams</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-secondary-600 text-sm">Approved Teams</p>
                    <p className="text-2xl font-bold text-primary-600">{approvedTeams.length}</p>
                  </div>
                  <div>
                    <p className="text-secondary-600 text-sm">Pending Approval</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingTeams.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-secondary-800 mb-4 flex items-center space-x-2">
                  <Award size={20} />
                  <span>Matches</span>
                </h3>
                <p className="text-2xl font-bold text-primary-600">{matches.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-700">Team Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-700">Manager</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-700">Players</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-700">Status</th>
                    {userProfile?.role === 'admin' && (
                      <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-700">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {teams.map(team => (
                    <tr key={team.id} className="border-b border-secondary-200 hover:bg-secondary-50">
                      <td className="px-6 py-4 font-medium text-secondary-800">{team.name}</td>
                      <td className="px-6 py-4 text-secondary-700">Manager</td>
                      <td className="px-6 py-4 text-secondary-700">{team.players?.length || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          team.registration_status === 'approved' ? 'bg-green-200 text-green-800' :
                          team.registration_status === 'rejected' ? 'bg-red-200 text-red-800' :
                          team.registration_status === 'waitlisted' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {team.registration_status}
                        </span>
                      </td>
                      {userProfile?.role === 'admin' && (
                        <td className="px-6 py-4">
                          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            View
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-secondary-600">No matches scheduled yet</p>
              </div>
            ) : (
              matches.map(match => (
                <div key={match.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-secondary-600">
                        {format(new Date(match.match_datetime), 'MMM dd, yyyy @ HH:mm')}
                      </p>
                      <h3 className="text-lg font-bold text-secondary-800 mt-2">
                        {match.team1?.name} vs {match.team2?.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        {match.team1_score !== null ? `${match.team1_score} - ${match.team2_score}` : 'TBD'}
                      </p>
                      <span className={`px-3 py-1 rounded text-xs font-semibold inline-block mt-2 ${
                        match.status === 'completed' ? 'bg-secondary-200 text-secondary-800' :
                        match.status === 'in_progress' ? 'bg-green-200 text-green-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {match.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-secondary-600">Standings will be available after matches are completed</p>
          </div>
        )}
      </div>
    </div>
  )
}
