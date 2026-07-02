import { classNames } from "../../utils/classNames"

export function Button({ children, className = "", variant = "primary", icon: Icon, ...props }) {
  const variants = {
    primary: "bg-flame text-white hover:bg-[#ff6e54]",
    secondary: "border border-line bg-panel text-white hover:border-aqua",
    light: "bg-white text-ink",
    icon: "grid place-items-center border border-line bg-panel text-white"
  }

  return (
    <button
      className={classNames(
        "inline-flex items-center justify-center gap-2 px-5 py-3 font-black transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        variant === "icon" && "h-12 w-12 px-0 py-0",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </button>
  )
}
