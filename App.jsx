import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { HeatMap } from './pages/HeatMap'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { Analytics } from './pages/Analytics'
import './App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/heatmap" element={<HeatMap />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
