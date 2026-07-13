import { useEffect, useMemo, useState } from 'react'
import ReactDiffViewer from 'react-diff-viewer-continued'
import { fixBugs } from '../services/fixBugsService.js'
import AppHeader from '../components/AppHeader.jsx'
import AppSidebar from '../components/AppSidebar.jsx'
import CodeEditor from '../components/CodeEditor.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import '../styles/app-shell.css'

const languages = ['C++', 'Python', 'Java', 'JavaScript']

const codeSamples = {
  'C++': `#include <iostream>\n\nint main() {\n    std::cout << \"Hello DevMate AI\" << std::endl;\n    return 0;\n}`,
  Python: `def greet(name):\n    return f\"Hello, {name}\"\n\nprint(greet(\"DevMate AI\"))`,
  Java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello DevMate AI\");\n    }\n}`,
  JavaScript: `function greet(name) {\n  return \`Hello, \${name}\`;\n}\n\nconsole.log(greet('DevMate AI'))`,
}

function FixBugs() {
  const [activeLang, setActiveLang] = useState('Python')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme } = useTheme()
  const [code, setCode] = useState(codeSamples.Python)
  const [result, setResult] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setCode(codeSamples[activeLang])
  }, [activeLang])

  const diffContent = useMemo(() => {
    if (!result?.fixedCode) {
      return null
    }

    return {
      oldValue: code,
      newValue: result.fixedCode,
    }
  }, [code, result])

  const handleFix = async () => {
    if (!code.trim()) {
      setErrorMessage('Please enter some code before generating fixes.')
      return
    }

    setIsGenerating(true)
    setErrorMessage('')

    try {
      const response = await fixBugs({ code, language: activeLang })
      const fixData = response?.data?.data

      if (!fixData) {
        throw new Error('The bug-fix service returned an empty response.')
      }

      setResult(fixData)
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Unable to reach the backend. Please make sure the API server is running.'
      setErrorMessage(message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="dashboard-shell">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
        role="presentation"
      />
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
                  disabled={isGenerating}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="workspace-grid">
              <div className="editor-shell">
                <div className="editor-card">
                  <CodeEditor
                    language={activeLang}
                    value={code}
                    onChange={(value) => setCode(value ?? '')}
                    theme={theme}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div className="analysis-shell">
                <div className="assistant-card">
                  <h3>Fix Bugs</h3>
                  <p>DevMate AI will inspect your code, highlight likely issues, and provide a corrected version.</p>
                </div>

                <button type="button" className="generate-button" onClick={handleFix} disabled={isGenerating}>
                  {isGenerating ? <><span className="spinner" aria-hidden="true" />Scanning...</> : 'Fix Bugs'}
                </button>

                {errorMessage ? (
                  <div className="error-banner" role="alert">
                    {errorMessage}
                  </div>
                ) : null}

                {result ? (
                  <div className="result-card">
                    <div className="result-card-header">
                      <h3>Detected issues</h3>
                    </div>
                    <ul className="metric-list">
                      {result.bugsFound?.length ? result.bugsFound.map((item) => <li key={item} className="metric-item">{item}</li>) : <li className="metric-item">No obvious bugs were detected.</li>}
                    </ul>
                    <div className="result-card-header">
                      <h3>Explanation</h3>
                    </div>
                    <p className="result-text">{result.explanation}</p>
                    <div className="result-card-header">
                      <h3>Diff preview</h3>
                    </div>
                    {diffContent ? (
                      <div className="diff-viewer-shell">
                        <ReactDiffViewer
                          oldValue={diffContent.oldValue}
                          newValue={diffContent.newValue}
                          splitView
                          hideLineNumbers={false}
                          useDarkTheme={theme === 'dark'}
                        />
                      </div>
                    ) : null}
                    <div className="result-card-header">
                      <h3>Fixed code</h3>
                    </div>
                    <pre className="markdown-block" style={{ whiteSpace: 'pre-wrap' }}>{result.fixedCode}</pre>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default FixBugs
