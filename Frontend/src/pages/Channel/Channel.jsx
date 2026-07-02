import { useEffect, useState } from "react"
import { Edit3, Heart, Send, Trash2, UserCheck, UserPlus, Users, Video } from "lucide-react"
import { Modal } from "../../components/Modal/Modal"
import { toggleSubscription } from "../../services/subscriptionService"
import { getChannelSubscribers, getSubscribedChannels } from "../../services/subscriptionService"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../../services/tweetService"
import { toggleTweetLike } from "../../services/likeService"
import { getChannelProfile } from "../../services/userService"
import { getVideos } from "../../services/videoService"
import { getApiError } from "../../utils/errors"
import { formatCount } from "../../utils/formatters"
import { VideoGrid } from "../Home/VideoGrid"

export function ChannelPage({ api, user, username, setNotice, onSelectVideo, onOpenChannel }) {
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [tweets, setTweets] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [tweetContent, setTweetContent] = useState("")
  const [editingTweetId, setEditingTweetId] = useState("")
  const [editingTweetContent, setEditingTweetContent] = useState("")

  useEffect(() => {
    async function loadChannel() {
      if (!username) return
      setLoading(true)
      try {
        const profileResponse = await getChannelProfile(api, username)
        setChannel(profileResponse.data)

        const videosResponse = await getVideos(api, {
          userId: profileResponse.data._id,
          limit: "24",
          sortBy: "createdAt"
        })
        setVideos(videosResponse.data?.docs || [])

        const [tweetsResponse, subscribersResponse, subscriptionsResponse] = await Promise.all([
          getUserTweets(api, profileResponse.data._id),
          getChannelSubscribers(api, profileResponse.data._id),
          getSubscribedChannels(api, profileResponse.data._id)
        ])
        setTweets(tweetsResponse.data?.tweets || [])
        setSubscribers(subscribersResponse.data?.subscribers || [])
        setSubscriptions(subscriptionsResponse.data?.channels || [])
      } catch (error) {
        setNotice(getApiError(error))
      } finally {
        setLoading(false)
      }
    }

    loadChannel()
  }, [api, username, setNotice])

  async function handleSubscribe() {
    if (!channel?._id) return

    try {
      const response = await toggleSubscription(api, channel._id)
      setChannel((current) => ({
        ...current,
        isSubscribed: response.data.subscribed,
        subscribersCount: response.data.subscriberCount
      }))
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function submitTweet(event) {
    event.preventDefault()
    if (!tweetContent.trim()) return
    try {
      const response = await createTweet(api, tweetContent)
      setTweets((current) => [response.data, ...current])
      setTweetContent("")
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function saveTweet(tweetId) {
    if (!editingTweetContent.trim()) return
    try {
      const response = await updateTweet(api, tweetId, editingTweetContent)
      setTweets((current) => current.map((tweet) => (tweet._id === tweetId ? response.data : tweet)))
      setEditingTweetId("")
      setEditingTweetContent("")
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function removeTweet(tweetId) {
    if (!window.confirm("Delete this tweet?")) return
    try {
      const response = await deleteTweet(api, tweetId)
      setTweets((current) => current.filter((tweet) => tweet._id !== tweetId))
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function likeTweet(tweetId) {
    try {
      const response = await toggleTweetLike(api, tweetId)
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  if (!channel) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="border border-line bg-panel p-6 text-white/56">{loading ? "Loading channel..." : "Open a channel to view its profile."}</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <section className="overflow-hidden border border-line bg-panel">
        <button
          className="block h-56 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${channel.coverImage || channel.avatar})` }}
          onClick={() => setPreviewImage(channel.coverImage || channel.avatar)}
          aria-label="Preview cover image"
        />
        <div className="flex flex-wrap items-end justify-between gap-4 p-5">
          <div className="flex items-end gap-4">
            <button onClick={() => setPreviewImage(channel.avatar)} aria-label="Preview avatar">
              <img src={channel.avatar} alt="" className="-mt-16 h-28 w-28 border-4 border-panel object-cover" />
            </button>
            <div>
              <h1 className="text-3xl font-black">{channel.fullName}</h1>
              <p className="text-white/54">@{channel.username}</p>
              <p className="mt-1 text-sm text-white/50">
                {formatCount(channel.subscribersCount)} subscribers · {formatCount(videos.length)} videos
              </p>
            </div>
          </div>
          <button
            onClick={handleSubscribe}
            className={`inline-flex items-center gap-2 px-4 py-3 font-black transition ${
              channel.isSubscribed ? "border border-line bg-ink text-white hover:border-flame" : "bg-white text-ink hover:bg-aqua"
            }`}
          >
            {channel.isSubscribed ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            {channel.isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>
      </section>

      <div className="mt-6">
        <div className="mb-4 flex items-center gap-2 text-white/72">
          <Video className="h-5 w-5 text-aqua" />
          <span className="font-bold">Published videos</span>
        </div>
        <VideoGrid
          title=""
          emptyText="This channel has no published videos."
          videos={videos}
          onSelectVideo={onSelectVideo}
          onOpenChannel={onOpenChannel}
          loading={loading}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="border border-line bg-panel p-5">
          <h2 className="mb-4 text-xl font-black">Tweets</h2>
          {channel._id === user?._id && (
            <form onSubmit={submitTweet} className="mb-4 flex gap-2">
              <input value={tweetContent} onChange={(event) => setTweetContent(event.target.value)} maxLength="280" placeholder="Share an update" className="min-w-0 flex-1 border border-line bg-ink px-3 py-3 outline-none focus:border-aqua" />
              <button className="grid h-12 w-12 place-items-center bg-aqua text-ink" aria-label="Create tweet">
                <Send className="h-5 w-5" />
              </button>
            </form>
          )}
          <div className="space-y-3">
            {tweets.length === 0 && <p className="text-white/50">No tweets yet.</p>}
            {tweets.map((tweet) => (
              <article key={tweet._id} className="border border-line bg-ink p-4">
                {editingTweetId === tweet._id ? (
                  <div className="space-y-2">
                    <textarea value={editingTweetContent} onChange={(event) => setEditingTweetContent(event.target.value)} maxLength="280" className="w-full border border-line bg-panel px-3 py-2 outline-none focus:border-aqua" />
                    <div className="flex gap-2">
                      <button onClick={() => saveTweet(tweet._id)} className="bg-white px-3 py-2 text-xs font-black text-ink">Save</button>
                      <button onClick={() => setEditingTweetId("")} className="border border-line px-3 py-2 text-xs font-bold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="leading-7 text-white/78">{tweet.content}</p>
                )}
                <div className="mt-3 flex gap-3">
                  <button onClick={() => likeTweet(tweet._id)} className="inline-flex items-center gap-1 text-sm text-white/52 hover:text-flame">
                    <Heart className="h-4 w-4" />
                    Like
                  </button>
                  {channel._id === user?._id && editingTweetId !== tweet._id && (
                    <>
                      <button onClick={() => {
                        setEditingTweetId(tweet._id)
                        setEditingTweetContent(tweet.content)
                      }} className="inline-flex items-center gap-1 text-sm text-white/52 hover:text-aqua">
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>
                      <button onClick={() => removeTweet(tweet._id)} className="inline-flex items-center gap-1 text-sm text-white/52 hover:text-flame">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <PeopleList title="Subscribers" people={subscribers} onOpenChannel={onOpenChannel} />
          <PeopleList title="Subscribed channels" people={subscriptions} onOpenChannel={onOpenChannel} />
        </aside>
      </div>

      <Modal open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} className="max-w-4xl">
        <img src={previewImage} alt="" className="max-h-[80vh] w-full object-contain" />
      </Modal>
    </div>
  )
}

function PeopleList({ title, people, onOpenChannel }) {
  return (
    <section className="border border-line bg-panel p-5">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-aqua" />
        <h2 className="font-black">{title}</h2>
      </div>
      <div className="space-y-3">
        {people.length === 0 && <p className="text-sm text-white/50">Nothing here yet.</p>}
        {people.map((person) => (
          <button key={person._id} onClick={() => onOpenChannel(person.username)} className="flex w-full items-center gap-3 text-left">
            <img src={person.avatar} alt="" className="h-9 w-9 object-cover" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{person.fullName}</span>
              <span className="block truncate text-xs text-white/50">@{person.username}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
