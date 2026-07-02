import { useState } from "react"
import { CheckCircle2, Eye, Film, Trash2, Upload } from "lucide-react"
import { MetricCard } from "../../components/Cards/MetricCard"
import { Field, FileField } from "../../components/Input/Input"
import { Loader } from "../../components/Loader/Loader"
import { formatCount } from "../../utils/formatters"
import { getApiError } from "../../utils/errors"
import { deleteVideo, togglePublishStatus, updateVideo } from "../../services/videoService"

export function UploadPage({ api, user, videos, stats, onUpload, onChanged }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [editingId, setEditingId] = useState("")

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    setBusy(true)
    setMessage("")

    try {
      await onUpload(new FormData(form))
      form.reset()
      setMessage("Upload complete.")
    } catch (error) {
      setMessage(getApiError(error))
    } finally {
      setBusy(false)
    }
  }

  async function submitEdit(event, videoId) {
    event.preventDefault()
    setEditingId(videoId)
    try {
      const formData = new FormData(event.currentTarget)
      const response = await updateVideo(api, videoId, formData)
      setMessage(response.message)
      await onChanged()
    } catch (error) {
      setMessage(getApiError(error))
    } finally {
      setEditingId("")
    }
  }

  async function togglePublished(videoId) {
    setEditingId(videoId)
    try {
      const response = await togglePublishStatus(api, videoId)
      setMessage(response.message)
      await onChanged()
    } catch (error) {
      setMessage(getApiError(error))
    } finally {
      setEditingId("")
    }
  }

  async function removeVideo(videoId) {
    if (!window.confirm("Delete this video?")) return
    setEditingId(videoId)
    try {
      const response = await deleteVideo(api, videoId)
      setMessage(response.message)
      await onChanged()
    } catch (error) {
      setMessage(getApiError(error))
    } finally {
      setEditingId("")
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard icon={Film} label="Your videos" value={stats?.totalVideos ?? videos.length} />
        <MetricCard icon={Eye} label="Your total views" value={formatCount(stats?.totalViews || 0)} />
        <MetricCard icon={CheckCircle2} label="Signed in as" value={`@${user?.username}`} />
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={submit} className="border border-line bg-panel p-5">
          <h1 className="text-2xl font-black">Upload video</h1>
          <div className="mt-5 space-y-4">
            <Field name="title" label="Title" required />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/70">Description</span>
              <textarea name="description" required rows="5" className="w-full border border-line bg-ink px-4 py-3 text-white outline-none focus:border-aqua" />
            </label>
            <FileField name="videoFile" label="Video file" accept="video/*" required />
            <FileField name="thumbnail" label="Thumbnail" required />
          </div>
          {message && <p className="mt-4 border border-line bg-ink px-4 py-3 text-sm text-white/70">{message}</p>}
          <button disabled={busy} className="mt-5 inline-flex items-center gap-2 bg-flame px-5 py-3 font-black disabled:opacity-60">
            {busy ? <Loader /> : <Upload className="h-5 w-5" />}
            Publish
          </button>
        </form>

        <div className="border border-line bg-panel p-5">
          <h2 className="mb-4 text-xl font-black">Manage uploads</h2>
          <div className="grid gap-4">
            {videos.slice(0, 7).map((video) => (
              <form key={video._id} onSubmit={(event) => submitEdit(event, video._id)} className="grid gap-3 border border-line bg-ink p-3">
                <div className="flex gap-3">
                  <img src={video.thumbnail} alt="" className="aspect-video w-28 object-cover" />
                  <div className="min-w-0 flex-1">
                    <input name="title" defaultValue={video.title} className="w-full border border-line bg-panel px-3 py-2 font-black outline-none focus:border-aqua" />
                    <p className="mt-1 text-sm text-white/52">{formatCount(video.views)} views · {video.isPublished ? "Published" : "Unpublished"}</p>
                  </div>
                </div>
                <textarea name="description" defaultValue={video.description} rows="2" className="w-full border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-aqua" />
                <FileField name="thumbnail" label="Replace thumbnail" />
                <div className="flex flex-wrap gap-2">
                  <button disabled={editingId === video._id} className="inline-flex items-center gap-2 bg-white px-4 py-2 font-black text-ink disabled:opacity-60">
                    {editingId === video._id ? <Loader /> : <Upload className="h-4 w-4" />}
                    Save
                  </button>
                  <button type="button" onClick={() => togglePublished(video._id)} className="border border-line px-4 py-2 font-bold">
                    {video.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button type="button" onClick={() => removeVideo(video._id)} className="inline-flex items-center gap-2 border border-flame/50 px-4 py-2 font-bold text-flame">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </form>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
