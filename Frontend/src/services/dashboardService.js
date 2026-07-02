export function getChannelStats(api) {
  return api.request("/dashboard/stats")
}

export function getChannelVideos(api) {
  return api.request("/dashboard/videos?limit=20")
}
