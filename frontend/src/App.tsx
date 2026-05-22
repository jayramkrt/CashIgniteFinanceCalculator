import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import CalculatorPage from '@/pages/CalculatorPage'
import StatisticsPage from '@/pages/StatisticsPage'
import TaxPlannerDashboard from '@/pages/TaxPlannerDashboard'
import TaxPlanEditPage from '@/pages/TaxPlanEditPage'
import TaxPlanDetailsPage from '@/pages/TaxPlanDetailsPage'
import LoanComparisonPage from '@/pages/LoanComparisonPage'
import RentVsBuyPage from '@/pages/RentVsBuyPage'
import Layout from '@/components/layout/Layout'
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/emi-calculator" element={<CalculatorPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/loan-comparison" element={<LoanComparisonPage />} />
        <Route path="/rent-vs-buy" element={<RentVsBuyPage />} />
        <Route path="/tax" element={<TaxPlannerDashboard />} />
        <Route path="/tax/new" element={<TaxPlanEditPage />} />
        <Route path="/tax/:planId" element={<TaxPlanDetailsPage />} />
        <Route path="/tax/:planId/edit" element={<TaxPlanEditPage />} />
      </Routes>
    </Layout>
  )
}
