import { useState } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import AppSidebar from '../components/AppSidebar.jsx'
import '../styles/app-shell.css'

const languages = ['C++', 'Python', 'Java', 'JavaScript']
const resultCards = [
  { title: 'Score', value: '92/100' },
  { title: 'Bugs', value: '3 minor issues' },
  { title: 'Performance', value: 'Optimized' },
  { title: 'Security', value: 'Secure' },
  { title: 'Suggestions', value: '5 actionable tips' },
  { title: 'Improved Code', value: 'Ready to review' },
]

function Home() {
  const [activeLang, setActiveLang] = useState('Python')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="dashboard-shell">
      <AppSidebar isOpen={sidebarOpen} />

      <div className="dashboard-main">
        <AppHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="workspace-content">
          <section className="panel">
            <div className="language-tabs" role="tablist" aria-label="Programming languages">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`lang-tab ${activeLang === lang ? 'active' : ''}`}
                  onClick={() => setActiveLang(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="editor-card">
              <div className="editor-placeholder">
                Monaco Editor will be placed here soon.
              </div>
            </div>

            <button type="button" className="generate-button">
              Generate
            </button>

            <div className="result-grid">
              {resultCards.map((item) => (
                <div key={item.title} className="result-card">
                  <h3>{item.title}</h3>
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Home
