import React, { useEffect, useState } from 'react'
import { coachingService } from '../../services/coachingService'
import { useAuth } from '../../context/AuthContext'
import { TrendingUp, Calendar, Award, FileText } from 'lucide-react'

export function StudentProgress() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [reports, setReports] = useState([])
  const [assessments, setAssessments] = useState([])
  const [homeVisits, setHomeVisits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await coachingService.getStudentProfile(user.id)
        if (profile) {
          const [metricsData, reportsData, assessmentsData, homeVisitsData] = await Promise.all([
            coachingService.getStudentMetrics(profile.id),
            coachingService.getProgressReports({ studentId: user.id }),
            coachingService.getStudentAssessments(user.id),
            coachingService.getHomeVisits({ studentId: user.id }),
          ])

          setMetrics(metricsData)
          setReports(reportsData)
          setAssessments(assessmentsData)
          setHomeVisits(homeVisitsData)
        }
      } catch (err) {
        console.error('Error loading progress data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user.id])

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
        <h1 className="text-3xl font-bold text-secondary-800 mb-8">My Progress</h1>

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<TrendingUp className="text-primary-600" size={24} />}
              label="Attendance Rate"
              value={`${metrics.attendanceRate}%`}
            />
            <StatCard
              icon={<Calendar className="text-green-600" size={24} />}
              label="Home Visits"
              value={metrics.homeVisitsCount}
            />
            <StatCard
              icon={<Award className="text-blue-600" size={24} />}
              label="Latest Assessment"
              value={metrics.latestAssessmentScore || 'N/A'}
            />
            <StatCard
              icon={<FileText className="text-purple-600" size={24} />}
              label="Reports"
              value={metrics.reportsGenerated}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-secondary-800 mb-4">Recent Assessments</h2>
            {assessments.length === 0 ? (
              <p className="text-secondary-600">No assessments yet</p>
            ) : (
              <div className="space-y-4">
                {assessments.slice(0, 5).map(assessment => (
                  <div key={assessment.id} className="pb-4 border-b border-secondary-200 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-secondary-600">
                          {new Date(assessment.assessment_date).toLocaleDateString()}
                        </p>
                        <p className="font-semibold text-secondary-800 text-lg mt-1">Score: {assessment.score}</p>
                      </div>
                    </div>
                    {assessment.comments && (
                      <p className="text-secondary-600 text-sm mt-2">{assessment.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-secondary-800 mb-4">Progress Reports</h2>
            {reports.length === 0 ? (
              <p className="text-secondary-600">No reports generated yet</p>
            ) : (
              <div className="space-y-4">
                {reports.slice(0, 5).map(report => (
                  <div key={report.id} className="pb-4 border-b border-secondary-200 last:border-0">
                    <p className="text-sm text-secondary-600">
                      {new Date(report.report_date).toLocaleDateString()}
                    </p>
                    <p className="font-semibold text-secondary-800 mt-1">
                      Attendance: {report.attendance_rate}%
                    </p>
                    {report.recommendations && (
                      <p className="text-secondary-600 text-sm mt-2 line-clamp-2">
                        {report.recommendations}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold text-secondary-800 mb-4">Home Visits</h2>
          {homeVisits.length === 0 ? (
            <p className="text-secondary-600">No home visits recorded</p>
          ) : (
            <div className="space-y-4">
              {homeVisits.slice(0, 5).map(visit => (
                <div key={visit.id} className="pb-4 border-b border-secondary-200 last:border-0">
                  <p className="text-sm text-secondary-600">
                    {new Date(visit.visit_date).toLocaleDateString()}
                  </p>
                  <p className="font-semibold text-secondary-800 mt-1">Duration: {visit.duration_minutes} minutes</p>
                  {visit.progress_update && (
                    <p className="text-secondary-600 text-sm mt-2">{visit.progress_update}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
