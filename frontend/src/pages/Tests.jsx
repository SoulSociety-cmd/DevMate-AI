import { useMemo, useState } from 'react'
import { Copy, Download } from 'lucide-react'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import AppHeader from '../components/AppHeader.jsx'
import AppSidebar from '../components/AppSidebar.jsx'
import CodeEditor from '../components/CodeEditor.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import '../styles/app-shell.css'
import { generateTests } from '../services/testsService.js'

const languages = ['Python', 'JavaScript', 'Java', 'C++']
const frameworkOptions = {
  Python: ['Pytest', 'Unittest'],
  JavaScript: ['Jest', 'Vitest'],
  Java: ['JUnit', 'TestNG'],
  'C++': ['Catch2', 'GoogleTest'],
}

const codeSamples = {
  Python: `def add(a, b):\n    return a + b`,
  JavaScript: `function add(a, b) {\n  return a + b\n}`,
  Java: `public class Calculator {\n  public int add(int a, int b) {\n    return a + b;\n  }\n}`,
  'C++': `int add(int a, int b) {\n  return a + b;\n}`,
}

function Tests() {
  const [activeLang, setActiveLang] = useState('Python')
  const [framework, setFramework] = useState('Pytest')
  const [code, setCode] = useState(codeSamples.Python)
  const [testCode, setTestCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const availableFrameworks = useMemo(() => frameworkOptions[activeLang] || ['Jest'], [activeLang])
  const highlightedTestCode = useMemo(() => {
    if (!testCode) {
      return ''
    }

    const normalizedLanguage = activeLang.toLowerCase()
    const language = normalizedLanguage === 'c++' ? 'cpp' : normalizedLanguage
    const result = hljs.highlightAuto(testCode, [language])
    return result.value
  }, [activeLang, testCode])

  const handleLanguageChange = (nextLang) => {
    setActiveLang(nextLang)
    setCode(codeSamples[nextLang])
    const nextFramework = frameworkOptions[nextLang]?.[0] || 'Jest'
    setFramework(nextFramework)
  }

  const handleGenerateTests = async () => {
    if (!code.trim()) {
      setErrorMessage('Please enter some code before generating tests.')
      return
    }

    setIsGenerating(true)
    setErrorMessage('')

    try {
      const response = await generateTests({ code, language: activeLang, testFramework: framework })
      const generatedCode = response?.testCode || response?.data?.testCode || ''
      const generatedFramework = response?.framework || response?.data?.framework || framework

      if (!generatedCode) {
        throw new Error('The tests service returned an empty response.')
      }

      setTestCode(generatedCode)
      setFramework(generatedFramework)
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Unable to reach the backend. Please make sure the API server is running.'
      setErrorMessage(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!testCode) {
      return
    }

    try {
      await navigator.clipboard.writeText(testCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setErrorMessage('Unable to copy the generated test code.')
    }
  }

  const handleDownload = () => {
    if (!testCode) {
      return
    }

    const blob = new Blob([testCode], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeLang.toLowerCase()}-${framework.toLowerCase()}-tests.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="dashboard-shell">
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} role="presentation" />
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
                  onClick={() => handleLanguageChange(lang)}
                  disabled={isGenerating}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="workspace-grid">
              <div className="editor-shell">
                <div className="editor-card">
                  <CodeEditor language={activeLang} value={code} onChange={(value) => setCode(value ?? '')} theme={theme} disabled={isGenerating} />
                </div>
              </div>

              <div className="analysis-shell">
                <div className="assistant-card">
                  <h3>Generate Unit Tests</h3>
                  <p>Create test cases for your snippet with a framework suited to your language.</p>
                </div>

                <div className="convert-controls">
                  <label className="convert-control">
                    <span>Framework</span>
                    <select value={framework} onChange={(event) => setFramework(event.target.value)}>
                      {availableFrameworks.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <button type="button" className="generate-button" onClick={handleGenerateTests} disabled={isGenerating}>
                  {isGenerating ? <><span className="spinner" aria-hidden="true" />Generating...</> : 'Generate Unit Tests'}
                </button>

                {errorMessage ? <div className="error-banner" role="alert">{errorMessage}</div> : null}

                <div className="result-card">
                  <div className="result-card-header">
                    <h3>Generated test code</h3>
                    <div className="result-card-actions">
                      <button type="button" className="result-action-btn" onClick={handleCopy} disabled={!testCode || isGenerating}>
                        <Copy size={14} /> Copy
                      </button>
                      <button type="button" className="result-action-btn" onClick={handleDownload} disabled={!testCode || isGenerating}>
                        <Download size={14} /> Download
                      </button>
                    </div>
                  </div>
                  <div className="code-output-shell">
                    {testCode ? (
                      <pre><code dangerouslySetInnerHTML={{ __html: highlightedTestCode }} /></pre>
                    ) : (
                      <p className="result-text">Your generated tests will appear here with syntax-highlighted output.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {copied ? <div className="copy-toast visible">Copied to clipboard</div> : null}
    </div>
  )
}

export default Tests
