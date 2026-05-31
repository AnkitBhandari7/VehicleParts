import { useState, useEffect } from 'react'
import api from '../../services/api'
import { getAllParts, createPart, deletePart, updatePart, stockIn } from '../../services/inventoryAPI'

export default function Inventory() {
  const [parts, setParts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingPartId, setDeletingPartId]       = useState(null)
  const [isEdit, setIsEdit]       = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [originalStock, setOriginalStock] = useState(0)
  const [vendors, setVendors] = useState([])
  const [filterCategory, setFilterCategory] = useState('All Categories')
  const [filterStock, setFilterStock]       = useState('Stock Level: All')
  const [searchQuery, setSearchQuery]       = useState('')
  const [form, setForm]           = useState({
    vendorID: '', name: '', description: '', category: 'Replacement Parts',
    partNumber: '', price: '', stock: '', lowStockThreshold: 10,
  })

  async function fetchVendors() {
    try {
      const res = await api.get('/api/vendor?activeOnly=true');
      setVendors(res.data);
      if (res.data.length > 0 && !form.vendorID) {
        setForm(f => ({ ...f, vendorID: res.data[0].vendorID }));
      }
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
    }
  }

  async function fetchParts() {
    setLoading(true)
    setError('')
    try { 
      const res = await getAllParts(); 
      setParts(res.data) 
    }
    catch { 
      setError('Failed to load inventory. Make sure the backend is running.') 
    }
    finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { 
    fetchParts() 
    fetchVendors()
  }, [])

  function handleOpenAdd() {
    setIsEdit(false)
    setEditingId(null)
    setForm({ 
      vendorID: vendors.length > 0 ? vendors[0].vendorID : '', 
      name: '', 
      description: '', 
      category: 'Replacement Parts', 
      partNumber: '', 
      price: '', 
      stock: '', 
      lowStockThreshold: 10 
    })
    setShowModal(true)
  }

  function handleOpenEdit(part) {
    setIsEdit(true)
    setEditingId(part.partID)
    setOriginalStock(part.stock) // Track original stock to detect changes
    setForm({
      vendorID: part.vendorID || (vendors.length > 0 ? vendors[0].vendorID : ''),
      name: part.name,
      description: part.description || '',
      category: part.category,
      partNumber: part.partNumber,
      price: part.price,
      stock: part.stock,
      lowStockThreshold: part.lowStockThreshold
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault(); 
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form, 
        partID: editingId, // Include ID in body for updates
        vendorID: parseInt(form.vendorID),
        price: parseFloat(form.price), 
        stock: parseInt(form.stock),
        quantity: parseInt(form.stock), // Add quantity for backend compatibility
        lowStockThreshold: parseInt(form.lowStockThreshold) 
      }

      if (isEdit) {
        await updatePart(editingId, payload)
        
        // Only call stockIn for positive increments to record the transaction.
        // The updatePart call above should handle the actual field update on the backend.
        const newStock = parseInt(form.stock)
        if (newStock > originalStock) {
          const diff = newStock - originalStock
          await stockIn(editingId, { quantity: diff, description: 'Manual stock increment via Edit' })
        }
      } else {
        await createPart(payload)
      }

      fetchParts()
      setShowModal(false)
      setForm({ 
        vendorID: vendors.length > 0 ? vendors[0].vendorID : '', 
        name: '', 
        description: '', 
        category: 'Replacement Parts', 
        partNumber: '', 
        price: '', 
        stock: '', 
        lowStockThreshold: 10 
      })
    } catch (err) { 
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} part.`) 
    }
    finally { 
      setSaving(false) 
    }
  }

  function handleDeleteClick(id) {
    setDeletingPartId(id)
    setShowDeleteConfirm(true)
  }

  async function confirmDelete() {
    try { 
      await deletePart(deletingPartId); 
      fetchParts() 
      setShowDeleteConfirm(false)
    }
    catch { 
      setError('Failed to delete part.') 
    }
  }

  // UI Money Formatter
  const money = (n) => `Rs. ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Computed Dashboard Metrics
  const totalSKUs = parts.length;
  const lowStockCount = parts.filter(p => p.isLowStock || p.stock < p.lowStockThreshold).length;
  const totalStockUnits = parts.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryValue = parts.reduce((sum, p) => sum + (p.price * p.stock), 0);

  // Derive unique categories for the dropdown
  const categories = ['All Categories', ...new Set(parts.map(p => p.category).filter(Boolean))];

  // Filtering Logic
  const filteredParts = parts.filter(p => {
    const matchesCategory = filterCategory === 'All Categories' || p.category === filterCategory;
    
    let matchesStock = true;
    if (filterStock === 'Low Stock') {
      matchesStock = p.isLowStock || p.stock < (p.lowStockThreshold || 10);
    } else if (filterStock === 'In Stock') {
      matchesStock = p.stock >= (p.lowStockThreshold || 10);
    } else if (filterStock === 'Out of Stock') {
      matchesStock = p.stock === 0;
    }

    // SKU and Name Search Logic
    const catPrefix = p.category ? p.category.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'GE';
    const skuCode = `AP-${catPrefix}-${1000 + p.partID}`.toLowerCase();
    const searchTerm = searchQuery.toLowerCase();
    
    const matchesSearch = searchTerm === '' || 
      p.name.toLowerCase().includes(searchTerm) || 
      skuCode.includes(searchTerm) || 
      p.partNumber?.toLowerCase().includes(searchTerm) ||
      p.partID.toString().includes(searchTerm);

    return matchesCategory && matchesStock && matchesSearch;
  });

  return (
    <div className="bg-slate-50/50 min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Parts Management</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2.5 font-bold text-xs shadow-md transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add New Part
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* TOTAL SKUs */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total SKUs</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{loading ? '...' : totalSKUs}</p>
          </div>
        </div>

        {/* LOW STOCK ITEMS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Items</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{loading ? '...' : lowStockCount}</p>
          </div>
        </div>

        {/* TOTAL STOCK UNITS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Units</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{loading ? '...' : totalStockUnits}</p>
          </div>
        </div>

        {/* INVENTORY VALUE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory Value</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{loading ? '...' : money(totalInventoryValue)}</p>
          </div>
        </div>

      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm shadow-sm">
          {error}
        </div>
      )}

      {/* Directory Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-slate-100 gap-3">
          
          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Search by ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-full bg-white text-slate-600 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full sm:w-64 shadow-sm"
              />
              <svg className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 text-xs border border-slate-200 rounded-full bg-white text-slate-600 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-3 h-3 w-3 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Stock Level Dropdown */}
            <div className="relative">
              <select 
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 text-xs border border-slate-200 rounded-full bg-white text-slate-600 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="Stock Level: All">Stock Level: All</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <svg className="absolute right-3 top-3 h-3 w-3 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-bold">
            Showing {filteredParts.length} of {parts.length}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 font-bold">SKU</th>
                <th className="px-6 py-4 font-bold">
                  <div className="flex items-center gap-1">
                    Part Name 
                    <span className="text-blue-500 ml-0.5 font-bold">↑</span>
                  </div>
                </th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Unit Price</th>
                <th className="px-6 py-4 font-bold w-64">Stock Level</th>
                <th className="px-6 py-4 font-bold text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading inventory...
                    </div>
                  </td>
                </tr>
              ) : filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium italic">
                    No components match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredParts.map((p) => {
                  const isLow = p.isLowStock || p.stock < (p.lowStockThreshold || 10);
                  
                  // Auto-generated SKU matching screenshot code (e.g. AP-HD-9021)
                  const catPrefix = p.category ? p.category.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'GE';
                  const skuCode = `AP-${catPrefix}-${1000 + p.partID}`;

                  // Progress Bar percentage calculation
                  const percentage = isLow 
                    ? Math.min(100, Math.max(12, (p.stock / (p.lowStockThreshold || 10)) * 50))
                    : Math.min(100, Math.max(25, (p.stock / 100) * 100));

                  return (
                    <tr 
                      key={p.partID} 
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* SKU */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono font-bold tracking-tight">
                        {skuCode}
                      </td>

                      {/* Part Name */}
                      <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-800 text-sm">
                        {p.name}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase bg-slate-50 text-slate-700 border border-slate-200/50">
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                        {money(p.price)}
                      </td>

                      {/* Stock Level Progress */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* Progress Track */}
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden inline-block relative border border-slate-200/30">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                isLow ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          {/* Count badge */}
                          <span 
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isLow 
                                ? 'text-amber-700 bg-amber-50/70 border-amber-100' 
                                : 'text-emerald-700 bg-emerald-50/70 border-emerald-100'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </div>
                      </td>

                      {/* Action items column */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-3 text-slate-400">
                          
                          {/* Edit Part */}
                          <button 
                            onClick={() => handleOpenEdit(p)}
                            type="button" 
                            title="Edit Part Details"
                            className="hover:text-indigo-600 transition-colors p-1"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>

                          {/* Delete Item */}
                          <button 
                            onClick={() => handleDeleteClick(p.partID)}
                            type="button" 
                            title="Delete Part"
                            className="hover:text-red-600 transition-colors p-1"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics & Pagination */}
        <div className="px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/20">
          <p className="text-xs text-slate-400 font-semibold">
            Showing {filteredParts.length} of {parts.length} entries
          </p>

          <div className="flex items-center gap-1.5">
            {/* Pagination Controls */}
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 text-xs font-bold hover:bg-slate-50 cursor-not-allowed">
              Previous
            </button>
            <button className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 text-xs font-bold hover:bg-slate-50 cursor-not-allowed">
              Next
            </button>
          </div>
        </div>

      </div>

      {/* Add New Part Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 transform scale-100 transition-all"
            onClick={e => e.stopPropagation()}>
            
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-800">{isEdit ? 'Update Component Part' : 'Add New Component Part'}</h2>
              <p className="text-xs text-slate-400 mt-1">{isEdit ? 'Modify existing inventory records and stock levels.' : 'Register items in the warehouse inventory system.'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Part Name</label>
                  <input 
                    required 
                    value={form.name} 
                    onChange={e => setForm({...form, name:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Part Number</label>
                  <input 
                    required 
                    value={form.partNumber} 
                    onChange={e => setForm({...form, partNumber:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Category</label>
                  <input 
                    required 
                    value={form.category} 
                    onChange={e => setForm({...form, category:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Supplier / Vendor</label>
                  <select 
                    required 
                    value={form.vendorID} 
                    onChange={e => setForm({...form, vendorID:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select a supplier</option>
                    {vendors.map(v => (
                      <option key={v.vendorID} value={v.vendorID}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Price (Rs.)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    value={form.price} 
                    onChange={e => setForm({...form, price:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">{isEdit ? 'Current Stock' : 'Initial Stock'}</label>
                  <input 
                    required 
                    type="number" 
                    value={form.stock} 
                    onChange={e => setForm({...form, stock:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Low-Stock Alert Limit</label>
                  <input 
                    required 
                    type="number" 
                    value={form.lowStockThreshold} 
                    onChange={e => setForm({...form, lowStockThreshold:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white transition-all" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  {saving ? (isEdit ? 'Updating...' : 'Registering...') : (isEdit ? 'Save Changes' : 'Add Component Part')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 border border-rose-100">
                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Deletion</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Are you sure you want to remove this part from the inventory? This action cannot be undone.
              </p>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  No, Keep it
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
