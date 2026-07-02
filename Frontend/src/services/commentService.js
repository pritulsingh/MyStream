export function getVideoComments(api, videoId) {
  return api.request(`/comments/${videoId}?page=1&limit=12`)
}

export function addVideoComment(api, videoId, content) {
  return api.request(`/comments/${videoId}`, {
    method: "POST",
    body: JSON.stringify({ content })
  })
}

export function updateComment(api, commentId, content) {
  return api.request(`/comments/c/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ content })
  })
}

export function deleteComment(api, commentId) {
  return api.request(`/comments/c/${commentId}`, { method: "DELETE" })
}
