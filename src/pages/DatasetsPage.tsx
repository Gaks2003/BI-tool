import { useState } from 'react'
import { Upload, Plus, Database, Calendar } from 'lucide-react'
import { useDatasets } from '@/hooks/useData'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'

export default function DatasetsPage() {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const { user } = useAuthStore()
  const { data: datasets, isLoading, refetch } = useDatasets()

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
        refetch()
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Datasets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload and manage your data sources
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Upload Dataset</span>
        </Button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Upload Dataset</h3>
          <input
            type="text"
            placeholder="Dataset name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input mb-4"
          />
          <div className="mb-4">
            <label className="btn btn-secondary cursor-pointer inline-flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Choose File (JSON/CSV)
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets?.map((dataset) => (
          <div key={dataset.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(dataset.created_at).toLocaleDateString()}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {dataset.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              {Array.isArray(dataset.data) ? dataset.data.length : 0} rows
            </p>
          </div>
        ))}
      </div>

      {datasets?.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No datasets yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload your first dataset to start creating visualizations
          </p>
          <Button onClick={() => setShowForm(true)}>
            Upload Dataset
          </Button>
        </div>
      )}
    </div>
  )
}