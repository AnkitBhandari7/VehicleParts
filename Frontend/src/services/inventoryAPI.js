import api from './api'

export const getAllParts  = ()        => api.get('/api/admin/parts')
export const createPart  = (data)    => api.post('/api/admin/parts', data)
export const updatePart  = (id,data) => api.put(`/api/admin/parts/${id}`, data)
export const deletePart  = (id)      => api.delete(`/api/admin/parts/${id}`)
export const searchParts = (keyword) => api.get(`/api/admin/parts/search?keyword=${keyword}`)
export const stockIn     = (id,data) => api.post(`/api/admin/parts/${id}/stock-in`, data)
