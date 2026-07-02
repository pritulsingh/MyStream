export function formatDuration(seconds = 0) {
  if (!Number.isFinite(seconds)) return "0:00"

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0")

  return `${mins}:${secs}`
}

export function formatCount(value = 0) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value)
}
