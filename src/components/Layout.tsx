import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Moon, Sun, LogOut } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const navItems = [
    { path: '/dashboards', label: 'Dashboards' },
    { path: '/datasets', label: 'Datasets' },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav style={{ 
        background: theme === 'dark' ? '#2a2a2a' : 'white', 
        padding: '16px 0', 
        borderBottom: '1px solid #ddd',
        marginBottom: '20px'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <h1 style={{ margin: 0 }}>BI Dashboard</h1>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: 'none',
                  color: location.pathname === item.path ? '#007bff' : 'inherit',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={toggleTheme} className="btn" style={{ padding: '8px' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={signOut} className="btn" style={{ padding: '8px' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>
      <div className="container">
        {children}
      </div>
    </div>
  )
}