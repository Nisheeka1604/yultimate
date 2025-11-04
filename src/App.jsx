import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Navigation } from './components/Navigation'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { NotFound } from './pages/NotFound'
import { TournamentList } from './pages/tournaments/TournamentList'
import { CreateTournament } from './pages/tournaments/CreateTournament'
import { TournamentDetail } from './pages/tournaments/TournamentDetail'
import { CoachingSessions } from './pages/coaching/CoachingSessions'
import { CreateSession } from './pages/coaching/CreateSession'
import { StudentProgress } from './pages/coaching/StudentProgress'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <Navigation />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tournaments"
              element={
                <ProtectedRoute>
                  <TournamentList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tournaments/create"
              element={
                <ProtectedRoute requiredRole="admin">
                  <CreateTournament />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tournaments/:id"
              element={
                <ProtectedRoute>
                  <TournamentDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions"
              element={
                <ProtectedRoute>
                  <CoachingSessions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions/create"
              element={
                <ProtectedRoute requiredRole="coach">
                  <CreateSession />
                </ProtectedRoute>
              }
            />

            <Route
              path="/progress"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentProgress />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
