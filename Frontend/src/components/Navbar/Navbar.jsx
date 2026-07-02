import { LogOut, Menu, Moon, Search, Sun } from "lucide-react"
import { Button } from "../Button/Button"

export function Navbar({ query, setQuery, sortBy, setSortBy, user, onLogout, onMenu, onAvatarClick, theme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/88 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <button className="grid h-11 w-11 place-items-center border border-line lg:hidden" onClick={onMenu} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-[220px] flex-1">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/42" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search videos"
              className="h-12 w-full border border-line bg-panel pl-12 pr-4 text-white outline-none focus:border-aqua"
            />
          </label>
        </div>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="h-12 border border-line bg-panel px-4 font-semibold text-white outline-none focus:border-aqua"
          aria-label="Sort videos"
        >
          <option value="createdAt">Newest</option>
          <option value="views">Most viewed</option>
          <option value="duration">Duration</option>
          <option value="title">Title</option>
        </select>

        <Button variant="icon" aria-label="Toggle theme" onClick={onToggleTheme}>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="icon" onClick={onLogout} aria-label="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
        <button onClick={onAvatarClick} aria-label="Open profile">
          <img src={user?.avatar} alt="" className="h-12 w-12 object-cover" />
        </button>
      </div>
    </header>
  )
}
