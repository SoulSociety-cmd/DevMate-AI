import { useEffect, useMemo, useState } from 'react'
import ReactDiffViewer from 'react-diff-viewer-continued'
import { optimizeCode } from '../services/optimizeService.js'
import AppHeader from '../components/AppHeader.jsx'
import AppSidebar from '../components/AppSidebar.jsx'
import CodeEditor from '../components/CodeEditor.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import '../styles/app-shell.css'

const languages = ['C++', 'Python', 'Java', 'JavaScript']

const codeSamples = {
  'C++': `#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> arr = {1, 2, 3, 4, 5};\n    for (int i = 0; i < arr.size(); i++) {\n        std::cout << arr[i] << \" \";\n    }\n    return 0;\n}`,
  Python: `def fibonacci(n):\n    result = []\n    for i in range(n):\n        if i == 0:\n            result.append(0)\n        elif i == 1:\n            result.append(1)\n        else:\n            result.append(result[i-1] + result[i-2])\n    return result\n\nprint(fibonacci(10))`,
  Java: `public class Calculator {\n    public static int sum(int[] arr) {\n        int sum = 0;\n        for (int i = 0; i < arr.length; i++) {\n            sum = sum + arr[i];\n        }\n        return sum;\n    }\n}`,
  JavaScript: `function findMax(arr) {\n    let max = arr[0];\n    for (let i = 0; i < arr.length; i++) {\n        if (arr[i] > max) {\n            max = arr[i];\n        }\n    }\n    return max;\n}`,
}

function Optimize() {
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
    if (!result?.optimizedCode) {
      return null
    }

    return {
      oldValue: code,
      newValue: result.optimizedCode,
    }
  }, [code, result])

  const handleOptimize = async () => {
    if (!code.trim()) {
      setErrorMessage('Please enter some code before generating optimizations.')
      return
    }

    setIsGenerating(true)
    setErrorMessage('')

    try {
      const response = await optimizeCode({ code, language: activeLang })
      const optimizeData = response?.data?.data

      if (!optimizeData) {
        throw new Error('The optimize service returned an empty response.')
      }

      setResult(optimizeData)
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
                  <h3>Optimize Code</h3>
                  <p>DevMate AI will analyze your code and provide optimized version with performance improvements and best practices.</p>
                </div>

                <button type="button" className="generate-button" onClick={handleOptimize} disabled={isGenerating}>
                  {isGenerating ? <><span className="spinner" aria-hidden="true" />Optimizing...</> : 'Optimize'}
                </button>

                {errorMessage ? (
                  <div className="error-banner" role="alert">
                    {errorMessage}
                  </div>
                ) : null}

                {result ? (
                  <div className="result-card">
                    <div className="result-card-header">
                      <h3>Performance Gain</h3>
                    </div>
                    <p className="result-text">{result.performanceGain}</p>
                    
                    <div className="result-card-header">
                      <h3>Improvements</h3>
                    </div>
                    <ul className="metric-list">
                      {result.improvements?.length ? result.improvements.map((item) => <li key={item} className="metric-item">✓ {item}</li>) : <li className="metric-item">No improvements available.</li>}
                    </ul>
                    
                    <div className="result-card-header">
                      <h3>Diff Preview</h3>
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
                      <h3>Optimized Code</h3>
                    </div>
                    <pre className="markdown-block" style={{ whiteSpace: 'pre-wrap' }}>{result.optimizedCode}</pre>
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

export default Optimize
