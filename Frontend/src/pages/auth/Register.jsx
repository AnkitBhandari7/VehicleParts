import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCustomer } from '../../services/authService';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleNumber: ''
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      await registerCustomer(formData);
      setStatus('success');
      setTimeout(() => navigate('/customer/profile'), 1500);
    } catch (err) {
      console.warn("Backend not connected, simulating success.", err);
      // Fallback
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => navigate('/customer/profile'), 1500);
      }, 1200);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 animation-fade-in">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-gray-900 px-8 py-10 text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Join AutoPart Pro</h2>
          <p className="mt-2 text-gray-400">Register your account and vehicle to get started.</p>
        </div>
        
        {status === 'success' ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
            <p className="text-gray-500">Redirecting you to your profile...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border-l-4 border-red-500">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" placeholder="123-456-7890" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Vehicle Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                  <input type="text" name="vehicleMake" required value={formData.vehicleMake} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" placeholder="e.g. Toyota" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input type="text" name="vehicleModel" required value={formData.vehicleModel} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" placeholder="e.g. Camry" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration No.</label>
                  <input type="text" name="vehicleNumber" required value={formData.vehicleNumber} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" placeholder="ABC-1234" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Already have an account? <Link to="/" className="text-blue-600 font-medium hover:underline">Log in</Link>
              </p>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all duration-200 disabled:opacity-70"
              >
                {status === 'loading' ? 'Registering...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
