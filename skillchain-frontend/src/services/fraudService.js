import { fraudAPI } from './api'

export const analyzeImage = (formData) => fraudAPI.post('/api/fraud/scan', formData, { headers: {'Content-Type': 'multipart/form-data'} })
export const listAlerts = () => fraudAPI.get('/api/fraud/alerts')
export const stats = () => fraudAPI.get('/api/fraud/stats')
