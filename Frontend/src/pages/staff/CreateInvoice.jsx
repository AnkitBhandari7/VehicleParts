import { useState, useEffect } from 'react'
import { createInvoice, sendInvoiceEmail } from '../../services/invoiceAPI'
import { getAllParts } from '../../services/inventoryAPI'
import api from '../../services/api'

const EMPTY_ITEM = { partID: '', quantity: 1 }

export default function CreateInvoice() {
  const [form, setForm] = useState({
    customerID: '',
    staffID: '',
    type: 'Sale',
    isCreditSale: false,
    dueDate: '',
    notes: '',
  })
  const [items, setItems] = useState([{ ...EMPTY_ITEM }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  
  const [parts, setParts] = useState([])
  const [customers, setCustomers] = useState([])

  // Feature 11 states
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState('')
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    getAllParts().then(r => setParts(r.data)).catch(() => {})
    api.get('/api/customer').then(r => setCustomers(r.data)).catch(() => {})
  }, [])

  // Update main form fields
  function handleFormChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Update a specific item row
  function handleItemChange(index, field, value) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  // Add new item row
  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }])
  }

  // Remove item row
  function removeItem(index) {
    if (items.length === 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(null)
    setEmailError('')
    setEmailSuccess('')
    setSaving(true)
    try {
      const payload = {
        customerID: parseInt(form.customerID),
        type: form.type,
        isCreditSale: form.isCreditSale,
        dueDate: form.isCreditSale && form.dueDate ? form.dueDate : null,
        notes: form.notes,
        items: items.map((item) => ({
          partID: parseInt(item.partID),
          quantity: parseInt(item.quantity),
        })),
      }
      const res = await createInvoice(payload)
      setSuccess(res.data)
      setForm({ customerID: '', staffID: '', type: 'Sale', isCreditSale: false, dueDate: '', notes: '' })
      setItems([{ ...EMPTY_ITEM }])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSendEmail(invoiceID) {
    setEmailError('')
    setEmailSuccess('')
    setSendingEmail(true)
    try {
      const payload = {
        invoiceID: invoiceID,
        subject: `Your Invoice #${invoiceID} from AutoParts Pro`,
        description: `Thank you for choosing AutoParts Pro. Please find the details of your invoice #${invoiceID} attached.`
      }
      await sendInvoiceEmail(payload)
      setEmailSuccess(`Invoice #${invoiceID} sent to customer's email successfully!`)
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Failed to send invoice email.')
    } finally {
      setSendingEmail(false)
    }
  }

  // Live calculation of Subtotal for operator preview
  const previewSubtotal = items.reduce((acc, curr) => {
    const part = parts.find(p => p.partID === parseInt(curr.partID))
    if (!part) return acc
    return acc + (part.price * parseInt(curr.quantity || 0))
  }, 0)

  const discountRate = previewSubtotal >= 5000 ? 0.10 : 0
  const previewDiscount = previewSubtotal * discountRate
  const previewTotal = previewSubtotal - previewDiscount

  const money = n => `Rs. ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="max-w-7xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sell Parts & Billing</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 uppercase tracking-wider">Generate customer sales invoices with active loyalty program checking</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4.5 text-xs text-rose-700 font-bold flex gap-3 items-center shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-rose-550">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Success Receipt Modal Card */}
      {success && (
        <div className="bg-emerald-50/60 border border-emerald-250 rounded-2xl p-6.5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-black text-emerald-800 uppercase tracking-wide">
                Invoice #{success.invoiceID} Generated Successfully!
              </h3>
              <p className="text-[10px] text-emerald-600/80 font-bold mt-0.5 uppercase">Registered in secure billing logs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 bg-white border border-emerald-100 p-5 rounded-2xl shadow-inner text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Name</p>
              <p className="font-extrabold text-slate-800 mt-1.5">{success.customerName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Staff</p>
              <p className="font-extrabold text-slate-800 mt-1.5">{success.staffName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice Subtotal</p>
              <p className="font-extrabold text-slate-800 mt-1.5">{money(success.subTotal)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Rate Applied</p>
              <p className="font-extrabold text-rose-600 mt-1.5">{money(success.discountAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billing Grand Total</p>
              <p className="font-black text-slate-900 mt-1.5 text-sm">{money(success.totalAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Tag</p>
              <p className="mt-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border
                  ${success.isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-rose-50 text-rose-700 border-rose-150'}
                `}>
                  {success.isPaid ? 'PAID IN FULL' : 'UNPAID CREDIT'}
                </span>
              </p>
            </div>
          </div>

          {success.loyaltyDiscountApplied && (
            <div className="mt-4 px-4 py-3 bg-indigo-50 border border-indigo-150 rounded-xl text-indigo-700 text-xs font-bold flex items-center gap-2.5 shadow-sm">
              <span>🎉</span>
              <span><strong>10% Loyalty Discount Applied!</strong> Customer saved <strong>{money(success.discountAmount)}</strong> due to high volume.</span>
            </div>
          )}

          {/* Feature 11: Send Email Button */}
          <div className="mt-5.5 pt-5.5 border-t border-emerald-100">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">Customer Invoice Dispatcher</h4>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleSendEmail(success.invoiceID)}
                disabled={sendingEmail}
                className="px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-slate-900/10"
              >
                {sendingEmail ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                    Dispatching...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Invoice to Customer
                  </>
                )}
              </button>
              
              {emailSuccess && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 px-3.5 py-2 rounded-xl">
                  {emailSuccess}
                </span>
              )}
              {emailError && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-150 px-3.5 py-2 rounded-xl">
                  {emailError}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left - Form Input Cards (Spans 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer & Staff */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6.5 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5 border-b border-slate-100 pb-3">
              1. Customer Profile & Terms
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Customer
                </label>
                <select
                  required
                  name="customerID"
                  value={form.customerID}
                  onChange={handleFormChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white text-slate-800 font-bold transition-all shadow-sm"
                >
                  <option value="">Select customer...</option>
                  {customers.map(c => (
                    <option key={c.customerID} value={c.customerID}>
                      {c.firstName} {c.lastName} (#CUST-{String(c.customerID).padStart(4,'0')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Invoice Category
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white text-slate-800 font-bold transition-all shadow-sm"
                >
                  <option value="Sale">Sale (Parts Delivery)</option>
                  <option value="Service">Service (Repair Appointment)</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Staff Notes / Comments
                </label>
                <input
                  type="text"
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  placeholder="Optional memo e.g. Customer requested immediate packaging"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 text-slate-800 focus:bg-white transition-all shadow-sm font-semibold"
                />
              </div>
            </div>

            {/* Credit Sale */}
            <div className="mt-5 border-t border-slate-100 pt-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isCreditSale"
                  name="isCreditSale"
                  checked={form.isCreditSale}
                  onChange={handleFormChange}
                  className="w-4.5 h-4.5 accent-slate-900 border-slate-300 rounded focus:ring-slate-900 transition-all cursor-pointer"
                />
                <label htmlFor="isCreditSale" className="text-xs font-bold text-slate-700 select-none cursor-pointer uppercase tracking-wider">
                  Credit Account Sale (Billed to outstanding balance)
                </label>
              </div>

              {/* Due Date - only if credit sale */}
              {form.isCreditSale && (
                <div className="flex flex-col max-w-xs animation-fade-in">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">
                    Credit Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 text-slate-800 focus:bg-white transition-all shadow-sm font-bold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Parts Items */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6.5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                2. Inventory Allocation
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-bold text-blue-650 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 px-3.5 py-1.5 border border-blue-150 rounded-xl transition-all shadow-sm"
              >
                + Add Part
              </button>
            </div>

            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                <span className="col-span-7">Part Name / Product SKU</span>
                <span className="col-span-3">Qty to Purchase</span>
                <span className="col-span-2 text-center">Delete</span>
              </div>

              {/* Item Rows */}
              {items.map((item, index) => {
                const selectedPart = parts.find(p => p.partID === parseInt(item.partID))
                const unitPrice = selectedPart ? selectedPart.price : 0
                const currentStock = selectedPart ? selectedPart.stock : 0
                return (
                  <div key={index} className="grid grid-cols-12 gap-3.5 items-center hover:bg-slate-50/20 p-1.5 rounded-xl transition-colors">
                    <div className="col-span-7 flex flex-col">
                      <select
                        required
                        value={item.partID}
                        onChange={(e) => handleItemChange(index, 'partID', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-800 font-bold shadow-sm"
                      >
                        <option value="">Select part...</option>
                        {parts.map(p => (
                          <option key={p.partID} value={p.partID} disabled={p.stock === 0}>
                            {p.name} (Part No: {p.partNumber} · Stock: {p.stock})
                          </option>
                        ))}
                      </select>
                      {selectedPart && (
                        <div className="flex justify-between items-center px-1 mt-1 text-[9px] font-bold text-slate-400 uppercase">
                          <span>Unit price: {money(unitPrice)}</span>
                          <span className={currentStock < 5 ? 'text-rose-500' : 'text-emerald-600'}>
                            In Stock: {currentStock} units
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <input
                      required
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="col-span-3 border border-slate-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 text-slate-850 focus:bg-white transition-all shadow-sm font-bold text-center"
                    />
                    
                    <div className="col-span-2 text-center">
                      <button
                        type="button"
                        disabled={items.length === 1}
                        onClick={() => removeItem(index)}
                        className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all mx-auto disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right - Summary Sidebar (Spans 1/3) */}
        <div className="space-y-6">
          
          {/* Summary Preview Receipts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">
              Billing Ledger Preview
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between font-bold text-slate-450 uppercase">
                <span>Total Items Weight</span>
                <span className="text-slate-700">{items.reduce((acc, curr) => acc + parseInt(curr.quantity || 0), 0)} unit(s)</span>
              </div>
              <div className="flex justify-between font-bold text-slate-450 uppercase">
                <span>Subtotal Preview</span>
                <span className="text-slate-700">{money(previewSubtotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-450 uppercase">
                <span>Automatic Discount</span>
                <span className="text-rose-600 font-extrabold">{previewDiscount > 0 ? `-${money(previewDiscount)} (10%)` : money(0)}</span>
              </div>
              
              <div className="border-t border-slate-100 pt-3.5 flex justify-between items-baseline">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Final Estimate</span>
                <span className="text-xl font-black text-indigo-650 tracking-tight">{money(previewTotal)}</span>
              </div>
            </div>
          </div>

          {/* Loyalty Info Details Panel */}
          <div className="bg-indigo-50/50 border border-indigo-150 rounded-2xl p-5.5 shadow-sm">
            <h3 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🎁</span> Loyalty Program Discount Check
            </h3>
            <p className="text-indigo-700 text-[11px] leading-relaxed font-semibold">
              Customers automatically save a **10% discount** off their subtotal once the threshold passes **Rs. 5,000**. Calculated and deducted securely in backend logs.
            </p>
          </div>

          {/* Submit Triggers */}
          <div className="bg-slate-900 border border-slate-950 rounded-2xl p-6 text-white shadow-md shadow-slate-900/10">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-widest mb-2.5">Confirm & Dispatch</h3>
            <p className="text-slate-400 text-[11px] font-semibold leading-relaxed mb-4">
              Generate the transaction record, verify parts allocation, update database balances, and ready the invoice.
            </p>
            <button
              onClick={handleSubmit}
              disabled={saving || !form.customerID || items.some(item => !item.partID)}
              className="w-full py-3 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-900 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
            >
              {saving && <div className="w-3.5 h-3.5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />}
              {saving ? 'Registering Ledger…' : 'Generate Invoice Receipt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}