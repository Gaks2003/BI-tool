import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore, useThemeStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import Auth from '@/components/Auth'
import Layout from '@/components/Layout'
import DashboardsPage from '@/pages/DashboardsPage'
import DatasetsPage from '@/pages/DatasetsPage'
import DashboardViewPage from '@/pages/DashboardViewPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

export default function App() {
  const { user, setUser } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    // Set initial theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser, theme])

  if (!user) return <Auth />

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboards" replace />} />
            <Route path="/dashboards" element={<DashboardsPage />} />
            <Route path="/datasets" element={<DatasetsPage />} />
            <Route path="/dashboard/:id" element={<DashboardViewPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}