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
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Home', icon: House, to: '/' },
  { label: 'Review', icon: FileCode2, to: '/' },
  { label: 'Explain', icon: BookOpenText, to: '/explain' },
  { label: 'Fix Bugs', icon: Bug, to: '/' },
  { label: 'Optimize', icon: Sparkles, to: '/' },
  { label: 'Convert', icon: ArrowRightLeft, to: '/' },
  { label: 'Docs', icon: BookOpenText, to: '/' },
  { label: 'Tests', icon: FlaskConical, to: '/' },
  { label: 'AI Chat', icon: Bot, to: '/' },
]

function AppSidebar({ isOpen }) {
  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">D</div>
        <span>DevMate</span>
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar navigation">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink key={label} to={to} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
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
