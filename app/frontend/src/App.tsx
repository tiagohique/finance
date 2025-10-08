import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { IncomesPage } from './pages/IncomesPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ReportsPage } from './pages/ReportsPage'

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="incomes" element={<IncomesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)

export default App
