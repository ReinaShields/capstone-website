import { useEffect, useState, useRef } from 'react'
import { db, auth } from '../firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

function FavoritesPage() {
  const [posts, setPosts] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [cities, setCities] = useState(['All'])
  const [selectedCity, setSelectedCity] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedSort, setSelectedSort] = useState('Recent')
  const [cityInput, setCityInput] = useState('All')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [userCache, setUserCache] = useState({})
  const userCacheRef = useRef({})
  const currentUser = auth.currentUser
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return }
    const fetchFavorites = async () => {
      const favSnap = await getDocs(collection(db, 'users', currentUser.uid, 'favorites'))
      const postPromises = favSnap.docs.map(d => getDoc(doc(db, 'posts', d.id)))
      const postSnaps = await Promise.all(postPromises)
      const data = postSnaps.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() }))
      setAllPosts(data)

      const uniqueUserIds = [...new Set(data.map(p => p.userId).filter(Boolean))]
      const newCache = { ...userCacheRef.current }
      await Promise.all(uniqueUserIds.map(async uid => {
        if (newCache[uid]) return
        const snap = await getDoc(doc(db, 'users', uid))
        if (snap.exists()) newCache[uid] = snap.data()
      }))
      userCacheRef.current = newCache
      setUserCache({ ...newCache })
    }
    fetchFavorites()
  }, [])

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await fetch('/uscities.csv')
        const text = await res.text()
        const lines = text.split('\n')
        const unique = new Set()
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].trim().split(',')
          const city = parts[0]?.replace(/"/g, '').trim()
          const stateId = parts[2]?.replace(/"/g, '').trim()
          if (city && stateId) unique.add(`${city}, ${stateId}`)
        }
        setCities(['All', ...Array.from(unique).sort()])
      } catch (err) {
        console.error('Failed to load cities CSV', err)
      }
    }
    loadCities()
  }, [])

  useEffect(() => {
    let filtered = allPosts.filter(post => {
      const locationMatch = selectedCity === 'All' || (post.location && post.location.toLowerCase() === selectedCity.toLowerCase())
      const typeMatch = selectedType === 'All' || (post.tags && post.tags.includes(selectedType))
      return locationMatch && typeMatch
    })
    if (selectedSort === 'Recent') filtered = filtered.sort((a, b) => b.timestamp - a.timestamp)
    else if (selectedSort === 'Likes') filtered = filtered.sort((a, b) => b.likeCount - a.likeCount)
    else filtered = filtered.sort((a, b) => b.commentCount - a.commentCount)
    setPosts(filtered)
  }, [allPosts, selectedCity, selectedType, selectedSort])

  const filteredCityOptions = cities.filter(c => c.toLowerCase().includes(cityInput.toLowerCase()))

  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setCityInput(city)
    setShowCityDropdown(false)
  }

  const handleCityBlur = () => {
    setTimeout(() => {
      const match = cities.find(c => c.toLowerCase() === cityInput.toLowerCase())
      if (!match) { setSelectedCity('All'); setCityInput('All') }
      setShowCityDropdown(false)
    }, 150)
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Favorites</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <input
            type="text"
            value={cityInput}
            onChange={e => { setCityInput(e.target.value); setShowCityDropdown(true) }}
            onFocus={() => setShowCityDropdown(true)}
            onBlur={handleCityBlur}
            placeholder="City"
            className="border rounded px-3 py-2 text-sm w-48"
          />
          {showCityDropdown && filteredCityOptions.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded shadow max-h-48 overflow-y-auto w-48 text-sm">
              {filteredCityOptions.slice(0, 100).map(city => (
                <li key={city} onMouseDown={() => handleCitySelect(city)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="border rounded px-3 py-2 text-sm">
          {['All', 'Mural', 'Graffiti', 'Sticker', 'Other'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={selectedSort} onChange={e => setSelectedSort(e.target.value)} className="border rounded px-3 py-2 text-sm">
          {['Recent', 'Likes', 'Comments'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="columns-3 gap-3">
        {posts.map(post => (
          <div key={post.id} className="break-inside-avoid mb-3 bg-white rounded-lg shadow cursor-pointer overflow-hidden" onClick={() => navigate(`/post/${post.id}`)}>
            <img src={post.imageURL} alt={post.title} className="w-full object-cover block" />
            <div className="p-2">
              <h2 className="font-bold text-sm truncate">{post.title || 'Untitled'}</h2>
              <p className="text-gray-500 text-xs truncate">{post.location}</p>
              {userCache[post.userId]?.username && (
                <p className="text-gray-400 text-xs truncate">{userCache[post.userId].username}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-gray-400 mt-12">No favorites yet.</p>
      )}
    </div>
  )
}
export default FavoritesPage