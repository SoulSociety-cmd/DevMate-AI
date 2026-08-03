import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { generateDocs } from '../services/docsService.js'
import AppHeader from '../components/AppHeader.jsx'
import AppSidebar from '../components/AppSidebar.jsx'
import CodeEditor from '../components/CodeEditor.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import '../styles/app-shell.css'

const languages = ['C++', 'Python', 'Java', 'JavaScript']

const codeSamples = {
  'C++': `#include <iostream>\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    std::cout << add(2, 3) << std::endl;\n    return 0;\n}`,
  Python: `def add(a, b):\n    return a + b\n\nprint(add(2, 3))`,
  Java: `public class Main {\n    public static int add(int a, int b) {\n        return a + b;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(add(2, 3));\n    }\n}`,
  JavaScript: `function add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(2, 3))`,
}

function Docs() {
  const [activeLang, setActiveLang] = useState('Python')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme } = useTheme()
  const [code, setCode] = useState(codeSamples.Python)
  const [documentation, setDocumentation] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setCode(codeSamples[activeLang])
  }, [activeLang])

  const markdownBody = useMemo(() => {
    if (documentation) {
      return documentation
    }
    return 'Your generated documentation will appear here after you submit the code sample.'
  }, [documentation])

  const handleDownloadMarkdown = () => {
    if (!documentation) {
      return
    }

    const blob = new Blob([documentation], { type: 'text/markdown;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'documentation.md'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleGenerate = async () => {
    if (!code.trim()) {
      setErrorMessage('Please enter some code before generating documentation.')
      return
    }

    setIsGenerating(true)
    setErrorMessage('')

    try {
      const response = await generateDocs({ code, language: activeLang })
      const documentationText = response?.data?.documentation

      if (!documentationText) {
        throw new Error('The documentation service returned an empty response.')
      }

      setDocumentation(documentationText)
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
                <div className="assistant-card">
                  <h3>Generate Documentation</h3>
                  <p>Produce markdown docs with Description, Parameters, Return Value, and Example for your code.</p>
                </div>

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
                <button type="button" className="generate-button" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? <><span className="spinner" aria-hidden="true" />Generating...</> : 'Generate Docs'}
                </button>

                {errorMessage ? (
                  <div className="error-banner" role="alert">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="result-card">
                  <div className="result-card-header">
                    <h3>Generated documentation</h3>
                    <button type="button" className="secondary-button" onClick={handleDownloadMarkdown} disabled={!documentation}>
                      Download .md
                    </button>
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

export default Docs
