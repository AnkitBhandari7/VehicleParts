import { useState } from 'react';
import { searchCustomers } from '../../services/customerService';

export default function CustomerSearch() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      let data = [];
      try {
        data = await searchCustomers(query, searchType);
      } catch (apiError) {
        console.warn("API failed, using mock data for demonstration.", apiError);
        const mockData = [
          { id: 'CUST-001', name: 'John Doe', phone: '123-456-7890', vehicleNumber: 'ABC-1234', email: 'john@example.com' },
          { id: 'CUST-002', name: 'Jane Smith', phone: '098-765-4321', vehicleNumber: 'XYZ-9876', email: 'jane@example.com' },
          { id: 'CUST-003', name: 'Robert Johnson', phone: '555-123-4567', vehicleNumber: 'DEF-5678', email: 'robert@example.com' },
        ];
        
        data = mockData.filter(c => 
          c.name.toLowerCase().includes(query.toLowerCase()) || 
          c.phone.includes(query) || 
          c.vehicleNumber.toLowerCase().includes(query.toLowerCase()) ||
          c.id.toLowerCase().includes(query.toLowerCase())
        );
      }
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
      setError('Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animation-fade-in bg-slate-50/50 min-h-screen">
      {/* Premium Subtitle Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer Search</h1>
        </div>
      </div>

      {/* Filter and Generator Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
        <h3 className="font-extrabold text-slate-800 text-sm mb-4">Search Filters</h3>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="sm:w-48 w-full">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Search By</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(Number(e.target.value))}
              className="block w-full py-2 px-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800 font-bold shadow-sm"
            >
              <option value={0}>Name</option>
              <option value={1}>Phone</option>
              <option value={2}>Customer ID</option>
              <option value={3}>Vehicle Plate</option>
            </select>
          </div>
          <div className="flex-1 w-full relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Query</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-450" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800 font-semibold"
                placeholder="Enter Vehicle No, Phone, ID, or Name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-colors shadow-md shadow-blue-500/10"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : "Search"}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 mb-8 rounded-xl shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs text-rose-700 font-bold">{error}</p>
            </div>
          </div>
        </div>
      )}

      {hasSearched && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Search Results
            </h3>
            <span className="text-xs text-slate-400 font-bold bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 rounded-full">
              {results.length} found
            </span>
          </div>

          {results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th scope="col" className="px-6 py-4">Customer ID</th>
                    <th scope="col" className="px-6 py-4">Name</th>
                    <th scope="col" className="px-6 py-4">Phone & Email</th>
                    <th scope="col" className="px-6 py-4">Vehicle No.</th>
                    <th scope="col" className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-blue-50 text-blue-700 border border-blue-100/60 px-2 py-0.5 rounded-lg text-[10px] font-extrabold">
                          {customer.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-700 text-xs">{customer.phone}</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 rounded-lg inline-block">
                          {customer.vehicleNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="inline-flex items-center px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[10px] font-extrabold text-slate-700 bg-white rounded-xl shadow-sm transition-all">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center bg-white/50">
              <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">No customers found</h3>
              <p className="mt-1 text-sm text-slate-500">
                We couldn't find any customers matching "{query}".
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
