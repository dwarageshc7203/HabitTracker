import { create, type StateCreator } from 'zustand'
import { habitService } from '../services/habitService'
import type { Habit, HabitDifficulty, HabitLog, HabitLogStatus } from '../types/api'

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'Something went wrong. Please try again.'
}

type HabitStatusState = 'idle' | 'loading' | 'error'

export type HabitState = {
  habits: Habit[]
  logs: HabitLog[]
  status: HabitStatusState
  error: string | null
  fetchHabits: () => Promise<void>
  fetchLogs: (params?: { from?: string; to?: string }) => Promise<void>
  createHabit: (payload: {
    name: string
    category: string
    difficulty: HabitDifficulty
  }) => Promise<void>
  updateHabit: (id: string, payload: {
    name: string
    category: string
    difficulty: HabitDifficulty
  }) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  logHabit: (id: string, payload: { logDate: string; status: HabitLogStatus; timezone?: string }) => Promise<void>
}

const habitCreator: StateCreator<HabitState> = (set, get) => ({
  habits: [],
  logs: [],
  status: 'idle',
  error: null,
  fetchHabits: async () => {
    set({ status: 'loading', error: null })
    try {
      const habits = await habitService.getHabits()
      set({ habits, status: 'idle' })
    } catch (error) {
      set({ status: 'error', error: getErrorMessage(error) })
    }
  },
  fetchLogs: async (params?: { from?: string; to?: string }) => {
    set({ status: 'loading', error: null })
    try {
      const existingHabits = get().habits.length
        ? get().habits
        : await habitService.getHabits()
      const habitIds = existingHabits.map((habit: Habit) => habit.id)
      const logs = await habitService.getLogsForRange(habitIds, params)
      set({ habits: existingHabits, logs, status: 'idle' })
    } catch (error) {
      set({ status: 'error', error: getErrorMessage(error) })
    }
  },
  createHabit: async (payload: { name: string; category: string; difficulty: HabitDifficulty }) => {
    set({ status: 'loading', error: null })
    try {
      const habit = await habitService.createHabit(payload)
      set({ habits: [habit, ...get().habits], status: 'idle' })
    } catch (error) {
      set({ status: 'error', error: getErrorMessage(error) })
      throw error
    }
  },
  updateHabit: async (
    id: string,
    payload: { name: string; category: string; difficulty: HabitDifficulty }
  ) => {
    set({ status: 'loading', error: null })
    try {
      const updated = await habitService.updateHabit(id, payload)
      set({
        habits: get().habits.map((habit: Habit) =>
          habit.id === id ? updated : habit
        ),
        status: 'idle',
      })
    } catch (error) {
      set({ status: 'error', error: getErrorMessage(error) })
      throw error
    }
  },
  deleteHabit: async (id: string) => {
    set({ status: 'loading', error: null })
    try {
      await habitService.deleteHabit(id)
      set({
        habits: get().habits.filter((habit: Habit) => habit.id !== id),
        status: 'idle',
      })
    } catch (error) {
      set({ status: 'error', error: getErrorMessage(error) })
      throw error
    }
  },
  logHabit: async (id: string, payload: { logDate: string; status: HabitLogStatus; timezone?: string }) => {
    set({ status: 'loading', error: null })
    try {
      const log = await habitService.createHabitLog(id, payload)
      const existing = get().logs
      const updated = existing.some((item: HabitLog) => item.id === log.id)
        ? existing.map((item: HabitLog) => (item.id === log.id ? log : item))
        : [log, ...existing]
      set({ logs: updated, status: 'idle' })
    } catch (error) {
      set({ status: 'error', error: getErrorMessage(error) })
      throw error
    }
  },
})

export const useHabitStore = create<HabitState>(habitCreator)
