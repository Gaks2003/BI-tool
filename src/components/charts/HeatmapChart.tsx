import React from 'react'
import { ResponsiveContainer } from 'recharts'

type Props = {
  data: any[]
  xAxis: string
  yAxis: string
  metric: string
}

export default function HeatmapChart({ data, xAxis, yAxis, metric }: Props) {
  // Check if we have too many unique values (indicating individual records)
  const xValues = [...new Set(data.map(item => item[xAxis]))]
  const yValues = [...new Set(data.map(item => item[yAxis]))]
  
  // If too many unique values, show error message
  if (xValues.length > 10 || yValues.length > 10) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Heatmap Not Suitable</p>
          <p className="text-sm mb-2">Too many unique values ({xValues.length} x {yValues.length})</p>
          <p className="text-xs">Heatmaps work best with categorical data like:</p>
          <p className="text-xs mt-1">• department vs location</p>
          <p className="text-xs">• gender vs department</p>
          <p className="text-xs">• location vs years_experience (grouped)</p>
        </div>
      </div>
    )
  }
  
  const sortedXValues = xValues.sort()
  const sortedYValues = yValues.sort()
  
  // Create heatmap matrix
  const matrix = sortedYValues.map(yVal => 
    sortedXValues.map(xVal => {
      const items = data.filter(item => item[xAxis] === xVal && item[yAxis] === yVal)
      const value = items.length > 0 
        ? items.reduce((sum, item) => sum + (parseFloat(item[metric]) || 0), 0) / items.length
        : 0
      return { x: xVal, y: yVal, value, count: items.length }
    })
  )

  // Get min/max for color scaling
  const allValues = matrix.flat().map(cell => cell.value).filter(v => v > 0)
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)

  // Color intensity function
  const getColor = (value: number) => {
    if (value === 0) return '#f3f4f6'
    const intensity = (value - minValue) / (maxValue - minValue)
    const opacity = 0.2 + (intensity * 0.8)
    return `rgba(59, 130, 246, ${opacity})`
  }

  const cellSize = Math.min(300 / Math.max(sortedXValues.length, sortedYValues.length), 50)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <div className="flex flex-col items-center">
        <div className="grid gap-1 p-4" style={{
          gridTemplateColumns: `80px repeat(${sortedXValues.length}, ${cellSize}px)`,
          gridTemplateRows: `30px repeat(${sortedYValues.length}, ${cellSize}px)`
        }}>
          {/* Empty top-left cell */}
          <div></div>
          
          {/* X-axis labels */}
          {sortedXValues.map(xVal => (
            <div key={xVal} className="text-xs text-center font-medium text-gray-600 dark:text-gray-400 truncate">
              {String(xVal)}
            </div>
          ))}
          
          {/* Y-axis labels and heatmap cells */}
          {matrix.map((row, yIndex) => (
            <React.Fragment key={sortedYValues[yIndex]}>
              <div className="text-xs text-right font-medium text-gray-600 dark:text-gray-400 pr-2 flex items-center justify-end">
                {String(sortedYValues[yIndex])}
              </div>
              {row.map((cell, xIndex) => (
                <div
                  key={`${xIndex}-${yIndex}`}
                  className="border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-medium cursor-pointer hover:border-gray-400 transition-colors"
                  style={{
                    backgroundColor: getColor(cell.value),
                    width: cellSize,
                    height: cellSize
                  }}
                  title={`${xAxis}: ${cell.x}\n${yAxis}: ${cell.y}\n${metric}: ${cell.value.toFixed(2)}\nCount: ${cell.count} records`}
                >
                  {cell.value > 0 ? cell.value.toFixed(0) : ''}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center space-x-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
          <span>Low</span>
          <div className="flex">
            {[0.2, 0.4, 0.6, 0.8, 1.0].map(opacity => (
              <div
                key={opacity}
                className="w-4 h-4 border border-gray-300"
                style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
              />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>
    </ResponsiveContainer>
  )
}