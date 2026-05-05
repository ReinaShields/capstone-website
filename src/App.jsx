import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import MainPage from './pages/MainPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import GalleryPage from './pages/GalleryPage'
import MapPage from './pages/MapPage'
import UploadPage from './pages/UploadPage'
import DetailedPostViewPage from './pages/DetailedPostViewPage'
import AboutPage from './pages/AboutPage'
import FavoritesPage from './pages/FavoritesPage'
import SettingsPage from './pages/SettingsPage.jsx'
import Navbar from './components/Navbar'

function AppLayout() {
  const location = useLocation()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8F8F8' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user/:userId" element={<ProfilePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/post/:id" element={<DetailedPostViewPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      {location.pathname !== '/map' && (
        <footer className="text-center text-sm p-6 mt-8" style={{ background: '#ffffff', borderTop: '1px solid #D9D9D9', color: '#7A7A7A' }}>
          <p>Alley Archive — 2026</p>
        </footer>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App