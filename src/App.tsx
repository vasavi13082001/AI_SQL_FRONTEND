import { useState } from 'react'
import { DarkModeProvider } from './context/DarkModeContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import OptimizationInsights from './components/OptimizationInsights'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          activePage={activePage}
          onNavigate={setActivePage}
        />

        {/* Main Content */}
        <main className="pt-16 lg:pl-64">
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'optimization' && <OptimizationInsights />}
          {!['dashboard', 'optimization'].includes(activePage) && (
            <div className="p-8 text-gray-500 dark:text-gray-400">
              This section is under construction.
            </div>
          )}
        </main>
      </div>
    </DarkModeProvider>
  )
}

export default App
