import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { supabase, Dashboard } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboards()
  }, [])

  const fetchDashboards = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDashboards(data || [])
    } catch (error) {
      console.error('Error fetching dashboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDashboard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('dashboards')
        .insert([{ name, description, user_id: user?.id }])

      if (error) throw error
      setName('')
      setDescription('')
      setShowForm(false)
      fetchDashboards()
    } catch (error) {
      console.error('Error creating dashboard:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Dashboards</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={16} style={{ marginRight: '8px' }} />
          New Dashboard
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Create Dashboard</h3>
          <form onSubmit={createDashboard}>
            <input
              type="text"
              placeholder="Dashboard name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', minHeight: '60px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-3">
        {dashboards.map(dashboard => (
          <Link key={dashboard.id} to={`/dashboard/${dashboard.id}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
              <h3>{dashboard.name}</h3>
              {dashboard.description && <p style={{ color: '#666', marginTop: '8px' }}>{dashboard.description}</p>}
              <p style={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
                Created: {new Date(dashboard.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {dashboards.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No dashboards yet. Create your first dashboard to get started!</p>
        </div>
      )}
    </div>
  )
}