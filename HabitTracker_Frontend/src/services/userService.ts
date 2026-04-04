import api from './api'
import type { User } from '../types/api'

type UserUpdatePayload = {
  name?: string
  avatarUrl?: string
  email?: string
  dateOfBirth?: string
  endGoal?: string
}

type PasswordPayload = {
  currentPassword: string
  newPassword: string
}

type BackendUser = {
  userId: number
  userName: string
  email: string
  dateOfBirth?: string
  profilePhotoUrl?: string
  endGoal?: string
  streaks?: number
  createdAt?: string
}

const toUser = (data: BackendUser): User => ({
  id: String(data.userId),
  name: data.userName,
  email: data.email,
  avatarUrl: data.profilePhotoUrl,
  dateOfBirth: data.dateOfBirth,
  endGoal: data.endGoal,
  createdAt: data.createdAt,
})

const getUser = async (): Promise<User> => {
  const { data } = await api.get('/api/user')
  return toUser(data as BackendUser)
}

const updateUser = async (payload: UserUpdatePayload): Promise<User> => {
  const backendPayload = {
    userName: payload.name,
    email: payload.email,
    dateOfBirth: payload.dateOfBirth,
    profilePhotoUrl: payload.avatarUrl,
    endGoal: payload.endGoal,
  }
  const { data } = await api.put('/api/user', backendPayload)
  return toUser(data as BackendUser)
}

const updatePassword = async (payload: PasswordPayload): Promise<void> => {
  await api.put('/api/user/password', payload)
}

export const userService = {
  getUser,
  updateUser,
  updatePassword,
}
