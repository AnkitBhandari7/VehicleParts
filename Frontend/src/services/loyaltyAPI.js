// loyaltyAPI.js — API calls for Feature 16 (Loyalty Program).
// Backend route: api/loyalty (LoyaltyController)
// Paths include /api because the canonical api.js baseURL is
// http://localhost:5213 (no /api suffix).
import api from './api'

// Get loyalty summary for a customer
export const getLoyaltySummary = (customerId) =>
  api.get(`/api/loyalty/${customerId}`)

// Check discount eligibility
export const checkDiscountEligibility = (customerId, subTotal) =>
  api.get(`/api/loyalty/${customerId}/check-discount?subTotal=${subTotal}`)