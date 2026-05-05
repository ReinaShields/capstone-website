import { useEffect, useState } from 'react'
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { useMap } from '@vis.gl/react-google-maps'
import { useLocation } from 'react-router-dom'

{/* Recenter after new query */}
function MapController({ posts }) {
  const map = useMap()

  useEffect(() => {
    if (!map || posts.length === 0) return
    if (posts.length === 1) {
      map.panTo({ lat: posts[0].coordinates.latitude, lng: posts[0].coordinates.longitude })
      map.setZoom(15)
      return
    }
    const bounds = new window.google.maps.LatLngBounds()
    posts.forEach(p => bounds.extend({ lat: p.coordinates.latitude, lng: p.coordinates.longitude }))
    map.fitBounds(bounds, 80)
  }, [map, posts])

  return null
}

function MapPage() {
  const [posts, setPosts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('search')
    if (q) setSearch(q)
  }, [location.search])

  useEffect(() => {
    const fetchPosts = async () => {
      const snap = await getDocs(collection(db, 'posts'))
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => p.coordinates?.latitude && p.coordinates?.longitude)
      setPosts(data)
      setFiltered(data)
    }
    fetchPosts()
  }, [])

  {/* Search function */}
  useEffect(() => {
    const raw = search.trim().toLowerCase()
    if (!raw) { setFiltered(posts); return }

    const terms = raw.split(',').map(t => t.trim()).filter(Boolean)

    const results = posts.filter(p => {
      const fields = [
        p.title?.toLowerCase(),
        p.location?.toLowerCase(),
        p.username?.toLowerCase(),
        ...(p.tags?.map(t => t.toLowerCase()) || [])
      ]
      return terms.every(term => fields.some(f => f?.includes(term)))
    })

    setFiltered(results)
  }, [search, posts])

  return (
    <div className="relative" style={{ height: 'calc(100vh - 57px)' }}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg px-4">
        <input
          type="text"
          placeholder="Search by title, city, username, or tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm"
          style={{ background: 'white', border: '1px solid #D9D9D9', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
        />
      </div>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          defaultZoom={13}
          defaultCenter={{ lat: 42.3314, lng: -83.0458 }}
          style={{ width: '100%', height: '100%' }}
          onClick={() => setSelected(null)}
        >
          <MapController posts={filtered} />
          {filtered.map(post => (
            <Marker
              key={post.id}
              position={{ lat: post.coordinates.latitude, lng: post.coordinates.longitude }}
              onClick={() => setSelected(post)}
            />
          ))}
          {selected && (
            <InfoWindow
              position={{ lat: selected.coordinates.latitude, lng: selected.coordinates.longitude }}
              onCloseClick={() => setSelected(null)}
              headerDisabled={true}
            >
              <div
                className="cursor-pointer"
                style={{ width: '200px' }}
                onClick={() => navigate(`/post/${selected.id}`)}
              >
                <img src={selected.imageURL} className="w-full h-28 object-cover rounded mb-2" />
                <p className="font-semibold text-sm text-gray-900">{selected.title}</p>
                <p className="text-xs text-gray-500">{selected.location}</p>
                {selected.username && <p className="text-xs text-gray-400">{selected.username}</p>}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  )
}
export default MapPage