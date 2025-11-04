import { supabase } from '../lib/supabase'

export const coachingService = {
  async createStudentProfile(studentData) {
    const { data, error } = await supabase
      .from('student_profiles')
      .insert(studentData)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getStudentProfile(userId) {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async updateStudentProfile(studentId, updates) {
    const { data, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('id', studentId)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async createCoachingSession(sessionData) {
    const { data, error } = await supabase
      .from('coaching_sessions')
      .insert(sessionData)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getCoachingSessions(filters = {}) {
    let query = supabase.from('coaching_sessions').select('*')

    if (filters.coachId) {
      query = query.eq('coach_id', filters.coachId)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query.order('scheduled_date', { ascending: true })

    if (error) throw error
    return data
  },

  async updateCoachingSession(sessionId, updates) {
    const { data, error } = await supabase
      .from('coaching_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async recordAttendance(attendanceData) {
    const { data, error } = await supabase
      .from('session_attendance')
      .insert(attendanceData)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getSessionAttendance(sessionId) {
    const { data, error } = await supabase
      .from('session_attendance')
      .select('*')
      .eq('session_id', sessionId)

    if (error) throw error
    return data
  },

  async getStudentAttendance(studentId) {
    const { data, error } = await supabase
      .from('session_attendance')
      .select(`
        *,
        coaching_sessions(title, scheduled_date)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async recordHomeVisit(visitData) {
    const { data, error } = await supabase
      .from('home_visits')
      .insert(visitData)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getHomeVisits(filters = {}) {
    let query = supabase.from('home_visits').select('*')

    if (filters.coachId) {
      query = query.eq('coach_id', filters.coachId)
    }

    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId)
    }

    const { data, error } = await query.order('visit_date', { ascending: false })

    if (error) throw error
    return data
  },

  async recordLSASAssessment(assessmentData) {
    const { data, error } = await supabase
      .from('lsas_assessments')
      .insert(assessmentData)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getStudentAssessments(studentId) {
    const { data, error } = await supabase
      .from('lsas_assessments')
      .select('*')
      .eq('student_id', studentId)
      .order('assessment_date', { ascending: false })

    if (error) throw error
    return data
  },

  async createProgressReport(reportData) {
    const { data, error } = await supabase
      .from('progress_reports')
      .insert(reportData)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getProgressReports(filters = {}) {
    let query = supabase.from('progress_reports').select('*')

    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId)
    }

    if (filters.coachId) {
      query = query.eq('coach_id', filters.coachId)
    }

    const { data, error } = await query.order('report_date', { ascending: false })

    if (error) throw error
    return data
  },

  async getStudentMetrics(studentId) {
    const [attendance, homeVisits, assessments, reports] = await Promise.all([
      supabase
        .from('session_attendance')
        .select('attended')
        .eq('student_id', studentId),
      supabase
        .from('home_visits')
        .select('id')
        .eq('student_id', studentId),
      supabase
        .from('lsas_assessments')
        .select('score')
        .eq('student_id', studentId),
      supabase
        .from('progress_reports')
        .select('*')
        .eq('student_id', studentId),
    ])

    const attendanceRate = attendance.data
      ? (attendance.data.filter(a => a.attended).length / attendance.data.length) * 100
      : 0

    return {
      attendanceRate: Math.round(attendanceRate),
      homeVisitsCount: homeVisits.data?.length || 0,
      latestAssessmentScore: assessments.data?.[0]?.score || null,
      reportsCount: reports.data?.length || 0,
    }
  },
}
