import { useMutation } from '@tanstack/react-query'
import { analyzeImage } from '../services/fraudService'

export function useFraud(){
  return useMutation({ mutationFn: (formData) => analyzeImage(formData) })
}
