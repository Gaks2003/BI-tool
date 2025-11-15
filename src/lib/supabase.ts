import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sqthespnbxtpzacrbihn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxdGhlc3BuYnh0cHphY3JiaWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTg2MjEsImV4cCI6MjA3ODY5NDYyMX0.1mEHGMVpwG8MqrqCiO-Vq-F1hoGQ5oXe4lfEFlCD0oQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Modern TypeScript interfaces
export interface Dataset {
  id: string
  user_id: string
  name: string
  data: Record<string, any>[]
  created_at: string
  updated_at?: string
}

export interface Dashboard {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
  updated_at?: string
}

export interface Visualization {
  id: string
  dashboard_id: string
  dataset_id: string
  name: string
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  config: {
    xAxis?: string
    yAxis?: string
    metric?: string
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  }
  created_at: string
  updated_at?: string
}