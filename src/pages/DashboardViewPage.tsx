import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, TrendingUp, Trash2, X, Maximize2, FileText, Download, Share2, Database, MessageSquare } from 'lucide-react'
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
import BubbleChart from '@/components/charts/BubbleChart'
import BoxPlotChart from '@/components/charts/BoxPlotChart'
import WaterfallChart from '@/components/charts/WaterfallChart'
import HeatmapChart from '@/components/charts/HeatmapChart'
import { AIAssistant } from '@/components/AIAssistant'
import { InsightPanel } from '@/components/InsightPanel'
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
    aggregation: 'sum',
    maxEntries: 25,
    sizeField: ''
  })
  const [selectedViz, setSelectedViz] = useState<Visualization | null>(null)
  const [chartPages, setChartPages] = useState<Record<string, number>>({})
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [selectedChartForAI, setSelectedChartForAI] = useState<{ data: any[], type: string } | null>(null)

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
    table: 'Data Table',
    bubble: 'Bubble Chart',
    boxplot: 'Box Plot',
    waterfall: 'Waterfall Chart'
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
      const dataset = datasets?.find(d => d.id === formData.datasetId)
      const config = formData.type === 'kpi' 
        ? { metric: formData.metric, aggregation: formData.aggregation, maxEntries: formData.maxEntries }
        : formData.type === 'heatmap'
          ? { xAxis: formData.xAxis, yAxis: formData.yAxis, metric: formData.metric, maxEntries: formData.maxEntries }
          : { xAxis: formData.xAxis, yAxis: formData.yAxis, maxEntries: formData.maxEntries, sizeField: formData.sizeField || undefined }

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
        aggregation: 'sum',
        maxEntries: 25,
        sizeField: ''
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
      if (viz.type === 'pie') {
        // Special analysis for pie charts with grouped data
        const groupedData = data.reduce((acc, item) => {
          const category = item[viz.config.xAxis!]
          const value = parseFloat(item[viz.config.yAxis!]) || 0
          acc[category] = (acc[category] || 0) + value
          return acc
        }, {} as Record<string, number>)
        
        const sortedGroups = Object.entries(groupedData)
          .map(([name, value]) => ({ name, value, percentage: (value / Object.values(groupedData).reduce((a, b) => a + b, 0) * 100) }))
          .sort((a, b) => b.value - a.value)
        
        const topGroup = sortedGroups[0]
        const bottomGroup = sortedGroups[sortedGroups.length - 1]
        const totalValue = Object.values(groupedData).reduce((a, b) => a + b, 0)
        
        return {
          type: 'Pie Chart Analysis',
          summary: `Distribution of ${viz.config.yAxis} across ${viz.config.xAxis} categories`,
          insights: [
            `Dominant Category: ${topGroup.name} (${topGroup.percentage.toFixed(1)}% of total)`,
            `Smallest Category: ${bottomGroup.name} (${bottomGroup.percentage.toFixed(1)}% of total)`,
            `Performance Gap: ${(topGroup.value - bottomGroup.value).toLocaleString()} points difference`,
            `Category Distribution: ${sortedGroups.length} distinct groups identified`,
            `Market Share Leader: ${topGroup.name} with ${topGroup.value.toLocaleString()} total score`,
            `Balanced vs Skewed: ${topGroup.percentage > 40 ? 'Highly concentrated' : topGroup.percentage > 25 ? 'Moderately concentrated' : 'Well distributed'} data`
          ]
        }
      }
      
      const xValues = [...new Set(data.map(item => item[viz.config.xAxis!]))]
      const yValues = data.map(item => parseFloat(item[viz.config.yAxis!]) || 0).filter(val => !isNaN(val))
      
      // Handle case where Y-axis is not numeric
      if (yValues.length === 0) {
        return {
          type: `${viz.type.charAt(0).toUpperCase() + viz.type.slice(1)} Chart Analysis`,
          summary: `Invalid chart configuration: ${viz.config.yAxis} contains non-numeric data`,
          insights: [
            `Chart Type: ${viz.type.toUpperCase()}`,
            `X-Axis Field: ${viz.config.xAxis} (${xValues.length} categories)`,
            `Y-Axis Field: ${viz.config.yAxis} (non-numeric)`,
            `Suggestion: Use numeric fields like salary, performance_score, age, or years_experience for Y-axis`,
            `Available Numeric Fields: salary, performance_score, years_experience, age, project_count`,
            `Current Data Type: Text/String values cannot be plotted on charts`
          ]
        }
      }
      
      const sum = yValues.reduce((a, b) => a + b, 0)
      const avg = yValues.length > 0 ? sum / yValues.length : 0
      const max = Math.max(...yValues)
      const min = Math.min(...yValues)
      const maxItem = data.find(item => parseFloat(item[viz.config.yAxis!]) === max)
      const minItem = data.find(item => parseFloat(item[viz.config.yAxis!]) === min)
      
      // Chart-specific insights
      const getChartInsights = () => {
        switch (viz.type) {
          case 'bar':
            return [
              `Top Performer: ${maxItem?.[viz.config.xAxis!]} with ${max.toLocaleString()}`,
              `Lowest Performer: ${minItem?.[viz.config.xAxis!]} with ${min.toLocaleString()}`,
              `Performance Range: ${(max - min).toLocaleString()} point spread`,
              `Above Average: ${yValues.filter(v => v > avg).length} out of ${yValues.length} categories`,
              `Consistency Level: ${max - min < avg * 0.3 ? 'High consistency' : max - min < avg ? 'Moderate variation' : 'High variation'}`,
              `Growth Opportunity: ${((max - avg) / avg * 100).toFixed(1)}% potential improvement for average performers`
            ]
          case 'line':
            const trend = yValues.length > 1 ? (yValues[yValues.length - 1] - yValues[0]) / yValues[0] * 100 : 0
            return [
              `Overall Trend: ${trend > 5 ? 'Strong upward' : trend > 0 ? 'Slight upward' : trend < -5 ? 'Strong downward' : trend < 0 ? 'Slight downward' : 'Stable'} (${trend.toFixed(1)}%)`,
              `Peak Performance: ${max.toLocaleString()} at ${maxItem?.[viz.config.xAxis!]}`,
              `Lowest Point: ${min.toLocaleString()} at ${minItem?.[viz.config.xAxis!]}`,
              `Volatility: ${((max - min) / avg * 100).toFixed(1)}% variation from average`,
              `Data Points: ${yValues.length} time periods analyzed`,
              `Trend Direction: ${trend > 0 ? 'Positive momentum' : trend < 0 ? 'Declining pattern' : 'Stable performance'}`
            ]
          case 'area':
            return [
              `Cumulative Total: ${sum.toLocaleString()} across all periods`,
              `Peak Contribution: ${maxItem?.[viz.config.xAxis!]} (${(max/sum*100).toFixed(1)}% of total)`,
              `Growth Pattern: ${trend > 0 ? 'Expanding area' : trend < 0 ? 'Contracting area' : 'Stable area'}`,
              `Distribution: ${yValues.filter(v => v > avg).length} periods above average`,
              `Concentration: ${max > avg * 2 ? 'Highly concentrated peaks' : 'Evenly distributed values'}`,
              `Performance Stability: ${(min/max*100).toFixed(1)}% consistency ratio`
            ]
          case 'scatter':
            const correlation = yValues.length > 1 ? 'Moderate' : 'Insufficient data'
            return [
              `Data Clusters: ${xValues.length} distinct ${viz.config.xAxis} values`,
              `Value Range: ${min.toLocaleString()} to ${max.toLocaleString()}`,
              `Outliers: ${yValues.filter(v => v > avg + (max-min)*0.3 || v < avg - (max-min)*0.3).length} potential outliers`,
              `Correlation Pattern: ${correlation} relationship observed`,
              `Data Density: ${(yValues.length/xValues.length).toFixed(1)} average points per category`,
              `Distribution: ${yValues.filter(v => v > avg).length}/${yValues.length} points above average`
            ]
          case 'radar':
            return [
              `Strongest Dimension: ${maxItem?.[viz.config.xAxis!]} (${max.toLocaleString()})`,
              `Weakest Dimension: ${minItem?.[viz.config.xAxis!]} (${min.toLocaleString()})`,
              `Balance Score: ${(min/max*100).toFixed(1)}% (higher = more balanced)`,
              `Performance Spread: ${(max-min).toLocaleString()} point difference`,
              `Above Average Dimensions: ${yValues.filter(v => v > avg).length}/${yValues.length}`,
              `Overall Profile: ${min/max > 0.8 ? 'Well-balanced' : min/max > 0.6 ? 'Moderately balanced' : 'Highly specialized'}`
            ]
          default:
            return [
              `Top Performer: ${maxItem?.[viz.config.xAxis!]} (${max.toLocaleString()})`,
              `Bottom Performer: ${minItem?.[viz.config.xAxis!]} (${min.toLocaleString()})`,
              `Performance Gap: ${(max-min).toLocaleString()} points`,
              `Average Performance: ${avg.toFixed(2)}`,
              `Data Quality: ${yValues.length} valid measurements`,
              `Variation Level: ${((max-min)/avg*100).toFixed(1)}% coefficient of variation`
            ]
        }
      }
      
      return {
        type: `${viz.type.charAt(0).toUpperCase() + viz.type.slice(1)} Chart Analysis`,
        summary: `${viz.type === 'line' ? 'Trend analysis of' : viz.type === 'scatter' ? 'Correlation between' : viz.type === 'radar' ? 'Multi-dimensional view of' : 'Comparative analysis of'} ${viz.config.yAxis} across ${viz.config.xAxis}`,
        insights: getChartInsights()
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

  const openAIAssistant = (chartData: any[], chartType: string) => {
    setSelectedChartForAI({ data: chartData, type: chartType })
    setAiAssistantOpen(true)
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

    // Group and aggregate data for better analysis
    const maxEntries = viz.config.maxEntries || 25
    let processedData = dataset.data
    
    // For charts, group by category and aggregate values
    if (viz.config.xAxis && viz.config.yAxis && viz.type !== 'table') {
      // Check if Y-axis is numeric
      const sampleValue = dataset.data[0]?.[viz.config.yAxis!]
      const isNumericY = !isNaN(parseFloat(sampleValue))
      
      if (isNumericY) {
        const groupedData = dataset.data.reduce((acc, item) => {
          const category = item[viz.config.xAxis!]
          const value = parseFloat(item[viz.config.yAxis!]) || 0
          if (!acc[category]) {
            acc[category] = { [viz.config.xAxis!]: category, [viz.config.yAxis!]: 0, count: 0 }
          }
          acc[category][viz.config.yAxis!] += value
          acc[category].count += 1
          return acc
        }, {} as Record<string, any>)
        
        processedData = Object.values(groupedData)
          .sort((a, b) => b[viz.config.yAxis!] - a[viz.config.yAxis!])
          .slice(0, maxEntries === 0 ? undefined : maxEntries)
      } else {
        // If Y-axis is not numeric, just take unique entries
        processedData = dataset.data
          .slice(0, maxEntries === 0 ? undefined : maxEntries)
      }
    }
    
    const data = processedData
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
        case 'bubble':
          // Find a numeric field for bubble size
          const sizeField = viz.config.sizeField || 'project_count'
          return <BubbleChart data={data} xAxis={viz.config.xAxis!} yAxis={viz.config.yAxis!} sizeField={sizeField} />
        case 'boxplot':
          return <BoxPlotChart data={data} category={viz.config.xAxis!} metric={viz.config.yAxis!} />
        case 'waterfall':
          return <WaterfallChart data={data} category={viz.config.xAxis!} value={viz.config.yAxis!} />
        case 'heatmap':
          return <HeatmapChart data={data} xAxis={viz.config.xAxis!} yAxis={viz.config.yAxis!} metric={viz.config.metric || 'performance_score'} />
        case 'pie':
          // Group data by category and aggregate values
          const groupedData = processedData.reduce((acc, item) => {
            const category = item[viz.config.xAxis!]
            const value = parseFloat(item[viz.config.yAxis!]) || 0
            acc[category] = (acc[category] || 0) + value
            return acc
          }, {} as Record<string, number>)
          
          const pieData = Object.entries(groupedData)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)
          
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

    const totalEntries = viz.type === 'table' ? dataset.data.length : processedData.length
    const isLimited = maxEntries > 0 && totalEntries > maxEntries && viz.type !== 'table'
    const showViewAll = isLimited && viz.type !== 'table'
    
    return (
      <div key={viz.id} className="card relative group cursor-pointer" onClick={() => setSelectedViz(viz)}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{viz.name}</h3>
            <p className="text-sm text-gray-500">
              {viz.type === 'table' 
                ? `Showing ${Math.min(50, dataset.data.length)} of ${dataset.data.length} records`
                : isLimited 
                  ? `Top ${processedData.length} entries (${dataset.data.length} total records)`
                  : `${processedData.length} entries from ${dataset.data.length} records`
              }
            </p>
          </div>
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
        
        <div className="mt-4">
          <InsightPanel
            chartData={data}
            chartType={viz.type}
            xField={viz.config.xAxis || ''}
            yField={viz.config.yAxis || ''}
          />
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation()
              openAIAssistant(data, viz.type)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
        {showViewAll && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Create a new visualization with all entries
                const newConfig = { ...viz.config, maxEntries: 0 }
                supabase.from('visualizations').update({ config: newConfig }).eq('id', viz.id).then(() => refetch())
              }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All {dataset.data.length} Entries
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Note: For better analysis, consider grouping by department instead of individual names
            </p>
          </div>
        )}
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
                <optgroup label="Basic Charts">
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="scatter">Scatter Plot</option>
                </optgroup>
                <optgroup label="Advanced Charts">
                  <option value="radar">Radar Chart</option>
                  <option value="bubble">Bubble Chart</option>
                  <option value="boxplot">Box Plot</option>
                  <option value="waterfall">Waterfall Chart</option>
                  <option value="heatmap">Heatmap</option>
                  <option value="treemap">Treemap</option>
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
                {formData.type === 'bubble' && (
                  <select
                    value={formData.sizeField || ''}
                    onChange={(e) => setFormData({...formData, sizeField: e.target.value})}
                    className="input"
                  >
                    <option value="">Select Size field (optional)</option>
                    {formData.datasetId && datasets?.find(d => d.id === formData.datasetId)?.data?.[0] && 
                      Object.keys(datasets.find(d => d.id === formData.datasetId)!.data[0])
                        .filter(key => !isNaN(parseFloat(datasets.find(d => d.id === formData.datasetId)!.data[0][key])))
                        .map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))
                    }
                  </select>
                )}
                {formData.type === 'heatmap' && (
                  <select
                    value={formData.metric}
                    onChange={(e) => setFormData({...formData, metric: e.target.value})}
                    className="input"
                    required
                  >
                    <option value="">Select Metric field</option>
                    {formData.datasetId && datasets?.find(d => d.id === formData.datasetId)?.data?.[0] && 
                      Object.keys(datasets.find(d => d.id === formData.datasetId)!.data[0])
                        .filter(key => !isNaN(parseFloat(datasets.find(d => d.id === formData.datasetId)!.data[0][key])))
                        .map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))
                    }
                  </select>
                )}
              </>
            )}

            {formData.type !== 'table' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Entries to Display
                </label>
                <select
                  value={formData.maxEntries}
                  onChange={(e) => setFormData({...formData, maxEntries: parseInt(e.target.value)})}
                  className="input"
                >
                  <option value={10}>10 entries</option>
                  <option value={25}>25 entries</option>
                  <option value={50}>50 entries</option>
                  <option value={100}>100 entries</option>
                  <option value={0}>All entries</option>
                </select>
              </div>
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
                    onClick={() => {
                      const dataset = datasets?.find(d => d.id === selectedViz.dataset_id)
                      if (dataset) {
                        openAIAssistant(dataset.data, selectedViz.type)
                      }
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Ask AI</span>
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
                      
                      // For pie charts, use all data for grouping; for other charts, limit for performance
                      let processedData = dataset.data
                      if (selectedViz.config.xAxis && selectedViz.type !== 'table' && selectedViz.type !== 'pie') {
                        const seen = new Set()
                        processedData = dataset.data.filter(item => {
                          const key = item[selectedViz.config.xAxis!]
                          if (seen.has(key)) return false
                          seen.add(key)
                          return true
                        })
                      }
                      
                      const data = selectedViz.type === 'pie' ? processedData : processedData.slice(0, 50)
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
                        case 'bubble':
                          const sizeField = selectedViz.config.sizeField || 'project_count'
                          return <BubbleChart data={data} xAxis={selectedViz.config.xAxis!} yAxis={selectedViz.config.yAxis!} sizeField={sizeField} />
                        case 'boxplot':
                          return <BoxPlotChart data={data} category={selectedViz.config.xAxis!} metric={selectedViz.config.yAxis!} />
                        case 'waterfall':
                          return <WaterfallChart data={data} category={selectedViz.config.xAxis!} value={selectedViz.config.yAxis!} />
                        case 'heatmap':
                          return <HeatmapChart data={data} xAxis={selectedViz.config.xAxis!} yAxis={selectedViz.config.yAxis!} metric={selectedViz.config.metric || 'performance_score'} />
                        case 'pie':
                          // Group data by category and aggregate values for expanded view
                          const groupedData = processedData.reduce((acc, item) => {
                            const category = item[selectedViz.config.xAxis!]
                            const value = parseFloat(item[selectedViz.config.yAxis!]) || 0
                            acc[category] = (acc[category] || 0) + value
                            return acc
                          }, {} as Record<string, number>)
                          
                          const pieData = Object.entries(groupedData)
                            .map(([name, value]) => ({ name, value }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 10)
                          
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
      
      <AIAssistant
        chartData={selectedChartForAI?.data || []}
        chartType={selectedChartForAI?.type || ''}
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />
    </div>
  )
}