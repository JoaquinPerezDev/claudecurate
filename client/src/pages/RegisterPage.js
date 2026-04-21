import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Button, Card, CardContent, Link, TextField, Typography, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = t('auth.emailRequired')
    if (!form.password) e.password = t('auth.passwordRequired')
    else if (form.password.length < 8) e.password = t('auth.passwordLength')
    if (form.password !== form.confirm) e.confirm = t('auth.passwordMatch')
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
      setApiError(err.response?.data?.message || t('auth.registrationFailed'))
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
          <Typography variant="h5" fontWeight={700} mb={0.5}>{t('auth.createAccount')}</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>{t('auth.startTracking')}</Typography>

          {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField {...field('email', t('auth.email'), 'email')} />
            <TextField {...field('password', t('auth.password'), 'password')} />
            <TextField {...field('confirm', t('auth.confirmPassword'), 'password')} sx={{ mb: 3 }} />
            <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
              {loading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" mt={2}>
            {t('auth.alreadyHave')} <Link component={RouterLink} to="/login">{t('auth.signIn')}</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
