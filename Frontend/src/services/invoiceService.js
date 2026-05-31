import api from './api';

/**
 * Sends an invoice via email to a customer
 * @param {Object} invoiceData - The invoice details (customerEmail, amount, description, etc.)
 */
export const sendInvoiceEmail = async (invoiceData) => {
  try {
    const response = await api.post(`/invoices/send`, invoiceData);
    return response.data;
  } catch (error) {
    console.error("Error sending invoice:", error);
    throw error;
  }
};
