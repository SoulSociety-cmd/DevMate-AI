import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { explainCode } from '../services/explainService.js'
import AppHeader from '../components/AppHeader.jsx'
import AppSidebar from '../components/AppSidebar.jsx'
import CodeEditor from '../components/CodeEditor.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import '../styles/app-shell.css'

const languages = ['C++', 'Python', 'Java', 'JavaScript']

const codeSamples = {
  'C++': `#include <iostream>\n\nint main() {\n    std::cout << "Hello DevMate AI" << std::endl;\n    return 0;\n}`,
  Python: `def greet(name):\n    return f"Hello, {name}"\n\nprint(greet("DevMate AI"))`,
  Java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello DevMate AI");\n    }\n}`,
  JavaScript: `function greet(name) {\n  return \`Hello, \${name}\`;\n}\n\nconsole.log(greet('DevMate AI'))`,
}

function Explain() {
  const [activeLang, setActiveLang] = useState('Python')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme } = useTheme()
  const [code, setCode] = useState(codeSamples.Python)
  const [explanation, setExplanation] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setCode(codeSamples[activeLang])
  }, [activeLang])

  const markdownBody = useMemo(() => explanation || 'Your explanation will appear here in a beginner-friendly format.', [explanation])

  const handleExplain = async () => {
    if (!code.trim()) {
      setErrorMessage('Please enter some code before generating an explanation.')
      return
    }

    setIsGenerating(true)
    setErrorMessage('')

    try {
      const response = await explainCode({ code, language: activeLang })
      const explanationData = response?.data?.data

      if (!explanationData?.explanation) {
        throw new Error('The explanation service returned an empty response.')
      }

      setExplanation(explanationData.explanation)
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
                  <h3>Explain Code</h3>
                  <p>DevMate AI will break down your code step by step in simple language for beginners.</p>
                </div>

                <button type="button" className="generate-button" onClick={handleExplain} disabled={isGenerating}>
                  {isGenerating ? <><span className="spinner" aria-hidden="true" />Explaining...</> : 'Explain Code'}
                </button>

                {errorMessage ? (
                  <div className="error-banner" role="alert">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="result-card">
                  <div className="result-card-header">
                    <h3>Step-by-step explanation</h3>
                  </div>
                  <div className="markdown-block">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {markdownBody}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Explain
