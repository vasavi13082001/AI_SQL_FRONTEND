import React from 'react'
import { Bell, Search, Moon, Sun, User } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

interface NavbarProps {
  onMenuClick: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 shadow-sm z-50">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4 flex-1">
          <div className="lg:ml-64 flex items-center gap-4 flex-1">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-dark-700 px-4 py-2 rounded-lg flex-1 max-w-md">
              <Search size={18} className="text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm w-full text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <User size={18} />
            </div>
            <span className="hidden sm:inline text-sm font-medium">Admin</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
