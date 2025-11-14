import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, TrendingUp, Trash2, X, Maximize2, FileText, Download, Share2, Database } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useStore'
import { useDatasets } from '@/hooks/useData'
import { Button } from '@/components/ui/Button'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import type { Dashboard, Visualization } from '@/types'

export default function DashboardViewPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { data: datasets } = useDatasets()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ 
    name: '', 
    datasetId: '', 
    type: 'bar', 
    xAxis: '', 
    yAxis: '',
    metric: '',
    aggregation: 'sum'
  })
  const [selectedViz, setSelectedViz] = useState<Visualization | null>(null)

  const chartTypeNames = {
    bar: 'Bar Chart',
    line: 'Line Chart',
    pie: 'Pie Chart',
    area: 'Area Chart',
    scatter: 'Scatter Plot',
    radar: 'Radar Chart',
    heatmap: 'Heatmap',
    treemap: 'Treemap',
    kpi: 'KPI Card',
    table: 'Data Table'
  }

  useEffect(() => {
    if (formData.type && !formData.name.includes('Chart') && !formData.name.includes('Card') && !formData.name.includes('Table')) {
      setFormData(prev => ({ 
        ...prev, 
        name: chartTypeNames[formData.type as keyof typeof chartTypeNames] 
      }))
    }
  }, [formData.type])

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single()
      if (error) throw error
      return data as Dashboard
    },
    enabled: !!id && !!user?.id,
  })

  const { data: visualizations, refetch } = useQuery({
    queryKey: ['visualizations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visualizations')
        .select('*')
        .eq('dashboard_id', id)
      if (error) throw error
      return data as Visualization[]
    },
    enabled: !!id,
  })

  const deleteVisualization = async (vizId: string) => {
    try {
      const { error } = await supabase
        .from('visualizations')
        .delete()
        .eq('id', vizId)
      
      if (error) throw error
      refetch()
    } catch (error) {
      console.error('Error deleting visualization:', error)
    }
  }

  const createVisualization = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const config = formData.type === 'kpi' 
        ? { metric: formData.metric, aggregation: formData.aggregation }
        : { xAxis: formData.xAxis, yAxis: formData.yAxis }

      const { error } = await supabase
        .from('visualizations')
        .insert([{
          dashboard_id: id,
          dataset_id: formData.datasetId,
          name: formData.name,
          type: formData.type,
          config
        }])

      if (error) throw error
      
      setFormData({ 
        name: chartTypeNames[formData.type as keyof typeof chartTypeNames], 
        datasetId: '', 
        type: 'bar', 
        xAxis: '', 
        yAxis: '',
        metric: '',
        aggregation: 'sum'
      })
      setShowForm(false)
      refetch()
    } catch (error) {
      console.error('Error creating visualization:', error)
    }
  }

  const handleTypeChange = (newType: string) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      name: chartTypeNames[newType as keyof typeof chartTypeNames]
    }))
  }

  const generateReport = (viz: Visualization, dataset: any) => {
    if (!dataset || !dataset.data) return null
    
    const data = dataset.data
    const totalRows = data.length
    
    if (viz.type === 'kpi') {
      const values = data.map(item => parseFloat(item[viz.config.metric!]) || 0).filter(val => !isNaN(val))
      const sum = values.reduce((a, b) => a + b, 0)
      const avg = values.length > 0 ? sum / values.length : 0
      const min = Math.min(...values)
      const max = Math.max(...values)
      
      return {
        type: 'KPI Analysis',
        summary: `Analysis of ${viz.config.metric} across ${totalRows} records`,
        insights: [
          `Total Sum: ${sum.toLocaleString()}`,
          `Average: ${avg.toFixed(2)}`,
          `Minimum Value: ${min.toLocaleString()}`,
          `Maximum Value: ${max.toLocaleString()}`,
          `Data Points: ${values.length}`,
          `Aggregation Method: ${viz.config.aggregation?.toUpperCase()}`
        ]
      }
    }
    
    if (viz.type === 'table') {
      const columns = Object.keys(data[0] || {})
      const numericColumns = columns.filter(col => 
        data.some(row => !isNaN(parseFloat(row[col])))
      )
      
      return {
        type: 'Data Table Analysis',
        summary: `Dataset contains ${totalRows} rows and ${columns.length} columns`,
        insights: [
          `Total Columns: ${columns.length}`,
          `Numeric Columns: ${numericColumns.length}`,
          `Text Columns: ${columns.length - numericColumns.length}`,
          `Sample Size: ${Math.min(totalRows, 50)} rows displayed`,
          `Column Names: ${columns.join(', ')}`,
          `Data Completeness: ${((data.filter(row => Object.values(row).every(val => val !== null && val !== '')).length / totalRows) * 100).toFixed(1)}%`
        ]
      }
    }
    
    // For charts
    if (viz.config.xAxis && viz.config.yAxis) {
      const xValues = [...new Set(data.map(item => item[viz.config.xAxis!]))]
      const yValues = data.map(item => parseFloat(item[viz.config.yAxis!]) || 0).filter(val => !isNaN(val))
      const sum = yValues.reduce((a, b) => a + b, 0)
      const avg = yValues.length > 0 ? sum / yValues.length : 0
      
      return {
        type: `${viz.type.charAt(0).toUpperCase() + viz.type.slice(1)} Chart Analysis`,
        summary: `Relationship between ${viz.config.xAxis} and ${viz.config.yAxis}`,
        insights: [
          `Unique Categories (${viz.config.xAxis}): ${xValues.length}`,
          `Total ${viz.config.yAxis}: ${sum.toLocaleString()}`,
          `Average ${viz.config.yAxis}: ${avg.toFixed(2)}`,
          `Highest Value: ${Math.max(...yValues).toLocaleString()}`,
          `Lowest Value: ${Math.min(...yValues).toLocaleString()}`,
          `Data Distribution: ${yValues.length} valid data points`
        ]
      }
    }
    
    return null
  }

  const downloadReport = (viz: Visualization) => {
    const dataset = datasets?.find(d => d.id === viz.dataset_id)
    const report = generateReport(viz, dataset)
    
    if (!report) return
    
    const reportContent = `
${report.type}
${'='.repeat(report.type.length)}

Visualization: ${viz.name}
Generated: ${new Date().toLocaleString()}

Summary:
${report.summary}

Key Insights:
${report.insights.map(insight => `• ${insight}`).join('\n')}

Dataset Information:
• Dataset Name: ${dataset?.name}
• Total Records: ${dataset?.data?.length || 0}
• Created: ${new Date(dataset?.created_at || '').toLocaleDateString()}
    `.trim()
    
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${viz.name.replace(/[^a-z0-9]/gi, '_')}_report.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareVisualization = (viz: Visualization) => {
    const dataset = datasets?.find(d => d.id === viz.dataset_id)
    const shareText = `Check out this ${viz.type} chart: "${viz.name}" from the ${dataset?.name} dataset. Generated on ${new Date().toLocaleDateString()}`
    
    if (navigator.share) {
      navigator.share({
        title: `BI Dashboard - ${viz.name}`,
        text: shareText,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`)
      alert('Share link copied to clipboard!')
    }
  }

  const calculateKPI = (data: any[], metric: string, aggregation: string) => {
    if (!data || data.length === 0) return 0
    
    const values = data.map(item => parseFloat(item[metric]) || 0).filter(val => !isNaN(val))
    
    switch (aggregation) {
      case 'sum': return values.reduce((a, b) => a + b, 0)
      case 'avg': return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      case 'count': return values.length
      case 'min': return Math.min(...values)
      case 'max': return Math.max(...values)
      default: return 0
    }
  }

  const renderVisualization = (viz: Visualization) => {
    const dataset = datasets?.find(d => d.id === viz.dataset_id)
    if (!dataset || !Array.isArray(dataset.data)) return null

    const data = dataset.data.slice(0, 50)
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']

    // KPI Card
    if (viz.type === 'kpi') {
      const value = calculateKPI(dataset.data, viz.config.metric!, viz.config.aggregation!)
      return (
        <div key={viz.id} className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white relative group cursor-pointer" onClick={() => setSelectedViz(viz)}>
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedViz(viz); }}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteVisualization(viz.id); }}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold opacity-90">{viz.name}</h3>
              <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
              <p className="text-sm opacity-75 mt-1">{viz.config.aggregation} of {viz.config.metric}</p>
            </div>
            <TrendingUp className="h-8 w-8 opacity-75" />
          </div>
        </div>
      )
    }

    // Data Table
    if (viz.type === 'table') {
      const columns = Object.keys(data[0] || {})
      return (
        <div key={viz.id} className="card relative group cursor-pointer" onClick={() => setSelectedViz(viz)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{viz.name}</h3>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedViz(viz); }}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Maximize2 className="h-4 w-4 text-gray-500" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteVisualization(viz.id); }}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
              </button>
            </div>
          </div>
          <div className="overflow-auto max-h-96 border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {columns.map(col => (
                    <th key={col} className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    {columns.map(col => (
                      <td key={col} className="p-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Showing {Math.min(data.length, 20)} of {dataset.data.length} rows
          </div>
        </div>
      )
    }

    const renderChart = () => {
      switch (viz.type) {
        case 'bar':
          return (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viz.config.xAxis} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={viz.config.yAxis} fill="#3b82f6" />
            </BarChart>
          )
        case 'line':
          return (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viz.config.xAxis} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={viz.config.yAxis} stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          )
        case 'area':
          return (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viz.config.xAxis} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey={viz.config.yAxis} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          )
        case 'scatter':
          return (
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viz.config.xAxis} />
              <YAxis dataKey={viz.config.yAxis} />
              <Tooltip />
              <Scatter fill="#3b82f6" />
            </ScatterChart>
          )
        case 'radar':
          const radarData = data.slice(0, 6).map(item => ({
            subject: item[viz.config.xAxis],
            value: parseFloat(item[viz.config.yAxis]) || 0
          }))
          return (
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
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
          return <div className="text-center text-gray-500">Chart type not supported yet</div>
      }
    }

    return (
      <div key={viz.id} className="card relative group cursor-pointer" onClick={() => setSelectedViz(viz)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{viz.name}</h3>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedViz(viz); }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Maximize2 className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteVisualization(viz.id); }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
            </button>
          </div>
        </div>
        <div className="overflow-auto">
          <div className="min-w-[400px] min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboard) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{dashboard.name}</h1>
          {dashboard.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{dashboard.description}</p>
          )}
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Visualization</span>
        </Button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Add Visualization</h3>
          <form onSubmit={createVisualization} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visualization Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="input"
              >
                <optgroup label="Charts">
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="radar">Radar Chart</option>
                </optgroup>
                <optgroup label="Data Views">
                  <option value="kpi">KPI Card</option>
                  <option value="table">Data Table</option>
                </optgroup>
              </select>
            </div>

            <input
              type="text"
              placeholder="Visualization name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input"
              required
            />

            <select
              value={formData.datasetId}
              onChange={(e) => setFormData({...formData, datasetId: e.target.value, xAxis: '', yAxis: '', metric: ''})}
              className="input"
              required
            >
              <option value="">Select Dataset</option>
              {datasets?.map(dataset => (
                <option key={dataset.id} value={dataset.id}>{dataset.name}</option>
              ))}
            </select>

            {formData.type === 'kpi' ? (
              <>
                <select
                  value={formData.metric}
                  onChange={(e) => setFormData({...formData, metric: e.target.value})}
                  className="input"
                  required
                >
                  <option value="">Select Metric Field</option>
                  {formData.datasetId && datasets?.find(d => d.id === formData.datasetId)?.data?.[0] && 
                    Object.keys(datasets.find(d => d.id === formData.datasetId)!.data[0]).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))
                  }
                </select>
                <select
                  value={formData.aggregation}
                  onChange={(e) => setFormData({...formData, aggregation: e.target.value})}
                  className="input"
                >
                  <option value="sum">Sum</option>
                  <option value="avg">Average</option>
                  <option value="count">Count</option>
                  <option value="min">Minimum</option>
                  <option value="max">Maximum</option>
                </select>
              </>
            ) : formData.type !== 'table' && (
              <>
                <select
                  value={formData.xAxis}
                  onChange={(e) => setFormData({...formData, xAxis: e.target.value})}
                  className="input"
                  required
                >
                  <option value="">Select X-Axis field</option>
                  {formData.datasetId && datasets?.find(d => d.id === formData.datasetId)?.data?.[0] && 
                    Object.keys(datasets.find(d => d.id === formData.datasetId)!.data[0]).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))
                  }
                </select>
                <select
                  value={formData.yAxis}
                  onChange={(e) => setFormData({...formData, yAxis: e.target.value})}
                  className="input"
                  required
                >
                  <option value="">Select Y-Axis field</option>
                  {formData.datasetId && datasets?.find(d => d.id === formData.datasetId)?.data?.[0] && 
                    Object.keys(datasets.find(d => d.id === formData.datasetId)!.data[0]).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))
                  }
                </select>
              </>
            )}

            <div className="flex space-x-3">
              <Button type="submit">Add Visualization</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visualizations?.map(renderVisualization)}
      </div>

      {visualizations?.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No visualizations yet. Add charts to your dashboard!</p>
        </div>
      )}

      {/* Modal for expanded view */}
      {selectedViz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedViz(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedViz.name}</h2>
                  <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <Database className="h-4 w-4" />
                    <span>Dataset: {datasets?.find(d => d.id === selectedViz.dataset_id)?.name}</span>
                    <span>•</span>
                    <span>{datasets?.find(d => d.id === selectedViz.dataset_id)?.data?.length || 0} records</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => shareVisualization(selectedViz)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => downloadReport(selectedViz)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setSelectedViz(null)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
              </div>
              
              {selectedViz.type === 'kpi' ? (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-6xl font-bold mb-4">{calculateKPI(datasets?.find(d => d.id === selectedViz.dataset_id)?.data || [], selectedViz.config.metric!, selectedViz.config.aggregation!).toLocaleString()}</p>
                      <p className="text-xl opacity-75">{selectedViz.config.aggregation} of {selectedViz.config.metric}</p>
                    </div>
                    <TrendingUp className="h-16 w-16 opacity-75" />
                  </div>
                </div>
              ) : selectedViz.type === 'table' ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        {Object.keys(datasets?.find(d => d.id === selectedViz.dataset_id)?.data?.[0] || {}).map(col => (
                          <th key={col} className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datasets?.find(d => d.id === selectedViz.dataset_id)?.data?.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          {Object.keys(row).map(col => (
                            <td key={col} className="p-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                      const dataset = datasets?.find(d => d.id === selectedViz.dataset_id)
                      if (!dataset) return null
                      const data = dataset.data.slice(0, 50)
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']
                      
                      switch (selectedViz.type) {
                        case 'bar':
                          return (
                            <BarChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey={selectedViz.config.xAxis} />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey={selectedViz.config.yAxis} fill="#3b82f6" />
                            </BarChart>
                          )
                        case 'line':
                          return (
                            <LineChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey={selectedViz.config.xAxis} />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey={selectedViz.config.yAxis} stroke="#3b82f6" strokeWidth={2} />
                            </LineChart>
                          )
                        case 'area':
                          return (
                            <AreaChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey={selectedViz.config.xAxis} />
                              <YAxis />
                              <Tooltip />
                              <Area type="monotone" dataKey={selectedViz.config.yAxis} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                            </AreaChart>
                          )
                        case 'pie':
                          const pieData = data.map((item, index) => ({
                            name: item[selectedViz.config.xAxis!],
                            value: parseFloat(item[selectedViz.config.yAxis!]) || 0
                          }))
                          return (
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
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
                          return <div>Chart type not supported</div>
                      }
                    })()
                    }
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Report Section */}
              {(() => {
                const dataset = datasets?.find(d => d.id === selectedViz.dataset_id)
                const report = generateReport(selectedViz, dataset)
                
                if (!report) return null
                
                return (
                  <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.type}</h3>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h4>
                        <p className="text-gray-600 dark:text-gray-400">{report.summary}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Key Insights</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {report.insights.map((insight, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                        Report generated on {new Date().toLocaleString()}
                      </div>
                    </div>
                  </div>
                )
              })()
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}