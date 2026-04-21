import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import express from 'express'
import authRoutes from '../routes/authRoutes.js'
import errorHandler from '../middleware/errorHandler.js'

process.env.JWT_SECRET = 'test_secret'

let mongod
const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use(errorHandler)

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  await mongoose.connection.db.dropDatabase()
})

describe('POST /api/auth/register', () => {
  it('registers a new user and returns token + webhookToken', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.webhookToken).toBeDefined()
    expect(res.body.user.email).toBe('test@example.com')
  })

  it('returns 409 for duplicate email', async () => {
    await request(app).post('/api/auth/register').send({ email: 'dup@example.com', password: 'password123' })
    const res = await request(app).post('/api/auth/register').send({ email: 'dup@example.com', password: 'password123' })
    expect(res.status).toBe(409)
  })

  it('returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'test@example.com' })
    expect(res.status).toBe(400)
  })

  it('returns 400 for short password', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'test@example.com', password: '123' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({ email: 'login@example.com', password: 'password123' })
  })

  it('logs in with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'password123' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.webhookToken).toBeDefined()
  })

  it('returns 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'wrongpass' })
    expect(res.status).toBe(401)
  })

  it('returns 401 for unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'password123' })
    expect(res.status).toBe(401)
  })
})
