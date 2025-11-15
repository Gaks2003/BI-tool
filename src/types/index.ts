export interface Dataset {
  id: string
  user_id: string
  name: string
  data: Record<string, any>[]
  created_at: string
}

export interface Dashboard {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
}

export interface Visualization {
  id: string
  dashboard_id: string
  dataset_id: string
  name: string
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'heatmap' | 'treemap' | 'kpi' | 'table' | 'bubble' | 'boxplot' | 'waterfall'
  config: {
    xAxis?: string
    yAxis?: string
    metric?: string
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
    offset?: number
    limit?: number
    maxEntries?: number
    sizeField?: string
  }
  created_at: string
}