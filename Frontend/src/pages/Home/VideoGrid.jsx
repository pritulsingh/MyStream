import { useRef, useState } from "react"
import { Eye, Sparkles } from "lucide-react"
import { Button } from "../../components/Button/Button"
import { classNames } from "../../utils/classNames"
import { formatCount, formatDuration } from "../../utils/formatters"

export function VideoGrid({ title, emptyText, videos, onSelectVideo, onOpenChannel, onRefresh, loading }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        {title && <h1 className="text-2xl font-black">{title}</h1>}
        {onRefresh && (
          <Button variant="secondary" className="px-4 py-2 text-sm" onClick={onRefresh}>
            <Sparkles className={classNames("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        )}
      </div>

      {videos.length === 0 && !loading && (
        <div className="grid min-h-64 place-items-center border border-line bg-panel p-8 text-center text-white/56">
          {emptyText}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} onSelectVideo={onSelectVideo} onOpenChannel={onOpenChannel} />
        ))}
      </div>
    </section>
  )
}

function VideoCard({ video, onSelectVideo, onOpenChannel }) {
  const videoRef = useRef(null)
  const [previewing, setPreviewing] = useState(false)

  async function startPreview() {
    setPreviewing(true)
    try {
      videoRef.current.currentTime = 0
      await videoRef.current.play()
    } catch {
      setPreviewing(false)
    }
  }

  function stopPreview() {
    setPreviewing(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <article
      className="group overflow-hidden border border-line bg-panel transition hover:-translate-y-1 hover:border-aqua"
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
    >
      <button className="block w-full text-left" onClick={() => onSelectVideo(video._id)}>
        <div className="relative aspect-video overflow-hidden bg-black">
          <img
            src={video.thumbnail}
            alt=""
            className={classNames("h-full w-full object-cover transition duration-300", previewing && "opacity-0")}
          />
          <video
            ref={videoRef}
            src={video.videoFile}
            muted
            playsInline
            preload="metadata"
            className={classNames("absolute inset-0 h-full w-full object-cover transition duration-300", previewing ? "opacity-100" : "opacity-0")}
          />
          <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs font-black">{formatDuration(video.duration)}</span>
        </div>
      </button>
      <div className="p-4">
        <button className="block w-full text-left" onClick={() => onSelectVideo(video._id)}>
          <h2 className="line-clamp-2 min-h-12 font-black leading-6">{video.title}</h2>
        </button>
        <div className="mt-3 flex items-center gap-2">
          <button onClick={() => onOpenChannel?.(video.ownerDetails?.username)} aria-label="Open channel">
            <img src={video.ownerDetails?.avatar} alt="" className="h-9 w-9 object-cover" />
          </button>
          <div className="min-w-0">
            <button className="block max-w-full truncate text-left text-sm font-semibold text-white/72" onClick={() => onOpenChannel?.(video.ownerDetails?.username)}>
              {video.ownerDetails?.fullName}
            </button>
            <p className="flex items-center gap-1 text-xs text-white/44">
              <Eye className="h-3.5 w-3.5" /> {formatCount(video.views)} views
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
