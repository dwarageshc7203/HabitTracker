import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
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

  return (
    <section className="profile-page" aria-label="Profile">
      <div className="profile-header">
        <div className="avatar-lg">
          {profilePhotoUrl ? (
            <img className="avatar-img" src={profilePhotoUrl} alt="Profile" />
          ) : (
            getInitials(userName)
          )}
        </div>
        <div>
          <p className="eyebrow">Profile</p>
          <h2>{userName || 'Your profile'}</h2>
          <p className="section-sub">Member since {user?.createdAt ?? '2025'}</p>
        </div>
      </div>

      <div className="profile-grid">
        <form className="card" onSubmit={handleProfileSave}>
          <h3>Profile information</h3>
          <label className="form-field">
            Username
            <input
              className="input"
              type="text"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
            />
          </label>
          <label className="form-field">
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="form-field">
            Date of birth
            <input
              className="input"
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
            />
          </label>
          <label className="form-field">
            Profile photo URL
            <input
              className="input"
              type="url"
              value={profilePhotoUrl}
              onChange={(event) => setProfilePhotoUrl(event.target.value)}
              placeholder="https://"
            />
          </label>
          <label className="form-field">
            End goal
            <textarea
              className="input"
              rows={3}
              value={endGoal}
              onChange={(event) => setEndGoal(event.target.value)}
            />
          </label>
          {(formError || error) && <p className="form-error">{formError ?? error}</p>}
          <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Saving...' : 'Save changes'}
          </button>
        </form>
        <form className="card" onSubmit={handlePasswordSave}>
          <h3>Account settings</h3>
          <label className="form-field">
            Current password
            <input
              className="input"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </label>
          <label className="form-field">
            New password
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </label>
          <label className="form-field">
            Confirm password
            <input
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
          {(formError || error) && <p className="form-error">{formError ?? error}</p>}
          <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>

      <div className="profile-stats">
        <div className="card">
          <h3>Statistics</h3>
          <div className="quick-stats">
            <div className="stat-tile">
              <p className="meta-label">Total habits</p>
              <p className="meta-value">{totalHabits}</p>
            </div>
            <div className="stat-tile">
              <p className="meta-label">Completed today</p>
              <p className="meta-value">{completedToday}</p>
            </div>
            <div className="stat-tile">
              <p className="meta-label">Current streak</p>
              <p className="meta-value">{currentStreak} days</p>
            </div>
            <div className="stat-tile">
              <p className="meta-label">Weekly average</p>
              <p className="meta-value">{weeklyAverage}%</p>
            </div>
            <div className="stat-tile">
              <p className="meta-label">Best streak</p>
              <p className="meta-value">{bestStreak} days</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
