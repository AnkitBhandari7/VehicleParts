import api from './api';

export const registerCustomer = async (customerData) => {
  try {
    const response = await api.post('/auth/register', customerData);
    return response.data;
  } catch (error) {
    console.error("Error during customer registration:", error);
    throw error;
  }
};
