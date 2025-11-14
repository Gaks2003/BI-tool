import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { supabase, Dashboard, Dataset, Visualization } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardViewPage() {
  const { id } = useParams<{ id: string }>()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [visualizations, setVisualizations] = useState<Visualization[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', datasetId: '', type: 'bar', xAxis: '', yAxis: '' })
  const { user } = useAuth()

  useEffect(() => {
    if (id) {
      fetchDashboard()
      fetchDatasets()
      fetchVisualizations()
    }
  }, [id])

  const fetchDashboard = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      setDashboard(data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    }
  }

  const fetchDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', user?.id)

      if (error) throw error
      setDatasets(data || [])
    } catch (error) {
      console.error('Error fetching datasets:', error)
    }
  }

  const fetchVisualizations = async () => {
    try {
      const { data, error } = await supabase
        .from('visualizations')
        .select('*')
        .eq('dashboard_id', id)

      if (error) throw error
      setVisualizations(data || [])
    } catch (error) {
      console.error('Error fetching visualizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const createVisualization = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('visualizations')
        .insert([{
          dashboard_id: id,
          dataset_id: formData.datasetId,
          name: formData.name,
          type: formData.type,
          config: { xAxis: formData.xAxis, yAxis: formData.yAxis }
        }])

      if (error) throw error
      setFormData({ name: '', datasetId: '', type: 'bar', xAxis: '', yAxis: '' })
      setShowForm(false)
      fetchVisualizations()
    } catch (error) {
      console.error('Error creating visualization:', error)
    }
  }

  const renderVisualization = (viz: Visualization) => {
    const dataset = datasets.find(d => d.id === viz.dataset_id)
    if (!dataset || !Array.isArray(dataset.data)) return null

    const data = dataset.data.slice(0, 10) // Limit for demo
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1']

    const renderChart = () => {
      switch (viz.type) {
        case 'bar':
          return (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viz.config.xAxis} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={viz.config.yAxis} fill="#007bff" />
            </BarChart>
          )
        case 'line':
          return (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viz.config.xAxis} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={viz.config.yAxis} stroke="#007bff" strokeWidth={2} />
            </LineChart>
          )
        case 'pie':
          const pieData = data.map((item, index) => ({
            name: item[viz.config.xAxis],
            value: parseFloat(item[viz.config.yAxis]) || 0
          }))
          return (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({name, value}) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )
        default:
          return null
      }
    }

    return (
      <div key={viz.id} className="card">
        <h3>{viz.name}</h3>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    )
  }

  if (loading) return <div>Loading...</div>

  if (!dashboard) return <div>Dashboard not found</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>{dashboard.name}</h2>
          {dashboard.description && <p style={{ color: '#666', margin: 0 }}>{dashboard.description}</p>}
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={16} style={{ marginRight: '8px' }} />
          Add Chart
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Add Visualization</h3>
          <form onSubmit={createVisualization}>
            <input
              type="text"
              placeholder="Chart name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
            />
            <select
              value={formData.datasetId}
              onChange={(e) => setFormData({...formData, datasetId: e.target.value, xAxis: '', yAxis: ''})}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
            >
              <option value="">Select Dataset</option>
              {datasets.map(dataset => (
                <option key={dataset.id} value={dataset.id}>{dataset.name}</option>
              ))}
            </select>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
            <select
              value={formData.xAxis}
              onChange={(e) => setFormData({...formData, xAxis: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
            >
              <option value="">Select X-Axis field</option>
              {formData.datasetId && datasets.find(d => d.id === formData.datasetId)?.data?.[0] && 
                Object.keys(datasets.find(d => d.id === formData.datasetId)!.data[0]).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))
              }
            </select>
            <select
              value={formData.yAxis}
              onChange={(e) => setFormData({...formData, yAxis: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
            >
              <option value="">Select Y-Axis field</option>
              {formData.datasetId && datasets.find(d => d.id === formData.datasetId)?.data?.[0] && 
                Object.keys(datasets.find(d => d.id === formData.datasetId)!.data[0]).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))
              }
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary">Add Chart</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-2">
        {visualizations.map(renderVisualization)}
      </div>

      {visualizations.length === 0 && !showForm && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No visualizations yet. Add charts to your dashboard!</p>
        </div>
      )}
    </div>
  )
}