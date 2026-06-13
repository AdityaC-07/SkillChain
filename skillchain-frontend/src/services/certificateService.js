import { certificateAPI } from './api'

export const issueCertificate = (formData) => certificateAPI.post('/api/certificates/issue', formData, { headers: {'Content-Type': 'multipart/form-data'} })
export const verifyCertificate = (id) => certificateAPI.get(`/api/certificates/verify/${id}`)
export const myCertificates = () => certificateAPI.get('/api/certificates/my')
export const getCertificate = (id) => certificateAPI.get(`/api/certificates/${id}`)
export const revokeCertificate = (id) => certificateAPI.post(`/api/certificates/revoke/${id}`)
