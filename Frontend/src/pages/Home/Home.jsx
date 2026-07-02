import { VideoGrid } from "./VideoGrid"

export function HomePage({ videos, loading, onSelectVideo, onOpenChannel, onRefresh, query }) {
  return (
    <div className="px-4 py-6 sm:px-6">
      <VideoGrid
        title={query?.trim() ? `Search results for "${query.trim()}"` : "Home"}
        emptyText={query?.trim() ? "No videos matched your title or description search." : "No uploaded videos found."}
        videos={videos}
        onSelectVideo={onSelectVideo}
        onOpenChannel={onOpenChannel}
        onRefresh={onRefresh}
        loading={loading}
      />
    </div>
  )
}
