import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { reviewCode } from '../services/reviewService.js'
import AppHeader from '../components/AppHeader.jsx'
import AppSidebar from '../components/AppSidebar.jsx'
import CodeEditor from '../components/CodeEditor.jsx'
import '../styles/app-shell.css'

const languages = ['C++', 'Python', 'Java', 'JavaScript']

const codeSamples = {
  'C++': `#include <iostream>\n\nint main() {\n    std::cout << "Hello DevMate AI" << std::endl;\n    return 0;\n}`,
  Python: `def greet(name):\n    return f"Hello, {name}"\n\nprint(greet("DevMate AI"))`,
  Java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello DevMate AI");\n    }\n}`,
  JavaScript: `function greet(name) {\n  return \`Hello, \${name}\`;\n}\n\nconsole.log(greet('DevMate AI'))`,
}

const initialResults = [
  { title: 'Score', value: 'Awaiting review' },
  { title: 'Bugs', value: 'Pending' },
  { title: 'Performance', value: 'Pending' },
  { title: 'Security', value: 'Pending' },
  { title: 'Suggestions', value: 'Pending' },
  { title: 'Improved Code', value: 'Pending' },
]

const toMarkdownText = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => `- ${item}`).join('\n')
  }

  if (typeof value === 'string') {
    return value
  }

  return String(value ?? '')
}

const getScoreLabel = (score) => {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Needs attention'
  return 'High risk'
}

const buildReviewMarkdown = (results) => {
  const sections = results.map((item) => {
    const title = `## ${item.title}`

    if (item.title === 'Score') {
      return `${title}\n\n${String(item.value ?? '')}`
    }

    if (item.title === 'Bugs' || item.title === 'Performance' || item.title === 'Security') {
      const entries = Array.isArray(item.value)
        ? item.value
        : String(item.value || 'No details available').split(' • ').filter(Boolean)

      const body = entries.length ? entries.map((entry) => `- ${entry}`).join('\n') : '- No details available'
      return `${title}\n\n${body}`
    }

    return `${title}\n\n${toMarkdownText(item.value) || 'No details available'}`
  })

  return ['# DevMate AI Review', '', ...sections].join('\n\n')
}

function Home() {
  const [activeLang, setActiveLang] = useState('Python')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [code, setCode] = useState(codeSamples.Python)
  const [results, setResults] = useState(initialResults)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [prompt, setPrompt] = useState('Improve this code and explain the changes.')
  const [assistantMessage, setAssistantMessage] = useState('Your AI review will appear here with focused suggestions.')
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I can review, explain, or improve your code.' },
  ])
  const [chatInput, setChatInput] = useState('')
  const [copiedNotice, setCopiedNotice] = useState('')

  useEffect(() => {
    setCode(codeSamples[activeLang])
  }, [activeLang])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!copiedNotice) {
      return undefined
    }

    const timer = window.setTimeout(() => setCopiedNotice(''), 1800)
    return () => window.clearTimeout(timer)
  }, [copiedNotice])

  const handleCopyContent = async (content, label = 'content') => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = content
        textArea.setAttribute('readonly', '')
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      setCopiedNotice('Đã copy!')
    } catch (error) {
      setCopiedNotice('Không thể sao chép')
    }
  }

  const handleDownloadContent = (content, filename) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleGenerate = async () => {
    if (!code.trim()) {
      setErrorMessage('Please enter some code before generating a review.')
      return
    }

    setIsGenerating(true)
    setErrorMessage('')

    try {
      const response = await reviewCode({ code, language: activeLang })
      const reviewData = response?.data?.data

      if (!reviewData) {
        throw new Error('The review service returned an empty response.')
      }

      const mappedResults = [
        { title: 'Score', value: reviewData.score ?? 0 },
        { title: 'Bugs', value: reviewData.bugs?.length ? reviewData.bugs : ['No major issues detected'] },
        { title: 'Performance', value: reviewData.performance || 'No issues detected' },
        { title: 'Security', value: reviewData.security || 'No issues detected' },
        { title: 'Suggestions', value: reviewData.suggestions?.length ? reviewData.suggestions : ['No suggestions'] },
        { title: 'Improved Code', value: reviewData.improvedCode || 'No improved version provided' },
      ]

      setResults(mappedResults)
      setAssistantMessage(reviewData.improvedCode ? 'Review complete. The improved version and recommendations are ready.' : 'Review complete. No improved code was generated.')
      setChatMessages((prev) => [
        ...prev,
        { role: 'user', text: prompt || 'Improve this code' },
        { role: 'assistant', text: reviewData.improvedCode || 'Review completed.' },
      ])
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Unable to reach the backend. Please make sure the API server is running.'
      setErrorMessage(message)
      setAssistantMessage('The review could not be completed. Please try again in a moment.')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderResultContent = (item) => {
    if (item.title === 'Score') {
      const score = Number(item.value) || 0
      const safeScore = Math.min(100, Math.max(0, score))

      return (
        <div className="score-display">
          <div className="score-ring" style={{ '--score': `${safeScore}%` }}>
            <span>{safeScore}</span>
          </div>
          <div className="score-meta">
            <strong>{getScoreLabel(safeScore)}</strong>
            <span>Overall code health</span>
          </div>
        </div>
      )
    }

    if (item.title === 'Bugs' || item.title === 'Performance' || item.title === 'Security') {
      const items = Array.isArray(item.value)
        ? item.value
        : String(item.value || 'No details available').split(' • ').filter(Boolean)

      return (
        <ul className="metric-list">
          {items.map((entry, index) => (
            <li key={`${item.title}-${index}`} className="metric-item">
              {entry}
            </li>
          ))}
        </ul>
      )
    }

    if (item.title === 'Suggestions' || item.title === 'Improved Code') {
      return (
        <div className="markdown-block">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {toMarkdownText(item.value)}
          </ReactMarkdown>
        </div>
      )
    }

    return <p className="result-text">{item.value}</p>
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
        <AppHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        />

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

            <div className="workspace-grid">
              <div className="editor-shell">
                <div className="editor-card">
                  <CodeEditor
                    language={activeLang}
                    value={code}
                    onChange={(value) => setCode(value ?? '')}
                    theme={theme}
                  />
                </div>
              </div>

              <div className="analysis-shell">
                <div className="prompt-box">
                  <label htmlFor="ai-prompt">What would you like DevMate AI to do?</label>
                  <textarea
                    id="ai-prompt"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    rows="3"
                    placeholder="Ask for review, explanation, bug fixing, or optimization..."
                  />
                </div>

                <button type="button" className="generate-button" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? <><span className="spinner" aria-hidden="true" />Generating...</> : 'Generate'}
                </button>

                {errorMessage ? (
                  <div className="error-banner" role="alert">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="result-summary">
                  <h2>AI Analysis</h2>
                  <p>{isGenerating ? 'Reviewing your code...' : 'Your latest review is ready.'}</p>
                </div>

                <div className="assistant-card">
                  <h3>Assistant response</h3>
                  <p>{assistantMessage}</p>
                </div>

                <div className={`copy-toast ${copiedNotice ? 'visible' : ''}`} aria-live="polite">
                  {copiedNotice}
                </div>

                <div className="chat-card">
                  <div className="chat-messages">
                    {chatMessages.map((message, index) => (
                      <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
                        <span>{message.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chat-input-row">
                    <input
                    type="text"
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        const message = chatInput.trim() || 'Tell me more about the code.'
                        setChatMessages((prev) => [
                          ...prev,
                          { role: 'user', text: message },
                          { role: 'assistant', text: `I analyzed your request: ${message}. Here's a concise follow-up based on the current code.` },
                        ])
                        setChatInput('')
                      }
                    }}
                    aria-label="Chat message"
                    placeholder="Ask the assistant a follow-up question..."
                  />
                  <button
                    type="button"
                    className="chat-send"
                    onClick={() => {
                      const message = chatInput.trim() || 'Tell me more about the code.'
                      setChatMessages((prev) => [
                        ...prev,
                        { role: 'user', text: message },
                        { role: 'assistant', text: `I analyzed your request: ${message}. Here's a concise follow-up based on the current code.` },
                      ])
                      setChatInput('')
                    }}
                  >
                    Send
                  </button>
                </div>
                </div>

                <div className="result-toolbar">
                  <span className="result-toolbar__title">Export review output</span>
                  <div className="result-toolbar__actions">
                    <button type="button" className="result-action-btn" onClick={() => handleCopyContent(buildReviewMarkdown(results))}>
                      Copy
                    </button>
                    <button type="button" className="result-action-btn" onClick={() => handleDownloadContent(buildReviewMarkdown(results), 'devmate-review.md')}>
                      Download
                    </button>
                  </div>
                </div>

                <div className="result-grid">
                  {results.map((item) => (
                    <div key={item.title} className="result-card">
                      <div className="result-card-header">
                        <h3>{item.title}</h3>
                        {item.title === 'Improved Code' ? (
                          <div className="result-card-actions">
                            <button
                              type="button"
                              className="result-action-btn"
                              onClick={() => handleCopyContent(`\n\n${toMarkdownText(item.value)}\n\n`, item.title)}
                            >
                              Copy
                            </button>
                            <button
                              type="button"
                              className="result-action-btn"
                              onClick={() => handleDownloadContent(`\n\n${toMarkdownText(item.value)}\n\n`, 'devmate-improved-code.md')}
                            >
                              Download
                            </button>
                          </div>
                        ) : null}
                      </div>
                      {renderResultContent(item)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Home
