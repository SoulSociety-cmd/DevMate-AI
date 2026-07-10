import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/analyze', (req, res) => {
  const { code = '', language = 'Python', prompt = '' } = req.body
  const score = 82 + (code.length % 18)
  const bugCount = code.includes('console.log') || code.includes('print') ? '1 minor issue' : '2 minor issues'
  const security = code.includes('password') ? 'Needs review' : 'Secure'
  const suggestions = language === 'JavaScript' ? '2 refactors' : '4 actionable tips'
  const assistantMessage = `Focused review for ${language}: ${prompt || 'Your request'} — improved readability, reduced complexity, and kept the logic intact.`

  res.json({
    results: [
      { title: 'Score', value: `${score}/100` },
      { title: 'Bugs', value: bugCount },
      { title: 'Performance', value: 'Improved by 18%' },
      { title: 'Security', value: security },
      { title: 'Suggestions', value: suggestions },
      { title: 'Improved Code', value: 'Ready to paste' },
    ],
    assistantMessage,
  })
})

app.listen(port, () => {
  console.log(`Backend running on port ${port}`)
})

export default app
