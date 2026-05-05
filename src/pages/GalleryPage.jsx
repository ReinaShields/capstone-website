import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

function GalleryPage() {
  const [posts, setPosts] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [cities, setCities] = useState(['All'])
  const [selectedCity, setSelectedCity] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedSort, setSelectedSort] = useState('Recent')
  const [cityInput, setCityInput] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, 'posts'))
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAllPosts(data)
    }
    fetchPosts()
  }, [])

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await fetch('/uscities.csv')
        const text = await res.text()
        const lines = text.split('\n')
        const unique = new Set()
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          const parts = line.split(',')
          if (parts.length < 3) continue
          const city = parts[0].replace(/"/g, '').trim()
          const stateId = parts[2].replace(/"/g, '').trim()
          if (city && stateId) unique.add(`${city}, ${stateId}`)
        }
        const sorted = ['All', ...Array.from(unique).sort()]
        setCities(sorted)
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

    if (selectedSort === 'Recent') {
      filtered = filtered.sort((a, b) => b.timestamp - a.timestamp)
    } else if (selectedSort === 'Likes') {
      filtered = filtered.sort((a, b) => b.likeCount - a.likeCount)
    } else if (selectedSort === 'Comments') {
      filtered = filtered.sort((a, b) => b.commentCount - a.commentCount)
    }

    setPosts(filtered)
  }, [allPosts, selectedCity, selectedType, selectedSort])

  const filteredCityOptions = cities.filter(c =>
    c.toLowerCase().includes(cityInput.toLowerCase())
  )

  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setCityInput(city)
    setShowCityDropdown(false)
  }

  const handleCityBlur = () => {
    setTimeout(() => {
      const match = cities.find(c => c.toLowerCase() === cityInput.toLowerCase());
      if (!match || cityInput === '') {
        setSelectedCity('All');
        setCityInput(''); // Returns to placeholder
      }
      setShowCityDropdown(false);
    }, 150);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black">
          &#8592;
        </button>
        <h1 className="text-2xl font-bold">Gallery</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">

        {/* City - autocomplete like the app */}
        <div>
          <input
            type="text"
            value={cityInput}
            placeholder="All"
            className="placeholder-[#1B1B1B] border rounded px-3 py-2 text-sm w-48"
            onFocus={() => {
              setCityInput('');
              setShowCityDropdown(true);
            }}
            onChange={e => {
              setCityInput(e.target.value);
              setShowCityDropdown(true);
              if (!e.target.value) setSelectedCity('All');
            }}
            onBlur={handleCityBlur}
          />
          {showCityDropdown && filteredCityOptions.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded shadow max-h-48 overflow-y-auto w-48 text-sm">
              {filteredCityOptions.slice(0, 100).map(city => (
                <li
                  key={city}
                  onMouseDown={() => handleCitySelect(city)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Type */}
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {['All', 'Mural', 'Graffiti', 'Sticker', 'Other'].map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={selectedSort}
          onChange={e => setSelectedSort(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {['Recent', 'Likes', 'Comments'].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Masonry grid */}
      <div className="columns-3 gap-3">
        {posts.map(post => (
          <div
            key={post.id}
            className="break-inside-avoid mb-3 bg-white rounded-lg shadow cursor-pointer overflow-hidden"
            onClick={() => navigate(`/post/${post.id}`)}
          >
            <img src={post.imageURL} alt={post.title} className="w-full object-cover block" />
            <div className="p-2">
              <h2 className="font-bold text-sm truncate">{post.title || 'Untitled'}</h2>
              <p className="text-gray-500 text-xs truncate">{post.location}</p>
              {post.username && (
                <p className="text-gray-400 text-xs truncate">{post.username}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-gray-400 mt-12">No posts match these filters.</p>
      )}
    </div>
  )
}

export default GalleryPage