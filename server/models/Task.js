import mongoose from 'mongoose'

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'complete'], default: 'pending' },
  completedAt: { type: Date, default: null }
}, { _id: true })

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'in_progress', 'complete'], default: 'pending' },
  claudeKeywords: [{ type: String, trim: true }],
  subtasks: [SubtaskSchema],
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
})

TaskSchema.index({ user: 1, status: 1 })

export default mongoose.model('Task', TaskSchema)
