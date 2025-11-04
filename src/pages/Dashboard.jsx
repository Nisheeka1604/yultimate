import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { tournamentService } from '../services/tournamentService'
import { coachingService } from '../services/coachingService'
import { Calendar, Users, Award, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export function Dashboard() {
  const { userProfile, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        if (userProfile?.role === 'admin') {
          const tournaments = await tournamentService.getTournaments()
          setStats({
            tournamentsCount: tournaments.length,
            activeTournaments: tournaments.filter(t => t.status === 'in_progress').length,
          })
        } else if (userProfile?.role === 'coach') {
          const sessions = await coachingService.getCoachingSessions({ coachId: user.id })
          const students = new Set()

          const allAttendance = await Promise.all(
            sessions.map(s => coachingService.getSessionAttendance(s.id))
          )

          allAttendance.forEach(attendance => {
            attendance?.forEach(a => students.add(a.student_id))
          })

          setStats({
            sessionsCount: sessions.length,
            upcomingSessions: sessions.filter(s => s.status === 'scheduled').length,
            studentsCount: students.size,
          })
        } else if (userProfile?.role === 'student') {
          const profile = await coachingService.getStudentProfile(user.id)
          const metrics = profile ? await coachingService.getStudentMetrics(profile.id) : null

          setStats({
            attendanceRate: metrics?.attendanceRate || 0,
            homeVisits: metrics?.homeVisitsCount || 0,
            reportsGenerated: metrics?.reportsCount || 0,
          })
        }
      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userProfile) {
      loadDashboard()
    }
  }, [userProfile, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-800">
            Welcome, {userProfile?.full_name || 'User'}!
          </h1>
          <p className="text-secondary-600 mt-2">
            Role: <span className="font-semibold text-primary-600 capitalize">{userProfile?.role}</span>
          </p>
        </div>

        {userProfile?.role === 'admin' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<Award className="text-primary-600" size={24} />}
                label="Total Tournaments"
                value={stats?.tournamentsCount || 0}
              />
              <StatCard
                icon={<Calendar className="text-green-600" size={24} />}
                label="Active Tournaments"
                value={stats?.activeTournaments || 0}
              />
              <StatCard
                icon={<Users className="text-blue-600" size={24} />}
                label="Total Users"
                value="N/A"
              />
              <StatCard
                icon={<TrendingUp className="text-purple-600" size={24} />}
                label="System Health"
                value="Good"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickActionCard
                title="Create Tournament"
                description="Start a new tournament"
                href="/tournaments/create"
                icon={<Calendar size={20} />}
              />
              <QuickActionCard
                title="Manage Users"
                description="View and manage platform users"
                href="/users"
                icon={<Users size={20} />}
              />
            </div>
          </div>
        )}

        {userProfile?.role === 'coach' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={<Calendar className="text-primary-600" size={24} />}
                label="Sessions Scheduled"
                value={stats?.sessionsCount || 0}
              />
              <StatCard
                icon={<Users className="text-green-600" size={24} />}
                label="Students"
                value={stats?.studentsCount || 0}
              />
              <StatCard
                icon={<TrendingUp className="text-blue-600" size={24} />}
                label="Upcoming Sessions"
                value={stats?.upcomingSessions || 0}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickActionCard
                title="Schedule Session"
                description="Create a new coaching session"
                href="/sessions/create"
                icon={<Calendar size={20} />}
              />
              <QuickActionCard
                title="View Students"
                description="Manage your students"
                href="/students"
                icon={<Users size={20} />}
              />
              <QuickActionCard
                title="Record Home Visit"
                description="Log a home visit"
                href="/home-visits/create"
                icon={<Users size={20} />}
              />
              <QuickActionCard
                title="Generate Report"
                description="Create a progress report"
                href="/reports/create"
                icon={<TrendingUp size={20} />}
              />
            </div>
          </div>
        )}

        {userProfile?.role === 'student' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={<TrendingUp className="text-primary-600" size={24} />}
                label="Attendance Rate"
                value={`${stats?.attendanceRate || 0}%`}
              />
              <StatCard
                icon={<Calendar className="text-green-600" size={24} />}
                label="Home Visits"
                value={stats?.homeVisits || 0}
              />
              <StatCard
                icon={<Award className="text-blue-600" size={24} />}
                label="Reports Generated"
                value={stats?.reportsGenerated || 0}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickActionCard
                title="View My Progress"
                description="Check your progress reports"
                href="/progress"
                icon={<TrendingUp size={20} />}
              />
              <QuickActionCard
                title="Browse Tournaments"
                description="Join a tournament"
                href="/tournaments"
                icon={<Award size={20} />}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-600">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-secondary-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-secondary-800 mt-2">{value}</p>
        </div>
        <div className="bg-primary-50 p-3 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({ title, description, href, icon }) {
  return (
    <Link
      to={href}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-secondary-200 hover:border-primary-300"
    >
      <div className="flex items-start space-x-4">
        <div className="bg-primary-50 p-3 rounded-lg text-primary-600">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-secondary-800">{title}</h3>
          <p className="text-secondary-600 text-sm mt-1">{description}</p>
        </div>
      </div>
    </Link>
  )
}
