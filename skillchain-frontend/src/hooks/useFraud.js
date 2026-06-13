import { useMutation } from '@tanstack/react-query'
import { analyzeImage } from '../services/fraudService'

export function useFraud(){
  return useMutation((formData)=> analyzeImage(formData))
}
