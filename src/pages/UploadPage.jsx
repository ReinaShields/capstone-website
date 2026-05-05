import { useState, useEffect, useRef } from 'react'
import { db, storage, auth } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import { GeoPoint } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import exifr from 'exifr'

const PLACEHOLDER_PFP = "https://firebasestorage.googleapis.com/v0/b/capstone-app-21baa.firebasestorage.app/o/images%2Fno_image_found.webp?alt=media&token=4631c2d6-098e-4f9b-8ba5-406fc84868c7"

function ManualPinModal({ onConfirm, onClose }) {
  const [pinLocation, setPinLocation] = useState(null)
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-lg">
        <h2 className="font-bold text-lg mb-2">Drop a Pin</h2>
        <p className="text-sm text-gray-500 mb-3">Click the map to place a pin</p>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            defaultZoom={12}
            defaultCenter={{ lat: 42.3314, lng: -83.0458 }}
            style={{ width: '100%', height: '350px' }}
            onClick={e => setPinLocation({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng })}
          >
            {pinLocation && <Marker position={pinLocation} />}
          </Map>
        </APIProvider>
        {pinLocation && (
          <p className="text-sm text-gray-500 mt-2">
            GPS [{pinLocation.lat.toFixed(5)}, {pinLocation.lng.toFixed(5)}]
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <button onClick={onClose} className="border rounded p-2 flex-1">Cancel</button>
          <button
            onClick={() => pinLocation && onConfirm(pinLocation)}
            disabled={!pinLocation}
            className="bg-black text-white rounded p-2 flex-1 disabled:opacity-40"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

function UploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [cities, setCities] = useState([])
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [tags, setTags] = useState({ Mural: false, Graffiti: false, Sticker: false, Other: false })
  const [coordinates, setCoordinates] = useState(null)
  const [usingManualCoords, setUsingManualCoords] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState([])
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/uscities.csv')
      .then(r => r.text())
      .then(text => {
        const lines = text.split('\n').slice(1)
        const cityList = lines
          .map(line => {
            const parts = line.split(',')
            const city = parts[0]?.trim()
            const state = parts[2]?.trim()
            return city && state ? `${city}, ${state}` : null
          })
          .filter(Boolean)
        setCities([...new Set(cityList)].sort())
      })
  }, [])

  const handleImageSelect = async (file) => {
    if (!file) return
    const compressed = await compressImage(file)
    setImage(compressed)
    setImagePreview(URL.createObjectURL(compressed))
    setUsingManualCoords(false)
    try {
      const gps = await exifr.gps(file)
      if (gps) {
        setCoordinates({ lat: gps.latitude, lng: gps.longitude })
      } else {
        setCoordinates(null)
      }
    } catch {
      setCoordinates(null)
    }
  }

  async function compressImage(file) {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const MAX = 1280
        let { width, height } = img
        if (width > MAX || height > MAX) {
          const scale = Math.min(MAX / width, MAX / height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)
        canvas.toBlob(blob => resolve(new File([blob], file.name, { type: 'image/webp' })), 'image/webp', 0.8)
      }
      img.src = url
    })
  }

  const toggleTag = (tag) => setTags(prev => ({ ...prev, [tag]: !prev[tag] }))

  const handleManualPin = (coords) => {
    setCoordinates(coords)
    setUsingManualCoords(true)
    setShowPinModal(false)
  }

  const validate = () => {
    const errors = []
    if (!auth.currentUser) errors.push('You must be logged in to post')
    if (!image) errors.push('Image is required')
    if (!title.trim()) errors.push('Title is required')
    if (!location.trim() || !cities.includes(location)) errors.push('A valid location is required')
    if (!Object.values(tags).some(Boolean)) errors.push('At least one tag is required')
    if (!coordinates) errors.push('Coordinates are required')
    setFieldErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const imageRef = ref(storage, `images/${uuidv4()}.webp`)
      await uploadBytes(imageRef, image)
      const imageURL = await getDownloadURL(imageRef)
      const user = auth.currentUser
      const selectedTags = Object.keys(tags).filter(t => tags[t])

      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        pfpURL: user.photoURL || PLACEHOLDER_PFP,
        usernameLower: (user.displayName || '').toLowerCase(),
        title: title.trim(),
        imageURL,
        location: location.trim(),
        coordinates: new GeoPoint(coordinates.lat, coordinates.lng),
        timestamp: Date.now(),
        tags: selectedTags,
        likeCount: 0,
        commentCount: 0,
        ...(description.trim() && { description: description.trim() })
      })
      navigate('/')
    } catch (err) {
      setFieldErrors(['Upload failed: ' + err.message])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {showPinModal && (
        <ManualPinModal onConfirm={handleManualPin} onClose={() => setShowPinModal(false)} />
      )}
      <h1 className="text-2xl font-bold mb-4">Upload Image</h1>

      <div className="flex gap-6">
        {/* LEFT — image */}
        <div className="flex-1 flex flex-col gap-2">
          <div
            onClick={() => fileInputRef.current.click()}
            className={`w-full aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 ${fieldErrors.includes('Image is required') ? 'border-red-500' : 'border-gray-300'}`}
          >
            {imagePreview
              ? <img src={imagePreview} className="w-full h-full object-cover" />
              : <span className="text-gray-400 text-sm text-center p-4">Click to select a photo</span>
            }
          </div>
          <div className="flex gap-2">
            <button onClick={() => fileInputRef.current.click()} className="flex-1 border rounded p-2 text-sm">Select Image</button>
          </div>
          
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageSelect(e.target.files[0])} />
        </div>

        {/* RIGHT — fields */}
        <div className="flex-1 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Title"
            className={`border rounded p-2 ${fieldErrors.includes('Title is required') ? 'border-red-500' : ''}`}
            value={title}
            onChange={e => { setTitle(e.target.value); setFieldErrors(p => p.filter(e => e !== 'Title is required')) }}
          />

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Location"
              className={`border rounded p-2 flex-1 ${fieldErrors.includes('A valid location is required') ? 'border-red-500' : ''}`}
              value={location}
              onChange={e => { setLocation(e.target.value); setFieldErrors(p => p.filter(e => e !== 'A valid location is required')) }}
              list="city-list"
            />
            <button
              onClick={() => setShowPinModal(true)}
              className={`border rounded p-2 text-sm whitespace-nowrap ${usingManualCoords ? 'bg-FFC149 text-white' : ''} ${fieldErrors.includes('Coordinates are required') ? 'border-red-500' : ''}`}
            >
              📍 {usingManualCoords ? 'Pin Set' : 'Add GPS'}
            </button>
          </div>
          {coordinates
            ? usingManualCoords
              ? <p className="text-xs text-green-600">Manual pin set!</p>
              : <p className="text-xs text-green-600">GPS data found in image!</p>
            : <p className="text-xs text-red-600">No GPS data found, please manually add coordinates</p>
          }
          <datalist id="city-list">
            {cities
              .filter(city => location.length > 1 && city.toLowerCase().startsWith(location.toLowerCase()))
              .slice(0, 20)
              .map(city => <option key={city} value={city} />)}
          </datalist>

          <div>
            <p className={`text-sm font-semibold mb-2 ${fieldErrors.includes('At least one tag is required') ? 'text-red-500' : ''}`}>
              Tags (select at least one)
            </p>
            <div className="flex gap-4 flex-wrap">
              {Object.keys(tags).map(tag => (
                <label key={tag} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={tags[tag]} onChange={() => { toggleTag(tag); setFieldErrors(p => p.filter(e => e !== 'At least one tag is required')) }} />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Description (optional)"
            className="border rounded p-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          {/* Error summary */}
          {fieldErrors.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded p-3">
              <p className="text-red-600 text-sm font-semibold mb-1">Please fill out fields before uploading:</p>
              <ul className="list-disc list-inside">
                {fieldErrors.map(e => <li key={e} className="text-red-500 text-sm">{e}</li>)}
              </ul>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white rounded p-2 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}
export default UploadPage