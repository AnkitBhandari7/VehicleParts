// invoiceAPI.js — API calls for Feature 7 (Sell Parts / Create Invoice).
// Backend route: api/invoice (InvoiceController)
import api from './api'

// Create a new sale invoice
export const createInvoice = (data) => api.post('/api/invoice', data)

// Get invoice by ID
export const getInvoiceById = (id) => api.get(`/api/invoice/${id}`)

// Get all invoices for a customer
export const getInvoicesByCustomer = (customerId) =>
  api.get(`/api/invoice/customer/${customerId}`)

// Send invoice via email (Feature 11)
export const sendInvoiceEmail = (data) => api.post('/api/invoice/send', data)