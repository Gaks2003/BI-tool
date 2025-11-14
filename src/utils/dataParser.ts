export function parseCSV(text: string): any[] {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const obj: any = {}
    headers.forEach((header, i) => {
      const value = values[i]
      obj[header] = isNaN(Number(value)) ? value : Number(value)
    })
    return obj
  })
}

export async function parseExcel(file: File): Promise<any[]> {
  try {
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    const buffer = await file.arrayBuffer()
    await workbook.xlsx.load(buffer)
    
    const worksheet = workbook.worksheets[0]
    if (!worksheet) throw new Error('No worksheet found')
    
    const data: any[] = []
    const headers: string[] = []
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell) => {
          headers.push(String(cell.value || `Column${headers.length + 1}`))
        })
      } else {
        const obj: any = {}
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1]
          if (header) {
            const value = cell.value
            obj[header] = typeof value === 'number' ? value : String(value || '')
          }
        })
        if (Object.keys(obj).length > 0) {
          data.push(obj)
        }
      }
    })
    
    console.log('Excel parsed:', data.length, 'rows,', headers.length, 'columns')
    return data
  } catch (err) {
    console.error('Excel parse error:', err)
    throw new Error('Failed to parse Excel file: ' + (err as Error).message)
  }
}

export function detectFieldTypes(data: any[]): Record<string, 'number' | 'string'> {
  if (data.length === 0) return {}
  
  const fields: Record<string, 'number' | 'string'> = {}
  const sample = data[0]
  
  Object.keys(sample).forEach(key => {
    const values = data.slice(0, 100).map(row => row[key])
    const numericCount = values.filter(v => {
      if (v === null || v === undefined || v === '') return false
      const num = Number(v)
      return !isNaN(num) && isFinite(num)
    }).length
    
    fields[key] = numericCount > values.length * 0.8 ? 'number' : 'string'
  })
  
  return fields
}

export function getFieldSuggestions(fields: Record<string, 'number' | 'string'>) {
  const numeric = Object.keys(fields).filter(k => fields[k] === 'number')
  const categorical = Object.keys(fields).filter(k => fields[k] === 'string')
  
  return { numeric, categorical }
}
