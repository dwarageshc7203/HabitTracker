import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import ChatbotWidget from '../components/chatbot/ChatbotWidget'
import { useAuthStore } from '../store/authStore'
import type { AuthState } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'
import type { HabitState } from '../store/habitStore'
import type { Entry, Habit } from '../types/api'

const statusLabels: Record<string, string> = {
  complete: 'Complete',
  partial: 'Partial',
  missed: 'Missed',
}

const DashboardPage = () => {
  const user = useAuthStore((state: AuthState) => state.user)
  const habits = useHabitStore((state: HabitState) => state.habits)
  const entries = useHabitStore((state: HabitState) => state.entries)
  const status = useHabitStore((state: HabitState) => state.status)
  const error = useHabitStore((state: HabitState) => state.error)
  const fetchHabits = useHabitStore((state: HabitState) => state.fetchHabits)
  const fetchEntries = useHabitStore(
    (state: HabitState) => state.fetchEntries
  )
  const createHabit = useHabitStore((state: HabitState) => state.createHabit)
  const updateHabit = useHabitStore((state: HabitState) => state.updateHabit)
  const deleteHabit = useHabitStore((state: HabitState) => state.deleteHabit)
  const logHabitEntry = useHabitStore(
    (state: HabitState) => state.logHabitEntry
  )
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [showCreate, setShowCreate] = useState(false)
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    tags: '',
  })
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
  const [editHabit, setEditHabit] = useState({
    name: '',
    description: '',
    tags: '',
  })

  useEffect(() => {
    fetchHabits()
    fetchEntries({ from: todayKey, to: todayKey })
  }, [fetchHabits, fetchEntries, todayKey])

  const entriesToday = useMemo(
    () => entries.filter((entry: Entry) => entry.date.startsWith(todayKey)),
    [entries, todayKey]
  )
  const completedToday = entriesToday.filter(
    (entry: Entry) => entry.status === 'complete'
  ).length
  const totalHabits = habits.length
  const progressPercent = totalHabits
    ? Math.round((completedToday / totalHabits) * 100)
    : 0

  const entryByHabit = useMemo(() => {
    const map = new Map<string, string>()
    entriesToday.forEach((entry: Entry) => {
      map.set(entry.habitId, entry.status)
    })
    return map
  }, [entriesToday])

  const quickStats = [
    { label: 'Total habits', value: String(totalHabits) },
    { label: 'Completed today', value: String(completedToday) },
    { label: 'Current streak', value: '11 days' },
    { label: 'Weekly average', value: '78%' },
  ]

  const parseTags = (value: string) =>
    value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newHabit.name.trim()) {
      return
    }
    await createHabit({
      name: newHabit.name,
      description: newHabit.description,
      tags: parseTags(newHabit.tags),
    })
    setNewHabit({ name: '', description: '', tags: '' })
    setShowCreate(false)
  }

  const handleEditStart = (habit: Habit) => {
    setEditingHabitId(habit.id)
    setEditHabit({
      name: habit.name,
      description: habit.description ?? '',
      tags: habit.tags?.join(', ') ?? '',
    })
  }

  const handleEditSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingHabitId) {
      return
    }
    await updateHabit(editingHabitId, {
      name: editHabit.name,
      description: editHabit.description,
      tags: parseTags(editHabit.tags),
    })
    setEditingHabitId(null)
  }

  const handleMarkComplete = async (habitId: string) => {
    await logHabitEntry(habitId, { date: todayKey, status: 'complete' })
  }

  return (
    <section className="dashboard" aria-label="Dashboard">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Good morning, {user?.name ?? 'there'}.</h2>
          <p className="section-sub">
            You are {progressPercent}% complete today.
          </p>
        </div>
        <div className="progress-card">
          <p className="meta-label">Today progress</p>
          <div className="progress-bar">
            <span style={{ width: `${progressPercent}%` }}></span>
          </div>
          <p className="meta-value">
            {completedToday} of {totalHabits || 0} habits checked in
          </p>
        </div>
      </div>

      <div className="quick-stats">
        {quickStats.map((stat) => (
          <div key={stat.label} className="stat-tile">
            <p className="meta-label">{stat.label}</p>
            <p className="meta-value">{stat.value}</p>
          </div>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      <div>
        <div className="dashboard-header">
          <div>
            <h3>Habits</h3>
            <p className="section-sub">Tap a habit to log a win.</p>
          </div>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setShowCreate((prev) => !prev)}
          >
            {showCreate ? 'Close' : 'Add new habit'}
          </button>
        </div>

        {showCreate && (
          <form className="card" onSubmit={handleCreate}>
            <div className="form-field">
              Habit name
              <input
                className="input"
                value={newHabit.name}
                onChange={(event) =>
                  setNewHabit((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>
            <div className="form-field">
              Description
              <textarea
                className="input"
                rows={3}
                value={newHabit.description}
                onChange={(event) =>
                  setNewHabit((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <div className="form-field">
              Tags (comma separated)
              <input
                className="input"
                value={newHabit.tags}
                onChange={(event) =>
                  setNewHabit((prev) => ({ ...prev, tags: event.target.value }))
                }
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Saving...' : 'Create habit'}
            </button>
          </form>
        )}

        {habits.length === 0 && status !== 'loading' ? (
          <p className="empty-state">No habits yet. Add your first habit.</p>
        ) : (
          <div className="habit-grid">
            {habits.map((habit: Habit) => {
              const statusKey = entryByHabit.get(habit.id)
              const statusLabel = statusKey
                ? statusLabels[statusKey]
                : 'Not started'
              return (
                <article key={habit.id} className="habit-card">
                  {editingHabitId === habit.id ? (
                    <form onSubmit={handleEditSave}>
                      <label className="form-field">
                        Habit name
                        <input
                          className="input"
                          value={editHabit.name}
                          onChange={(event) =>
                            setEditHabit((prev) => ({
                              ...prev,
                              name: event.target.value,
                            }))
                          }
                          required
                        />
                      </label>
                      <label className="form-field">
                        Description
                        <textarea
                          className="input"
                          rows={2}
                          value={editHabit.description}
                          onChange={(event) =>
                            setEditHabit((prev) => ({
                              ...prev,
                              description: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="form-field">
                        Tags
                        <input
                          className="input"
                          value={editHabit.tags}
                          onChange={(event) =>
                            setEditHabit((prev) => ({
                              ...prev,
                              tags: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <div className="habit-actions">
                        <button className="btn btn-primary" type="submit">
                          Save
                        </button>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => setEditingHabitId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div>
                        <h4>{habit.name}</h4>
                        <p className="section-sub">{habit.description}</p>
                      </div>
                      <div className="habit-tags">
                        {habit.tags?.map((tag: string) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="habit-actions">
                        <button
                          className="habit-check"
                          type="button"
                          onClick={() => handleMarkComplete(habit.id)}
                        >
                          {statusLabel}
                        </button>
                        <div>
                          <button
                            className="btn btn-ghost"
                            type="button"
                            onClick={() => handleEditStart(habit)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-ghost"
                            type="button"
                            onClick={() => deleteHabit(habit.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>

      <ChatbotWidget />
    </section>
  )
}

export default DashboardPage
