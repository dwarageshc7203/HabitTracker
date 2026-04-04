import { create, type StateCreator } from 'zustand'
import { habitService } from '../services/habitService'
import type { Entry, Habit, HabitStatus } from '../types/api'

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
  entries: Entry[]
  status: HabitStatusState
  error: string | null
  fetchHabits: () => Promise<void>
  fetchEntries: (params?: { from?: string; to?: string }) => Promise<void>
  createHabit: (payload: { name: string; description?: string; tags?: string[] }) => Promise<void>
  updateHabit: (id: string, payload: { name: string; description?: string; tags?: string[] }) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  logHabitEntry: (id: string, payload: { date: string; status: HabitStatus }) => Promise<void>
}

const habitCreator: StateCreator<HabitState> = (set, get) => ({
  habits: [],
  entries: [],
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
  fetchEntries: async (params?: { from?: string; to?: string }) => {
    set({ status: 'loading', error: null })
    try {
      const entries = await habitService.getEntries(params)
      set({ entries, status: 'idle' })
    } catch (error) {
      set({ status: 'error', error: getErrorMessage(error) })
    }
  },
  createHabit: async (payload: { name: string; description?: string; tags?: string[] }) => {
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
    payload: { name: string; description?: string; tags?: string[] }
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
  logHabitEntry: async (
    id: string,
    payload: { date: string; status: HabitStatus }
  ) => {
    set({ status: 'loading', error: null })
    try {
      const entry = await habitService.logHabitEntry(id, payload)
      const existing = get().entries
      const updated = existing.some((item: Entry) => item.id === entry.id)
        ? existing.map((item: Entry) => (item.id === entry.id ? entry : item))
        : [entry, ...existing]
      set({ entries: updated, status: 'idle' })
    } catch (error) {
      set({ status: 'error', error: getErrorMessage(error) })
      throw error
    }
  },
})

export const useHabitStore = create<HabitState>(habitCreator)
