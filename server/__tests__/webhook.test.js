import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import express from 'express'
import authRoutes from '../routes/authRoutes.js'
import taskRoutes from '../routes/taskRoutes.js'
import webhookRoutes from '../routes/webhookRoutes.js'
import errorHandler from '../middleware/errorHandler.js'
import { matchTask } from '../utils/matchTask.js'

process.env.JWT_SECRET = 'test_secret'

let mongod, token, webhookToken
const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/webhook', webhookRoutes)
app.use(errorHandler)

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase()
  const reg = await request(app).post('/api/auth/register').send({ email: 'hook@test.com', password: 'password123' })
  token = reg.body.token
  webhookToken = reg.body.webhookToken
})

describe('POST /api/webhook/claude-hook', () => {
  it('returns 401 for invalid webhookToken', async () => {
    const res = await request(app).post('/api/webhook/claude-hook').send({ webhookToken: 'bad-token', taskDescription: 'did something' })
    expect(res.status).toBe(401)
  })

  it('returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/webhook/claude-hook').send({ webhookToken })
    expect(res.status).toBe(400)
  })

  it('matches a task by keyword and marks it complete', async () => {
    await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Implement login', claudeKeywords: ['login', 'authentication'] })

    const res = await request(app).post('/api/webhook/claude-hook')
      .send({ webhookToken, taskDescription: 'built the login and authentication flow' })

    expect(res.status).toBe(200)
    expect(res.body.matched).toBe(true)
    expect(res.body.task.status).toBe('complete')
  })

  it('returns matched: false when nothing matches', async () => {
    await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Write docs', claudeKeywords: ['documentation'] })

    const res = await request(app).post('/api/webhook/claude-hook')
      .send({ webhookToken, taskDescription: 'fixed a CSS bug in the navbar' })

    expect(res.status).toBe(200)
    expect(res.body.matched).toBe(false)
  })

  it('matches a subtask and auto-completes parent when all subtasks done', async () => {
    await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Feature', subtasks: [{ title: 'setup database' }] })

    const res = await request(app).post('/api/webhook/claude-hook')
      .send({ webhookToken, taskDescription: 'setup the database connection' })

    expect(res.status).toBe(200)
    expect(res.body.matched).toBe(true)
    expect(res.body.subtask).toBeDefined()
    expect(res.body.autoCompletedParent).toBe(true)
  })
})

describe('matchTask (unit)', () => {
  const makeTasks = (overrides = []) => overrides.map((o, i) => ({
    _id: `task${i}`,
    title: o.title || 'Task',
    claudeKeywords: o.claudeKeywords || [],
    subtasks: (o.subtasks || []).map(s => ({ title: s, status: 'pending', completedAt: null })),
    status: 'pending',
    save: async () => {}
  }))

  it('returns matched: false for empty input', () => {
    expect(matchTask('', [])).toEqual({ matched: false })
    expect(matchTask('something', [])).toEqual({ matched: false })
  })

  it('exact keyword match returns the task', () => {
    const tasks = makeTasks([{ title: 'Auth feature', claudeKeywords: ['authentication', 'jwt'] }])
    const result = matchTask('implemented authentication and jwt', tasks)
    expect(result.matched).toBe(true)
    expect(result.task._id).toBe('task0')
  })

  it('no match below threshold returns matched: false', () => {
    const tasks = makeTasks([{ title: 'Deploy to AWS', claudeKeywords: ['aws', 'deploy'] }])
    const result = matchTask('refactored some CSS styles', tasks)
    expect(result.matched).toBe(false)
  })

  it('picks highest scoring task among multiple', () => {
    const tasks = makeTasks([
      { title: 'Auth feature', claudeKeywords: ['login'] },
      { title: 'Database setup', claudeKeywords: ['database', 'mongodb', 'schema'] }
    ])
    const result = matchTask('built the database schema and mongodb connection', tasks)
    expect(result.matched).toBe(true)
    expect(result.task._id).toBe('task1')
  })

  it('subtask title match completes the subtask', () => {
    const tasks = makeTasks([{ title: 'Big feature', subtasks: ['write unit tests'] }])
    const result = matchTask('wrote unit tests for the auth module', tasks)
    expect(result.matched).toBe(true)
    expect(result.subtask).toBeDefined()
    expect(result.subtask.status).toBe('complete')
  })

  it('all subtasks complete triggers parent auto-complete', () => {
    const tasks = makeTasks([{ title: 'Feature', subtasks: ['setup database'] }])
    const result = matchTask('setup database connection', tasks)
    expect(result.autoCompletedParent).toBe(true)
    expect(result.task.status).toBe('complete')
  })
})
