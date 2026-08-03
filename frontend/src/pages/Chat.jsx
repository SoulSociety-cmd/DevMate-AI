import { useState } from 'react'
import { sendChat } from '../services/chatService.js'

function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachCode, setAttachCode] = useState(false)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed && !code.trim()) return

    const userMessage = { role: 'user', content: trimmed || '' }
    // if code attached, append it to content as fenced block
    if (attachCode && code.trim()) {
      userMessage.content += `\n\n\`\`\` ${language}\n${code}\n\`\`\`\n`
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setCode('')
    setAttachCode(false)
    setLoading(true)

    try {
      const resp = await sendChat({ messages: nextMessages })
      const replyText = resp?.data?.reply || 'No reply'
      setMessages((m) => [...m, { role: 'assistant', content: replyText }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>AI Chat</h2>
      <div style={{ border: '1px solid #ddd', padding: 12, height: '60vh', overflowY: 'auto', marginBottom: 12 }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', margin: '6px 0' }}>
            <div style={{ maxWidth: '75%', padding: '8px 12px', borderRadius: 8, background: m.role === 'user' ? '#0b5cff' : '#f1f3f5', color: m.role === 'user' ? '#fff' : '#000' }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <textarea placeholder="Write a message..." value={input} onChange={(e) => setInput(e.target.value)} style={{ minHeight: 80 }} />

        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={attachCode} onChange={(e) => setAttachCode(e.target.checked)} /> Attach code
        </label>

        {attachCode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="language (javascript)" />
            <textarea placeholder="Paste code here" value={code} onChange={(e) => setCode(e.target.value)} style={{ minHeight: 120 }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSend} disabled={loading}>
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
