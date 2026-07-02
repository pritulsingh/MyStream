import { Play, X } from "lucide-react"
import { navItems } from "../../routes/navItems"
import { classNames } from "../../utils/classNames"

export function Sidebar({ activeView, setActiveView, user, mobileNavOpen, setMobileNavOpen, onLogoClick }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-line bg-panel/95 px-5 py-6 backdrop-blur lg:block">
        <SidebarContent activeView={activeView} setActiveView={setActiveView} user={user} onLogoClick={onLogoClick} />
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 lg:hidden">
          <aside className="h-full w-80 max-w-[86vw] border-r border-line bg-panel px-5 py-6">
            <button
              className="mb-5 grid h-10 w-10 place-items-center border border-line"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              activeView={activeView}
              setActiveView={(view) => {
                setActiveView(view)
                setMobileNavOpen(false)
              }}
              user={user}
              onLogoClick={() => {
                onLogoClick()
                setMobileNavOpen(false)
              }}
            />
          </aside>
        </div>
      )}
    </>
  )
}

function SidebarContent({ activeView, setActiveView, user, onLogoClick }) {
  return (
    <div className="flex h-full flex-col">
      <button className="mb-8 flex items-center gap-3 text-left" onClick={onLogoClick}>
        <div className="grid h-11 w-11 place-items-center bg-flame">
          <Play className="h-5 w-5 fill-current" />
        </div>
        <div>
          <p className="text-xl font-black">MyStream</p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Studio</p>
        </div>
      </button>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={classNames(
                "flex w-full items-center gap-3 px-4 py-3 text-left font-bold transition",
                activeView === item.id ? "bg-white text-ink" : "text-white/72 hover:bg-white/8 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto border border-line bg-ink p-4">
        <img src={user?.avatar} alt="" className="h-14 w-14 object-cover" />
        <p className="mt-3 font-black">{user?.fullName || "Creator"}</p>
        <p className="text-sm text-white/52">@{user?.username}</p>
      </div>
    </div>
  )
}
