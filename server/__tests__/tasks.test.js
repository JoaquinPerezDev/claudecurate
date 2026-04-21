import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import express from 'express'
import authRoutes from '../routes/authRoutes.js'
import taskRoutes from '../routes/taskRoutes.js'
import errorHandler from '../middleware/errorHandler.js'

process.env.JWT_SECRET = 'test_secret'

let mongod, token, token2
const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
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
  const r1 = await request(app).post('/api/auth/register').send({ email: 'user1@test.com', password: 'password123' })
  const r2 = await request(app).post('/api/auth/register').send({ email: 'user2@test.com', password: 'password123' })
  token = r1.body.token
  token2 = r2.body.token
})

describe('GET /api/tasks', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/tasks')
    expect(res.status).toBe(401)
  })

  it('returns empty array for new user', async () => {
    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/tasks', () => {
  it('creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Build auth', claudeKeywords: ['auth', 'JWT'] })

    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Build auth')
    expect(res.body.claudeKeywords).toContain('auth')
    expect(res.body.status).toBe('pending')
  })

  it('creates a task with subtasks', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Big feature', subtasks: [{ title: 'step one' }, { title: 'step two' }] })

    expect(res.status).toBe(201)
    expect(res.body.subtasks).toHaveLength(2)
    expect(res.body.subtasks[0].status).toBe('pending')
  })

  it('returns 400 for missing title', async () => {
    const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({})
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/tasks/:id', () => {
  it('updates a task', async () => {
    const created = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Old title' })
    const res = await request(app)
      .put(`/api/tasks/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'in_progress' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('in_progress')
  })

  it('returns 404 for another user\'s task', async () => {
    const created = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Private' })
    const res = await request(app)
      .put(`/api/tasks/${created.body._id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ title: 'Hacked' })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/tasks/:id', () => {
  it('deletes a task', async () => {
    const created = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Delete me' })
    const res = await request(app).delete(`/api/tasks/${created.body._id}`).set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
  })

  it('returns 404 for another user\'s task', async () => {
    const created = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Mine' })
    const res = await request(app).delete(`/api/tasks/${created.body._id}`).set('Authorization', `Bearer ${token2}`)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/tasks/:id/subtasks/:subtaskId', () => {
  it('toggles a subtask and auto-completes parent when all done', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Parent', subtasks: [{ title: 'only subtask' }] })

    const subtaskId = created.body.subtasks[0]._id
    const res = await request(app)
      .patch(`/api/tasks/${created.body._id}/subtasks/${subtaskId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.subtasks[0].status).toBe('complete')
    expect(res.body.status).toBe('complete')
  })
})
