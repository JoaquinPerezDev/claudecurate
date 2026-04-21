import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Button, Card, CardContent, Link, TextField, Typography, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = t('auth.emailRequired')
    if (!form.password) e.password = t('auth.passwordRequired')
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    setLoading(true)
    setApiError('')
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || t('auth.loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>{t('auth.welcomeBack')}</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>{t('auth.signInTo')}</Typography>

          {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField fullWidth label={t('auth.email')} type="email" value={form.email}
              onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })) }}
              error={!!errors.email} helperText={errors.email} sx={{ mb: 2 }} />
            <TextField fullWidth label={t('auth.password')} type="password" value={form.password}
              onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })) }}
              error={!!errors.password} helperText={errors.password} sx={{ mb: 3 }} />
            <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" mt={2}>
            {t('auth.noAccount')} <Link component={RouterLink} to="/register">{t('auth.createOne')}</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
