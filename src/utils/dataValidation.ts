export function validateData(data: any[]): { valid: boolean, errors: string[] } {
  const errors: string[] = []

  if (!Array.isArray(data)) {
    errors.push('Data must be an array')
    return { valid: false, errors }
  }

  if (data.length === 0) {
    errors.push('Data is empty')
    return { valid: false, errors }
  }

  // Check for consistent columns
  const firstKeys = Object.keys(data[0])
  data.forEach((row, i) => {
    const keys = Object.keys(row)
    if (keys.length !== firstKeys.length) {
      errors.push(`Row ${i} has inconsistent columns`)
    }
  })

  // Check for null/undefined values
  const nullCounts: Record<string, number> = {}
  data.forEach(row => {
    Object.entries(row).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        nullCounts[key] = (nullCounts[key] || 0) + 1
      }
    })
  })

  Object.entries(nullCounts).forEach(([key, count]) => {
    if (count > data.length * 0.5) {
      errors.push(`Column '${key}' has ${count} null values (${((count/data.length)*100).toFixed(1)}%)`)
    }
  })

  return { valid: errors.length === 0, errors }
}

export function cleanData(data: any[]): any[] {
  return data.map(row => {
    const cleaned: any = {}
    Object.entries(row).forEach(([key, val]) => {
      // Replace null/undefined with defaults
      if (val === null || val === undefined || val === '') {
        cleaned[key] = typeof val === 'number' ? 0 : ''
      } else {
        cleaned[key] = val
      }
    })
    return cleaned
  })
}

export function removeDuplicates(data: any[], key: string): any[] {
  const seen = new Set()
  return data.filter(row => {
    const val = row[key]
    if (seen.has(val)) return false
    seen.add(val)
    return true
  })
}
