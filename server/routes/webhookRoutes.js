import { Router } from 'express'
import { claudeHook } from '../controllers/webhookController.js'

const router = Router()

router.post('/claude-hook', claudeHook)

export default router
