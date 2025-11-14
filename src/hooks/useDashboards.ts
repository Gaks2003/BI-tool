import { useState, useEffect, useCallback } from 'react'
import { supabase, Dashboard } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Cache object to store fetched data
const cache: Record<string, { data: Dashboard[]; timestamp: number }> = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

export function useDashboards() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  const fetchDashboards = useCallback(async () => {
    if (!user) return
    
    const cacheKey = `dashboards-${user.id}`
    const now = Date.now()
    
    // Return cached data if it's still valid
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      setDashboards(cache[cacheKey].data)
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('dashboards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100) // Reasonable limit for dashboards

      if (fetchError) throw fetchError
      
      // Update cache
      cache[cacheKey] = {
        data: data || [],
        timestamp: now
      }
      
      setDashboards(data || [])
    } catch (err) {
      console.error('Error fetching dashboards:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboards'))
    } finally {
      setLoading(false)
    }
  }, [user])

  // Invalidate cache
  const invalidateCache = useCallback(() => {
    if (user) {
      delete cache[`dashboards-${user.id}`]
    }
  }, [user])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    
    const fetchData = async () => {
      if (!user) return
      
      try {
        await fetchDashboards()
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
  }, [fetchDashboards, user])

  const createDashboard = useCallback(async (name: string, description?: string) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const { error } = await supabase
        .from('dashboards')
        .insert({ 
          name, 
          description, 
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        
      if (error) throw error
      
      // Invalidate cache after successful creation
      invalidateCache()
      await fetchDashboards()
      
      return { error: null }
    } catch (err) {
      console.error('Error creating dashboard:', err)
      return { 
        error: err instanceof Error ? err : new Error('Failed to create dashboard')
      }
    }
  }, [user, fetchDashboards, invalidateCache])

  const deleteDashboard = useCallback(async (id: string) => {
    try {
      // First, delete all visualizations associated with this dashboard
      const { error: vizError } = await supabase
        .from('visualizations')
        .delete()
        .eq('dashboard_id', id)
      
      if (vizError) throw vizError
      
      // Then delete the dashboard
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      
      // Invalidate cache after successful deletion
      invalidateCache()
      await fetchDashboards()
      
      return { error: null }
    } catch (err) {
      console.error('Error deleting dashboard:', err)
      return { 
        error: err instanceof Error ? err : new Error('Failed to delete dashboard')
      }
    }
  }, [fetchDashboards, invalidateCache])

  return { 
    dashboards, 
    loading, 
    error,
    createDashboard, 
    deleteDashboard, 
    refetch: fetchDashboards 
  }
}
