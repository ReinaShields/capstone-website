import { useState, useEffect } from 'react'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

function SettingsPage() {
  const currentUser = auth.currentUser
  const navigate = useNavigate()

  const [isPrivate, setIsPrivate] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return }
    const fetchPrivacy = async () => {
      const snap = await getDoc(doc(db, 'users', currentUser.uid))
      if (snap.exists()) setIsPrivate(snap.data().isPrivate || false)
    }
    fetchPrivacy()
  }, [])

  const togglePrivate = async () => {
    const newVal = !isPrivate
    setIsPrivate(newVal)
    await updateDoc(doc(db, 'users', currentUser.uid), { isPrivate: newVal })
  }

  const validatePassword = (p) => {
    if (p.length < 8 || p.length > 15) return 'Password must be between 8 and 15 characters'
    if (!/[A-Z]/.test(p)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(p)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(p)) return 'Password must contain at least one number'
    if (!/[!@#$]/.test(p)) return 'Password must contain at least one special character (!, @, #, $)'
    return null
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')
    if (!currentPassword.trim()) { setPasswordError('Current password is required'); return }
    const pwError = validatePassword(newPassword)
    if (pwError) { setPasswordError(pwError); return }
    if (newPassword !== confirmNewPassword) { setPasswordError('Passwords do not match'); return }
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
      await reauthenticateWithCredential(currentUser, credential)
      await updatePassword(currentUser, newPassword)
      setPasswordSuccess('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (e) {
      setPasswordError(e.code === 'auth/wrong-password' ? 'Current password is incorrect.' : e.message)
    }
  }

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await signOut(auth)
      navigate('/login')
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account? This action is permanent and cannot be undone.')) return
    if (!window.confirm('Are you absolutely sure? All your account data may be lost.')) return
    try {
      await deleteUser(currentUser)
      navigate('/login')
    } catch (e) {
      if (e.code === 'auth/requires-recent-login') {
        alert('For security reasons, please log out and log back in before deleting your account.')
      } else {
        alert('Delete failed: ' + e.message)
      }
    }
  }

  if (!currentUser) return null

  return (
    <div className="max-w-2xl mx-auto p-4">
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm flex flex-col gap-3">
            <h2 className="font-bold text-lg">Change Password</h2>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-600 text-sm">{passwordSuccess}</p>}

            <div className="relative">
              <input type={showCurrent ? 'text' : 'password'} placeholder="Current password" className="border rounded p-2 w-full pr-10 text-sm" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{showCurrent ? 'Hide' : 'Show'}</button>
            </div>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} placeholder="New password" className="border rounded p-2 w-full pr-10 text-sm" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{showNew ? 'Hide' : 'Show'}</button>
            </div>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm new password" className="border rounded p-2 w-full pr-10 text-sm" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
              <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{showConfirm ? 'Hide' : 'Show'}</button>
            </div>
            <div className="text-xs text-gray-500 flex flex-col gap-0.5">
              <p className="font-semibold">Password must contain:</p>
              <p>Between 8–15 characters</p>
              <p>Uppercase, lowercase, numbers, and special characters (!, @, #, $)</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(''); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('') }} className="border rounded p-2 flex-1 text-sm">Cancel</button>
              <button onClick={handleChangePassword} className="rounded p-2 flex-1 text-sm font-medium" style={{ background: '#FFC149', color: '#1B1B1B' }}>Update Password</button>
            </div>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm flex flex-col gap-4">
            <h2 className="font-bold text-lg">FAQ</h2>

            <div>
              <p className="text-sm font-semibold text-gray-900">How do I upload a post?</p>
              <p className="text-sm text-gray-500 mt-0.5">Open the upload screen, select a photo, add details, and submit.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">How do I save a post?</p>
              <p className="text-sm text-gray-500 mt-0.5">Tap the save or favorite button on a post to keep it in your saved collection.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">How do I update profile details?</p>
              <p className="text-sm text-gray-500 mt-0.5">Go to Settings &gt; Personal details to edit your profile information.</p>
            </div>

            <p className="text-sm text-gray-500">
              Need more help?{' '}
              <a
                href="https://github.com/ReinaShields/Alley-Archive-Documentation"
                target="_blank"
                rel="noreferrer"
                className="underline"
                style={{ color: '#ebad36', fontWeight: 'bold'}}
              >
                View the User Manual on GitHub
              </a>.
            </p>

            <button onClick={() => setShowHelp(false)} className="border rounded p-2 text-sm">Close</button>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Account Management */}
      <Section title="Account management">
        <SettingsRow
          label="Personal details"
          sub="Update username, view email"
          onClick={() => navigate(`/user/${currentUser.uid}`)}
        />
        <SettingsToggle
          label="Private profile"
          sub={isPrivate ? 'On' : 'Off'}
          value={isPrivate}
          onToggle={togglePrivate}
        />
      </Section>

      {/* Support */}
      <Section title="Support">
        <SettingsRow
          label="Help"
          sub="FAQs and support information"
          onClick={() => setShowHelp(true)}
        />
      </Section>

      {/* Account Actions */}
      <Section title="Account actions">
        <SettingsRow
          label="Change password"
          sub="Update your account password"
          onClick={() => setShowPasswordModal(true)}
        />
        <SettingsRow
          label="Log out"
          sub="Sign out of your account"
          onClick={handleLogout}
        />
        <SettingsRow
          label="Delete account"
          sub="Permanently remove your account and data"
          onClick={handleDeleteAccount}
          danger
        />
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 px-1">{title}</p>
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {children}
      </div>
    </div>
  )
}

function SettingsRow({ label, sub, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
    >
      <div>
        <p className="text-sm font-medium" style={{ color: danger ? '#EF534E' : '#1B1B1B' }}>{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
      </svg>
    </button>
  )
}

function SettingsToggle({ label, sub, value, onToggle }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm font-medium" style={{ color: '#1B1B1B' }}>{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <button
        onClick={onToggle}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        style={{ background: value ? '#FFC149' : '#D9D9D9' }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          style={{ transform: value ? 'translateX(22px)' : 'translateX(4px)' }}
        />
      </button>
    </div>
  )
}

export default SettingsPage