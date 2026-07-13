import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import reviewRoutes from './routes/reviewRoutes.js'
import explainRoutes from './routes/explainRoutes.js'
import fixBugsRoutes from './routes/fixBugsRoutes.js'
import { errorHandler } from './middlewares/errorHandler.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(helmet())
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(morgan('dev'))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', reviewRoutes)
app.use('/api', explainRoutes)
app.use('/api', fixBugsRoutes)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Backend running on port ${port}`)
})

export default app
