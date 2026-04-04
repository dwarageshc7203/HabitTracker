import { create, type StateCreator } from 'zustand'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import type { LoginPayload, SignupPayload } from '../services/authService'
import type { User } from '../types/api'

const tokenKey = 'ht_token'

type AuthStatus = 'idle' | 'loading' | 'error'

export type AuthState = {
  token: string | null
  user: User | null
  status: AuthStatus
  error: string | null
  loadSession: () => Promise<void>
  login: (payload: LoginPayload) => Promise<void>
  signup: (payload: SignupPayload) => Promise<void>
  logout: () => void
  updateProfile: (payload: {
    name?: string
    email?: string
    avatarUrl?: string
    dateOfBirth?: string
    endGoal?: string
  }) => Promise<void>
  updatePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>
}

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'Something went wrong. Please try again.'
}

const authCreator: StateCreator<AuthState> = (set) => ({
  token: localStorage.getItem(tokenKey),
  user: null,
  status: 'idle',
  error: null,
  loadSession: async () => {
    const token = localStorage.getItem(tokenKey)
    if (!token) {
      set({ token: null, user: null, status: 'idle' })
      return
    }
    set({ token, status: 'loading', error: null })
    try {
      const user = await userService.getUser()
      set({ user, status: 'idle' })
    } catch (error) {
      localStorage.removeItem(tokenKey)
      set({ token: null, user: null, status: 'error', error: getErrorMessage(error) })
    }
  },
  login: async (payload: LoginPayload) => {
    set({ status: 'loading', error: null })
    try {
      const { token, user } = await authService.login(payload)
      if (!token) {
        throw new Error('Missing auth token')
      }
      localStorage.setItem(tokenKey, token)
      set({ token, user: user ?? null, status: 'idle' })
      if (!user) {
        const profile = await userService.getUser()
        set({ user: profile })
      }
    } catch (error) {
      set({ status: 'error', error: getErrorMessage(error) })
      throw error
    }
  },
  signup: async (payload: SignupPayload) => {
    set({ status: 'loading', error: null })
    try {
      const { token, user } = await authService.signup(payload)
      if (!token) {
        throw new Error('Missing auth token')
      }
      localStorage.setItem(tokenKey, token)
      set({ token, user: user ?? null, status: 'idle' })
      if (!user) {
        const profile = await userService.getUser()
        set({ user: profile })
      }
    } catch (error) {
      set({ status: 'error', error: getErrorMessage(error) })
      throw error
    }
  },
  logout: () => {
    localStorage.removeItem(tokenKey)
    set({ token: null, user: null, status: 'idle', error: null })
  },
  updateProfile: async (payload: {
    name?: string
    email?: string
    avatarUrl?: string
    dateOfBirth?: string
    endGoal?: string
  }) => {
    set({ status: 'loading', error: null })
    try {
      const updated = await userService.updateUser(payload)
      set({ user: updated, status: 'idle' })
    } catch (error) {
      set({ status: 'error', error: getErrorMessage(error) })
      throw error
    }
  },
  updatePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    set({ status: 'loading', error: null })
    try {
      await userService.updatePassword(payload)
      set({ status: 'idle' })
    } catch (error) {
      set({ status: 'error', error: getErrorMessage(error) })
      throw error
    }
  },
})

export const useAuthStore = create<AuthState>(authCreator)
