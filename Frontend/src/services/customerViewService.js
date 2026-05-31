// customerViewService.js — API calls for Feature 8 (Customer History).
// Staff looks up a customer's profile, vehicles, and purchase history.
import api from "./api";

export const getCustomerDetails = (customerId) =>
  api.get(`/api/customer-view/${customerId}`);

export const getCustomerVehicles = (customerId) =>
  api.get(`/api/customer-view/${customerId}/vehicles`);

export const getCustomerPurchaseHistory = (customerId) =>
  api.get(`/api/customer-view/${customerId}/history`);