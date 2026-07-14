import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { convertCode } from '../services/convertService.js'
import AppHeader from '../components/AppHeader.jsx'
import AppSidebar from '../components/AppSidebar.jsx'
import CodeEditor from '../components/CodeEditor.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import '../styles/app-shell.css'

const languages = ['Python', 'JavaScript', 'Java', 'C++']

const codeSamples = {
  Python: `def greet(name):
    return f"Hello, {name}"

print(greet("DevMate AI"))`,
  JavaScript: `function greet(name) {
  return \`Hello, \${name}\`;
}

console.log(greet('DevMate AI'))`,
  Java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello DevMate AI");
    }
}`,
  'C++': `#include <iostream>\n\nint main() {\n    std::cout << "Hello DevMate AI" << std::endl;\n    return 0;\n}`,
}

function Convert() {
  const [sourceLanguage, setSourceLanguage] = useState('Python')
  const [targetLanguage, setTargetLanguage] = useState('JavaScript')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme } = useTheme()
  const [code, setCode] = useState(codeSamples.Python)
  const [convertedCode, setConvertedCode] = useState('')
  const [notes, setNotes] = useState([])
  const [isConverting, setIsConverting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setCode(codeSamples[sourceLanguage])
  }, [sourceLanguage])

  const markdownBody = useMemo(() => {
    if (!notes.length) {
      return 'Your conversion notes will appear here with the main changes and caveats.'
    }

    return notes.map((note) => `- ${note}`).join('\n')
  }, [notes])

  const handleConvert = async () => {
    if (!code.trim()) {
      setErrorMessage('Please enter some code before converting it.')
      return
    }

    setIsConverting(true)
    setErrorMessage('')

    try {
      const response = await convertCode({ code, language: sourceLanguage, targetLanguage })
      const conversionData = response?.data?.data

      if (!conversionData?.convertedCode) {
        throw new Error('The conversion service returned an empty response.')
      }

      setConvertedCode(conversionData.convertedCode)
      setNotes(Array.isArray(conversionData.notes) ? conversionData.notes : [])
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Unable to reach the backend. Please make sure the API server is running.'
      setErrorMessage(message)
    } finally {
      setIsConverting(false)
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
            <div className="workspace-grid">
              <div className="editor-shell">
                <div className="assistant-card">
                  <h3>Convert Language</h3>
                  <p>Translate your code between supported languages and review the main differences.</p>
                </div>

                <div className="convert-controls">
                  <label className="convert-control">
                    <span>Source</span>
                    <select value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)} disabled={isConverting}>
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="convert-control">
                    <span>Target</span>
                    <select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} disabled={isConverting}>
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="editor-card">
                  <CodeEditor language={sourceLanguage} value={code} onChange={(value) => setCode(value ?? '')} theme={theme} disabled={isConverting} />
                </div>
              </div>

              <div className="analysis-shell">
                <button type="button" className="generate-button" onClick={handleConvert} disabled={isConverting}>
                  {isConverting ? <><span className="spinner" aria-hidden="true" />Converting...</> : 'Convert Code'}
                </button>

                {errorMessage ? (
                  <div className="error-banner" role="alert">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="result-card">
                  <div className="result-card-header">
                    <h3>Converted code</h3>
                  </div>
                  <div className="code-output-shell">
                    <CodeEditor
                      language={targetLanguage}
                      value={convertedCode || ''}
                      onChange={() => {}}
                      theme={theme}
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="result-card">
                  <div className="result-card-header">
                    <h3>Notes</h3>
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

export default Convert
