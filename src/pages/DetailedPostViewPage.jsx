import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { db, auth } from '../firebase'
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, increment, orderBy, query } from 'firebase/firestore'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import { HeartIcon, BookmarkIcon, ChatBubbleLeftIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'

function getRelativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  const weeks = Math.floor(days / 7)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return `${weeks}w ago`
}

function CommentItem({ comment }) {
  const [avatarSrc, setAvatarSrc] = useState('/avatars/avatar_default.png')

  useEffect(() => {
    if (!comment.userId) return
    getDoc(doc(db, 'users', comment.userId)).then(snap => {
      if (!snap.exists()) return
      const { pfpUrl, avatarResName } = snap.data()
      if (pfpUrl) setAvatarSrc(pfpUrl)
      else if (avatarResName) setAvatarSrc(`/avatars/${avatarResName}.png`)
    })
  }, [comment.userId])

  return (
    <div className="flex gap-2 border-b border-gray-100 pb-2">
      <img src={avatarSrc} className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <Link to={`/user/${comment.userId}`} className="text-sm font-semibold text-gray-900 hover:underline">
            {comment.username}
          </Link>
          <span className="text-xs text-gray-400">{getRelativeTime(comment.timestamp)}</span>
        </div>
        <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{comment.text}</p>
      </div>
    </div>
  )
}

function MapModal({ post, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px) brightness(0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl overflow-hidden w-full max-w-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{post.location}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            defaultZoom={15}
            defaultCenter={{ lat: post.coordinates.latitude, lng: post.coordinates.longitude }}
            style={{ width: '100%', height: '420px' }}
          >
            <Marker position={{ lat: post.coordinates.latitude, lng: post.coordinates.longitude }} />
          </Map>
        </APIProvider>
      </div>
    </div>
  )
}

function DetailedPostViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = auth.currentUser

  const [post, setPost] = useState(null)
  const [userDoc, setUserDoc] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      const docSnap = await getDoc(doc(db, 'posts', id))
      if (docSnap.exists()) {
        const postData = { id: docSnap.id, ...docSnap.data() }
        setPost(postData)
        setLikeCount(postData.likeCount || 0)
        if (postData.userId) {
          const userSnap = await getDoc(doc(db, 'users', postData.userId))
          if (userSnap.exists()) setUserDoc(userSnap.data())
        }
      }
    }

    const fetchComments = async () => {
      const q = query(collection(db, 'posts', id, 'comments'), orderBy('timestamp', 'asc'))
      const snap = await getDocs(q)
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }

    const loadLikeState = async () => {
      if (!currentUser) return
      const snap = await getDoc(doc(db, 'posts', id, 'likesUserIDs', currentUser.uid))
      setIsLiked(snap.exists())
    }

    const loadFavoriteState = async () => {
      if (!currentUser) return
      const snap = await getDoc(doc(db, 'users', currentUser.uid, 'favorites', id))
      setIsFavorited(snap.exists())
    }

    fetchPost()
    fetchComments()
    loadLikeState()
    loadFavoriteState()
  }, [id])

  const handleLike = async () => {
    if (!currentUser) { alert('Sign in to like posts'); return }
    if (likeLoading) return
    setLikeLoading(true)
    const likeRef = doc(db, 'posts', id, 'likesUserIDs', currentUser.uid)
    const postRef = doc(db, 'posts', id)
    if (isLiked) {
      await deleteDoc(likeRef)
      await updateDoc(postRef, { likeCount: increment(-1) })
      setIsLiked(false)
      setLikeCount(c => Math.max(0, c - 1))
    } else {
      await setDoc(likeRef, { likedAt: Date.now() })
      await updateDoc(postRef, { likeCount: increment(1) })
      setIsLiked(true)
      setLikeCount(c => c + 1)
    }
    setLikeLoading(false)
  }

  const handleFavorite = async () => {
    if (!currentUser) { alert('Sign in to favorite posts'); return }
    if (favLoading) return
    setFavLoading(true)
    const favRef = doc(db, 'users', currentUser.uid, 'favorites', id)
    if (isFavorited) {
      await deleteDoc(favRef)
      setIsFavorited(false)
    } else {
      await setDoc(favRef, { savedAt: Date.now(), postId: id })
      setIsFavorited(true)
    }
    setFavLoading(false)
  }

  const handleSubmitComment = async () => {
    if (!currentUser) { alert('Sign in to comment'); return }
    if (!commentText.trim()) return
    setSubmitting(true)
    const userSnap = await getDoc(doc(db, 'users', currentUser.uid))
    const username = userSnap.exists() ? userSnap.data().username : 'Unknown User'
    const commentData = {
      text: commentText.trim(),
      username,
      userId: currentUser.uid,
      timestamp: Date.now(),
      likeCount: 0
    }
    await addDoc(collection(db, 'posts', id, 'comments'), commentData)
    await updateDoc(doc(db, 'posts', id), { commentCount: increment(1) })
    setComments(prev => [...prev, { id: Date.now().toString(), ...commentData }])
    setCommentText('')
    setSubmitting(false)
  }

  const getAvatar = (u) => {
    if (!u) return '/avatars/avatar_default.png'
    if (u.pfpUrl) return u.pfpUrl
    if (u.avatarResName) return `/avatars/${u.avatarResName}.png`
    return '/avatars/avatar_default.png'
  }

  if (!post) return <div className="p-4">Loading...</div>

  const date = new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const hasCoords = post.coordinates?.latitude && post.coordinates?.longitude

  return (
    <div className="p-4 flex items-start justify-center min-h-screen">
      {showMap && hasCoords && <MapModal post={post} onClose={() => setShowMap(false)} />}

      <div className="bg-white rounded-xl w-full max-w-5xl" style={{ height: '90vh' }}>
        <div className="flex h-full">

          {/* LEFT — pfp/username + image */}
          <div className="flex flex-col w-1/2 border-r border-gray-100">

            {/* pfp + username */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <img
                src={getAvatar(userDoc)}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                onClick={() => navigate(`/user/${post.userId}`)}
              />
              <Link
                to={`/user/${post.userId}`}
                className="font-semibold text-sm text-gray-900 hover:underline leading-none"
              >
                {userDoc?.username || 'Unknown User'}
              </Link>
            </div>

            {/* image container — shrink to fit, no crop */}
            <div className="relative flex-1 flex items-center justify-center bg-gray-50 overflow-hidden">
              <img
                src={post.imageURL}
                className="w-full h-full object-contain"
              />
              {hasCoords && (
                <button
                  onClick={() => setShowMap(true)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-medium text-white px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                >
                  <MapPinIcon className="w-3.5 h-3.5" />
                  View on map
                </button>
              )}
            </div>
          </div>

          {/* RIGHT — details + comments */}
          <div className="flex flex-col w-1/2 min-h-0 h-full">

            {/* title + meta + tags + description */}
            <div className="flex flex-col gap-2 px-4 pt-4 pb-2 flex-shrink-0">
              <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
                <p className="text-xs text-gray-400">{post.location} · {date}</p>
              </div>

              {post.tags?.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {post.description && (
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{post.description}</p>
              )}
            </div>

            {/* likes + favs */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 flex-shrink-0">
              {/* LIKE BUTTON */}
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity"
              >
                {isLiked
                  ? <HeartSolid className="w-5 h-5" style={{ color: '#FFC149' }} />
                  : <HeartIcon className="w-5 h-5 text-gray-400" />
                }
                <span className="text-sm" style={{ color: isLiked ? '#FFC149' : '#9ca3af', fontWeight: isLiked ? '600' : '400' }}>
                  {likeCount}
                </span>
              </button>

              {/* FAVORITE BUTTON */}
              <button
                onClick={handleFavorite}
                disabled={favLoading}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity"
              >
                {isFavorited
                  ? <BookmarkSolid className="w-5 h-5" style={{ color: '#FFC149' }} />
                  : <BookmarkIcon className="w-5 h-5 text-gray-400" />
                }
                <span className="text-sm" style={{ color: isFavorited ? '#FFC149' : '#9ca3af', fontWeight: isFavorited ? '600' : '400' }}>
                  {isFavorited ? 'Saved' : 'Save'}
                </span>
              </button>

              <div className="flex items-center gap-1.5 ml-auto">
                <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">{comments.length}</span>
              </div>
            </div>

            {/* comment pocket — fills remaining space */}
            <div className="flex flex-col flex-1 min-h-0 border-t border-gray-100">
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                {comments.length === 0
                  ? <p className="text-sm text-gray-400">No comments yet</p>
                  : comments.map(c => <CommentItem key={c.id} comment={c} />)
                }
              </div>

              {/* comment input — pinned to bottom */}
              <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3 flex flex-col gap-2">
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment"
                  maxLength={250}
                  rows={2}
                  className="border border-gray-300 rounded-lg p-2 text-sm resize-none w-full text-gray-900"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{commentText.length}/250</span>
                  <button
                    onClick={handleSubmitComment}
                    disabled={submitting || !commentText.trim()}
                    className="text-sm rounded-full px-4 py-1.5 disabled:opacity-40 bg-[#FFC149] hover:bg-[#f0a524] text-[#1B1B1B] cursor-pointer transition-colors"
                  >
                    {submitting ? 'Uploading...' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailedPostViewPage