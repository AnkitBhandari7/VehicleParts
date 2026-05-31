import api from './api'

// POST /api/auth/login — returns { token, fullName, role, ... }
export const login    = (data) => api.post('/api/auth/login', data)

// POST /api/auth/register
export const register = (data) => api.post('/api/auth/register', data)
