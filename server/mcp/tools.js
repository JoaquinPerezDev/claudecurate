import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Task from '../models/Task.js'
import { matchTask } from '../utils/matchTask.js'

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname })

let connected = false
async function ensureConnected() {
  if (!connected) {
    await mongoose.connect(process.env.MONGO_URI)
    connected = true
  }
}

export const toolDefinitions = [
  {
    name: 'list_tasks',
    description: 'List the user\'s pending and in-progress tasks in ClaudeCurate.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'complete_task',
    description: 'Mark a specific ClaudeCurate task as complete by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'The _id of the task to complete' }
      },
      required: ['taskId']
    }
  },
  {
    name: 'log_session',
    description: 'Log what was accomplished in this Claude session. ClaudeCurate will auto-match and complete relevant tasks.',
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'One sentence describing what was accomplished' }
      },
      required: ['description']
    }
  }
]

export async function handleTool(name, args, webhookToken) {
  await ensureConnected()

  const user = await User.findOne({ webhookToken })
  if (!user) throw new Error('Invalid webhook token')

  if (name === 'list_tasks') {
    const tasks = await Task.find({ user: user._id, status: { $ne: 'complete' } }).sort({ createdAt: -1 })
    return {
      content: [{
        type: 'text',
        text: tasks.length
          ? tasks.map(t => `[${t._id}] ${t.title} (${t.status})${t.subtasks?.length ? `\n  Subtasks: ${t.subtasks.map(s => `${s.title} [${s.status}]`).join(', ')}` : ''}`).join('\n')
          : 'No pending tasks.'
      }]
    }
  }

  if (name === 'complete_task') {
    const task = await Task.findOne({ _id: args.taskId, user: user._id })
    if (!task) throw new Error('Task not found')
    task.status = 'complete'
    task.completedAt = new Date()
    await task.save()
    return { content: [{ type: 'text', text: `Marked "${task.title}" as complete.` }] }
  }

  if (name === 'log_session') {
    const tasks = await Task.find({ user: user._id, status: { $ne: 'complete' } })
    const result = matchTask(args.description, tasks)
    if (!result.matched) {
      return { content: [{ type: 'text', text: 'Session logged. No matching task found.' }] }
    }
    await result.task.save()
    const msg = result.subtask
      ? `Completed subtask "${result.subtask.title}"${result.autoCompletedParent ? ` and parent task "${result.task.title}"` : ''}.`
      : `Completed task "${result.task.title}".`
    return { content: [{ type: 'text', text: msg }] }
  }

  throw new Error(`Unknown tool: ${name}`)
}
