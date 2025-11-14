export function compressData(data: any[]): string {
  return JSON.stringify(data)
}

export function decompressData(compressed: string): any[] {
  return JSON.parse(compressed)
}

export function chunkData(data: any[], chunkSize: number = 10000): any[][] {
  const chunks: any[][] = []
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize))
  }
  return chunks
}

export function estimateDataSize(data: any[]): number {
  return new Blob([JSON.stringify(data)]).size
}

export function optimizeDataset(data: any[]): any[] {
  return data.map(row => {
    const optimized: any = {}
    Object.entries(row).forEach(([key, value]) => {
      // Remove null/undefined
      if (value !== null && value !== undefined && value !== '') {
        // Trim strings
        if (typeof value === 'string') {
          optimized[key] = value.trim()
        } else {
          optimized[key] = value
        }
      }
    })
    return optimized
  })
}
