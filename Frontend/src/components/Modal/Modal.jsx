export function Modal({ children, open, onClose, className = "max-w-lg" }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onMouseDown={onClose}>
      <div className={`w-full border border-line bg-panel p-5 ${className}`} onMouseDown={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
