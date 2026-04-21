import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import connectDB from './config/db.js'

// Resolve .env relative to this file, not process.cwd()
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '.env') })
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import webhookRoutes from './routes/webhookRoutes.js'
import errorHandler from './middleware/errorHandler.js'

connectDB()

const app = express()

app.use(helmet())
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server requests (no origin) and anything on vercel.app
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error(`CORS blocked: ${origin}`))
    }
  },
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/webhook', webhookRoutes)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app
