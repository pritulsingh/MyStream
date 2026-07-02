export function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="border border-line bg-panel p-5">
      <Icon className="h-6 w-6 text-aqua" />
      <p className="mt-4 text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm font-semibold text-white/50">{label}</p>
    </div>
  )
}

export function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="border border-white/14 bg-black/22 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-aqua" />
      <p className="mt-3 text-2xl font-black">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">{label}</p>
    </div>
  )
}
