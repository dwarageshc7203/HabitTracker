import { useEffect, useMemo, useState } from 'react'
import { useHabitStore } from '../store/habitStore'
import type { HabitState } from '../store/habitStore'
import type { Habit, HabitLog } from '../types/api'

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const CalendarPage = () => {
  const habits = useHabitStore((state: HabitState) => state.habits)
  const logs = useHabitStore((state: HabitState) => state.logs)
  const fetchHabits = useHabitStore((state: HabitState) => state.fetchHabits)
  const fetchLogs = useHabitStore((state: HabitState) => state.fetchLogs)
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()))

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  useEffect(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    fetchLogs({ from: toDateKey(start), to: toDateKey(end) })
  }, [currentDate, fetchLogs])

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const start = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const leadingEmpty = start.getDay()

    const days: Array<Date | null> = Array.from(
      { length: leadingEmpty },
      () => null
    )
    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(new Date(year, month, day))
    }
    return days
  }, [currentDate])

  const logsByDate = useMemo(() => {
    const map = new Map<string, HabitLog[]>()
    logs.forEach((log: HabitLog) => {
      const key = log.logDate
      if (!key) {
        return
      }
      const list = map.get(key) ?? []
      list.push(log)
      map.set(key, list)
    })
    return map
  }, [logs])

  const uniqueByHabit = (items: HabitLog[]) => {
    const map = new Map<string, HabitLog>()
    items.forEach((log) => {
      map.set(log.habitId, log)
    })
    return Array.from(map.values())
  }

  const statusForEntries = (items: HabitLog[]) => {
    if (items.length === 0) {
      return 'empty'
    }
    const statuses = items.map((entry: HabitLog) => entry.status)
    if (statuses.includes('MISSED')) {
      return 'missed'
    }
    if (statuses.includes('DONE')) {
      return 'complete'
    }
    return 'empty'
  }

  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate)

  const selectedEntries = logsByDate.get(selectedDate) ?? []
  const habitMap = useMemo(() => {
    return new Map<string, Habit>(
      habits.map((habit: Habit) => [habit.id, habit])
    )
  }, [habits])

  return (
    <section className="calendar-page" aria-label="Calendar">
      <div className="calendar-header">
        <div>
          <p className="eyebrow">Calendar</p>
          <h2>{monthLabel}</h2>
        </div>
        <div className="calendar-controls">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() =>
              setCurrentDate(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
              )
            }
          >
            Prev
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() =>
              setCurrentDate(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
              )
            }
          >
            Next
          </button>
        </div>
      </div>

      <div className="calendar-layout">
        <div>
          <div className="calendar-grid" role="grid">
            {dayLabels.map((label) => (
              <div key={label} className="calendar-day" role="columnheader">
                <strong>{label}</strong>
              </div>
            ))}
            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="calendar-day calendar-empty"
                  />
                )
              }
              const key = toDateKey(date)
              const entriesForDay = logsByDate.get(key) ?? []
              const uniqueEntries = uniqueByHabit(entriesForDay)
              const status = statusForEntries(uniqueEntries)
              return (
                <button
                  key={key}
                  className={`calendar-day status-${status}`}
                  role="gridcell"
                  type="button"
                  onClick={() => setSelectedDate(key)}
                >
                  <strong>{date.getDate()}</strong>
                  <div className="status-dot"></div>
                  <span>{uniqueEntries.length} habits</span>
                </button>
              )
            })}
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <span className="status-dot"></span>
              <span>Not started</span>
            </div>
            <div className="legend-item">
              <span className="status-dot status-complete"></span>
              <span>Complete</span>
            </div>
            <div className="legend-item">
              <span className="status-dot status-missed"></span>
              <span>Missed</span>
            </div>
          </div>
        </div>

        <div className="calendar-sidebar">
          <div className="card">
            <h3>Habit legend</h3>
            <p className="section-sub">Highlight a habit to see patterns.</p>
            <div className="habit-tags">
              {habits.map((habit: Habit) => (
                <span key={habit.id} className="tag">
                  {habit.name}
                </span>
              ))}
            </div>
          </div>
          <div className="card">
            <h3>Day detail</h3>
            <p className="section-sub">{selectedDate}</p>
            {selectedEntries.length === 0 ? (
              <p className="section-sub">No entries logged yet.</p>
            ) : (
              <ul className="clean-list">
                {selectedEntries.map((entry) => (
                  <li key={entry.id}>
                    {habitMap.get(entry.habitId)?.name ?? 'Habit'} -
                    {` ${entry.status}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CalendarPage
