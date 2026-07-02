export function Field({ label, name, type = "text", required = false, defaultValue = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/70">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        {...props}
        className="w-full border border-line bg-ink px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-aqua"
      />
    </label>
  )
}

export function FileField({ label, name, required = false, accept = "image/*" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/70">{label}</span>
      <input
        name={name}
        type="file"
        accept={accept}
        required={required}
        className="w-full cursor-pointer border border-line bg-ink px-4 py-3 text-sm text-white file:mr-3 file:border-0 file:bg-white file:px-3 file:py-2 file:font-bold file:text-ink"
      />
    </label>
  )
}
