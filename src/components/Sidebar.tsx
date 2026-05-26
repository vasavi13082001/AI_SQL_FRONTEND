import React from 'react'
import { Menu, X, LayoutDashboard, Settings, Users, FileText, BarChart3, LogOut, Sparkles } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  activePage: string
  onNavigate: (page: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activePage, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'optimization', label: 'Optimization Insights', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-16 left-4 z-40 p-2 rounded-lg bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-gray-100"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 mt-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 z-40 transform transition-transform duration-300 ease-in-out pt-20 lg:pt-0 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-6 py-8 border-b border-gray-200 dark:border-dark-700">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Admin Panel</p>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 py-8 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id)
                      setIsOpen(false)
                    }}
                    className={`sidebar-link w-full text-left ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-dark-700">
          <button className="sidebar-link w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
