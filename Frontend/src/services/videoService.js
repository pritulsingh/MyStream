export function getVideos(api, filters = {}) {
  const params = new URLSearchParams({
    page: filters.page || "1",
    limit: filters.limit || "18",
    sortBy: filters.sortBy || "createdAt",
    sortType: filters.sortType || "desc"
  })

  if (filters.query?.trim()) params.set("query", filters.query.trim())
  if (filters.userId) params.set("userId", filters.userId)

  return api.request(`/videos?${params.toString()}`)
}

export function getVideoById(api, videoId) {
  return api.request(`/videos/${videoId}`)
}

export function publishVideo(api, formData) {
  return api.request("/videos", {
    method: "POST",
    body: formData
  })
}

export function updateVideo(api, videoId, formData) {
  return api.request(`/videos/${videoId}`, {
    method: "PATCH",
    body: formData
  })
}

export function deleteVideo(api, videoId) {
  return api.request(`/videos/${videoId}`, { method: "DELETE" })
}

export function togglePublishStatus(api, videoId) {
  return api.request(`/videos/toggle/publish/${videoId}`, { method: "PATCH" })
}
