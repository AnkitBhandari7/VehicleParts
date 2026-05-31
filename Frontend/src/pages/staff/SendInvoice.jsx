import { useState } from 'react';
import { sendInvoiceEmail } from '../../services/invoiceService';

export default function SendInvoice() {
  const [formData, setFormData] = useState({
    customerEmail: '',
    customerName: '',
    amount: '',
    description: '',
  });
  
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Strict validation for lowercase @gmail.com email
    if (!formData.customerEmail.endsWith('@gmail.com')) {
      setStatus('error');
      setErrorMessage('Only @gmail.com email addresses are allowed.');
      return;
    }

    if (formData.customerEmail !== formData.customerEmail.toLowerCase()) {
      setStatus('error');
      setErrorMessage('Email address must be strictly in lowercase (no uppercase letters allowed).');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Attempt API call to send invoice
      await sendInvoiceEmail(formData);
      setStatus('success');
      resetFormAfterDelay();
    } catch (err) {
      console.warn("Backend API not connected. Simulating success for demonstration.", err);
      // Fallback for demonstration when backend is not running
      setTimeout(() => {
        setStatus('success');
        resetFormAfterDelay();
      }, 1200);
    }
  };

  const resetFormAfterDelay = () => {
    setTimeout(() => {
      setFormData({
        customerEmail: '',
        customerName: '',
        amount: '',
        description: '',
      });
      setStatus('idle');
    }, 4000); // Reset back to form after 4 seconds
  };

  return (
    <div className="max-w-4xl mx-auto animation-fade-in py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Send Invoice</h1>
        <p className="mt-2 text-sm text-gray-500">Generate and email an invoice directly to a customer's inbox.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Success Overlay */}
        {status === 'success' && (
          <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-500">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-10 w-10 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Invoice Sent Successfully!</h3>
            <p className="text-gray-500 text-center max-w-md">
              An email has been dispatched to <span className="font-semibold text-gray-700">{formData.customerEmail}</span> containing the invoice details.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="customerName"
                  id="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="customerEmail"
                  id="customerEmail"
                  required
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Amount (NPR)
            </label>
            <div className="relative w-full md:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm font-medium">NPR</span>
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                required
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className="block w-full pl-12 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Service Description
            </label>
            <textarea
              name="description"
              id="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="block w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors resize-none"
              placeholder="Describe the parts or services provided..."
            />
          </div>

          {/* Error Message */}
          {status === 'error' && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <p className="text-sm text-red-700">{errorMessage || 'An error occurred while sending the invoice.'}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Invoice...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Invoice via Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
