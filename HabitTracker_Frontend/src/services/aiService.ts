import api from './api'
import type { HabitSuggestion } from '../types/api'

const suggestHabits = async (input: string): Promise<HabitSuggestion[]> => {
  const { data } = await api.post('/api/ai/suggest-habits', { input })
  return data as HabitSuggestion[]
}

export const aiService = {
  suggestHabits,
}
