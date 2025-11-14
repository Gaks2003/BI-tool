const cache = new Map<string, { data: any, timestamp: number }>()
const TTL = 5 * 60 * 1000

export function getCached(key: string): any | null {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() - item.timestamp > TTL) {
    cache.delete(key)
    return null
  }
  return item.data
}

export function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

export function clearCache() {
  cache.clear()
}
