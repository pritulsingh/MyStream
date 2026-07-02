import { Loader2 } from "lucide-react"
import { classNames } from "../../utils/classNames"

export function Loader({ className = "" }) {
  return <Loader2 className={classNames("h-5 w-5 animate-spin", className)} />
}

export function Skeleton({ className = "" }) {
  return <div className={classNames("animate-pulse bg-white/8", className)} />
}
