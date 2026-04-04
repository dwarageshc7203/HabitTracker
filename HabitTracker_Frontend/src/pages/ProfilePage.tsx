import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuthStore } from '../store/authStore'
import type { AuthState } from '../store/authStore'

const ProfilePage = () => {
  const user = useAuthStore((state: AuthState) => state.user)
  const updateProfile = useAuthStore((state: AuthState) => state.updateProfile)
  const updatePassword = useAuthStore(
    (state: AuthState) => state.updatePassword
  )
  const status = useAuthStore((state: AuthState) => state.status)
  const error = useAuthStore((state: AuthState) => state.error)
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
        <div className="card">
          <h3>Notifications</h3>
          <div className="setting-row">
            <span>Daily reminders</span>
            <div className="toggle">
              <span></span>
            </div>
          </div>
          <div className="setting-row">
            <span>Weekly summary</span>
            <div className="toggle">
              <span></span>
            </div>
          </div>
          <div className="setting-row">
            <span>Tips and features</span>
            <div className="toggle">
              <span></span>
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Statistics</h3>
          <div className="quick-stats">
            <div className="stat-tile">
              <p className="meta-label">Total habits</p>
              <p className="meta-value">18</p>
            </div>
            <div className="stat-tile">
              <p className="meta-label">Best streak</p>
              <p className="meta-value">27 days</p>
            </div>
            <div className="stat-tile">
              <p className="meta-label">Completion rate</p>
              <p className="meta-value">84%</p>
            </div>
          </div>
        </div>
        <div className="card danger-zone">
          <h3>Danger zone</h3>
          <p className="section-sub">Export or delete your account data.</p>
          <div className="hero-actions">
            <button className="btn btn-secondary" type="button">
              Export data
            </button>
            <button className="btn btn-primary" type="button">
              Delete account
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
