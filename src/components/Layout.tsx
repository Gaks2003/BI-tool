import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, LogOut, BarChart3, Database } from 'lucide-react'
import { useAuthStore, useThemeStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import { Button } from './ui/Button'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, setUser } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const location = useLocation()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const navItems = [
    { path: '/dashboards', label: 'Dashboards', icon: BarChart3 },
    { path: '/datasets', label: 'Datasets', icon: Database },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >


        {/* Navigation */}
        <nav className="flex-1 p-2 pt-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-2 mt-auto border-t border-gray-200 dark:border-gray-700">
          <div className={`flex ${sidebarOpen ? 'justify-between' : 'flex-col space-y-2'} items-center`}>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              className="p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Modern BI
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}