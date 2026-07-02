export function toggleSubscription(api, channelId) {
  return api.request(`/subscriptions/c/${channelId}`, { method: "POST" })
}

export function getChannelSubscribers(api, channelId) {
  return api.request(`/subscriptions/subscribers/${channelId}`)
}

export function getSubscribedChannels(api, userId) {
  return api.request(`/subscriptions/subscriptions/${userId}`)
}
