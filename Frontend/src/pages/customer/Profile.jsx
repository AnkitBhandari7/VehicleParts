import { useState, useEffect } from 'react';
import { getCustomerProfile, updateCustomerProfile } from '../../services/profileService';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '098-765-4321',
    vehicleMake: 'Honda',
    vehicleModel: 'Civic',
    vehicleNumber: 'XYZ-9876',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, saving
  
  // Simulated fetch on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setStatus('loading');
      try {
        const data = await getCustomerProfile();
        setProfile(data);
      } catch (err) {
        console.warn("Backend not connected, using mock data.");
      } finally {
        setStatus('idle');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setStatus('saving');
    try {
      await updateCustomerProfile(profile);
      setIsEditing(false);
    } catch (err) {
      console.warn("Backend not connected, saving locally.");
      setTimeout(() => setIsEditing(false), 800);
    } finally {
      setTimeout(() => setStatus('idle'), 800);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 animation-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
          <p className="mt-2 text-sm text-gray-500">Manage your personal information and vehicle details.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)} 
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => setIsEditing(false)} 
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={status === 'saving'}
              className="px-4 py-2 bg-blue-600 rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {status === 'saving' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center gap-6 mb-8">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-md">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                {profile.email}
              </p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
              {isEditing ? (
                <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              ) : (
                <p className="text-gray-900 font-medium">{profile.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
              {isEditing ? (
                <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              ) : (
                <p className="text-gray-900 font-medium">{profile.phone}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <h3 className="text-lg font-bold text-gray-900">Vehicle Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Make</label>
              {isEditing ? (
                <input type="text" name="vehicleMake" value={profile.vehicleMake} onChange={handleChange} className="w-full px-2 py-1 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
              ) : (
                <p className="text-gray-900 font-semibold text-lg">{profile.vehicleMake}</p>
              )}
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Model</label>
              {isEditing ? (
                <input type="text" name="vehicleModel" value={profile.vehicleModel} onChange={handleChange} className="w-full px-2 py-1 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
              ) : (
                <p className="text-gray-900 font-semibold text-lg">{profile.vehicleModel}</p>
              )}
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Registration No.</label>
              {isEditing ? (
                <input type="text" name="vehicleNumber" value={profile.vehicleNumber} onChange={handleChange} className="w-full px-2 py-1 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
              ) : (
                <p className="text-gray-900 font-semibold text-lg bg-gray-100 inline-block px-2 py-1 rounded">{profile.vehicleNumber}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
