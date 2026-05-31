// historyAPI.js — API calls for Feature 14 (Customer Purchase History).
// Backend route: api/customerhistory (CustomerHistoryController)
// Paths include /api because the canonical api.js baseURL is
// http://localhost:5213 (no /api suffix).
import api from './api'

// Get full history (purchases + services)
export const getFullHistory = (customerId) =>
  api.get(`/api/customerhistory/${customerId}`)

// Get only purchase history
export const getPurchaseHistory = (customerId) =>
  api.get(`/api/customerhistory/${customerId}/purchases`)

// Get only service history
export const getServiceHistory = (customerId) =>
  api.get(`/api/customerhistory/${customerId}/services`)