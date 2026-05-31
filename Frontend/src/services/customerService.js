import api from './api';

export const searchCustomers = async (query, type = 0) => {
  try {
    const response = await api.get(`/api/customer/search`, { params: { type, query } });
    return response.data;
  } catch (error) {
    console.error("Error searching customers:", error);
    throw error;
  }
};

// Expose profile and vehicle self-management services
export const getCustomerProfile = (customerId) => api.get(`/api/customer/${customerId}`);

export const updateCustomerProfile = (customerId, data) => api.put(`/api/customer/${customerId}`, data);

export const addCustomerVehicle = (customerId, data) => api.post(`/api/customer/${customerId}/vehicles`, data);

