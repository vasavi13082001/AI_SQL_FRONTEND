import { useMemo, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const activePage = useMemo(() => {
    const pathTokens = location.pathname.split('/').filter(Boolean)
    return pathTokens[pathTokens.length - 1] || 'dashboard'
  }, [location.pathname])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Navbar
        onMenuClick={() => setSidebarOpen((prevState) => !prevState)}
        userName={user.name}
        userRole={user.role}
        onLogout={logout}
      />
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activePage={activePage}
        onLogout={logout}
      />

      <main className="pt-16 lg:pl-64">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
