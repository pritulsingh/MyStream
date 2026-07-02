import { useState } from "react"
import { MailCheck, RefreshCcw, ShieldCheck } from "lucide-react"
import { Loader } from "../../components/Loader/Loader"
import { getApiError } from "../../utils/errors"

export function VerifyEmailPage({ email, onVerify, onResend, onBackToLogin, notice }) {
  const [otp, setOtp] = useState("")
  const [busy, setBusy] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")

  async function submit(event) {
    event.preventDefault()
    const normalizedOtp = otp.trim()

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError("Enter the 6-digit OTP sent to your email.")
      return
    }

    setBusy(true)
    setError("")
    try {
      await onVerify(normalizedOtp)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setResending(true)
    setError("")
    try {
      await onResend()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5 text-white">
      <section className="w-full max-w-md border border-line bg-panel p-6 shadow-glow sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-aqua">Verify email</p>
            <h1 className="mt-2 text-3xl font-black">Check your inbox</h1>
            <p className="mt-2 text-sm leading-6 text-white/56">
              Enter the OTP sent to {email || "your registered email"}.
            </p>
          </div>
          <div className="grid h-12 w-12 place-items-center bg-flame text-white">
            <MailCheck className="h-6 w-6" />
          </div>
        </div>

        <form onSubmit={submit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/70">6-digit OTP</span>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              className="w-full border border-line bg-ink px-4 py-3 text-center text-2xl font-black tracking-[0.35em] text-white outline-none focus:border-aqua"
            />
          </label>

          {(error || notice) && (
            <p className={`mt-5 border px-4 py-3 text-sm ${error ? "border-flame/50 bg-flame/10 text-red-100" : "border-aqua/40 bg-aqua/10 text-aqua"}`}>
              {error || notice}
            </p>
          )}

          <button disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 bg-flame px-5 py-3 font-black text-white disabled:opacity-70">
            {busy ? <Loader /> : <ShieldCheck className="h-5 w-5" />}
            Verify account
          </button>
        </form>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button disabled={resending} onClick={resend} className="inline-flex items-center justify-center gap-2 border border-line px-4 py-3 font-bold text-white hover:border-aqua disabled:opacity-60">
            {resending ? <Loader /> : <RefreshCcw className="h-4 w-4" />}
            Resend OTP
          </button>
          <button onClick={onBackToLogin} className="border border-line px-4 py-3 font-bold text-white/70 hover:text-white">
            Back to login
          </button>
        </div>
      </section>
    </main>
  )
}
