import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const PLACEHOLDER_IMAGES = [
  { src: '/images/art1.jpg', link: 'https://unsplash.com/photos/red-yellow-and-purple-abstract-painting-Xeif8SdEgRU' },
  { src: '/images/art2.jpg', link: 'https://unsplash.com/photos/a-wall-covered-in-stickers-pqojLmjh4Tc' },
  { src: '/images/art3.jpg', link: 'https://unsplash.com/photos/empty-tunnel-pathway-with-graffiti-walls-jF946mh5QrA' },
  { src: '/images/art4.jpg', link: 'https://unsplash.com/photos/assorted-stickers-on-white-wall-xKnUnPEUiWA' },
  { src: '/images/art5.jpg', link: 'https://unsplash.com/photos/text-uymG7UVPXpI' },
]

function MainPage() {
  const [search, setSearch] = useState('')
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent(p => (p + 1) % PLACEHOLDER_IMAGES.length)
    }, 4000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/map?search=${encodeURIComponent(search.trim())}`)
    } else {
      navigate('/map')
    }
  }

  const goTo = (i) => {
    setCurrent(i)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrent(p => (p + 1) % PLACEHOLDER_IMAGES.length)
    }, 4000)
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: '520px' }}>

      {/* FIXED DEFAULT IMAGE (Shows while others load) */}
      <img 
        src="/images/art1.jpg" 
        className="absolute inset-0 w-full h-full object-cover"
        alt="Loading..."
      />

      {/* Carousel background */}
      {PLACEHOLDER_IMAGES.map((img, i) => (
        <img
          key={i}
          src={img.src}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <p className="text-white font-bold text-lg mb-8 max-w-lg">
          A real-time, digital archive for street art
        </p>
        <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2">
          <input
            type="text"
            placeholder="Search by city, tag, or artist..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white outline-none"
          />
          <button
            type="submit"
            className="rounded-lg px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#e6ae42]"
            style={{ background: '#FFC149', color: '#1B1B1B' }}
          >
            Explore
          </button>
        </form>
      </div>

      {/* Source Link - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-20">
        <a 
          href={PLACEHOLDER_IMAGES[current].link} 
          target="_blank" 
          rel="noreferrer"
          className="text-white/50 hover:text-white text-[10px] uppercase tracking-widest transition-colors"
        >
          Image Source
        </a>
      </div>

      {/* Carousel dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {PLACEHOLDER_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="w-2 h-2 rounded-full transition-colors"
            style={{ background: i === current ? '#FFC149' : 'rgba(255,255,255,0.5)' }}
          />
        ))}
      </div>

      </div>

        {/* About section */}
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-4 text-center">
          <h2 className="text-xl font-bold mb-3">What is Alley Archive?</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Street art is overwhelmingly temporary, especially when compared to most forms of art. Pieces get painted over, weather away, or are intentionally removed. Despite being a key part of urban history and identity, notably in cities like Detroit, it is a form of art that is often underappreciated. Although a minor solution, the hope is that this website can help document local art.
          </p>
      </div>

  </div> 
  )
}
export default MainPage