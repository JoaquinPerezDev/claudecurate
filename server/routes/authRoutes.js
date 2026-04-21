import { Router } from 'express'
import { register, login, regenerateToken, updateLanguage } from '../controllers/authController.js'
import auth from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/regenerate-token', auth, regenerateToken)
router.patch('/language', auth, updateLanguage)

export default router
