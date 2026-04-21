import Task from '../models/Task.js'

export async function getTasks(req, res, next) {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(tasks)
  } catch (err) {
    next(err)
  }
}

export async function createTask(req, res, next) {
  try {
    const { title, description, status, claudeKeywords, subtasks } = req.body
    if (!title) return res.status(400).json({ message: 'Title is required' })

    const task = await Task.create({
      user: req.user.id,
      title,
      description: description || '',
      status: status || 'pending',
      claudeKeywords: claudeKeywords || [],
      subtasks: (subtasks || []).map(s => ({ title: s.title || s, status: 'pending' }))
    })
    res.status(201).json(task)
  } catch (err) {
    next(err)
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id })
    if (!task) return res.status(404).json({ message: 'Task not found' })

    const { title, description, status, claudeKeywords, subtasks } = req.body

    if (title !== undefined) task.title = title
    if (description !== undefined) task.description = description
    if (claudeKeywords !== undefined) task.claudeKeywords = claudeKeywords
    if (subtasks !== undefined) {
      task.subtasks = subtasks.map(s => ({
        _id: s._id,
        title: s.title,
        status: s.status || 'pending',
        completedAt: s.completedAt || null
      }))
    }
    if (status !== undefined) {
      task.status = status
      if (status === 'complete' && !task.completedAt) task.completedAt = new Date()
      if (status !== 'complete') task.completedAt = null
    }

    await task.save()
    res.json(task)
  } catch (err) {
    next(err)
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ message: 'Task deleted' })
  } catch (err) {
    next(err)
  }
}

export async function toggleSubtask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id })
    if (!task) return res.status(404).json({ message: 'Task not found' })

    const subtask = task.subtasks.id(req.params.subtaskId)
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' })

    subtask.status = subtask.status === 'complete' ? 'pending' : 'complete'
    subtask.completedAt = subtask.status === 'complete' ? new Date() : null

    // Auto-complete parent when all subtasks are done
    if (task.subtasks.length > 0 && task.subtasks.every(s => s.status === 'complete')) {
      task.status = 'complete'
      task.completedAt = new Date()
    } else if (task.status === 'complete' && task.subtasks.some(s => s.status === 'pending')) {
      task.status = 'in_progress'
      task.completedAt = null
    }

    await task.save()
    res.json(task)
  } catch (err) {
    next(err)
  }
}
