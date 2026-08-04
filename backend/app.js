import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import reviewRoutes from './routes/reviewRoutes.js'
import explainRoutes from './routes/explainRoutes.js'
import fixBugsRoutes from './routes/fixBugsRoutes.js'
import optimizeRoutes from './routes/optimizeRoutes.js'
import convertRoutes from './routes/convertRoutes.js'
import docsRoutes from './routes/docsRoutes.js'
import generateTestsRoutes from './routes/generateTestsRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import { errorHandler } from './middlewares/errorHandler.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Not allowed by CORS'))
  },
}))
app.use(morgan('dev'))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', reviewRoutes)
app.use('/api', explainRoutes)
app.use('/api', fixBugsRoutes)
app.use('/api', optimizeRoutes)
app.use('/api', convertRoutes)
app.use('/api', docsRoutes)
app.use('/api', generateTestsRoutes)
app.use('/api', chatRoutes)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Backend running on port ${port}`)
})

export default app
