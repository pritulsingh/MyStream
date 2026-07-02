import { useState } from "react"
import { ChevronRight, Flame, Play, ShieldCheck, Sparkles, Video } from "lucide-react"
import { Field, FileField } from "../../components/Input/Input"
import { Loader } from "../../components/Loader/Loader"
import { StatPill } from "../../components/Cards/MetricCard"
import { classNames } from "../../utils/classNames"
import { getApiError } from "../../utils/errors"

export function AuthPage({ authMode, setAuthMode, notice, onSubmit }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function submit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const validationError = validateAuthForm(formData, authMode)

    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError("")

    try {
      await onSubmit(formData)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white">
      <section className="relative grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hero-media relative flex min-h-[46vh] items-end px-6 py-8 sm:px-10 lg:min-h-screen lg:px-14">
          <div className="relative z-10 max-w-2xl pb-8">
            <div className="mb-5 inline-flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur">
              <Sparkles className="h-4 w-4 text-gold" />
              Creator-first video streaming
            </div>
            <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-normal sm:text-7xl">MyStream</h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-white/78">
              Discover channels, publish stories, and keep your watch flow sharp in a fast modern interface.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              <StatPill icon={Video} label="Clips" value="HD" />
              <StatPill icon={ShieldCheck} label="Auth" value="JWT" />
              <StatPill icon={Flame} label="Live API" value="Render" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-8 sm:px-8">
          <form onSubmit={submit} className="w-full max-w-md border border-line bg-panel/95 p-6 shadow-glow backdrop-blur sm:p-8">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-aqua">
                  {authMode === "login" ? "Sign in" : "Create account"}
                </p>
                <h2 className="mt-2 text-3xl font-black">{authMode === "login" ? "Welcome back" : "Join MyStream"}</h2>
                <p className="mt-2 text-sm text-white/52">
                  {authMode === "login" ? "Use your email or username to continue." : "Create your channel with verified profile images."}
                </p>
              </div>
              <div className="grid h-12 w-12 place-items-center bg-flame text-white">
                <Play className="h-6 w-6 fill-current" />
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 border border-line bg-ink p-1">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={classNames("px-3 py-2 text-sm font-bold", authMode === "login" && "bg-white text-ink")}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={classNames("px-3 py-2 text-sm font-bold", authMode === "register" && "bg-white text-ink")}
              >
                Register
              </button>
            </div>

            <div className="space-y-4">
              {authMode === "register" && (
                <>
                  <Field name="fullName" label="Full name" required minLength="2" maxLength="60" />
                  <Field name="username" label="Username" required minLength="3" maxLength="30" />
                </>
              )}
              {authMode === "login" ? (
                <Field name="loginIdentifier" label="Email or username" required />
              ) : (
                <Field name="email" label="Email" type="email" required />
              )}
              <Field name="password" label="Password" type="password" required minLength="6" maxLength="72" />
              {authMode === "register" && (
                <>
                  <FileField name="avatar" label="Avatar" required />
                  <FileField name="coverImage" label="Cover image" />
                </>
              )}
            </div>

            {(error || notice) && (
              <p className={classNames("mt-5 border px-4 py-3 text-sm", error ? "border-flame/50 bg-flame/10 text-red-100" : "border-aqua/40 bg-aqua/10 text-aqua")}>
                {error || notice}
              </p>
            )}

            <button
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-flame px-5 py-3 font-black text-white transition hover:bg-[#ff6e54] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Loader /> : <ChevronRight className="h-5 w-5" />}
              {authMode === "login" ? "Enter MyStream" : "Create account"}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

function validateAuthForm(formData, authMode) {
  const password = String(formData.get("password") || "")

  if (password.length < 6) return "Password must be at least 6 characters."
  if (password.length > 72) return "Password must be 72 characters or fewer."

  if (authMode === "login") {
    const identifier = String(formData.get("loginIdentifier") || "").trim()
    if (!identifier) return "Enter your email or username."
    if (identifier.includes("@") && !isValidEmail(identifier)) return "Enter a valid email address."
    if (!identifier.includes("@") && !isValidUsername(identifier)) {
      return "Username can use letters, numbers, dots, and underscores only."
    }
    return ""
  }

  const fullName = String(formData.get("fullName") || "").trim()
  const username = String(formData.get("username") || "").trim()
  const email = String(formData.get("email") || "").trim()

  if (fullName.length < 2) return "Full name must be at least 2 characters."
  if (!isValidUsername(username)) return "Username must be 3-30 characters and use letters, numbers, dots, or underscores."
  if (!isValidEmail(email)) return "Enter a valid email address."
  if (!formData.get("avatar")?.name) return "Avatar image is required."

  return ""
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

function isValidUsername(value) {
  return /^[a-zA-Z0-9._]{3,30}$/.test(value)
}
