import api from './api'

export const getAllStaff  = ()        => api.get('/api/admin/staff')
export const createStaff = (data)    => api.post('/api/admin/staff', data)
export const updateStaff = (id,data) => api.put(`/api/admin/staff/${id}`, data)
export const deleteStaff = (id)      => api.delete(`/api/admin/staff/${id}`)
