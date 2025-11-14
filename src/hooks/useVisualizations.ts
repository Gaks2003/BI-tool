import { useState, useEffect } from 'react'
import { supabase, Visualization } from '../lib/supabase'

export function useVisualizations(dashboardId?: string) {
  const [visualizations, setVisualizations] = useState<Visualization[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVisualizations = async () => {
    if (!dashboardId) return
    const { data, error } = await supabase
      .from('visualizations')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('created_at', { ascending: false })
    if (!error && data) setVisualizations(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchVisualizations()
  }, [dashboardId])

  const createVisualization = async (viz: Omit<Visualization, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('visualizations').insert(viz)
    if (!error) await fetchVisualizations()
    return { error }
  }

  const deleteVisualization = async (id: string) => {
    const { error } = await supabase.from('visualizations').delete().eq('id', id)
    if (!error) await fetchVisualizations()
    return { error }
  }

  return { visualizations, loading, createVisualization, deleteVisualization, refetch: fetchVisualizations }
}
