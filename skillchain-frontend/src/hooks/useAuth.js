import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'

export default function useAuthHook(){
  return useAuth()
}
