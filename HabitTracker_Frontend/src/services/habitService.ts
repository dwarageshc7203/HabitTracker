import api from './api'
import type { Entry, Habit, HabitStatus } from '../types/api'

type EntryPayload = {
  date: string
  status: HabitStatus
}

type HabitPayload = {
  name: string
  description?: string
  tags?: string[]
}

type BackendHabit = {
  habitId: number
  habitName: string
  habitDescription?: string
  habitTags?: string[]
  createdAt?: string
}

type BackendHabitPayload = {
  userId?: number
  habitName: string
  habitDescription?: string
  habitTags?: string[]
}

type BackendEntry = {
  entryId: number
  habitId: number
  entryStatus: HabitStatus
  completedAt?: string
}

type BackendEntryPayload = {
  userId?: number
  habitId: number
  entryStatus: HabitStatus
  completedAt: string
}

const toHabit = (data: BackendHabit): Habit => ({
  id: String(data.habitId),
  name: data.habitName,
  description: data.habitDescription,
  tags: data.habitTags,
  createdAt: data.createdAt,
})

const toEntry = (data: BackendEntry): Entry => ({
  id: String(data.entryId),
  habitId: String(data.habitId),
  status: data.entryStatus,
  date: data.completedAt ? data.completedAt.split('T')[0] : '',
})

const getHabits = async (): Promise<Habit[]> => {
  const { data } = await api.get('/api/habits')
  return (data as BackendHabit[]).map(toHabit)
}

const createHabit = async (payload: HabitPayload): Promise<Habit> => {
  const backendPayload: BackendHabitPayload = {
    userId: 0,
    habitName: payload.name,
    habitDescription: payload.description,
    habitTags: payload.tags,
  }
  const { data } = await api.post('/api/habits', backendPayload)
  return toHabit(data as BackendHabit)
}

const updateHabit = async (id: string, payload: HabitPayload): Promise<Habit> => {
  const backendPayload: BackendHabitPayload = {
    userId: 0,
    habitName: payload.name,
    habitDescription: payload.description,
    habitTags: payload.tags,
  }
  const { data } = await api.put(`/api/habits/${id}`, backendPayload)
  return toHabit(data as BackendHabit)
}

const deleteHabit = async (id: string): Promise<void> => {
  await api.delete(`/api/habits/${id}`)
}

const logHabitEntry = async (habitId: string, payload: EntryPayload): Promise<Entry> => {
  const completedAt = new Date(`${payload.date}T00:00:00Z`).toISOString()
  const backendPayload: BackendEntryPayload = {
    userId: 0,
    habitId: Number(habitId),
    entryStatus: payload.status,
    completedAt,
  }
  const { data } = await api.post(`/api/habits/${habitId}/entries`, backendPayload)
  return toEntry(data as BackendEntry)
}

const getEntries = async (params?: {
  from?: string
  to?: string
}): Promise<Entry[]> => {
  const { data } = await api.get('/api/entries', { params })
  return (data as BackendEntry[]).map(toEntry)
}

export const habitService = {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabitEntry,
  getEntries,
}
