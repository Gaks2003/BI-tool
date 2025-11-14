import { useState, useEffect } from 'react'
import { Upload, Plus } from 'lucide-react'
import { supabase, Dataset } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchDatasets()
  }, [])

  const fetchDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDatasets(data || [])
    } catch (error) {
      console.error('Error fetching datasets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      let data: any[] = []

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text)
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n')
        const headers = lines[0].split(',')
        data = lines.slice(1).map(line => {
          const values = line.split(',')
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim()
          })
          return obj
        }).filter(obj => Object.values(obj).some(val => val))
      }

      if (data.length > 0) {
        const { error } = await supabase
          .from('datasets')
          .insert([{ 
            name: name || file.name.replace(/\.[^/.]+$/, ""), 
            data, 
            user_id: user?.id 
          }])

        if (error) throw error
        setName('')
        setShowForm(false)
        fetchDatasets()
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Datasets</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={16} style={{ marginRight: '8px' }} />
          Upload Dataset
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Upload Dataset</h3>
          <input
            type="text"
            placeholder="Dataset name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
          <div style={{ marginBottom: '8px' }}>
            <label className="btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
              <Upload size={16} style={{ marginRight: '8px' }} />
              Choose File (JSON/CSV)
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <button onClick={() => setShowForm(false)} className="btn">Cancel</button>
        </div>
      )}

      <div className="grid grid-3">
        {datasets.map(dataset => (
          <div key={dataset.id} className="card">
            <h3>{dataset.name}</h3>
            <p style={{ color: '#666', marginTop: '8px' }}>
              {Array.isArray(dataset.data) ? dataset.data.length : 0} rows
            </p>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
              Created: {new Date(dataset.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {datasets.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No datasets yet. Upload your first dataset to get started!</p>
        </div>
      )}
    </div>
  )
}