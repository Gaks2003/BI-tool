import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sqthespnbxtpzacrbihn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxdGhlc3BuYnh0cHphY3JiaWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTg2MjEsImV4cCI6MjA3ODY5NDYyMX0.1mEHGMVpwG8MqrqCiO-Vq-F1hoGQ5oXe4lfEFlCD0oQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Dataset = {
  id: string
  user_id: string
  name: string
  data: any[]
  created_at: string
}

export type Dashboard = {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
}

export type Visualization = {
  id: string
  dashboard_id: string
  dataset_id: string
  name: string
  type: 'bar' | 'line' | 'pie' | 'area'
  config: {
    xAxis?: string
    yAxis?: string
    metric?: string
  }
  created_at: string
}