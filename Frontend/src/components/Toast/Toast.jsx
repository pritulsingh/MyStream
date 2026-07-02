import { CheckCircle2, X } from "lucide-react"

export function Toast({ message, onClose }) {
  return (
    <div className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 border border-line bg-panel p-4 shadow-glow">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-aqua" />
      <p className="text-sm text-white/80">{message}</p>
      <button onClick={onClose} className="ml-auto text-white/50 hover:text-white" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
