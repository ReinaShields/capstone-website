import { useEffect, useState } from 'react'
import { auth, db } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';

function LoginPage() {
  const USE_EMAIL_VERIFICATION = false // dev toggle
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation();
  const [isSignup, setIsSignup] = useState(location.state?.startAsSignup || false);

  useEffect(() => {
    if (location.state !== null && location.state !== undefined) {
      setIsSignup(location.state.startAsSignup || false);
      
      setError('');
    }
  }, [location.state, location.key]);

  const validatePassword = (p) => {
    if (p.length < 8 || p.length > 15) return 'Password must be between 8 and 15 characters'
    if (!/[A-Z]/.test(p)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(p)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(p)) return 'Password must contain at least one number'
    if (!/[!@#$]/.test(p)) return 'Password must contain at least one special character (!, @, #, $)'
    return null
  }

  const handleSubmit = async () => {
    setError('')

    if (isSignup) {
      if (!username.trim()) { setError('Username is required'); return }
      if (username.trim().length < 3) { setError('Username must be at least 3 characters'); return }
      if (username.trim().length > 25) { setError('Username must be 25 characters or less'); return }
      if (!email.trim()) { setError('Email is required'); return }
      const pwError = validatePassword(password)
      if (pwError) { setError(pwError); return }
      if (password !== confirmPassword) { setError('Passwords do not match'); return }
    }

    setLoading(true)
    try {
      if (isSignup) {
        const result = await createUserWithEmailAndPassword(auth, email, password)
          await updateProfile(result.user, { displayName: username.trim() })
          await setDoc(doc(db, 'users', result.user.uid), {
            userId: result.user.uid,
            email: email.trim(),
            username: username.trim(),
            bio: '',
            pfpUrl: '',
            avatarResName: '',
          })
          if (USE_EMAIL_VERIFICATION) {
            await sendEmailVerification(result.user)
            await signOut(auth)
            setError('Verification email sent. Please check your inbox before logging in.')
            setLoading(false)
            return
          }
          navigate('/')
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password)
        if (USE_EMAIL_VERIFICATION && !result.user.emailVerified) {
          await signOut(auth)
          setError('Please verify your email before logging in.')
          setLoading(false)
          return
        }
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const switchMode = () => {
    setIsSignup(p => !p)
    setError('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setUsername('')
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-2">{isSignup ? 'Create Your Account' : 'Login'}</h1>
      {isSignup && <p className="text-sm text-gray-500 mb-4">Sign up to save your favorite photos.</p>}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="border rounded p-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        {isSignup && (
          <input
            type="text"
            placeholder="Username"
            className="border rounded p-2"
            maxLength={25}
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        )}

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="border rounded p-2 w-full pr-10"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {isSignup && (
          <>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                className="border rounded p-2 w-full pr-10"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="text-xs text-gray-500 flex flex-col gap-0.5">
              <p className="font-semibold">Password must contain:</p>
              <p>Between 8–15 characters</p>
              <p>Uppercase letters, lowercase letters, numbers, and special characters (!, @, #, $)</p>
            </div>
          </>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#FFC149] hover:bg-[#f0a524] text-[#1B1B1B] rounded p-2 font-medium disabled:opacity-50 cursor-pointer transition-colors"
        >
          {loading ? '...' : isSignup ? 'Sign Up' : 'Login'}
        </button>

        <p className="text-center text-sm cursor-pointer underline" style={{ color: '#1B1B1B' }} onClick={switchMode}>
          {isSignup ? 'Already have an account? Log in.' : "Don't have an account? Sign up"}
        </p>
      </div>
    </div>
  )
}
export default LoginPage