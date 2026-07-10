import { Menu, MoonStar, SunMedium } from 'lucide-react'

function AppHeader({ onToggleSidebar }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="icon-button mobile-only"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="brand">
          <div className="brand-mark">D</div>
          <div>
            <h1>DevMate AI</h1>
            <p>AI coding workspace</p>
          </div>
        </div>
      </div>

      <button type="button" className="theme-toggle" aria-label="Theme toggle">
        <MoonStar size={16} />
        <span>Dark / Light</span>
        <SunMedium size={16} />
      </button>
    </header>
  )
}

export default AppHeader
