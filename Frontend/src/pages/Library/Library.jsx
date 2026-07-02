import { useEffect, useState } from "react"
import { Edit3, Heart, History, ListVideo, Plus, Trash2, X } from "lucide-react"
import { Skeleton } from "../../components/Loader/Loader"
import { getLikedVideos } from "../../services/likeService"
import { getWatchHistory } from "../../services/userService"
import { createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../../services/playlistService"
import { getApiError } from "../../utils/errors"
import { formatCount } from "../../utils/formatters"

export function LibraryPage({ api, user, setNotice, onSelectVideo }) {
  const [history, setHistory] = useState([])
  const [liked, setLiked] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [activePlaylist, setActivePlaylist] = useState(null)
  const [editingPlaylistId, setEditingPlaylistId] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadLibrary() {
      setLoading(true)
      try {
        const [historyResponse, likedResponse, playlistsResponse] = await Promise.all([
          getWatchHistory(api),
          getLikedVideos(api),
          getUserPlaylists(api, user._id)
        ])
        setHistory(historyResponse.data || [])
        setLiked(likedResponse.data?.docs || [])
        setPlaylists(playlistsResponse.data || [])
      } catch (error) {
        setNotice(getApiError(error))
      } finally {
        setLoading(false)
      }
    }

    loadLibrary()
  }, [api, user?._id, setNotice])

  async function submitPlaylist(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const payload = {
      name: form.get("name"),
      description: form.get("description")
    }

    try {
      const response = editingPlaylistId
        ? await updatePlaylist(api, editingPlaylistId, payload)
        : await createPlaylist(api, payload)

      if (editingPlaylistId) {
        setPlaylists((current) => current.map((playlist) => playlist._id === editingPlaylistId ? response.data : playlist))
        setEditingPlaylistId("")
      } else {
        setPlaylists((current) => [response.data, ...current])
      }
      event.currentTarget.reset()
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function openPlaylist(playlistId) {
    try {
      const response = await getPlaylistById(api, playlistId)
      setActivePlaylist(response.data)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function removePlaylist(playlistId) {
    if (!window.confirm("Delete this playlist?")) return
    try {
      const response = await deletePlaylist(api, playlistId)
      setPlaylists((current) => current.filter((playlist) => playlist._id !== playlistId))
      if (activePlaylist?._id === playlistId) setActivePlaylist(null)
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function removeFromPlaylist(videoId) {
    try {
      const response = await removeVideoFromPlaylist(api, videoId, activePlaylist._id)
      setActivePlaylist(response.data)
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  return (
    <div className="grid gap-6 px-4 py-6 sm:px-6 xl:grid-cols-2">
      <LibrarySection icon={History} title="Watch history" videos={history} loading={loading} onSelectVideo={onSelectVideo} />
      <LibrarySection icon={Heart} title={`${user?.fullName?.split(" ")[0] || "Your"} liked videos`} videos={liked} loading={loading} onSelectVideo={onSelectVideo} />
      <section className="border border-line bg-panel p-5 xl:col-span-2">
        <div className="mb-5 flex items-center gap-3">
          <ListVideo className="h-5 w-5 text-aqua" />
          <h1 className="text-xl font-black">Playlists</h1>
        </div>
        <form onSubmit={submitPlaylist} className="mb-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input name="name" placeholder="Playlist name" required className="border border-line bg-ink px-4 py-3 outline-none focus:border-aqua" />
          <input name="description" placeholder="Description" required className="border border-line bg-ink px-4 py-3 outline-none focus:border-aqua" />
          <button className="inline-flex items-center justify-center gap-2 bg-white px-4 py-3 font-black text-ink">
            <Plus className="h-5 w-5" />
            {editingPlaylistId ? "Save" : "Create"}
          </button>
        </form>
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="space-y-3">
            {playlists.length === 0 && <p className="text-white/50">No playlists yet.</p>}
            {playlists.map((playlist) => (
              <article key={playlist._id} className="border border-line bg-ink p-3">
                <button className="block w-full text-left" onClick={() => openPlaylist(playlist._id)}>
                  <p className="font-black">{playlist.name}</p>
                  <p className="mt-1 text-sm text-white/52">{playlist.description}</p>
                </button>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => {
                    setEditingPlaylistId(playlist._id)
                    setNotice("Edit the playlist form above, then press Save.")
                  }} className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-aqua">
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button onClick={() => removePlaylist(playlist._id)} className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-flame">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="border border-line bg-ink p-4">
            {!activePlaylist && <p className="text-white/50">Open a playlist to manage its videos.</p>}
            {activePlaylist && (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black">{activePlaylist.name}</h2>
                    <p className="text-sm text-white/52">{activePlaylist.description}</p>
                  </div>
                  <button onClick={() => setActivePlaylist(null)} aria-label="Close playlist">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {activePlaylist.videos?.length === 0 && <p className="text-white/50">No videos in this playlist.</p>}
                  {activePlaylist.videos?.map((video) => (
                    <div key={video._id} className="flex gap-3 border border-line bg-panel p-3">
                      <button onClick={() => onSelectVideo(video._id)} className="flex flex-1 gap-3 text-left">
                        <img src={video.thumbnail} alt="" className="aspect-video w-28 object-cover" />
                        <span className="min-w-0">
                          <span className="line-clamp-2 font-black">{video.title}</span>
                          <span className="text-sm text-white/52">{formatCount(video.views)} views</span>
                        </span>
                      </button>
                      <button onClick={() => removeFromPlaylist(video._id)} className="text-flame" aria-label="Remove from playlist">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function LibrarySection({ icon: Icon, title, videos, loading, onSelectVideo }) {
  return (
    <section className="border border-line bg-panel p-5">
      <div className="mb-5 flex items-center gap-3">
        <Icon className="h-5 w-5 text-aqua" />
        <h1 className="text-xl font-black">{title}</h1>
      </div>

      {loading && <Skeleton className="h-28 w-full" />}
      {!loading && videos.length === 0 && (
        <p className="text-white/50">
          {title === "Watch history"
            ? "No watch history is available. The backend exposes a history reader, but it does not currently add videos to history when a video is watched."
            : "Nothing here yet."}
        </p>
      )}

      <div className="space-y-3">
        {videos.map((video) => {
          const item = normalizeLibraryVideo(video)

          return (
            <button key={item._id} onClick={() => onSelectVideo(item._id)} className="flex w-full gap-3 border border-line bg-ink p-3 text-left">
              <img src={item.thumbnail} alt="" className="aspect-video w-32 object-cover" />
              <span className="min-w-0">
                <span className="line-clamp-2 font-black">{item.title}</span>
                <span className="mt-1 block text-sm text-white/52">{formatCount(item.views)} views</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function normalizeLibraryVideo(video) {
  const item = video.video || video.videoDetails || video

  return {
    ...item,
    ownerDetails: item.ownerDetails || item.owner
  }
}
