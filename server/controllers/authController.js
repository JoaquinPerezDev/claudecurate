import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import User from '../models/User.js'

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' })

export async function register(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'Email already registered' })

    const user = await User.create({ email, password, webhookToken: randomUUID() })
    const token = signToken(user._id)

    res.status(201).json({
      token,
      webhookToken: user.webhookToken,
      user: { id: user._id, email: user.email }
    })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = signToken(user._id)
    res.json({
      token,
      webhookToken: user.webhookToken,
      user: { id: user._id, email: user.email }
    })
  } catch (err) {
    next(err)
  }
}

export async function regenerateToken(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { webhookToken: randomUUID() },
      { new: true }
    )
    res.json({ webhookToken: user.webhookToken })
  } catch (err) {
    next(err)
  }
}
