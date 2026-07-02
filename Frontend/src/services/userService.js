export function getCurrentUser(api) {
  return api.request("/users/current-user")
}

export function getChannelProfile(api, username) {
  return api.request(`/users/c/${username}`)
}

export function getWatchHistory(api) {
  return api.request("/users/history")
}

export function updateAccount(api, payload) {
  return api.request("/users/update-account", {
    method: "PATCH",
    body: JSON.stringify(payload)
  })
}

export function changePassword(api, payload) {
  return api.request("/users/change-password", {
    method: "POST",
    body: JSON.stringify(payload)
  })
}

export function updateAvatar(api, formData) {
  return api.request("/users/avatar", {
    method: "PATCH",
    body: formData
  })
}

export function updateCoverImage(api, formData) {
  return api.request("/users/cover-image", {
    method: "PATCH",
    body: formData
  })
}

export function healthcheck(api) {
  return api.request("/healthcheck")
}
