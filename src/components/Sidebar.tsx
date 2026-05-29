import React from 'react'
import { Menu, X, LayoutDashboard, Settings, Users, FileText, BarChart3, LogOut, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/auth'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  activePage: string
  onLogout: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  path: string
  allowedRoles: UserRole[]
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activePage, onLogout }) => {
  const { hasRole } = useAuth()

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/app/dashboard',
      allowedRoles: ['admin', 'analyst', 'viewer'],
    },
    {
      id: 'optimization',
      label: 'Optimization Insights',
      icon: Sparkles,
      path: '/app/optimization',
      allowedRoles: ['admin', 'analyst'],
    },
    {
      id: 'analytics',
      label: 'AI Assistant',
      icon: BarChart3,
      path: '/app/analytics',
      allowedRoles: ['admin', 'analyst'],
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      path: '/app/users',
      allowedRoles: ['admin'],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      path: '/app/reports',
      allowedRoles: ['admin', 'analyst'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/app/settings',
      allowedRoles: ['admin'],
    },
  ] satisfies MenuItem[]

  const visibleMenuItems = menuItems.filter((item) => hasRole(item.allowedRoles))

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
            {visibleMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`sidebar-link w-full text-left ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-dark-700">
          <button
            onClick={onLogout}
            className="sidebar-link w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
