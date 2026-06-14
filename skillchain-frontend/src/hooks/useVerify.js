import { useMutation } from '@tanstack/react-query'
import { verifyCertificate } from '../services/certificateService'

export function useVerify(){
  return useMutation({ mutationFn: (id) => verifyCertificate(id) })
}
