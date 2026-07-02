export function toggleVideoLike(api, videoId) {
  return api.request(`/likes/toggle/v/${videoId}`, { method: "POST" })
}

export function toggleCommentLike(api, commentId) {
  return api.request(`/likes/toggle/c/${commentId}`, { method: "POST" })
}

export function toggleTweetLike(api, tweetId) {
  return api.request(`/likes/toggle/t/${tweetId}`, { method: "POST" })
}

export function getLikedVideos(api) {
  return api.request("/likes/videos")
}
