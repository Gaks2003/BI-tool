self.onmessage = (e: MessageEvent) => {
  const { type, data } = e.data

  switch (type) {
    case 'aggregate':
      const result = aggregateData(data.rows, data.groupBy, data.metric, data.operation)
      self.postMessage({ type: 'result', data: result })
      break
    case 'filter':
      const filtered = filterData(data.rows, data.filters)
      self.postMessage({ type: 'result', data: filtered })
      break
  }
}

function aggregateData(rows: any[], groupBy: string, metric: string, operation: string) {
  const groups: Record<string, number[]> = {}
  rows.forEach(row => {
    const key = row[groupBy]
    if (!groups[key]) groups[key] = []
    groups[key].push(Number(row[metric]) || 0)
  })
  return Object.entries(groups).map(([key, values]) => ({
    [groupBy]: key,
    [metric]: operation === 'sum' ? values.reduce((a, b) => a + b, 0) : values.reduce((a, b) => a + b, 0) / values.length
  }))
}

function filterData(rows: any[], filters: Record<string, string>) {
  return rows.filter(row => {
    return Object.entries(filters).every(([key, value]) => {
      return String(row[key]).toLowerCase().includes(value.toLowerCase())
    })
  })
}
