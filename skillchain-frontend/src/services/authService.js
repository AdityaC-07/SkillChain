import { authAPI } from './api'

export const register = (payload) => authAPI.post('/api/auth/register', payload)
export const login = (payload) => authAPI.post('/api/auth/login', payload)
export const me = () => authAPI.get('/api/auth/me')
