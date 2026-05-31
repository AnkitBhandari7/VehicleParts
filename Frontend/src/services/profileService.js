import api from './api';

// Fetch customer profile including vehicle details
export const getCustomerProfile = async (customerId = 'me') => {
  try {
    const response = await api.get(`/customers/${customerId}/profile`);
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

// Update customer profile and vehicle details
export const updateCustomerProfile = async (profileData, customerId = 'me') => {
  try {
    const response = await api.put(`/customers/${customerId}/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
