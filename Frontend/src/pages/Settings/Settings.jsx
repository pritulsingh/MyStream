import { useEffect, useState } from "react"
import { Activity, Image, KeyRound, Settings, Upload } from "lucide-react"
import { Field, FileField } from "../../components/Input/Input"
import { Loader } from "../../components/Loader/Loader"
import { changePassword, healthcheck, updateAvatar, updateCoverImage } from "../../services/userService"
import { getApiError } from "../../utils/errors"

export function SettingsPage({ api, setUser, setNotice }) {
  const [busy, setBusy] = useState("")
  const [health, setHealth] = useState("Checking...")

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await healthcheck(api)
        setHealth(response.message || "Backend is reachable")
      } catch (error) {
        setHealth(getApiError(error))
      }
    }

    checkHealth()
  }, [api])

  async function submitPassword(event) {
    event.preventDefault()
    setBusy("password")
    try {
      const form = new FormData(event.currentTarget)
      const response = await changePassword(api, {
        oldPassword: form.get("oldPassword"),
        newPassword: form.get("newPassword")
      })
      event.currentTarget.reset()
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    } finally {
      setBusy("")
    }
  }

  async function submitImage(event, type) {
    event.preventDefault()
    setBusy(type)
    try {
      const formData = new FormData(event.currentTarget)
      const response = type === "avatar" ? await updateAvatar(api, formData) : await updateCoverImage(api, formData)
      setUser(response.data)
      event.currentTarget.reset()
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    } finally {
      setBusy("")
    }
  }

  return (
    <div className="grid gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[1fr_1fr]">
      <section className="border border-line bg-panel p-6">
        <div className="mb-5 flex items-center gap-3">
          <KeyRound className="h-5 w-5 text-aqua" />
          <h1 className="text-xl font-black">Password</h1>
        </div>
        <form onSubmit={submitPassword} className="space-y-4">
          <Field name="oldPassword" label="Current password" type="password" required />
          <Field name="newPassword" label="New password" type="password" required minLength="6" maxLength="72" />
          <button disabled={busy === "password"} className="inline-flex items-center gap-2 bg-white px-5 py-3 font-black text-ink disabled:opacity-60">
            {busy === "password" ? <Loader /> : <Settings className="h-5 w-5" />}
            Update password
          </button>
        </form>
      </section>

      <section className="border border-line bg-panel p-6">
        <div className="mb-5 flex items-center gap-3">
          <Image className="h-5 w-5 text-aqua" />
          <h1 className="text-xl font-black">Profile images</h1>
        </div>
        <div className="grid gap-5">
          <form onSubmit={(event) => submitImage(event, "avatar")} className="space-y-4">
            <FileField name="avatar" label="Avatar" required />
            <button disabled={busy === "avatar"} className="inline-flex items-center gap-2 border border-line px-5 py-3 font-black disabled:opacity-60">
              {busy === "avatar" ? <Loader /> : <Upload className="h-5 w-5" />}
              Update avatar
            </button>
          </form>
          <form onSubmit={(event) => submitImage(event, "cover")} className="space-y-4">
            <FileField name="coverImage" label="Cover image" required />
            <button disabled={busy === "cover"} className="inline-flex items-center gap-2 border border-line px-5 py-3 font-black disabled:opacity-60">
              {busy === "cover" ? <Loader /> : <Upload className="h-5 w-5" />}
              Update cover
            </button>
          </form>
        </div>
      </section>

      <section className="border border-line bg-panel p-6 xl:col-span-2">
        <div className="mb-3 flex items-center gap-3">
          <Activity className="h-5 w-5 text-aqua" />
          <h1 className="text-xl font-black">Backend health</h1>
        </div>
        <p className="text-white/60">{health}</p>
      </section>
    </div>
  )
}
