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
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, regenerateToken, logout } = useAuth()
  const navigate = useNavigate()
  const [webhookToken, setWebhookToken] = useState(localStorage.getItem('webhookToken') || '')
  const [showToken, setShowToken] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [snack, setSnack] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  const copyToken = () => {
    navigator.clipboard.writeText(webhookToken)
    setSnack('Webhook token copied!')
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const newToken = await regenerateToken()
      setWebhookToken(newToken)
      setSnack('New token generated. Update your hook script or MCP config.')
    } catch {
      setSnack('Failed to regenerate token')
    } finally {
      setRegenerating(false)
      setConfirmOpen(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: 700, mx: 'auto' }}>
        <Typography variant="h5" fontWeight={700} mb={3}>Profile</Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>Account</Typography>
            <TextField fullWidth label="Email" value={user?.email || ''} InputProps={{ readOnly: true }} size="small" sx={{ mb: 2 }} />
            <Button variant="outlined" color="error" onClick={() => { logout(); navigate('/login') }}>Sign out</Button>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={0.5}>Claude Integration</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Your webhook token links your Claude hooks or MCP server to this account.
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Auto-completion requires <strong>Claude Code CLI</strong> or <strong>Claude Desktop with MCP</strong>.
              Claude.ai web users can track tasks manually.
            </Alert>

            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField
                size="small" fullWidth label="Webhook token"
                value={showToken ? webhookToken : '••••••••••••••••••••••••'}
                InputProps={{ readOnly: true }}
              />
              <Button size="small" onClick={() => setShowToken(s => !s)}>{showToken ? 'Hide' : 'Show'}</Button>
              <Button size="small" startIcon={<ContentCopyIcon />} onClick={copyToken}>Copy</Button>
            </Box>

            <Button size="small" color="warning" startIcon={<RefreshIcon />} onClick={() => setConfirmOpen(true)} disabled={regenerating} sx={{ mt: 1 }}>
              Regenerate token
            </Button>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" mb={2}>Reconfigure your integration</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="outlined" startIcon={<TerminalIcon />} onClick={() => { localStorage.removeItem('onboardingComplete'); navigate('/onboarding', { state: { method: 'code' } }) }}>
                Claude Code setup
              </Button>
              <Button variant="outlined" startIcon={<DesktopWindowsIcon />} onClick={() => { localStorage.removeItem('onboardingComplete'); navigate('/onboarding', { state: { method: 'desktop' } }) }}>
                Claude Desktop setup
              </Button>
              <Button variant="outlined" color="inherit" startIcon={<LinkOffIcon />} onClick={() => navigate('/onboarding')}>
                View all options
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>Integration status</Typography>
              <Chip icon={<TerminalIcon />} label="Claude Code — configure via settings.json" size="small" variant="outlined" sx={{ mr: 1, mb: 1 }} />
              <Chip icon={<DesktopWindowsIcon />} label="Claude Desktop — configure via MCP" size="small" variant="outlined" sx={{ mb: 1 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Regenerate webhook token?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will invalidate your current token. Any existing <code>claude-hook.sh</code> scripts or MCP configs using the old token will stop working until you update them with the new token.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="warning" onClick={handleRegenerate} disabled={regenerating}>
            {regenerating ? 'Regenerating…' : 'Yes, regenerate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} />
    </Box>
  )
}
