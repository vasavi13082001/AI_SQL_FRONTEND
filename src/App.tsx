import { Navigate, Route, Routes } from 'react-router-dom'
import { DarkModeProvider } from './context/DarkModeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './components/Dashboard'
import OptimizationInsights from './components/OptimizationInsights'
import AnalyticsAssistant from './components/AnalyticsAssistant'
import AdminAnalyticsDashboard from './components/AdminAnalyticsDashboard'
import AIErrorDemoPage from './components/AIErrorDemoPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

const PlaceholderPage = () => (
  <div className="p-8 text-gray-500 dark:text-gray-400">This section is under construction.</div>
)

const RootRedirect = () => {
  const { isAuthenticated } = useAuth()

  return <Navigate to={isAuthenticated ? '/app/dashboard' : '/login'} replace />
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />

              <Route element={<ProtectedRoute allowedRoles={['admin', 'analyst']} />}>
                <Route path="analytics" element={<AnalyticsAssistant />} />
                <Route path="optimization" element={<OptimizationInsights />} />
                <Route path="reports" element={<PlaceholderPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="admin-analytics" element={<AdminAnalyticsDashboard />} />
                <Route path="users" element={<PlaceholderPage />} />
                <Route path="settings" element={<PlaceholderPage />} />
                <Route path="error-demo" element={<AIErrorDemoPage />} />
              </Route>

              <Route path="*" element={<PlaceholderPage />} />
            </Route>
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </DarkModeProvider>
  )
}

export default App
