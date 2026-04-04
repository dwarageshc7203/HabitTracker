import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import HabitCard from '../components/habits/HabitCard'
import HabitHeatmap from '../components/habits/HabitHeatmap'
import { habitService } from '../services/habitService'
import { useAuthStore } from '../store/authStore'
import type { AuthState } from '../store/authStore'
import type { Habit, HabitLog, HabitLogStatus } from '../types/api'

const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type NewHabitState = {
  name: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

type CreateHabitContext = {
  previous?: Habit[]
  tempId: string
}

const DashboardPage = () => {
  const user = useAuthStore((state: AuthState) => state.user)
  const queryClient = useQueryClient()
  const [logError, setLogError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newHabit, setNewHabit] = useState<NewHabitState>({
    name: '',
    category: 'Health',
    difficulty: 'EASY',
  })
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    category: '',
  })
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
  const [editHabit, setEditHabit] = useState<NewHabitState>({
    name: '',
    category: 'Health',
    difficulty: 'EASY',
  })
  const [editErrors, setEditErrors] = useState({
    name: '',
    category: '',
  })
  const [editError, setEditError] = useState<string | null>(null)
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  )

  const habitsQuery = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: habitService.getHabits,
  })

  const habitIdsKey = useMemo(
    () => (habitsQuery.data ?? []).map((habit: Habit) => habit.id).join(','),
    [habitsQuery.data]
  )

  const rangeStartKey = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - 29)
    return toDateKey(start)
  }, [])

  const logsQueryKey = useMemo(
    () => ['habitLogsRange', rangeStartKey, todayKey, habitIdsKey],
    [rangeStartKey, todayKey, habitIdsKey]
  )

  const logsQuery = useQuery<HabitLog[]>({
    queryKey: logsQueryKey,
    enabled: (habitsQuery.data?.length ?? 0) > 0,
    queryFn: async () => {
      const habits = habitsQuery.data ?? []
      const habitIds = habits.map((habit: Habit) => habit.id)
      return habitService.getLogsForRange(habitIds, {
        from: rangeStartKey,
        to: todayKey,
      })
    },
  })

  const logMutation = useMutation({
    mutationFn: ({ habitId, status }: { habitId: string; status: HabitLogStatus }) =>
      habitService.createHabitLog(habitId, {
        logDate: todayKey,
        status,
        timezone,
      }),
    onMutate: async ({ habitId, status }: { habitId: string; status: HabitLogStatus }) => {
      setLogError(null)
      await queryClient.cancelQueries({ queryKey: logsQueryKey })
      const previous = queryClient.getQueryData<HabitLog[]>(logsQueryKey)

      const optimisticLog: HabitLog = {
        id: `optimistic-${habitId}`,
        habitId,
        logDate: todayKey,
        status,
        timezone,
      }

      queryClient.setQueryData<HabitLog[]>(logsQueryKey, (current) => {
        const existing = current ?? []
        const updated = existing.filter(
          (item) => !(item.habitId === habitId && item.logDate === todayKey)
        )
        return [optimisticLog, ...updated]
      })

      return { previous }
    },
    onError: (
      error: unknown,
      _variables: { habitId: string; status: HabitLogStatus },
      context?: { previous?: HabitLog[] }
    ) => {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String(error.message)
          : 'Unable to log habit.'
      setLogError(message)
      if (context?.previous) {
        queryClient.setQueryData(logsQueryKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: logsQueryKey })
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string
      category: string
      difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    }) => habitService.createHabit(payload),
    onMutate: async (payload) => {
      setCreateError(null)
      await queryClient.cancelQueries({ queryKey: ['habits'] })
      const previous = queryClient.getQueryData<Habit[]>(['habits'])
      const tempId = `temp-${Date.now()}`
      const optimistic: Habit = {
        id: tempId,
        name: payload.name,
        category: payload.category,
        difficulty: payload.difficulty,
        createdAt: new Date().toISOString(),
        currentStreak: 0,
        longestStreak: 0,
        completionRate: 0,
      }
      queryClient.setQueryData<Habit[]>(['habits'], (current) => [
        optimistic,
        ...(current ?? []),
      ])
      return { previous, tempId }
    },
    onError: (
      error: unknown,
      _variables,
      context?: CreateHabitContext
    ) => {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String(error.message)
          : 'Unable to create habit.'
      setCreateError(message)
      if (context?.previous) {
        queryClient.setQueryData(['habits'], context.previous)
      }
    },
    onSuccess: (habit, _variables, context?: CreateHabitContext) => {
      queryClient.setQueryData<Habit[]>(['habits'], (current) => {
        const list = current ?? []
        const filtered = context?.tempId
          ? list.filter((item) => item.id !== context.tempId)
          : list
        return [habit, ...filtered]
      })
      setNewHabit({ name: '', category: 'Health', difficulty: 'EASY' })
      setFieldErrors({ name: '', category: '' })
      setShowCreate(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: {
      id: string
      name: string
      category: string
      difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    }) => habitService.updateHabit(payload.id, payload),
    onMutate: async (payload) => {
      setEditError(null)
      await queryClient.cancelQueries({ queryKey: ['habits'] })
      const previous = queryClient.getQueryData<Habit[]>(['habits'])
      queryClient.setQueryData<Habit[]>(['habits'], (current) =>
        (current ?? []).map((habit) =>
          habit.id === payload.id
            ? {
                ...habit,
                name: payload.name,
                category: payload.category,
                difficulty: payload.difficulty,
              }
            : habit
        )
      )
      return { previous }
    },
    onError: (error: unknown, _variables, context?: { previous?: Habit[] }) => {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String(error.message)
          : 'Unable to update habit.'
      setEditError(message)
      if (context?.previous) {
        queryClient.setQueryData(['habits'], context.previous)
      }
    },
    onSuccess: (habit) => {
      queryClient.setQueryData<Habit[]>(['habits'], (current) =>
        (current ?? []).map((item) => (item.id === habit.id ? habit : item))
      )
      setEditingHabitId(null)
      setEditErrors({ name: '', category: '' })
    },
  })

  const habits = habitsQuery.data ?? []
  const logs = logsQuery.data ?? []
  const logsByHabitToday = logs.reduce<Record<string, HabitLog>>((acc, log) => {
    if (log.logDate === todayKey) {
      acc[log.habitId] = log
    }
    return acc
  }, {})
  const completedCount = habits.filter(
    (habit: Habit) => logsByHabitToday[habit.id]?.status === 'DONE'
  ).length

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Today
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Keep your momentum, {user?.name ?? 'there'}.
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            You completed {completedCount}/{habits.length} habits today.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <p className="text-xs uppercase text-slate-400">Completed</p>
          <p className="text-lg font-semibold text-slate-900">
            {completedCount}/{habits.length}
          </p>
        </div>
      </div>

      {habitsQuery.isError && (
        <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Unable to load habits.
        </p>
      )}
      {logError && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {logError}
        </p>
      )}
      {createError && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {createError}
        </p>
      )}
      {editError && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {editError}
        </p>
      )}

      <div className="mt-6">
        <HabitHeatmap logs={logs} totalHabits={habits.length} />
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Habits</h3>
          <p className="text-sm text-slate-500">Add a habit in seconds.</p>
        </div>
        <button
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          type="button"
          onClick={() => {
            setShowCreate((prev) => !prev)
            setEditingHabitId(null)
          }}
        >
          + Add Habit
        </button>
      </div>

      {showCreate && (
        <form
          className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault()
            const trimmedName = newHabit.name.trim()
            const trimmedCategory = newHabit.category.trim()
            const errors = {
              name: trimmedName ? '' : 'Name is required',
              category: trimmedCategory ? '' : 'Category is required',
            }
            setFieldErrors(errors)
            if (errors.name || errors.category) {
              return
            }
            createMutation.mutate({
              name: trimmedName,
              category: trimmedCategory,
              difficulty: newHabit.difficulty,
            })
          }}
        >
          <label className="text-sm text-slate-600">
            Name
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              value={newHabit.name}
              onChange={(event) =>
                setNewHabit((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Meditate"
            />
            {fieldErrors.name && (
              <span className="mt-1 block text-xs text-rose-600">
                {fieldErrors.name}
              </span>
            )}
          </label>

          <label className="text-sm text-slate-600">
            Category
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              value={newHabit.category}
              onChange={(event) =>
                setNewHabit((prev) => ({ ...prev, category: event.target.value }))
              }
            >
              <option>Health</option>
              <option>Fitness</option>
              <option>Focus</option>
              <option>Mindfulness</option>
              <option>Learning</option>
              <option>Other</option>
            </select>
            {fieldErrors.category && (
              <span className="mt-1 block text-xs text-rose-600">
                {fieldErrors.category}
              </span>
            )}
          </label>

          <label className="text-sm text-slate-600">
            Difficulty
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              value={newHabit.difficulty}
              onChange={(event) =>
                setNewHabit((prev) => ({
                  ...prev,
                  difficulty: event.target.value as 'EASY' | 'MEDIUM' | 'HARD',
                }))
              }
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </label>

          <div className="md:col-span-3 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Fast add: name, category, difficulty.
            </p>
            <button
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Saving...' : 'Create habit'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {habitsQuery.isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}

        {!habitsQuery.isLoading && habits.length === 0 && !showCreate && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
            Start your first habit to build momentum.
          </div>
        )}

        {habits.map((habit: Habit) => {
          const log = logsByHabitToday[habit.id]
          const isComplete = log?.status === 'DONE'
          const isDisabled = Boolean(log)
          return (
            <div key={habit.id} className="space-y-3">
              <HabitCard
                name={habit.name}
                category={habit.category}
                currentStreak={habit.currentStreak}
                longestStreak={habit.longestStreak}
                completionRate={habit.completionRate}
                isComplete={isComplete}
                isDisabled={isDisabled || logMutation.isPending}
                onToggle={(checked) => {
                  if (!checked || isDisabled) {
                    return
                  }
                  logMutation.mutate({ habitId: habit.id, status: 'DONE' })
                }}
                onEdit={() => {
                  setEditingHabitId(habit.id)
                  setEditHabit({
                    name: habit.name,
                    category: habit.category,
                    difficulty: habit.difficulty,
                  })
                  setEditErrors({ name: '', category: '' })
                  setEditError(null)
                  setShowCreate(false)
                }}
              />

              {editingHabitId === habit.id && (
                <form
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const trimmedName = editHabit.name.trim()
                    const trimmedCategory = editHabit.category.trim()
                    const errors = {
                      name: trimmedName ? '' : 'Name is required',
                      category: trimmedCategory ? '' : 'Category is required',
                    }
                    setEditErrors(errors)
                    if (errors.name || errors.category) {
                      return
                    }
                    updateMutation.mutate({
                      id: habit.id,
                      name: trimmedName,
                      category: trimmedCategory,
                      difficulty: editHabit.difficulty,
                    })
                  }}
                >
                  <label className="text-sm text-slate-600">
                    Name
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                      value={editHabit.name}
                      onChange={(event) =>
                        setEditHabit((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                    />
                    {editErrors.name && (
                      <span className="mt-1 block text-xs text-rose-600">
                        {editErrors.name}
                      </span>
                    )}
                  </label>

                  <label className="text-sm text-slate-600">
                    Category
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                      value={editHabit.category}
                      onChange={(event) =>
                        setEditHabit((prev) => ({
                          ...prev,
                          category: event.target.value,
                        }))
                      }
                    />
                    {editErrors.category && (
                      <span className="mt-1 block text-xs text-rose-600">
                        {editErrors.category}
                      </span>
                    )}
                  </label>

                  <label className="text-sm text-slate-600">
                    Difficulty
                    <select
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                      value={editHabit.difficulty}
                      onChange={(event) =>
                        setEditHabit((prev) => ({
                          ...prev,
                          difficulty: event.target.value as 'EASY' | 'MEDIUM' | 'HARD',
                        }))
                      }
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </label>

                  <div className="flex items-center justify-between">
                    <button
                      className="text-xs font-semibold text-slate-500"
                      type="button"
                      onClick={() => setEditingHabitId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                      type="submit"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default DashboardPage
