import api from './api'
import type { AuthResponse, User } from '../types/api'

export type LoginPayload = {
  email: string
  password: string
  remember?: boolean
}

export type SignupPayload = {
  name: string
  email: string
  password: string
}

type BackendLoginPayload = {
  email: string
  password: string
}

type BackendSignupPayload = {
  userName: string
  email: string
  password: string
}

const normalizeAuthResponse = (data: any): AuthResponse => {
  const token = data?.token ?? data?.accessToken ?? ''
  const user = data?.user as User | undefined
  return { token, user }
}

const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const backendPayload: BackendLoginPayload = {
    email: payload.email.trim(),
    password: payload.password,
  }
  const { data } = await api.post('/api/auth/login', backendPayload)
  return normalizeAuthResponse(data)
}

const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const backendPayload: BackendSignupPayload = {
    userName: payload.name.trim() || payload.email.trim(),
    email: payload.email.trim(),
    password: payload.password,
  }
  const { data } = await api.post('/api/auth/register', backendPayload)
  return normalizeAuthResponse(data)
}

export const authService = {
  login,
  signup,
}
