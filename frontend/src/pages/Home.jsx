import { useEffect, useState } from 'react'
import MonacoEditor from '@monaco-editor/react'
import AppHeader from '../components/AppHeader.jsx'
import AppSidebar from '../components/AppSidebar.jsx'
import '../styles/app-shell.css'

const languages = ['C++', 'Python', 'Java', 'JavaScript']
const languageMap = {
  'C++': 'cpp',
  Python: 'python',
  Java: 'java',
  JavaScript: 'javascript',
}

const codeSamples = {
  'C++': `#include <iostream>\n\nint main() {\n    std::cout << "Hello DevMate AI" << std::endl;\n    return 0;\n}`,
  Python: `def greet(name):\n    return f"Hello, {name}"\n\nprint(greet("DevMate AI"))`,
  Java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello DevMate AI");\n    }\n}`,
  JavaScript: `function greet(name) {\n  return \`Hello, \${name}\`;\n}\n\nconsole.log(greet('DevMate AI'))`,
}

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
  const [code, setCode] = useState(codeSamples.Python)

  useEffect(() => {
    setCode(codeSamples[activeLang])
  }, [activeLang])

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
              <div className="editor-toolbar">
                <span>{activeLang} Editor</span>
                <span className="editor-pill">AI-ready</span>
              </div>
              <MonacoEditor
                height="320px"
                language={languageMap[activeLang]}
                value={code}
                theme="vs-dark"
                onChange={(value) => setCode(value ?? '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                }}
              />
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
