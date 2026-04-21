import { Router } from 'express'
import { claudeHook, mcpListTasks, mcpCompleteTask } from '../controllers/webhookController.js'

const router = Router()

router.post('/claude-hook', claudeHook)
router.get('/mcp/tasks', mcpListTasks)
router.post('/mcp/tasks/:id/complete', mcpCompleteTask)

export default router
