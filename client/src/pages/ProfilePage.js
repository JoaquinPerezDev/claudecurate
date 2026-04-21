import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, Snackbar,
  TextField, Typography
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import RefreshIcon from '@mui/icons-material/Refresh'
import TerminalIcon from '@mui/icons-material/Terminal'
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import LanguageToggle from '../components/LanguageToggle'

export default function ProfilePage() {
  const { user, regenerateToken, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [webhookToken, setWebhookToken] = useState(localStorage.getItem('webhookToken') || '')
  const [showToken, setShowToken] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [snack, setSnack] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  const copyToken = () => {
    navigator.clipboard.writeText(webhookToken)
    setSnack(t('profile.tokenCopied'))
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const newToken = await regenerateToken()
      setWebhookToken(newToken)
      setSnack(t('profile.newTokenGenerated'))
    } catch {
      setSnack(t('profile.failedRegen'))
    } finally {
      setRegenerating(false)
      setConfirmOpen(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: 700, mx: 'auto' }}>
        <Typography variant="h5" fontWeight={700} mb={3}>{t('profile.title')}</Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('profile.account')}</Typography>
            <TextField fullWidth label={t('auth.email')} value={user?.email || ''} InputProps={{ readOnly: true }} size="small" sx={{ mb: 2 }} />
            <Button variant="outlined" color="error" onClick={() => { logout(); navigate('/login') }}>{t('profile.signOut')}</Button>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={0.5}>{t('profile.language')}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>{t('profile.languageDesc')}</Typography>
            <LanguageToggle />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={0.5}>{t('profile.claudeIntegration')}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {t('profile.integrationDesc')}
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              {t('profile.integrationAlert')}
            </Alert>

            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField
                size="small" fullWidth label={t('profile.webhookToken')}
                value={showToken ? webhookToken : '••••••••••••••••••••••••'}
                InputProps={{ readOnly: true }}
              />
              <Button size="small" onClick={() => setShowToken(s => !s)}>{showToken ? t('profile.hide') : t('profile.show')}</Button>
              <Button size="small" startIcon={<ContentCopyIcon />} onClick={copyToken}>{t('profile.copy')}</Button>
            </Box>

            <Button size="small" color="warning" startIcon={<RefreshIcon />} onClick={() => setConfirmOpen(true)} disabled={regenerating} sx={{ mt: 1 }}>
              {t('profile.regenerateToken')}
            </Button>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" mb={2}>{t('profile.reconfigure')}</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="outlined" startIcon={<TerminalIcon />} onClick={() => { localStorage.removeItem('onboardingComplete'); navigate('/onboarding', { state: { method: 'code' } }) }}>
                {t('profile.claudeCodeSetup')}
              </Button>
              <Button variant="outlined" startIcon={<DesktopWindowsIcon />} onClick={() => { localStorage.removeItem('onboardingComplete'); navigate('/onboarding', { state: { method: 'desktop' } }) }}>
                {t('profile.claudeDesktopSetup')}
              </Button>
              <Button variant="outlined" color="inherit" startIcon={<LinkOffIcon />} onClick={() => navigate('/onboarding')}>
                {t('profile.viewAllOptions')}
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>{t('profile.integrationStatus')}</Typography>
              <Chip icon={<TerminalIcon />} label="Claude Code — configure via settings.json" size="small" variant="outlined" sx={{ mr: 1, mb: 1 }} />
              <Chip icon={<DesktopWindowsIcon />} label="Claude Desktop — configure via MCP" size="small" variant="outlined" sx={{ mb: 1 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('profile.confirmRegenTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('profile.confirmRegenDesc')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t('task.cancel')}</Button>
          <Button color="warning" onClick={handleRegenerate} disabled={regenerating}>
            {regenerating ? t('profile.regenerating') : t('profile.yesRegenerate')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} />
    </Box>
  )
}
