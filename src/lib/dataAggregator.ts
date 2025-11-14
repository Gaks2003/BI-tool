export function aggregateData(data: any[], groupBy: string, metric: string, operation: 'sum' | 'avg' | 'count' | 'min' | 'max' = 'sum') {
  const groups: Record<string, number[]> = {}
  
  data.forEach(row => {
    const key = row[groupBy]
    if (!groups[key]) groups[key] = []
    groups[key].push(Number(row[metric]) || 0)
  })
  
  return Object.entries(groups).map(([key, values]) => {
    let result = 0
    switch (operation) {
      case 'sum':
        result = values.reduce((a, b) => a + b, 0)
        break
      case 'avg':
        result = values.reduce((a, b) => a + b, 0) / values.length
        break
      case 'count':
        result = values.length
        break
      case 'min':
        result = Math.min(...values)
        break
      case 'max':
        result = Math.max(...values)
        break
    }
    return { [groupBy]: key, [metric]: result }
  })
}

export function paginateData(data: any[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    data: data.slice(start, end),
    total: data.length,
    pages: Math.ceil(data.length / pageSize),
    currentPage: page
  }
}

export function sampleData(data: any[], sampleSize: number = 1000) {
  if (data.length <= sampleSize) return data
  const step = Math.floor(data.length / sampleSize)
  return data.filter((_, i) => i % step === 0).slice(0, sampleSize)
}
