import { useEffect, useState } from 'react'
import { db, storage, auth } from '../firebase'
import { deleteDoc, doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, increment } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useParams } from 'react-router-dom'

const PLACEHOLDER_PFP = "https://firebasestorage.googleapis.com/v0/b/capstone-app-21baa.firebasestorage.app/o/images%2Fno_image_found.webp?alt=media&token=4631c2d6-098e-4f9b-8ba5-406fc84868c7"

const ANIMAL_AVATARS = [
  { label: 'Cat', value: 'avatar_cat' },
  { label: 'Dog', value: 'avatar_dog' },
  { label: 'Fox', value: 'avatar_fox' },
  { label: 'Owl', value: 'avatar_owl' },
  { label: 'Panda', value: 'avatar_panda' },
  { label: 'Bear', value: 'avatar_bear' },
]

// since we cant use Android drawables, use placeholder emoji avatars for web
const AVATAR_EMOJI = { avatar_cat: '/avatars/avatar_cat.png', avatar_dog: '/avatars/avatar_dog.png', avatar_fox: '/avatars/avatar_fox.png', avatar_owl: '/avatars/avatar_owl.png', avatar_panda: '/avatars/avatar_panda.png', avatar_bear: '/avatars/avatar_bear.png' }

function ProfilePage() {
  const { userId } = useParams()
  const currentUser = auth.currentUser
  const targetUserId = userId || currentUser?.uid
  const isOwnProfile = !userId || userId === currentUser?.uid
  const [userDoc, setUserDoc] = useState(null)
  const [posts, setPosts] = useState([])
  const [editOpen, setEditOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [editError, setEditError] = useState('')
  const navigate = useNavigate()
  {/* Profile Handling */}
  const [manageOpen, setManageOpen] = useState(false)
  const [editPostOpen, setEditPostOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTags, setEditTags] = useState({ Mural: false, Graffiti: false, Sticker: false, Other: false })
  const [postComments, setPostComments] = useState([])
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState(null)

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return }
    fetchUserDoc()
    fetchPosts()
  }, [])

  const fetchUserDoc = async () => {
    const snap = await getDoc(doc(db, 'users', targetUserId))
    if (snap.exists()) {
      setUserDoc(snap.data())
    } else {
      const data = {
        username: currentUser.displayName || 'Street Art Explorer',
        bio: '',
        email: currentUser.email,
        pfpUrl: '',
        avatarResName: '',
      }
      await setDoc(doc(db, 'users', targetUserId), data)
      setUserDoc(data)
    }
  }

  const fetchPosts = async () => {
    const q = query(collection(db, 'posts'), where('userId', '==', targetUserId))
    const snap = await getDocs(q)
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  const handleSaveProfile = async () => {
    setEditError('')
    if (!username.trim()) { setEditError("Username can't be empty"); return }
    if (username.trim().length < 3) { setEditError("Username must be at least 3 characters"); return }
    if (username.trim().length > 25) { setEditError("Username must be 25 characters or less"); return }
    if (bio.length > 250) { setEditError("Bio must be 250 characters or less"); return }
    await updateProfile(currentUser, { displayName: username.trim() })
    await setDoc(doc(db, 'users', targetUserId), { username: username.trim(), bio, email: currentUser.email }, { merge: true })
    setUserDoc(prev => ({ ...prev, username: username.trim(), bio }))
    setEditOpen(false)
  }

  const handleAvatarSelect = async (avatarResName) => {
    await setDoc(doc(db, 'users', targetUserId), { avatarResName, pfpUrl: '' }, { merge: true })
    setUserDoc(prev => ({ ...prev, avatarResName, pfpUrl: '' }))
    setAvatarOpen(false)
  }

  const handlePhotoUpload = async (file) => {
    if (!file) return
    const photoRef = ref(storage, `profile_photos/${targetUserId}/${uuidv4()}.jpg`)
    await uploadBytes(photoRef, file)
    const url = await getDownloadURL(photoRef)
    await setDoc(doc(db, 'users', targetUserId), { pfpUrl: url, avatarResName: '' }, { merge: true })
    setUserDoc(prev => ({ ...prev, pfpUrl: url, avatarResName: '' }))
    setAvatarOpen(false)
  }

  const handleClearPfp = async () => {
    await setDoc(doc(db, 'users', targetUserId), { pfpUrl: '', avatarResName: '' }, { merge: true })
    setUserDoc(prev => ({ ...prev, pfpUrl: '', avatarResName: '' }))
    setAvatarOpen(false)
  }

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await signOut(auth)
      navigate('/login')
    }
  }

  const handleOpenEditPost = async (post) => {
    setEditingPost(post)
    setEditTitle(post.title || '')
    setEditDescription(post.description || '')
    setEditTags({ Mural: false, Graffiti: false, Sticker: false, Other: false, ...Object.fromEntries((post.tags || []).map(t => [t, true])) })
    const commentsSnap = await getDocs(collection(db, 'posts', post.id, 'comments'))
    {/* Get comment pfps */}
    const commentsWithAvatars = await Promise.all(
      commentsSnap.docs.map(async d => {
        const data = { id: d.id, ...d.data() }
        if (data.userId) {
          const userSnap = await getDoc(doc(db, 'users', data.userId))
          if (userSnap.exists()) {
            const { pfpUrl, avatarResName } = userSnap.data()
            data.pfpUrl = pfpUrl || ''
            data.avatarResName = avatarResName || ''
          }
        }
        return data
      })
    )
    setPostComments(commentsWithAvatars)
    setEditPostOpen(true)
  }

  const handleSavePost = async () => {
    const selectedTags = Object.keys(editTags).filter(t => editTags[t])
    await updateDoc(doc(db, 'posts', editingPost.id), {
      title: editTitle.trim(),
      description: editDescription.trim(),
      tags: selectedTags
    })
    setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, title: editTitle.trim(), description: editDescription.trim(), tags: selectedTags } : p))
    setEditPostOpen(false)
  }

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    await deleteDoc(doc(db, 'posts', editingPost.id))
    setPosts(prev => prev.filter(p => p.id !== editingPost.id))
    setEditPostOpen(false)
  }

  const handleDeleteComment = async (commentId) => {
    await deleteDoc(doc(db, 'posts', editingPost.id, 'comments', commentId))
    await updateDoc(doc(db, 'posts', editingPost.id), { commentCount: increment(-1) })
    setPostComments(prev => prev.filter(c => c.id !== commentId))
    setConfirmDeleteCommentId(null)
  }

  const getAvatar = () => {
    if (userDoc?.pfpUrl) return <img src={userDoc.pfpUrl} className="w-16 h-16 rounded-full object-cover cursor-pointer" onClick={() => isOwnProfile && setAvatarOpen(true)} />
    if (userDoc?.avatarResName) return <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl cursor-pointer" onClick={() => isOwnProfile && setAvatarOpen(true)}><img src={AVATAR_EMOJI[userDoc.avatarResName]} className="w-full h-full rounded-full object-cover" /></div>
    return <img src="/avatars/avatar_default.png" className="w-16 h-16 rounded-full object-cover cursor-pointer" onClick={() => isOwnProfile && setAvatarOpen(true)} />
  }

  if (!currentUser) return null

  return (
    <div className="max-w-4xl mx-auto p-4">

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm flex flex-col gap-3">
            <h2 className="font-bold text-lg">Edit Profile</h2>
            {editError && <p className="text-red-500 text-sm">{editError}</p>}

            {/* User and bio */}
            <div className="flex flex-col gap-0.5">
              <input className="border border-[#1B1B1B] rounded p-2" placeholder="Username" maxLength={25} value={username} onChange={e => setUsername(e.target.value)} />
              <span className="text-xs text-gray-400 text-right">{username.length}/25</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <textarea className="border border-[#1B1B1B] rounded p-2 resize-none break-words" placeholder="Bio (optional)" maxLength={250} value={bio} onChange={e => setBio(e.target.value)} rows={3} />
              <span className="text-xs text-gray-400 text-right">{bio.length}/250</span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditOpen(false)} className="bg-[#D9D9D9] rounded p-2 flex-1">Cancel</button>
              <button onClick={handleSaveProfile} className="bg-[#FFC149] text-[#1B1B1B] rounded p-2 flex-1">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editPostOpen && editingPost && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg">Edit Post</h2>
            <input className="border rounded p-2 text-sm" placeholder="Title" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            <div>
              <p className="text-sm font-semibold mb-2">Tags</p>
              <div className="flex gap-4 flex-wrap">
                {Object.keys(editTags).map(tag => (
                  <label key={tag} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={editTags[tag]} onChange={() => setEditTags(p => ({ ...p, [tag]: !p[tag] }))} />
                    {tag}
                  </label>
                ))}
              </div>
            </div>
            <textarea className="border rounded p-2 text-sm" placeholder="Description (optional)" value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} />

            <div>
              <p className="text-sm font-semibold mb-2">Comments</p>
              {postComments.length === 0
                ? <p className="text-xs text-gray-400">No comments yet.</p>
                : <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                    {postComments.map(c => (
                      <div key={c.id} className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2">
                        <div className="flex gap-2 items-start">
                          <img
                            src={c.pfpUrl ? c.pfpUrl : c.avatarResName ? `/avatars/${c.avatarResName}.png` : '/avatars/avatar_default.png'}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{c.username}</p>
                            <p className="text-sm text-gray-600">{c.text}</p>
                          </div>
                        </div>
                        {confirmDeleteCommentId === c.id ? (
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => handleDeleteComment(c.id)} className="text-red-500 text-xs font-medium">Confirm</button>
                            <button onClick={() => setConfirmDeleteCommentId(null)} className="text-gray-400 text-xs">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteCommentId(c.id)} className="text-red-400 text-xs flex-shrink-0 hover:text-red-600">Delete</button>
                        )}
                      </div>
                    ))}
                  </div>
              }
            </div>

            <div className="flex gap-2">
              <button onClick={handleSavePost} className="text-sm rounded p-2 flex-1 font-medium" style={{ background: '#FFC149', color: '#1B1B1B' }}>Save</button>
              <button onClick={() => setEditPostOpen(false)} className="border rounded p-2 text-sm flex-1">Cancel</button>
            </div>
            <button onClick={handleDeletePost} className="w-full text-sm rounded p-2 font-medium" style={{ background: '#EF534E', color: '#fff' }}>Delete Post</button>
          </div>
        </div>
      )}

      {/* Avatar Modal */}
      {avatarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm flex flex-col gap-3">
            <h2 className="font-bold text-lg">Profile Picture</h2>
            <p className="text-sm font-semibold">Choose Animal Avatar</p>
            <div className="grid grid-cols-3 gap-4 justify-items-center">
              {ANIMAL_AVATARS.map(a => (
                <button key={a.value} onClick={() => handleAvatarSelect(a.value)} className="flex flex-col items-center gap-1">
                  <img src={AVATAR_EMOJI[a.value]} className="w-12 h-12 rounded-full object-cover" />
                  <span className="text-xs">{a.label}</span>
                </button>
              ))}
            </div>
            <label className="border rounded p-2 text-sm text-center cursor-pointer">
              Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e.target.files[0])} />
            </label>
            <button onClick={handleClearPfp} className="border rounded p-2 text-sm text-red-500">Remove Profile Picture</button>
            <button onClick={() => setAvatarOpen(false)} className="border rounded p-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        {getAvatar()}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{userDoc?.username || currentUser.displayName || 'Street Art Explorer'}</h1>
          <p className="text-gray-500 text-sm break-words whitespace-pre-wrap">{userDoc?.bio || 'No bio yet.'}</p>
          <p className="text-gray-400 text-sm">{posts.length} posts</p>
        </div>
        {isOwnProfile && (
          <div className="flex gap-2">
          </div>
        )}
      </div>

      {/* Posts Grid */}
      {isOwnProfile && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">My Posts</h2>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => { setUsername(userDoc?.username || ''); setBio(userDoc?.bio || ''); setEditOpen(true) }} className="border rounded p-2 text-sm">Edit Profile</button>
            <button onClick={() => setManageOpen(p => !p)} className="text-sm border rounded px-3 py-1.5 ml-2">
              {manageOpen ? 'Done' : 'Manage Posts'}
            </button>
            </div>
        </div>
      )}

      {posts.length === 0
        ? <p className="text-gray-400 text-center mt-8">No posts yet</p>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow cursor-pointer overflow-hidden relative"
                onClick={() => manageOpen ? handleOpenEditPost(post) : navigate(`/post/${post.id}`)}
              >
                <img src={post.imageURL} className="w-full h-48 object-cover" />
                {manageOpen && (
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                )}
                <div className="p-3">
                  <h2 className="font-bold">{post.title}</h2>
                  <p className="text-gray-500 text-sm">{post.location}</p>
                  <p className="text-gray-400 text-xs">{new Date(post.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
export default ProfilePage