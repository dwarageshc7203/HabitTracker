import type { HabitLog } from '../../types/api'

type HeatmapDay = {
  dateKey: string
  status: 'none' | 'done' | 'missed'
  intensity: number
  doneCount: number
  missedCount: number
}

type HabitHeatmapProps = {
  logs: HabitLog[]
  totalHabits: number
  days?: number
}

const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const buildDateRange = (days: number) => {
  const end = new Date()
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end)
    date.setDate(end.getDate() - (days - 1 - index))
    return date
  })
}

const intensityClass = (value: number) => {
  if (value >= 0.75) return 'bg-emerald-600'
  if (value >= 0.5) return 'bg-emerald-500'
  if (value > 0) return 'bg-emerald-300'
  return 'bg-slate-100'
}

const statusLabel = (status: HeatmapDay['status']) => {
  if (status === 'done') return 'Done'
  if (status === 'missed') return 'Missed'
  return 'No data'
}

const HabitHeatmap = ({ logs, totalHabits, days = 30 }: HabitHeatmapProps) => {
  const dateRange = buildDateRange(days)
  const countsByDate = logs.reduce(
    (acc: Record<string, { done: number; missed: number }>, log) => {
      const key = log.logDate
      const current = acc[key] ?? { done: 0, missed: 0 }
      if (log.status === 'DONE') {
        current.done += 1
      } else if (log.status === 'MISSED') {
        current.missed += 1
      }
      acc[key] = current
      return acc
    },
    {}
  )

  const daysWithStatus: HeatmapDay[] = dateRange.map((date) => {
    const dateKey = toDateKey(date)
    const counts = countsByDate[dateKey] ?? { done: 0, missed: 0 }
    const hasLogs = counts.done + counts.missed > 0
    const status = !hasLogs ? 'none' : counts.done > 0 ? 'done' : 'missed'
    const intensity = totalHabits > 0 ? counts.done / totalHabits : 0
    return {
      dateKey,
      status,
      intensity,
      doneCount: counts.done,
      missedCount: counts.missed,
    }
  })

  const leadingBlanks = dateRange[0]?.getDay() ?? 0
  const paddedCells: Array<HeatmapDay | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...daysWithStatus,
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Last 30 days</p>
          <h3 className="text-base font-semibold text-slate-900">Habit consistency</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex h-3 w-3 rounded-sm bg-slate-100"></span>
          <span>None</span>
          <span className="inline-flex h-3 w-3 rounded-sm bg-emerald-300"></span>
          <span>Done</span>
          <span className="inline-flex h-3 w-3 rounded-sm bg-rose-200"></span>
          <span>Missed</span>
        </div>
      </div>

      <div className="mt-4 grid grid-flow-col grid-rows-7 gap-1">
        {paddedCells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-3 w-3" />
          }

          const baseClass =
            day.status === 'missed'
              ? 'bg-rose-200'
              : intensityClass(day.intensity)
          const completionText =
            totalHabits > 0
              ? `${day.doneCount}/${totalHabits} complete`
              : 'No habits'
          const tooltip = `${day.dateKey} • ${statusLabel(day.status)} • ${completionText}`

          return (
            <div
              key={day.dateKey}
              title={tooltip}
              className={`h-3 w-3 rounded-sm ${baseClass} transition-transform hover:scale-110`}
            />
          )
        })}
      </div>
    </div>
  )
}

export default HabitHeatmap
