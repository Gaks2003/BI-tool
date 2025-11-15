import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useStore'
import type { Dataset, Dashboard, Visualization } from '@/types'

export const useDatasets = () => {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['datasets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Dataset[]
    },
    enabled: !!user?.id,
  })
}

export const useDashboards = () => {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['dashboards', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Dashboard[]
    },
    enabled: !!user?.id,
  })
}

export const useCreateDashboard = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const { error } = await supabase
        .from('dashboards')
        .insert([{ ...data, user_id: user?.id }])
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
    },
  })
}