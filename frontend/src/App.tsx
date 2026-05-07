import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import CalculatorPage from '@/pages/CalculatorPage'
import StatisticsPage from '@/pages/StatisticsPage'
import TaxPlannerDashboard from '@/pages/TaxPlannerDashboard'
import TaxPlanEditPage from '@/pages/TaxPlanEditPage'
import TaxPlanDetailsPage from '@/pages/TaxPlanDetailsPage'
// import HistoryPage from '@/pages/HistoryPage'  // DB disabled
import Layout from '@/components/layout/Layout'
import LandingLayout from '@/components/layout/LandingLayout'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingLayout><HomePage /></LandingLayout>} />
        <Route path="/emi-calculator" element={<CalculatorPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/tax" element={<TaxPlannerDashboard />} />
        <Route path="/tax/new" element={<TaxPlanEditPage />} />
        <Route path="/tax/:planId" element={<TaxPlanDetailsPage />} />
        <Route path="/tax/:planId/edit" element={<TaxPlanEditPage />} />
        {/* history route disabled — uncomment when DB is re-enabled */}
      </Routes>
    </Layout>
  )
}
