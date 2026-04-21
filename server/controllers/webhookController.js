import User from '../models/User.js'
import Task from '../models/Task.js'
import { matchTask } from '../utils/matchTask.js'

export async function claudeHook(req, res, next) {
  try {
    const { webhookToken, taskDescription } = req.body
    if (!webhookToken || !taskDescription) {
      return res.status(400).json({ message: 'webhookToken and taskDescription are required' })
    }

    const user = await User.findOne({ webhookToken })
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
