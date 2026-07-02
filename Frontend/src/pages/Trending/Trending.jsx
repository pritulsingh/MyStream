import { VideoGrid } from "../Home/VideoGrid"

export function TrendingPage({ videos, loading, onSelectVideo, onOpenChannel, onRefresh }) {
  return (
    <div className="px-4 py-6 sm:px-6">
      <VideoGrid
        title="Trending"
        emptyText="No videos available to rank by views."
        videos={videos}
        onSelectVideo={onSelectVideo}
        onOpenChannel={onOpenChannel}
        onRefresh={onRefresh}
        loading={loading}
      />
    </div>
  )
}
