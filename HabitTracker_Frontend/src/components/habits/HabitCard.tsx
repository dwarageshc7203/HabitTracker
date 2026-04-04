type HabitCardProps = {
  name: string
  category: string
  currentStreak: number
  longestStreak: number
  completionRate: number
  isComplete: boolean
  isDisabled?: boolean
  onToggle: (nextValue: boolean) => void
  onEdit?: () => void
}

const HabitCard = ({
  name,
  category,
  currentStreak,
  longestStreak,
  completionRate,
  isComplete,
  isDisabled = false,
  onToggle,
  onEdit,
}: HabitCardProps) => {
  const hasActiveStreak = currentStreak > 0
  const highlightClass = isComplete
    ? 'border-emerald-200 bg-emerald-50/50 shadow-md'
    : 'border-slate-200 bg-white'
  const streakClass = hasActiveStreak
    ? 'bg-amber-200 text-amber-800'
    : 'bg-slate-100 text-slate-500'

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${highlightClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{category}</p>
          <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
          <p className="mt-1 text-xs text-slate-400">
            Best streak: {longestStreak} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
              onClick={onEdit}
            >
              Edit
            </button>
          )}
          <div className={`rounded-full px-3 py-1 text-sm font-semibold ${streakClass}`}>
            <span className="text-base">🔥</span> {currentStreak}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Completion</span>
          <span>{Math.round(completionRate)}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
          />
        </div>
      </div>

      <label className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
        <span className="flex items-center gap-2">
          Mark as complete
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 transition-all duration-200 ${
              isComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            ✓ Done
          </span>
        </span>
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          checked={isComplete}
          disabled={isDisabled}
          onChange={(event) => onToggle(event.target.checked)}
        />
      </label>
    </div>
  )
}

export default HabitCard
