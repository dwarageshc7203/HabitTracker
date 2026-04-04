export type HabitStatus = 'complete' | 'partial' | 'missed'

export type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  dateOfBirth?: string
  endGoal?: string
  createdAt?: string
}

export type Habit = {
  id: string
  name: string
  description?: string
  tags?: string[]
  createdAt?: string
}

export type Entry = {
  id: string
  habitId: string
  date: string
  status: HabitStatus
}

export type AuthResponse = {
  token: string
  user?: User
}
