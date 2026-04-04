export type HabitLogStatus = 'DONE' | 'MISSED'

export type HabitDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

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
  category: string
  difficulty: HabitDifficulty
  createdAt?: string
  currentStreak: number
  longestStreak: number
  completionRate: number
}

export type HabitLog = {
  id: string
  habitId: string
  logDate: string
  status: HabitLogStatus
  timezone?: string
  createdAt?: string
}

export type AuthResponse = {
  token: string
  user?: User
}

export type HabitSuggestion = {
  habitName: string
  habitCategory: string
  habitDifficulty: HabitDifficulty
}
