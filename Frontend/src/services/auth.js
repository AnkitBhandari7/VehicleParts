export const getToken      = () => localStorage.getItem('token')
export const getUserName   = () => localStorage.getItem('userName')
export const getRole       = () => localStorage.getItem('role')
export const getCustomerId = () => localStorage.getItem('customerId')
export const getCurrentCustomerId = () => localStorage.getItem('customerId')

export const isLoggedIn = () => !!getToken()

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userName')
  localStorage.removeItem('role')
  localStorage.removeItem('customerId')
  window.location.href = '/login'
}