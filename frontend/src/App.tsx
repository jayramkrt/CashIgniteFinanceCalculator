import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import CalculatorPage from '@/pages/CalculatorPage'
import StatisticsPage from '@/pages/StatisticsPage'
// import HistoryPage from '@/pages/HistoryPage'  // DB disabled
import Layout from '@/components/layout/Layout'
import LandingLayout from '@/components/layout/LandingLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={
        <LandingLayout><HomePage /></LandingLayout>
      } />
      <Route path="/emi-calculator" element={
        <Layout><CalculatorPage /></Layout>
      } />
      <Route path="/statistics" element={
        <Layout><StatisticsPage /></Layout>
      } />
      {/* <Route path="/history" element={<Layout><HistoryPage /></Layout>} /> */}
    </Routes>
  )
}
