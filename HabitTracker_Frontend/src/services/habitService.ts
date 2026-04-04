import api from './api'
import type {
  Habit,
  HabitDifficulty,
  HabitLog,
  HabitLogStatus,
} from '../types/api'

type HabitPayload = {
  name: string
  category: string
  difficulty: HabitDifficulty
}

type HabitLogPayload = {
  logDate: string
  status: HabitLogStatus
  timezone?: string
}

type BackendHabit = {
  habitId: number
  habitName: string
  habitCategory: string
  habitDifficulty: HabitDifficulty
  createdAt?: string
  currentStreak: number
  longestStreak: number
  completionRate: number
}

type BackendHabitPayload = {
  habitName: string
  habitCategory: string
  habitDifficulty: HabitDifficulty
}

type BackendHabitLog = {
  logId: number
  habitId: number
  logDate: string
  status: HabitLogStatus
  timezone?: string
  createdAt?: string
}

type BackendHabitLogPayload = {
  logDate: string
  status: HabitLogStatus
  timezone?: string
}

const toHabit = (data: BackendHabit): Habit => ({
  id: String(data.habitId),
  name: data.habitName,
  category: data.habitCategory,
  difficulty: data.habitDifficulty,
  createdAt: data.createdAt,
  currentStreak: data.currentStreak,
  longestStreak: data.longestStreak,
  completionRate: data.completionRate,
})

const toHabitLog = (data: BackendHabitLog): HabitLog => ({
  id: String(data.logId),
  habitId: String(data.habitId),
  logDate: data.logDate,
  status: data.status,
  timezone: data.timezone,
  createdAt: data.createdAt,
})

const getHabits = async (): Promise<Habit[]> => {
  const { data } = await api.get('/api/habits')
  return (data as BackendHabit[]).map(toHabit)
}

const createHabit = async (payload: HabitPayload): Promise<Habit> => {
  const backendPayload: BackendHabitPayload = {
    habitName: payload.name,
    habitCategory: payload.category,
    habitDifficulty: payload.difficulty,
  }
  const { data } = await api.post('/api/habits', backendPayload)
  return toHabit(data as BackendHabit)
}

const updateHabit = async (id: string, payload: HabitPayload): Promise<Habit> => {
  const backendPayload: BackendHabitPayload = {
    habitName: payload.name,
    habitCategory: payload.category,
    habitDifficulty: payload.difficulty,
  }
  const { data } = await api.patch(`/api/habits/${id}`, backendPayload)
  return toHabit(data as BackendHabit)
}

const deleteHabit = async (id: string): Promise<void> => {
  await api.delete(`/api/habits/${id}`)
}

const createHabitLog = async (
  habitId: string,
  payload: HabitLogPayload
): Promise<HabitLog> => {
  const backendPayload: BackendHabitLogPayload = {
    logDate: payload.logDate,
    status: payload.status,
    timezone: payload.timezone,
  }
  const { data } = await api.post(`/api/habits/${habitId}/logs`, backendPayload)
  return toHabitLog(data as BackendHabitLog)
}

const getHabitLogs = async (
  habitId: string,
  params?: { from?: string; to?: string }
): Promise<HabitLog[]> => {
  const { data } = await api.get(`/api/habits/${habitId}/logs`, { params })
  return (data as BackendHabitLog[]).map(toHabitLog)
}

const getLogsForRange = async (
  habitIds: string[],
  params?: { from?: string; to?: string }
): Promise<HabitLog[]> => {
  const results = await Promise.all(
    habitIds.map((id) => getHabitLogs(id, params))
  )
  return results.flat()
}

export const habitService = {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  createHabitLog,
  getHabitLogs,
  getLogsForRange,
}
