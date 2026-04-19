import { Routes, Route } from 'react-router-dom'
import CalculatorPage from '@/pages/CalculatorPage'
import StatisticsPage from '@/pages/StatisticsPage'
// import HistoryPage from '@/pages/HistoryPage'  // DB disabled
import Layout from '@/components/layout/Layout'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"              element={<CalculatorPage />} />
        <Route path="/statistics"    element={<StatisticsPage />} />
        {/* history route disabled — uncomment when DB is re-enabled */}
      </Routes>
    </Layout>
  )
}
