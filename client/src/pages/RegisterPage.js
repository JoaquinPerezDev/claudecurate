import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Button, Card, CardContent, Link, TextField, Typography, Alert } from '@mui/material'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    setLoading(true)
    setApiError('')
    try {
      await register(form.email, form.password)
      navigate('/onboarding')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text') => ({
    fullWidth: true, label, type, value: form[key],
    onChange: e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })) },
    error: !!errors[key], helperText: errors[key], sx: { mb: 2 }
  })

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>Create your account</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Start tracking tasks with Claude</Typography>

          {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField {...field('email', 'Email', 'email')} />
            <TextField {...field('password', 'Password', 'password')} />
            <TextField {...field('confirm', 'Confirm password', 'password')} sx={{ mb: 3 }} />
            <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" mt={2}>
            Already have an account? <Link component={RouterLink} to="/login">Sign in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
