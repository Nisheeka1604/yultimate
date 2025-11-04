import { supabase } from '../lib/supabase'

export const tournamentService = {
  async createTournament(tournamentData, userId) {
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        ...tournamentData,
        created_by: userId,
      })
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getTournaments(filters = {}) {
    let query = supabase.from('tournaments').select('*')

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.createdBy) {
      query = query.eq('created_by', filters.createdBy)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getTournamentById(tournamentId) {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async updateTournament(tournamentId, updates) {
    const { data, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', tournamentId)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getTeamsByTournament(tournamentId) {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        players(*)
      `)
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async createTeam(teamData) {
    const { data, error } = await supabase
      .from('teams')
      .insert(teamData)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async updateTeamRegistration(teamId, status, approvedBy) {
    const { data, error } = await supabase
      .from('teams')
      .update({
        registration_status: status,
        approved_by: approvedBy,
      })
      .eq('id', teamId)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async addPlayers(players) {
    const { data, error } = await supabase
      .from('players')
      .insert(players)
      .select()

    if (error) throw error
    return data
  },

  async getPlayersByTeam(teamId) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async createMatches(matches) {
    const { data, error } = await supabase
      .from('matches')
      .insert(matches)
      .select()

    if (error) throw error
    return data
  },

  async getMatchesByTournament(tournamentId) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        team1:team1_id(id, name),
        team2:team2_id(id, name)
      `)
      .eq('tournament_id', tournamentId)
      .order('match_datetime', { ascending: true })

    if (error) throw error
    return data
  },

  async updateMatchScore(matchId, team1Score, team2Score, status) {
    const { data, error } = await supabase
      .from('matches')
      .update({
        team1_score: team1Score,
        team2_score: team2Score,
        status,
      })
      .eq('id', matchId)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async submitSpiritScore(spiritScoreData) {
    const { data, error } = await supabase
      .from('spirit_scores')
      .insert(spiritScoreData)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getSpiritScoresByMatch(matchId) {
    const { data, error } = await supabase
      .from('spirit_scores')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getSpiritLeaderboard(tournamentId) {
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('team1_id, team2_id')
      .eq('tournament_id', tournamentId)
      .eq('status', 'completed')

    if (matchError) throw matchError

    const teamIds = new Set()
    matches.forEach(m => {
      teamIds.add(m.team1_id)
      teamIds.add(m.team2_id)
    })

    const { data: spirits, error: spiritError } = await supabase
      .from('spirit_scores')
      .select('opponent_team_id, rules_knowledge, fouls, body_contact, fairness, attitude, communication')

    if (spiritError) throw spiritError

    const leaderboard = {}
    spirits.forEach(s => {
      if (!leaderboard[s.opponent_team_id]) {
        leaderboard[s.opponent_team_id] = {
          scores: [],
          average: 0,
        }
      }
      leaderboard[s.opponent_team_id].scores.push(
        (s.rules_knowledge + s.fouls + s.body_contact + s.fairness + s.attitude + s.communication) / 6
      )
    })

    Object.keys(leaderboard).forEach(teamId => {
      const scores = leaderboard[teamId].scores
      leaderboard[teamId].average = scores.reduce((a, b) => a + b, 0) / scores.length
    })

    return leaderboard
  },
}
