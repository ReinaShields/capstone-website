import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

function Navbar() {
  const [user, setUser] = useState(null)
  const [userDoc, setUserDoc] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid))
        if (snap.exists()) setUserDoc(snap.data())
      } else {
        setUserDoc(null)
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await signOut(auth)
      setDropdownOpen(false)
      navigate('/login')
    }
  }

  const getAvatar = () => {
    if (userDoc?.pfpUrl) return userDoc.pfpUrl
    if (userDoc?.avatarResName) return `/avatars/${userDoc.avatarResName}.png`
    return '/avatars/avatar_default.png'
  }

  return (
    <nav style={{ background: '#ffffff', borderBottom: '1px solid #D9D9D9' }} className="px-6 flex items-center h-14">
      <Link to="/" className="mr-4 self-stretch flex items-center">
        <img src="/images/logo_transparent.png" className="h-6 w-auto" />
      </Link>

      <Link to="/gallery" className="text-m font-semibold self-stretch flex items-center px-4 gap-6 hover:bg-gray-100 transition-colors" style={{ color: '#1B1B1B' }}>Gallery</Link>
      <Link to="/map" className="text-m font-semibold self-stretch flex items-center px-4 gap-6 hover:bg-gray-100 transition-colors" style={{ color: '#1B1B1B' }}>Map</Link>
      <Link to="/about" className="text-m font-semibold self-stretch flex items-center px-4 gap-6 hover:bg-gray-100 transition-colors" style={{ color: '#1B1B1B' }}>About</Link>

      <div className="ml-auto flex items-center gap-4">
        {!user ? (
          <>
            <Link
              to="/login"
              state={{ startAsSignup: false }}
              className="text-sm hover:underline" style={{ color: '#1B1B1B' }}>Log in</Link>
            <Link 
              to="/login" 
              state={{ startAsSignup: true }}
              className="text-sm rounded-full px-4 py-1.5 font-medium bg-[#FFC149] hover:bg-[#f0a524] text-[#1B1B1B] cursor-pointer transition-colors"
            >
              Sign up
            </Link>
          </>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={async () => {
                setDropdownOpen(p => !p)
                if (user) {
                  const snap = await getDoc(doc(db, 'users', user.uid))
                  if (snap.exists()) setUserDoc(snap.data())
                }
              }}
              className="flex items-center gap-2">
              
              <img src={getAvatar()} className="w-8 h-8 rounded-full object-cover" />
              <span className="text-sm font-medium" style={{ color: '#1B1B1B' }}>
                {userDoc?.username || user.displayName || 'Account'}
              </span>
              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden z-50"
                style={{ background: '#ffffff', border: '1px solid #D9D9D9', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: '#D9D9D9' }}>
                  <p className="text-sm font-semibold" style={{ color: '#1B1B1B' }}>{userDoc?.username || user.displayName}</p>
                  <p className="text-xs" style={{ color: '#7A7A7A' }}>{user.email}</p>
                </div>
                {[
                  { label: 'View Profile', to: `/user/${user.uid}` },
                  { label: 'Upload', to: '/upload' },
                  { label: 'Favorites', to: '/favorites' },
                  { label: 'Settings', to: '/settings' },
                ].map(item => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2.5 text-sm hover:bg-gray-50"
                    style={{ color: '#1B1B1B' }}
                  >
                    {item.label}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid #D9D9D9' }}>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50"
                    style={{ color: '#EF534E' }}
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
export default Navbar