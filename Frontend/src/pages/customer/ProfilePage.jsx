import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentCustomerId } from "../../services/auth";
import { getCustomerProfile, updateCustomerProfile, addCustomerVehicle } from "../../services/customerService";

export default function ProfilePage() {
  const navigate = useNavigate();
  const customerId = getCurrentCustomerId();

  // Loading & state metrics
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);
  
  // Feedback alerts
  const [errorMsg, setErrorMsg] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [vehicleSuccess, setVehicleSuccess] = useState("");

  // Toggle vehicle input panel
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: "",
    make: "",
    model: "",
    year: "",
    color: "",
    vin: "",
    notes: "",
  });

  // Guard for stale sessions
  useEffect(() => {
    if (!customerId) {
      localStorage.clear();
      navigate("/login");
    }
  }, [customerId, navigate]);

  // Load customer profile data
  const loadProfile = async () => {
    if (!customerId) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getCustomerProfile(customerId);
      const data = res.data;
      setProfile(data);
      
      const rawDob = data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "";
      const isInvalidDob = !rawDob || rawDob.startsWith("0001") || new Date(rawDob).getFullYear() < 1900;

      setProfileForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        address: data.address || "",
        dateOfBirth: isInvalidDob ? "" : rawDob,
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to retrieve profile data. Please verify database connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Update customer profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setProfileSuccess("");
    setSavingProfile(true);

    if (!profileForm.dateOfBirth) {
      setErrorMsg("Please select a valid Date of Birth.");
      setSavingProfile(false);
      return;
    }

    const dobYear = new Date(profileForm.dateOfBirth).getFullYear();
    if (dobYear < 1900) {
      setErrorMsg("Please enter a valid Date of Birth (must be after January 1, 1900).");
      setSavingProfile(false);
      return;
    }

    try {
      const payload = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        address: profileForm.address,
        dateOfBirth: new Date(profileForm.dateOfBirth).toISOString(),
      };
      
      const res = await updateCustomerProfile(customerId, payload);
      setProfile(res.data);
      setProfileSuccess("Your profile has been updated successfully.");
      
      // Update local storage name representation if changed
      const fullName = `${res.data.firstName} ${res.data.lastName}`.trim();
      localStorage.setItem("userName", fullName);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update profile details. Check inputs.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Register a new vehicle
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setVehicleSuccess("");
    setAddingVehicle(true);

    try {
      const payload = {
        vehicleNumber: vehicleForm.vehicleNumber,
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: vehicleForm.year,
        color: vehicleForm.color,
        vin: vehicleForm.vin,
        notes: vehicleForm.notes,
      };

      await addCustomerVehicle(customerId, payload);
      setVehicleSuccess(`Vehicle "${vehicleForm.make} ${vehicleForm.model}" added successfully!`);
      
      // Clear vehicle form
      setVehicleForm({
        vehicleNumber: "",
        make: "",
        model: "",
        year: "",
        color: "",
        vin: "",
        notes: "",
      });

      setShowAddVehicle(false);
      
      // Refresh entire profile to fetch updated vehicles list
      const res = await getCustomerProfile(customerId);
      setProfile(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to add vehicle. Please verify input fields.");
    } finally {
      setAddingVehicle(false);
    }
  };

  // UI Utilities
  const money = (n) => `Rs. ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-screen bg-slate-50/50">
        <svg className="animate-spin h-6 w-6 text-slate-900" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-slate-500 font-bold uppercase tracking-wider text-xs">Loading Profile & Fleet...</span>
      </div>
    );
  }

  // Crash-proof layout: if profile is null (database offline or unauthorized), display beautiful robust error card instead of throwing TypeError.
  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen bg-slate-50/50 animation-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile & Vehicles</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 uppercase tracking-wider">
            Manage your personal settings and registered vehicles fleet
          </p>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4 text-xs text-rose-700 font-bold flex gap-3 items-center shadow-sm max-w-2xl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 text-rose-500">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p className="font-extrabold uppercase tracking-wide">Error Retrieving Account Information</p>
            <p className="text-[11px] text-rose-600 font-semibold mt-0.5">{errorMsg || "Unable to contact the server to fetch your profile. Please check your credentials or network."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 bg-slate-50/50 min-h-screen pb-16 animation-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile & Vehicles</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 uppercase tracking-wider">
            Manage your personal settings and registered vehicles fleet
          </p>
        </div>
        
        {/* Loyalty Quick Balance Badge */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-3 shadow-md min-w-[180px]">
          <p className="text-[9px] uppercase font-bold tracking-wider text-slate-450">Loyalty Balance</p>
          <p className="text-xl font-black mt-0.5 flex items-baseline gap-1">
            {profile.loyaltyPoints} 
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">pts</span>
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-rose-50 border border-rose-100 rounded-2xl px-5 py-3.5 text-xs text-rose-700 font-bold flex gap-2.5 items-center shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 text-rose-500">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personal Profile Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/85 p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            Account Personal Profile
          </h3>
          
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-xs text-emerald-700 font-bold flex gap-2 items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 text-emerald-500">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>{profileSuccess}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Home Address</label>
              <textarea
                required
                rows={2}
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium resize-none"
              />
            </div>

            {/* Read-only system values */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4.5 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</p>
                <p className="text-sm font-black text-slate-900 mt-1">{money(profile.totalSpent)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Visits Count</p>
                <p className="text-sm font-black text-slate-900 mt-1">{profile.totalVisits} visit(s)</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Credit Balance</p>
                <p className={`text-sm font-black mt-1 ${profile.creditBalance > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {money(profile.creditBalance)}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {savingProfile ? "Saving changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Fleet Management / Vehicles (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/85 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  My Vehicles Fleet
                </h3>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setVehicleSuccess("");
                  setShowAddVehicle(!showAddVehicle);
                }}
                className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all ${
                  showAddVehicle 
                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50' 
                    : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {showAddVehicle ? "Cancel" : "+ Register"}
              </button>
            </div>

            {vehicleSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-xs text-emerald-700 font-bold flex gap-2 items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 text-emerald-500">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>{vehicleSuccess}</span>
              </div>
            )}

            {/* Add Vehicle Panel */}
            {showAddVehicle && (
              <form onSubmit={handleVehicleSubmit} className="mb-6 p-4.5 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-4 shadow-sm animation-fade-in">
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5">Register New Vehicle</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plate Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BA-1-PA-2023"
                      value={vehicleForm.vehicleNumber}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">VIN (17 chars)</label>
                    <input
                      type="text"
                      maxLength="17"
                      placeholder="Optional VIN"
                      value={vehicleForm.vin}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Make</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Toyota"
                      value={vehicleForm.make}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Model</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hilux"
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Year</label>
                    <input
                      type="text"
                      required
                      maxLength="4"
                      placeholder="e.g. 2021"
                      value={vehicleForm.year}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Gray"
                      value={vehicleForm.color}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Additional Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Diesel Engine, AWD, manual transmission"
                    value={vehicleForm.notes}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingVehicle}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {addingVehicle ? "Registering..." : "Submit Registration"}
                </button>
              </form>
            )}

            {/* Registered Vehicles List */}
            {!profile.vehicles || profile.vehicles.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
                <span className="text-3xl block">🚗</span>
                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wide">No vehicles registered</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Add a vehicle to enable service appointments booking.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {profile.vehicles.map((v) => (
                  <div 
                    key={v.vehicleID} 
                    className="bg-slate-50/30 border border-slate-150 rounded-2xl p-4 relative shadow-sm hover:border-blue-400 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black text-slate-800">
                          {v.make} {v.model} <span className="text-[9px] font-bold text-slate-400">({v.year})</span>
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-150 uppercase tracking-wide mt-2">
                          Plate: {v.vehicleNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Vehicle ID</p>
                        <p className="text-[10px] font-black text-slate-650 bg-slate-200/60 px-2 py-0.5 rounded-full inline-block mt-0.5">#{v.vehicleID}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] border-t border-slate-100 pt-2.5 text-slate-500 font-semibold uppercase tracking-wide">
                      {v.color && <p><span className="text-slate-400 font-bold">Color:</span> {v.color}</p>}
                      {v.vin && <p><span className="text-slate-400 font-bold">VIN:</span> {v.vin}</p>}
                    </div>
                    {v.notes && (
                      <p className="text-[10px] text-slate-450 mt-2 italic leading-tight border-t border-dashed border-slate-100 pt-1.5 font-medium">
                        * {v.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
