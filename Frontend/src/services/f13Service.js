// f13Service.js — API calls for Feature 13 (Customer Self-Service)
// Covers appointments, part requests, and service reviews.
import api from "./api";

// ---- Appointments ----
export const bookAppointment = (data) =>
  api.post("/api/F13/appointments", data);

export const getAppointments = (customerId) =>
  api.get(`/api/F13/appointments/${customerId}`);

// ---- Part Requests ----
export const requestPart = (data) =>
  api.post("/api/F13/part-requests", data);

export const getPartRequests = (customerId) =>
  api.get(`/api/F13/part-requests/${customerId}`);

// ---- Service Reviews ----
export const submitReview = (data) =>
  api.post("/api/F13/reviews", data);

export const getReviews = (customerId) =>
  api.get(`/api/F13/reviews/${customerId}`);