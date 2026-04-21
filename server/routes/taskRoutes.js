import { Router } from 'express'
import { getTasks, createTask, updateTask, deleteTask, toggleSubtask } from '../controllers/taskController.js'
import auth from '../middleware/auth.js'

const router = Router()

router.use(auth)

router.get('/', getTasks)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)
router.patch('/:id/subtasks/:subtaskId', toggleSubtask)

export default router
