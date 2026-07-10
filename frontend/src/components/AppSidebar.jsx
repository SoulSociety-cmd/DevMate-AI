import {
  Bot,
  BookOpenText,
  Bug,
  FileCode2,
  FlaskConical,
  House,
  MessageSquareText,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react'

const navItems = [
  { label: 'Home', icon: House, active: true },
  { label: 'Review', icon: FileCode2 },
  { label: 'Explain', icon: BookOpenText },
  { label: 'Fix Bugs', icon: Bug },
  { label: 'Optimize', icon: Sparkles },
  { label: 'Convert', icon: ArrowRightLeft },
  { label: 'Docs', icon: BookOpenText },
  { label: 'Tests', icon: FlaskConical },
  { label: 'AI Chat', icon: Bot },
]

function AppSidebar({ isOpen }) {
  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">D</div>
        <span>DevMate</span>
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar navigation">
        {navItems.map(({ label, icon: Icon, active }) => (
          <button key={label} type="button" className={`sidebar-item ${active ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <MessageSquareText size={18} />
        <span>Need help?</span>
      </div>
    </aside>
  )
}

export default AppSidebar
