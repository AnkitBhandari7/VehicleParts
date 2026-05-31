import api from './api'

export const getFinancialSummary = (from, to) => {
  const params = {}
  if (from) params.from = from
  if (to) params.to = to
  return api.get('/api/admin/reports/financial', { params })
}

export const getMonthlyReport = (year) => {
  const y = year || new Date().getFullYear()
  return api.get(`/api/admin/reports/financial/monthly/${y}`)
}

export const getTopParts = (count = 5) => 
  api.get('/api/admin/reports/financial/top-parts', { params: { count } })