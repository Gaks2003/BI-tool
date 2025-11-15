import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, BarChart3, Calendar, Database, ArrowRight } from 'lucide-react'
import { useDashboards, useCreateDashboard, useDatasets } from '@/hooks/useData'
import { Button } from '@/components/ui/Button'

export default function DashboardsPage() {
  const [showForm, setShowForm] = useState(false)
  const [step, setStep] = useState(1) // 1: Dashboard info, 2: Dataset selection
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDataset, setSelectedDataset] = useState('')
  
  const { data: dashboards, isLoading } = useDashboards()
  const { data: datasets } = useDatasets()
  const createDashboard = useCreateDashboard()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
      return
    }
    
    // Create dashboard with selected dataset info
    await createDashboard.mutateAsync({ 
      name, 
      description: description + (selectedDataset ? ` (Dataset: ${datasets?.find(d => d.id === selectedDataset)?.name})` : '')
    })
    
    // Reset form
    setName('')
    setDescription('')
    setSelectedDataset('')
    setStep(1)
    setShowForm(false)
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setSelectedDataset('')
    setStep(1)
    setShowForm(false)
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage your business intelligence dashboards
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Dashboard</span>
        </Button>
      </div>

      {showForm && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Create Dashboard</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className={step === 1 ? 'text-blue-600 font-medium' : ''}>Dashboard Info</span>
              <ArrowRight className="h-4 w-4" />
              <span className={step === 2 ? 'text-blue-600 font-medium' : ''}>Select Dataset</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <input
                  type="text"
                  placeholder="Dashboard name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input min-h-[80px] resize-none"
                />
              </>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Choose a dataset to start with
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {datasets?.map((dataset) => (
                      <div
                        key={dataset.id}
                        onClick={() => setSelectedDataset(dataset.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedDataset === dataset.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Database className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{dataset.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {Array.isArray(dataset.data) ? dataset.data.length : 0} rows
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(!datasets || datasets.length === 0) && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No datasets available. Upload a dataset first.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              {step === 1 && (
                <>
                  <Button type="submit">Next: Select Dataset</Button>
                  <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                </>
              )}
              {step === 2 && (
                <>
                  <Button type="submit" disabled={!selectedDataset || createDashboard.isPending}>
                    {createDashboard.isPending ? 'Creating...' : 'Create Dashboard'}
                  </Button>
                  <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                  <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                </>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards?.map((dashboard) => (
          <Link key={dashboard.id} to={`/dashboard/${dashboard.id}`}>
            <div className="card hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(dashboard.created_at).toLocaleDateString()}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {dashboard.name}
              </h3>
              {dashboard.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                  {dashboard.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {dashboards?.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No dashboards yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first dashboard to get started with data visualization
          </p>
          <Button onClick={() => setShowForm(true)}>
            Create Dashboard
          </Button>
        </div>
      )}
    </div>
  )
}