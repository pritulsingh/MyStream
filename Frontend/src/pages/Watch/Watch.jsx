import { useEffect, useState } from "react"
import { CalendarDays, CheckCircle2, Clock3, Edit3, Eye, Heart, ListPlus, Send, Trash2, UserCheck, UserPlus } from "lucide-react"
import { deleteComment, updateComment } from "../../services/commentService"
import { toggleCommentLike } from "../../services/likeService"
import { addVideoToPlaylist, getUserPlaylists } from "../../services/playlistService"
import { toggleSubscription } from "../../services/subscriptionService"
import { getChannelProfile } from "../../services/userService"
import { getApiError } from "../../utils/errors"
import { formatCount, formatDuration } from "../../utils/formatters"

export function WatchPage({ api, user, video, comments, onLike, onComment, onOpenChannel, onReloadComments, setNotice }) {
  const [channel, setChannel] = useState(null)
  const [likeState, setLikeState] = useState(null)
  const [playlists, setPlaylists] = useState([])

  useEffect(() => {
    async function loadChannel() {
      if (!video?.ownerDetails?.username) {
        setChannel(null)
        return
      }

      try {
        const response = await getChannelProfile(api, video.ownerDetails.username)
        setChannel(response.data)
      } catch (error) {
        setNotice(getApiError(error))
      }
    }

    loadChannel()
  }, [api, video?.ownerDetails?.username, setNotice])

  useEffect(() => {
    async function loadPlaylists() {
      if (!user?._id) return
      try {
        const response = await getUserPlaylists(api, user._id)
        setPlaylists(response.data || [])
      } catch {
        setPlaylists([])
      }
    }

    loadPlaylists()
  }, [api, user?._id])

  async function handleLike() {
    const data = await onLike()
    if (data) setLikeState(data)
  }

  async function handleSubscribe() {
    const channelId = channel?._id || video?.ownerDetails?._id
    if (!channelId) return

    try {
      const response = await toggleSubscription(api, channelId)
      setChannel((current) => ({
        ...current,
        isSubscribed: response.data.subscribed,
        subscribersCount: response.data.subscriberCount
      }))
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function handleAddToPlaylist(event) {
    const playlistId = event.target.value
    if (!playlistId || !video?._id) return

    try {
      const response = await addVideoToPlaylist(api, video._id, playlistId)
      setNotice(response.message)
      event.target.value = ""
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  if (!video) {
    return (
      <div className="grid min-h-[420px] place-items-center px-4 py-6 text-center sm:px-6">
        <div>
          <h1 className="text-3xl font-black">Select a video</h1>
          <p className="mt-2 text-white/56">Open a video from Home or Trending to start watching.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-5">
        <article className="overflow-hidden border border-line bg-panel">
          <div className="bg-black">
            <video key={video.videoFile} src={video.videoFile} poster={video.thumbnail} controls className="aspect-video w-full object-contain" />
          </div>
          <div className="p-5">
            <h1 className="text-2xl font-black leading-tight sm:text-4xl">{video.title}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/58">
              <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {formatCount(video.views)} views</span>
              <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> {formatDuration(video.duration)}</span>
              <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {formatDate(video.createdAt)}</span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> {video.isPublished ? "Published" : "Unpublished"}
              </span>
              {likeState?.likesCount !== undefined && (
                <span className="inline-flex items-center gap-1"><Heart className="h-4 w-4" /> {formatCount(likeState.likesCount)} likes</span>
              )}
            </div>
            <p className="mt-5 whitespace-pre-line leading-7 text-white/72">{video.description}</p>
          </div>
        </article>

        <section className="flex flex-wrap items-center justify-between gap-4 border border-line bg-panel p-4">
          <button className="flex items-center gap-3 text-left" onClick={() => onOpenChannel(video.ownerDetails?.username)}>
            <img src={video.ownerDetails?.avatar} alt="" className="h-14 w-14 object-cover" />
            <span>
              <span className="block font-black">{video.ownerDetails?.fullName || "Channel"}</span>
              <span className="block text-sm text-white/50">@{video.ownerDetails?.username}</span>
              {channel && <span className="mt-1 block text-xs text-white/42">{formatCount(channel.subscribersCount)} subscribers</span>}
            </span>
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-2 border px-4 py-3 font-black transition ${
                likeState?.liked
                  ? "border-flame bg-flame text-white"
                  : "border-line bg-ink text-white hover:border-flame hover:text-flame"
              }`}
            >
              <Heart className={`h-5 w-5 ${likeState?.liked ? "fill-current" : ""}`} />
              {likeState?.liked ? "Liked" : "Like"}
            </button>
            <button
              onClick={handleSubscribe}
              className={`inline-flex items-center gap-2 px-4 py-3 font-black transition disabled:opacity-50 ${
                channel?.isSubscribed ? "border border-line bg-ink text-white hover:border-flame" : "bg-white text-ink hover:bg-aqua"
              }`}
              disabled={!channel || channel?._id === undefined}
            >
              {channel?.isSubscribed ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              {channel?.isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
            {playlists.length > 0 && (
              <label className="inline-flex items-center gap-2 border border-line bg-ink px-3 py-2">
                <ListPlus className="h-5 w-5 text-aqua" />
                <select onChange={handleAddToPlaylist} defaultValue="" className="bg-transparent text-sm font-bold outline-none">
                  <option value="">Add to playlist</option>
                  {playlists.map((playlist) => (
                    <option key={playlist._id} value={playlist._id}>{playlist.name}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </section>
      </section>

      <CommentPanel
        api={api}
        user={user}
        video={video}
        comments={comments}
        onComment={onComment}
        onReloadComments={onReloadComments}
        onOpenChannel={onOpenChannel}
        setNotice={setNotice}
      />
    </div>
  )
}

export function CommentPanel({ api, user, video, comments, onComment, onReloadComments, onOpenChannel, setNotice }) {
  const [content, setContent] = useState("")
  const [editingCommentId, setEditingCommentId] = useState("")
  const [editingContent, setEditingContent] = useState("")

  async function submit(event) {
    event.preventDefault()
    await onComment(content)
    setContent("")
  }

  async function saveComment(commentId) {
    if (!editingContent.trim()) return
    try {
      const response = await updateComment(api, commentId, editingContent)
      setNotice(response.message)
      setEditingCommentId("")
      setEditingContent("")
      await onReloadComments()
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function removeComment(commentId) {
    if (!window.confirm("Delete this comment?")) return
    try {
      const response = await deleteComment(api, commentId)
      setNotice(response.message)
      await onReloadComments()
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function likeComment(commentId) {
    try {
      const response = await toggleCommentLike(api, commentId)
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  return (
    <aside className="border border-line bg-panel p-4 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-auto">
      <h2 className="mb-4 text-lg font-black">Comments</h2>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={content}
          disabled={!video}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Add a comment"
          className="min-w-0 flex-1 border border-line bg-ink px-3 py-3 text-sm outline-none focus:border-aqua"
        />
        <button disabled={!video || !content.trim()} className="grid h-12 w-12 place-items-center bg-aqua text-ink disabled:opacity-50" aria-label="Send comment">
          <Send className="h-5 w-5" />
        </button>
      </form>
      <div className="mt-4 space-y-3">
        {comments.length === 0 && <p className="text-sm text-white/48">No comments yet.</p>}
        {comments.map((comment) => (
          <div key={comment._id} className="border border-line bg-ink p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button onClick={() => onOpenChannel?.(comment.owner?.username)} aria-label="Open commenter channel">
                  <img src={comment.owner?.avatar} alt="" className="h-7 w-7 object-cover" />
                </button>
                <button className="text-left text-xs font-bold text-white/62 hover:text-aqua" onClick={() => onOpenChannel?.(comment.owner?.username)}>
                  @{comment.owner?.username || "viewer"}
                </button>
              </div>
              <button onClick={() => likeComment(comment._id)} className="text-white/50 hover:text-flame" aria-label="Like comment">
                <Heart className="h-4 w-4" />
              </button>
            </div>
            {editingCommentId === comment._id ? (
              <div className="space-y-2">
                <textarea value={editingContent} onChange={(event) => setEditingContent(event.target.value)} className="w-full border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-aqua" />
                <div className="flex gap-2">
                  <button onClick={() => saveComment(comment._id)} className="bg-white px-3 py-2 text-xs font-black text-ink">Save</button>
                  <button onClick={() => setEditingCommentId("")} className="border border-line px-3 py-2 text-xs font-bold">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-white/78">{comment.content}</p>
            )}
            {(comment.owner?._id === user?._id || video?.owner === user?._id) && editingCommentId !== comment._id && (
              <div className="mt-3 flex gap-2">
                {comment.owner?._id === user?._id && (
                  <button onClick={() => {
                    setEditingCommentId(comment._id)
                    setEditingContent(comment.content)
                  }} className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-aqua">
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}
                <button onClick={() => removeComment(comment._id)} className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-flame">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

function formatDate(value) {
  if (!value) return "Unknown date"
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
}
