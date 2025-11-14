import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Auth from './components/Auth'
import Layout from './components/Layout'
import DashboardsPage from './pages/DashboardsPage'
import DatasetsPage from './pages/DatasetsPage'
import DashboardViewPage from './pages/DashboardViewPage'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user) return <Auth />

  return (
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
  )
}