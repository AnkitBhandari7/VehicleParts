// notificationService.js — API calls for Feature 15 (Notifications).
import api from "./api";

// ---- Low stock ----
export const getLowStockParts = () =>
  api.get(`/api/notifications/low-stock`);

export const notifyAdminLowStock = (adminUserId) =>
  api.post(`/api/notifications/low-stock/notify/${adminUserId}`);

// ---- Overdue credits ----
export const getOverdueCredits = () =>
  api.get(`/api/notifications/overdue-credits`);

export const sendCreditReminders = () =>
  api.post(`/api/notifications/overdue-credits/notify`);

// ---- A user's notifications ----
export const getNotificationsByUser = (userId) =>
  api.get(`/api/notifications/${userId}`);