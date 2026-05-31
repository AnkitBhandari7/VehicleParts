// customerReportService.js — API calls for Feature 9 (Customer Reports).
import api from "./api";

export const getRegularCustomers = (topCount = 10) =>
  api.get(`/api/customer-reports/regulars?topCount=${topCount}`);

export const getHighSpenders = (topCount = 10) =>
  api.get(`/api/customer-reports/high-spenders?topCount=${topCount}`);

export const getPendingCredits = () =>
  api.get(`/api/customer-reports/pending-credits`);