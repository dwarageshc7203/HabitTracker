import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import HabitHeatmap from '../components/habits/HabitHeatmap'
import { useAuthStore } from '../store/authStore'
import type { AuthState } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'
import type { HabitState } from '../store/habitStore'
import type { HabitLog } from '../types/api'

const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dateKeyOffset = (offset: number) => {
  const date = new Date()
  date.setDate(date.getDate() - offset)
  return toDateKey(date)
}

const ProfilePage = () => {
  const user = useAuthStore((state: AuthState) => state.user)
  const updateProfile = useAuthStore((state: AuthState) => state.updateProfile)
  const updatePassword = useAuthStore(
    (state: AuthState) => state.updatePassword
  )
  const status = useAuthStore((state: AuthState) => state.status)
  const error = useAuthStore((state: AuthState) => state.error)
  const habits = useHabitStore((state: HabitState) => state.habits)
  const logs = useHabitStore((state: HabitState) => state.logs)
  const fetchHabits = useHabitStore((state: HabitState) => state.fetchHabits)
  const fetchLogs = useHabitStore((state: HabitState) => state.fetchLogs)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('')
  const [endGoal, setEndGoal] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const heatmapStartKey = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - 29)
    return toDateKey(start)
  }, [])

  useEffect(() => {
    if (user) {
      setUserName(user.name ?? '')
      setEmail(user.email ?? '')
      setDateOfBirth(user.dateOfBirth ?? '')
      setProfilePhotoUrl(user.avatarUrl ?? '')
      setEndGoal(user.endGoal ?? '')
    }
  }, [user])

  useEffect(() => {
    fetchHabits()
    fetchLogs()
  }, [fetchHabits, fetchLogs])

  const logsByDate = useMemo(() => {
    const map = new Map<string, HabitLog[]>()
    logs.forEach((log: HabitLog) => {
      if (!log.logDate) {
        return
      }
      const list = map.get(log.logDate) ?? []
      list.push(log)
      map.set(log.logDate, list)
    })
    return map
  }, [logs])

  const totalHabits = habits.length
  const completionRateForDate = (dateKey: string) => {
    if (!totalHabits) {
      return 0
    }
    const dayEntries = logsByDate.get(dateKey) ?? []
    const map = new Map<string, HabitLog>()
    dayEntries.forEach((entry) => {
      map.set(entry.habitId, entry)
    })
    const completed = Array.from(map.values()).filter(
      (entry) => entry.status === 'DONE'
    ).length
    return completed / totalHabits
  }

  const completedToday = useMemo(() => {
    const todayEntries = logsByDate.get(toDateKey(new Date())) ?? []
    const map = new Map<string, HabitLog>()
    todayEntries.forEach((entry) => {
      map.set(entry.habitId, entry)
    })
    return Array.from(map.values()).filter(
      (entry) => entry.status === 'DONE'
    ).length
  }, [logsByDate])

  const weeklyKeys = useMemo(
    () => Array.from({ length: 7 }, (_, index) => dateKeyOffset(index)),
    []
  )

  const weeklyAverage = totalHabits
    ? Math.round(
        (weeklyKeys.reduce(
          (sum, key) => sum + completionRateForDate(key),
          0
        ) /
          weeklyKeys.length) *
          100
      )
    : 0

  const currentStreak = useMemo(() => {
    if (!totalHabits) {
      return 0
    }
    let streak = 0
    for (let offset = 0; offset < 365; offset += 1) {
      if (completionRateForDate(dateKeyOffset(offset)) === 1) {
        streak += 1
      } else {
        break
      }
    }
    return streak
  }, [logsByDate, totalHabits])

  const bestStreak = useMemo(() => {
    if (!totalHabits || logsByDate.size === 0) {
      return 0
    }
    const dateKeys = Array.from(logsByDate.keys()).sort()
    const start = new Date(`${dateKeys[0]}T00:00:00`)
    const end = new Date()
    let maxStreak = 0
    let current = 0
    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      if (completionRateForDate(toDateKey(date)) === 1) {
        current += 1
        if (current > maxStreak) {
          maxStreak = current
        }
      } else {
        current = 0
      }
    }
    return maxStreak
  }, [logsByDate, totalHabits])

  const getInitials = (value: string) =>
    value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'HT'

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    try {
      await updateProfile({
        name: userName,
        email,
        dateOfBirth: dateOfBirth || undefined,
        avatarUrl: profilePhotoUrl || undefined,
        endGoal: endGoal || undefined,
      })
    } catch (submitError) {
      if (submitError instanceof Error) {
        setFormError(submitError.message)
      } else {
        setFormError('Unable to update your profile.')
      }
    }
  }

  const handlePasswordSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }
    try {
      await updatePassword({
        currentPassword,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (submitError) {
      if (submitError instanceof Error) {
        setFormError(submitError.message)
      } else {
        setFormError('Unable to update password.')
      }
    }
  }

  const heatmapLogs = useMemo(
    () =>
      logs.filter(
        (log) => log.logDate >= heatmapStartKey && log.logDate <= todayKey
      ),
    [logs, heatmapStartKey, todayKey]
  )

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10" aria-label="Profile">
      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
          {profilePhotoUrl ? (
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={profilePhotoUrl}
              alt="Profile"
            />
          ) : (
            getInitials(userName)
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Profile</p>
          <h2 className="text-2xl font-semibold text-slate-900">
            {userName || 'Your profile'}
          </h2>
          <p className="text-sm text-slate-500">Member since {user?.createdAt ?? '2025'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="text-xs uppercase text-slate-400">Streak</p>
          <p className="text-lg font-semibold text-slate-900">{currentStreak} days</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={handleProfileSave}
        >
          <h3 className="text-lg font-semibold text-slate-900">Personal info</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              Username
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                type="text"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-600">
              Email
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-600">
              Date of birth
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-600">
              Profile photo URL
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                type="url"
                value={profilePhotoUrl}
                onChange={(event) => setProfilePhotoUrl(event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-600 md:col-span-2">
              End goal
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                type="text"
                value={endGoal}
                onChange={(event) => setEndGoal(event.target.value)}
              />
            </label>
          </div>
          {formError && <p className="mt-3 text-sm text-rose-600">{formError}</p>}
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
          <button
            className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
            type="submit"
          >
            {status === 'loading' ? 'Updating...' : 'Update profile'}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <HabitHeatmap logs={heatmapLogs} totalHabits={totalHabits} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Stats summary</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-400">Total habits</p>
                <p className="text-lg font-semibold text-slate-900">{totalHabits}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-400">Completed today</p>
                <p className="text-lg font-semibold text-slate-900">{completedToday}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-400">Weekly average</p>
                <p className="text-lg font-semibold text-slate-900">{weeklyAverage}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-400">Best streak</p>
                <p className="text-lg font-semibold text-slate-900">{bestStreak} days</p>
              </div>
            </div>
          </div>

          <form
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={handlePasswordSave}
          >
            <h3 className="text-lg font-semibold text-slate-900">Security</h3>
            <div className="mt-4 grid gap-4">
              <label className="text-sm text-slate-600">
                Current password
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </label>
              <label className="text-sm text-slate-600">
                New password
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </label>
              <label className="text-sm text-slate-600">
                Confirm password
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>
            </div>
            {formError && <p className="mt-3 text-sm text-rose-600">{formError}</p>}
            <button
              className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="submit"
            >
              {status === 'loading' ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
