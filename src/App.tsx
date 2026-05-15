import { useState } from 'react'
import { DarkModeProvider } from './context/DarkModeContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className="pt-16 lg:pl-64">
          <Dashboard />
        </main>
      </div>
    </DarkModeProvider>
  )
}

export default App
