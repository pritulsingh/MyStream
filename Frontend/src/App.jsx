import { useEffect, useState } from "react"
import { Navbar } from "./components/Navbar/Navbar"
import { Sidebar } from "./components/Sidebar/Sidebar"
import { Toast } from "./components/Toast/Toast"
import { Modal } from "./components/Modal/Modal"
import { AuthContext } from "./context/AuthContext"
import { useApi } from "./hooks/useApi"
import { ChannelPage } from "./pages/Channel/Channel"
import { AuthPage } from "./pages/Login/AuthPage"
import { VerifyEmailPage } from "./pages/Login/VerifyEmail"
import { HomePage } from "./pages/Home/Home"
import { LibraryPage } from "./pages/Library/Library"
import { ProfilePage } from "./pages/Profile/Profile"
import { SettingsPage } from "./pages/Settings/Settings"
import { TrendingPage } from "./pages/Trending/Trending"
import { UploadPage } from "./pages/Upload/Upload"
import { WatchPage } from "./pages/Watch/Watch"
import { addVideoComment, getVideoComments } from "./services/commentService"
import { getChannelStats, getChannelVideos } from "./services/dashboardService"
import { login, logout, register, resendOtp, verifyOtp } from "./services/authService"
import { toggleVideoLike } from "./services/likeService"
import { getCurrentUser } from "./services/userService"
import { getVideoById, getVideos, publishVideo } from "./services/videoService"
import { getApiError } from "./utils/errors"

export default function App() {
  const api = useApi()
  const [activeView, setActiveView] = useState("home")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mystream_user"))
    } catch {
      return null
    }
  })
  const [videos, setVideos] = useState([])
  const [studioVideos, setStudioVideos] = useState([])
  const [trendingVideos, setTrendingVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [activeChannelUsername, setActiveChannelUsername] = useState("")
  const [comments, setComments] = useState([])
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState("")
  const [authMode, setAuthMode] = useState("login")
  const [authStep, setAuthStep] = useState("auth")
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("")
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false)
  const [studioStats, setStudioStats] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem("mystream_theme") || "dark")

  const isAuthed = Boolean(api.tokens.accessToken)

  useEffect(() => {
    if (user) localStorage.setItem("mystream_user", JSON.stringify(user))
    else localStorage.removeItem("mystream_user")
  }, [user])

  useEffect(() => {
    localStorage.setItem("mystream_theme", theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(""), 5000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    if (!isAuthed || authStep === "verify") return
    loadCurrentUser()
    loadVideos()
    loadTrendingVideos()
    loadStudioStats()
    loadStudioVideos()
  }, [isAuthed, authStep])

  useEffect(() => {
    function handlePopState(event) {
      const state = event.state
      if (!state?.view) return

      setActiveView(state.view)
      setActiveChannelUsername(state.channelUsername || "")

      if (state.view === "watch" && state.videoId && selectedVideo?._id !== state.videoId) {
        loadVideo(state.videoId, { replaceHistory: true })
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [selectedVideo?._id])

  useEffect(() => {
    if (!isAuthed) return

    const routeState = {
      view: activeView,
      videoId: activeView === "watch" ? selectedVideo?._id : undefined,
      channelUsername: activeView === "channel" ? activeChannelUsername : undefined
    }
    const url = getUrlForState(routeState)

    if (window.location.pathname !== url) {
      window.history.pushState(routeState, "", url)
    } else {
      window.history.replaceState(routeState, "", url)
    }
  }, [isAuthed, activeView, selectedVideo?._id, activeChannelUsername])

  useEffect(() => {
    if (!isAuthed) return
    const timeout = window.setTimeout(() => loadVideos(), 350)
    return () => window.clearTimeout(timeout)
  }, [query, sortBy])

  async function loadCurrentUser() {
    try {
      const response = await getCurrentUser(api)
      setUser(response.data)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function loadVideos() {
    setLoading(true)
    try {
      const response = await getVideos(api, { query, sortBy })
      const docs = response.data?.docs || []
      setVideos(docs)
    } catch (error) {
      setNotice(getApiError(error))
    } finally {
      setLoading(false)
    }
  }

  async function loadTrendingVideos() {
    try {
      const response = await getVideos(api, { sortBy: "views", sortType: "desc", limit: "24" })
      setTrendingVideos(response.data?.docs || [])
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function loadStudioStats() {
    try {
      const response = await getChannelStats(api)
      setStudioStats(response.data)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function loadStudioVideos() {
    try {
      const response = await getChannelVideos(api)
      setStudioVideos(response.data?.docs || [])
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function loadVideo(videoId, options = {}) {
    try {
      const response = await getVideoById(api, videoId)
      setSelectedVideo(response.data)
      loadComments(videoId)
      setActiveView("watch")
      if (options.replaceHistory) {
        window.history.replaceState({ view: "watch", videoId }, "", `/watch/${videoId}`)
      }
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function loadComments(videoId) {
    try {
      const response = await getVideoComments(api, videoId)
      setComments(response.data?.docs || response.data || [])
    } catch {
      setComments([])
    }
  }

  async function handleLogin(formData) {
    const payload = Object.fromEntries(formData.entries())
    const identifier = String(payload.loginIdentifier || "").trim()
    delete payload.loginIdentifier

    if (identifier.includes("@")) payload.email = identifier
    else payload.username = identifier

    const response = await login(api, payload)

    api.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken
    })
    setUser(response.data.user)
    setNotice("Welcome back to MyStream.")
  }

  async function handleRegister(formData) {
    const response = await register(api, formData)
    const accessToken = response.data?.accessToken
    const email = formData.get("email")

    if (accessToken) {
      api.setTokens({ accessToken })
      setPendingVerificationEmail(email)
      setAuthStep("verify")
      setNotice(response.message || "OTP sent to your email.")
      return
    }

    setNotice(response.message || "Account created. Please login after verification.")
    setAuthMode("login")
  }

  async function handleVerifyOtp(otp) {
    const response = await verifyOtp(api, otp)
    api.clearTokens()
    setPendingVerificationEmail("")
    setAuthStep("auth")
    setAuthMode("login")
    setNotice(response.message || "Account verified. Please login.")
  }

  async function handleResendOtp() {
    const response = await resendOtp(api)
    setNotice(response.message || "OTP sent to your email.")
  }

  async function handleLogout() {
    try {
      await logout(api)
    } catch {
      // Local sign-out still matters if the remote cookie/token has expired.
    }

    api.clearTokens()
    setUser(null)
    setSelectedVideo(null)
    setVideos([])
    setActiveView("home")
  }

  async function handleUpload(formData) {
    const response = await publishVideo(api, formData)
    setNotice(response.message || "Video uploaded.")
    await loadVideos()
    await loadStudioStats()
    setSelectedVideo(response.data)
    await loadStudioVideos()
  }

  async function handleComment(content) {
    if (!selectedVideo?._id || !content.trim()) return

    try {
      await addVideoComment(api, selectedVideo._id, content)
      await loadComments(selectedVideo._id)
    } catch (error) {
      setNotice(getApiError(error))
    }
  }

  async function handleLike() {
    if (!selectedVideo?._id) return

    try {
      const response = await toggleVideoLike(api, selectedVideo._id)
      setNotice(response.message || "Preference updated.")
      return response.data
    } catch (error) {
      setNotice(getApiError(error))
      return null
    }
  }

  function openHome() {
    setActiveView("home")
    setActiveChannelUsername("")
  }

  function openChannel(username) {
    if (!username) return
    setActiveChannelUsername(username)
    setActiveView("channel")
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"))
  }

  if (authStep === "verify") {
    return (
      <VerifyEmailPage
        email={pendingVerificationEmail}
        notice={notice}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onBackToLogin={() => {
          api.clearTokens()
          setAuthStep("auth")
          setAuthMode("login")
        }}
      />
    )
  }

  if (!isAuthed) {
    return (
      <AuthPage
        authMode={authMode}
        setAuthMode={setAuthMode}
        notice={notice}
        onSubmit={authMode === "login" ? handleLogin : handleRegister}
      />
    )
  }

  return (
    <AuthContext.Provider value={{ api, user, setUser, isAuthed }}>
      <div className={`min-h-screen bg-ink text-white theme-${theme}`}>
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          user={user}
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
          onLogoClick={openHome}
        />

        <main className="min-h-screen lg:pl-72">
          <Navbar
            query={query}
            setQuery={setQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            user={user}
            onLogout={() => setConfirmLogoutOpen(true)}
            onMenu={() => setMobileNavOpen(true)}
            onAvatarClick={() => setActiveView("profile")}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          {notice && <Toast message={notice} onClose={() => setNotice("")} />}

          {activeView === "home" && (
            <HomePage
              videos={videos}
              loading={loading}
              onSelectVideo={loadVideo}
              onOpenChannel={openChannel}
              onRefresh={loadVideos}
              query={query}
            />
          )}

          {activeView === "watch" && (
            <WatchPage
              api={api}
              user={user}
              video={selectedVideo}
              comments={comments}
              onLike={handleLike}
              onComment={handleComment}
              onReloadComments={() => selectedVideo?._id && loadComments(selectedVideo._id)}
              onOpenChannel={openChannel}
              setNotice={setNotice}
            />
          )}

          {activeView === "trending" && (
            <TrendingPage
              videos={trendingVideos}
              loading={loading}
              onSelectVideo={loadVideo}
              onOpenChannel={openChannel}
              onRefresh={loadTrendingVideos}
            />
          )}

          {activeView === "studio" && (
            <UploadPage
              api={api}
              user={user}
              videos={studioVideos}
              stats={studioStats}
              onUpload={handleUpload}
              onChanged={async () => {
                await loadStudioVideos()
                await loadStudioStats()
                await loadVideos()
              }}
            />
          )}

          {activeView === "library" && (
            <LibraryPage api={api} user={user} setNotice={setNotice} onSelectVideo={loadVideo} />
          )}

          {activeView === "profile" && (
            <ProfilePage api={api} user={user} setUser={setUser} setNotice={setNotice} />
          )}

          {activeView === "settings" && (
            <SettingsPage api={api} setUser={setUser} setNotice={setNotice} />
          )}

          {activeView === "channel" && (
            <ChannelPage api={api} user={user} username={activeChannelUsername} setNotice={setNotice} onSelectVideo={loadVideo} onOpenChannel={openChannel} />
          )}
        </main>

        <Modal open={confirmLogoutOpen} onClose={() => setConfirmLogoutOpen(false)}>
          <h2 className="text-xl font-black">Log out?</h2>
          <p className="mt-2 text-white/60">Your current session will end on this device.</p>
          <div className="mt-5 flex justify-end gap-3">
            <button className="border border-line px-4 py-2 font-bold" onClick={() => setConfirmLogoutOpen(false)}>
              Cancel
            </button>
            <button
              className="bg-flame px-4 py-2 font-black text-white"
              onClick={() => {
                setConfirmLogoutOpen(false)
                handleLogout()
              }}
            >
              Log out
            </button>
          </div>
        </Modal>
      </div>
    </AuthContext.Provider>
  )
}

function getUrlForState(state) {
  if (state.view === "watch" && state.videoId) return `/watch/${state.videoId}`
  if (state.view === "channel" && state.channelUsername) return `/channel/${state.channelUsername}`
  if (state.view === "trending") return "/trending"
  if (state.view === "studio") return "/studio"
  if (state.view === "library") return "/library"
  if (state.view === "profile") return "/profile"
  return "/home"
}
