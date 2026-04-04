import { useEffect, useMemo, useState } from 'react'
import { useHabitStore } from '../store/habitStore'
import type { HabitState } from '../store/habitStore'
import type { Entry, Habit } from '../types/api'

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const formatDateKey = (date: Date) => date.toISOString().split('T')[0]

const CalendarPage = () => {
  const habits = useHabitStore((state: HabitState) => state.habits)
  const entries = useHabitStore((state: HabitState) => state.entries)
  const fetchHabits = useHabitStore((state: HabitState) => state.fetchHabits)
  const fetchEntries = useHabitStore(
    (state: HabitState) => state.fetchEntries
  )
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()))

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  useEffect(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    fetchEntries({ from: formatDateKey(start), to: formatDateKey(end) })
  }, [currentDate, fetchEntries])

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

  const entriesByDate = useMemo(() => {
    const map = new Map<string, Entry[]>()
    entries.forEach((entry: Entry) => {
      const key = entry.date.split('T')[0]
      const list = map.get(key) ?? []
      list.push(entry)
      map.set(key, list)
    })
    return map
  }, [entries])

  const statusForEntries = (items: Entry[]) => {
    if (items.length === 0) {
      return 'empty'
    }
    const statuses = items.map((entry: Entry) => entry.status)
    if (statuses.includes('missed')) {
      return 'missed'
    }
    if (statuses.includes('partial')) {
      return 'partial'
    }
    if (statuses.includes('complete')) {
      return 'complete'
    }
    return 'empty'
  }

  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate)

  const selectedEntries = entriesByDate.get(selectedDate) ?? []
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
              const key = formatDateKey(date)
              const entriesForDay = entriesByDate.get(key) ?? []
              const status = statusForEntries(entriesForDay)
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
                  <span>{entriesForDay.length} habits</span>
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
              <span className="status-dot status-partial"></span>
              <span>Partial</span>
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
