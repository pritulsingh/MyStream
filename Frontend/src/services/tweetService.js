export function createTweet(api, content) {
  return api.request("/tweets", {
    method: "POST",
    body: JSON.stringify({ content })
  })
}

export function getUserTweets(api, userId) {
  return api.request(`/tweets/user/${userId}`)
}

export function updateTweet(api, tweetId, content) {
  return api.request(`/tweets/${tweetId}`, {
    method: "PATCH",
    body: JSON.stringify({ content })
  })
}

export function deleteTweet(api, tweetId) {
  return api.request(`/tweets/${tweetId}`, { method: "DELETE" })
}
