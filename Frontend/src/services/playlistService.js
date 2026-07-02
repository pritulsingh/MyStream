export function createPlaylist(api, payload) {
  return api.request("/playlist", {
    method: "POST",
    body: JSON.stringify(payload)
  })
}

export function getUserPlaylists(api, userId) {
  return api.request(`/playlist/user/${userId}`)
}

export function getPlaylistById(api, playlistId) {
  return api.request(`/playlist/${playlistId}`)
}

export function updatePlaylist(api, playlistId, payload) {
  return api.request(`/playlist/${playlistId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  })
}

export function deletePlaylist(api, playlistId) {
  return api.request(`/playlist/${playlistId}`, { method: "DELETE" })
}

export function addVideoToPlaylist(api, videoId, playlistId) {
  return api.request(`/playlist/add/${videoId}/${playlistId}`, { method: "PATCH" })
}

export function removeVideoFromPlaylist(api, videoId, playlistId) {
  return api.request(`/playlist/remove/${videoId}/${playlistId}`, { method: "PATCH" })
}
