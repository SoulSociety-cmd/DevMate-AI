import { useEffect, useState } from 'react'
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

  useEffect(() => {
    setCode(codeSamples[activeLang])
  }, [activeLang])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

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
        { title: 'Score', value: `${reviewData.score}/100` },
        { title: 'Bugs', value: reviewData.bugs?.length ? reviewData.bugs.join(' • ') : 'No major issues detected' },
        { title: 'Performance', value: reviewData.performance || 'No issues detected' },
        { title: 'Security', value: reviewData.security || 'No issues detected' },
        { title: 'Suggestions', value: reviewData.suggestions?.length ? reviewData.suggestions.join(' • ') : 'No suggestions' },
        { title: 'Improved Code', value: reviewData.improvedCode ? reviewData.improvedCode.split('\n').slice(0, 2).join(' ') : 'No improved version provided' },
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

                <div className="result-grid">
                  {results.map((item) => (
                    <div key={item.title} className="result-card">
                      <h3>{item.title}</h3>
                      <p>{item.value}</p>
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
