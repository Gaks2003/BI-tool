import { Visualization } from '../../lib/supabase'
import { aggregateData, sampleData } from '../../lib/dataAggregator'
import BarChart from './BarChart'
import LineChart from './LineChart'
import AreaChart from './AreaChart'
import PieChart from './PieChart'
import ScatterChart from './ScatterChart'
import RadarChart from './RadarChart'
import HeatmapChart from './HeatmapChart'
import TreemapChart from './TreemapChart'
import KPICard from './KPICard'
import DataTable from './DataTable'

type Props = {
  visualization: Visualization
  data: any[]
}

export default function ChartRenderer({ visualization, data }: Props) {
  const { type, config } = visualization
  
  let processedData = data
  
  if (config.useSampling && data.length > (config.sampleSize || 1000)) {
    processedData = sampleData(data, config.sampleSize || 1000)
  }
  
  if (config.aggregation && config.xAxis && config.yAxis) {
    processedData = aggregateData(processedData, config.xAxis, config.yAxis, config.aggregation)
  }

  switch (type) {
    case 'bar':
      return <BarChart data={processedData} xAxis={config.xAxis!} yAxis={config.yAxis!} />
    case 'line':
      return <LineChart data={processedData} xAxis={config.xAxis!} yAxis={config.yAxis!} />
    case 'area':
      return <AreaChart data={processedData} xAxis={config.xAxis!} yAxis={config.yAxis!} />
    case 'scatter':
      return <ScatterChart data={processedData} xAxis={config.xAxis!} yAxis={config.yAxis!} />
    case 'pie':
      return <PieChart data={processedData} label={config.label!} metric={config.metric!} />
    case 'radar':
      return <RadarChart data={processedData} category={config.category!} metric={config.metric!} />
    case 'heatmap':
      return <HeatmapChart data={processedData} xAxis={config.xAxis!} yAxis={config.yAxis!} metric={config.metric!} />
    case 'treemap':
      return <TreemapChart data={processedData} category={config.category!} metric={config.metric!} />
    case 'kpi':
      return <KPICard data={data} metric={config.metric!} name={visualization.name} />
    case 'table':
      return <DataTable data={processedData} />
    default:
      return <div>Unknown chart type</div>
  }
}
