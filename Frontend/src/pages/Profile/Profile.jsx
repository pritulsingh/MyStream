import { useState } from "react"
import { Settings } from "lucide-react"
import { Field } from "../../components/Input/Input"
import { Loader } from "../../components/Loader/Loader"
import { Modal } from "../../components/Modal/Modal"
import { updateAccount } from "../../services/userService"
import { getApiError } from "../../utils/errors"

export function ProfilePage({ api, user, setUser, setNotice }) {
  const [saving, setSaving] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  async function updateProfile(event) {
    event.preventDefault()
    setSaving(true)

    try {
      const form = new FormData(event.currentTarget)
      const response = await updateAccount(api, {
        fullName: form.get("fullName"),
        email: form.get("email")
      })
      setUser(response.data)
      setNotice(response.message)
    } catch (error) {
      setNotice(getApiError(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <section className="overflow-hidden border border-line bg-panel">
        <button
          className="block h-52 w-full bg-cover bg-center text-left"
          style={{ backgroundImage: `url(${user?.coverImage || user?.avatar})` }}
          onClick={() => setPreviewImage(user?.coverImage || user?.avatar)}
          aria-label="Preview cover image"
        />
        <div className="p-5">
          <button onClick={() => setPreviewImage(user?.avatar)} aria-label="Preview avatar">
            <img src={user?.avatar} alt="" className="-mt-16 h-28 w-28 border-4 border-panel object-cover" />
          </button>
          <h1 className="mt-4 text-3xl font-black">{user?.fullName}</h1>
          <p className="text-white/54">@{user?.username}</p>
        </div>
      </section>

      <form onSubmit={updateProfile} className="mt-6 max-w-2xl border border-line bg-panel p-5">
        <h2 className="text-xl font-black">Account details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field name="fullName" label="Full name" defaultValue={user?.fullName || ""} required />
          <Field name="email" label="Email" type="email" defaultValue={user?.email || ""} required />
        </div>
        <button disabled={saving} className="mt-5 inline-flex items-center gap-2 bg-white px-5 py-3 font-black text-ink disabled:opacity-60">
          {saving ? <Loader /> : <Settings className="h-5 w-5" />}
          Save changes
        </button>
      </form>

      <Modal open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} className="max-w-4xl">
        <img src={previewImage} alt="" className="max-h-[80vh] w-full object-contain" />
      </Modal>
    </div>
  )
}
