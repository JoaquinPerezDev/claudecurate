import { Router } from 'express'
import { register, login, regenerateToken } from '../controllers/authController.js'
import auth from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/regenerate-token', auth, regenerateToken)

export default router
