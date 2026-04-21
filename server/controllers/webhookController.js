import User from '../models/User.js'
import Task from '../models/Task.js'
import { matchTask } from '../utils/matchTask.js'

async function resolveUser(webhookToken) {
  const user = await User.findOne({ webhookToken })
  if (!user) throw Object.assign(new Error('Invalid webhook token'), { status: 401 })
  return user
}

export async function claudeHook(req, res, next) {
  try {
    const { webhookToken, taskDescription } = req.body
    if (!webhookToken || !taskDescription) {
      return res.status(400).json({ message: 'webhookToken and taskDescription are required' })
    }

    const user = await resolveUser(webhookToken).catch(err => {
      if (err.status === 401) return null
      throw err
    })
    if (!user) return res.status(401).json({ message: 'Invalid webhook token' })

    const tasks = await Task.find({ user: user._id, status: { $ne: 'complete' } })
    const result = matchTask(taskDescription, tasks)

    if (!result.matched) return res.json({ matched: false })

    await result.task.save()
    return res.json({
      matched: true,
      task: result.task,
      subtask: result.subtask || null,
      autoCompletedParent: result.autoCompletedParent || false
    })
  } catch (err) {
    next(err)
  }
}

export async function mcpListTasks(req, res, next) {
  try {
    const webhookToken = req.headers['x-webhook-token']
    if (!webhookToken) return res.status(400).json({ message: 'x-webhook-token header required' })

    const user = await User.findOne({ webhookToken })
    if (!user) return res.status(401).json({ message: 'Invalid webhook token' })

    const tasks = await Task.find({ user: user._id, status: { $ne: 'complete' } }).sort({ createdAt: -1 })
    res.json({ tasks, language: user.language })
  } catch (err) {
    next(err)
  }
}

export async function mcpCompleteTask(req, res, next) {
  try {
    const webhookToken = req.headers['x-webhook-token']
    if (!webhookToken) return res.status(400).json({ message: 'x-webhook-token header required' })

    const user = await User.findOne({ webhookToken })
    if (!user) return res.status(401).json({ message: 'Invalid webhook token' })

    const task = await Task.findOne({ _id: req.params.id, user: user._id })
    if (!task) return res.status(404).json({ message: 'Task not found' })

    task.status = 'complete'
    task.completedAt = new Date()
    await task.save()
    res.json(task)
  } catch (err) {
    next(err)
  }
}
