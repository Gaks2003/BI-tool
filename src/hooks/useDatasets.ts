import { useState, useEffect, useCallback } from 'react'
import { supabase, Dataset } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Cache object to store fetched data
const cache: Record<string, { data: any[]; timestamp: number }> = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

export function useDatasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  const fetchDatasets = useCallback(async () => {
    if (!user) return
    
    const cacheKey = `datasets-${user.id}`
    const now = Date.now()
    
    // Return cached data if it's still valid
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      setDatasets(cache[cacheKey].data)
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('datasets')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000) // Limit the number of records

      if (fetchError) throw fetchError
      
      // Update cache
      cache[cacheKey] = {
        data: data || [],
        timestamp: now
      }
      
      setDatasets(data || [])
    } catch (err) {
      console.error('Error fetching datasets:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch datasets'))
    } finally {
      setLoading(false)
    }
  }, [user])

  // Invalidate cache
  const invalidateCache = useCallback(() => {
    if (user) {
      delete cache[`datasets-${user.id}`]
    }
  }, [user])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    
    const fetchData = async () => {
      if (!user) return
      
      try {
        await fetchDatasets()
      } catch (err) {
        if (isMounted) {
          console.error('Error in fetchData:', err)
        }
      }
    }
    
    fetchData()
    
    // Set up refresh interval
    const refreshInterval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    
    return () => {
      isMounted = false
      controller.abort()
      clearInterval(refreshInterval)
    }
  }, [fetchDatasets, user])

  const createDataset = useCallback(async (name: string, data: any[], isVector: boolean = false, vectorField?: string) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      // For large datasets, sample to 50000 rows
      const finalData = data.length > 50000 ? data.slice(0, 50000) : data
      
      if (data.length > 50000) {
        console.warn(`Dataset too large (${data.length} rows). Sampling to 50000 rows.`)
      }
      
      const { error } = await supabase
        .from('datasets')
        .insert({ 
          name, 
          data: finalData, 
          user_id: user.id, 
          is_vector: isVector, 
          vector_field: vectorField,
          data_length: finalData.length // Store length for reference
        })
        
      if (error) throw error
      
      // Invalidate cache after successful creation
      invalidateCache()
      await fetchDatasets()
      
      return { error: null, sampled: data.length > 50000 }
    } catch (err) {
      console.error('Error creating dataset:', err)
      return { 
        error: err instanceof Error ? err : new Error('Failed to create dataset'),
        sampled: false
      }
    }
  }, [user, fetchDatasets, invalidateCache])

  const deleteDataset = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('datasets')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      
      // Invalidate cache after successful deletion
      invalidateCache()
      await fetchDatasets()
      
      return { error: null }
    } catch (err) {
      console.error('Error deleting dataset:', err)
      return { 
        error: err instanceof Error ? err : new Error('Failed to delete dataset')
      }
    }
  }, [fetchDatasets, invalidateCache])

  return { 
    datasets, 
    loading, 
    error,
    createDataset, 
    deleteDataset, 
    refetch: fetchDatasets 
  }
}
