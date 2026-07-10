import { useEffect, useState } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { analyzeCode } from '../services/api.js'
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

const initialResults = [
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
  const [theme, setTheme] = useState('dark')
  const [code, setCode] = useState(codeSamples.Python)
  const [results, setResults] = useState(initialResults)
  const [isGenerating, setIsGenerating] = useState(false)
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
    setIsGenerating(true)

    try {
      const response = await analyzeCode({ code, language: activeLang, prompt })
      const { results: apiResults, assistantMessage: apiAssistantMessage } = response.data

      setResults(apiResults)
      setAssistantMessage(apiAssistantMessage)
      setChatMessages((prev) => [
        ...prev,
        { role: 'user', text: prompt || 'Improve this code' },
        { role: 'assistant', text: apiAssistantMessage },
      ])
    } catch (error) {
      setAssistantMessage('Unable to reach the backend. Please make sure the API server is running.')
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
                  <div className="editor-toolbar">
                    <span>{activeLang} Editor</span>
                    <span className="editor-pill">AI-ready</span>
                  </div>
                  <MonacoEditor
                    height="420px"
                    language={languageMap[activeLang]}
                    value={code}
                    theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
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

                <button type="button" className="generate-button" onClick={handleGenerate}>
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>

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
