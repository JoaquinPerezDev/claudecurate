import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert, Box, Button, Card, CardActionArea, CardContent, Chip,
  MobileStepper, Paper, Step, StepLabel, Stepper, Snackbar,
  Typography, useMediaQuery, useTheme
} from '@mui/material'
import TerminalIcon from '@mui/icons-material/Terminal'
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows'
import EditNoteIcon from '@mui/icons-material/EditNote'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { useTranslation } from 'react-i18next'

function CopyBlock({ code, label }) {
  const [copied, setCopied] = useState(false)
  return (
    <Box sx={{ position: 'relative', mb: 2 }}>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#1e1e2e', borderRadius: 2, overflowX: 'auto' }}>
        <Typography component="pre" variant="body2" sx={{ color: '#cdd6f4', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', m: 0 }}>
          {code}
        </Typography>
      </Paper>
      <Button size="small" startIcon={<ContentCopyIcon />} variant="outlined"
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        sx={{ mt: 1 }}>
        {copied ? 'Copied!' : label || 'Copy'}
      </Button>
    </Box>
  )
}

function TrackA({ webhookToken, apiUrl, onDone }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [activeStep, setActiveStep] = useState(0)

  const scriptContent = `#!/usr/bin/env bash
WEBHOOK_TOKEN="${webhookToken}"
API_URL="${apiUrl}/api/webhook/claude-hook"
PAYLOAD=$(cat)
TASK_DESC=$(echo "$PAYLOAD" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('description') or data.get('task_description') or '')
" 2>/dev/null || echo "")
[ -z "$TASK_DESC" ] && exit 0
curl -s -X POST "$API_URL" \\
  -H "Content-Type: application/json" \\
  -d "{\\"webhookToken\\":\\"$WEBHOOK_TOKEN\\",\\"taskDescription\\":\\"$TASK_DESC\\"}" > /dev/null
exit 0`

  const settingsJson = `{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "bash ~/claude-hook.sh"
      }]
    }]
  }
}`

  const steps = [
    {
      label: t('onboarding.trackA.step1Label'),
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('onboarding.trackA.step1Desc')}
          </Typography>
          <CopyBlock code={scriptContent} label={t('onboarding.trackA.copy')} />
          <Button variant="outlined" size="small"
            onClick={() => { const b = new Blob([scriptContent], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'claude-hook.sh'; a.click() }}>
            {t('onboarding.trackA.downloadBtn')}
          </Button>
        </>
      )
    },
    {
      label: t('onboarding.trackA.step2Label'),
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('onboarding.trackA.step2Desc')}
          </Typography>
          <CopyBlock code="chmod +x ~/claude-hook.sh" label={t('onboarding.trackA.copyCommand')} />
        </>
      )
    },
    {
      label: t('onboarding.trackA.step3Label'),
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('onboarding.trackA.step3Desc')}
          </Typography>
          <CopyBlock code={settingsJson} label={t('onboarding.trackA.copyJSON')} />
          <Button size="small" variant="text" href="https://code.claude.com/docs/en/hooks" target="_blank" rel="noopener">
            {t('onboarding.trackA.step3Link')}
          </Button>
        </>
      )
    },
    {
      label: t('onboarding.trackA.step4Label'),
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('onboarding.trackA.step4Desc')}
          </Typography>
          <CopyBlock code={`echo '{"description":"test task completed"}' | bash ~/claude-hook.sh`} label={t('onboarding.trackA.copyCommand')} />
          <Alert severity="info" sx={{ mt: 1 }}>
            {t('onboarding.trackA.step4Alert')}
          </Alert>
        </>
      )
    },
    {
      label: t('onboarding.trackA.step5Label'),
      content: (
        <Box textAlign="center" py={2}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} mb={1}>{t('onboarding.trackA.step5Title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('onboarding.trackA.step5Desc')}
          </Typography>
        </Box>
      )
    }
  ]

  return (
    <Box>
      {!isMobile ? (
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map(s => <Step key={s.label}><StepLabel>{s.label}</StepLabel></Step>)}
        </Stepper>
      ) : (
        <Typography variant="caption" color="text.secondary" mb={1} display="block">
          {t('onboarding.step', { current: activeStep + 1, total: steps.length })}: {steps[activeStep].label}
        </Typography>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3, minHeight: 220 }}>
        {steps[activeStep].content}
      </Paper>

      {isMobile ? (
        <MobileStepper steps={steps.length} position="static" activeStep={activeStep}
          nextButton={<Button size="small" onClick={activeStep === steps.length - 1 ? onDone : () => setActiveStep(s => s + 1)} endIcon={activeStep < steps.length - 1 ? <KeyboardArrowRightIcon /> : null}>{activeStep === steps.length - 1 ? t('onboarding.goToDashboard') : t('onboarding.next')}</Button>}
          backButton={<Button size="small" onClick={() => setActiveStep(s => s - 1)} disabled={activeStep === 0} startIcon={<KeyboardArrowLeftIcon />}>{t('onboarding.back')}</Button>} />
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setActiveStep(s => s - 1)} disabled={activeStep === 0}>{t('onboarding.back')}</Button>
          <Button variant="contained" onClick={activeStep === steps.length - 1 ? onDone : () => setActiveStep(s => s + 1)}>
            {activeStep === steps.length - 1 ? t('onboarding.goToDashboard') : t('onboarding.next')}
          </Button>
        </Box>
      )}
    </Box>
  )
}

function TrackB({ webhookToken, apiUrl, onDone }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [activeStep, setActiveStep] = useState(0)
  const isMac = !navigator.platform.toLowerCase().includes('win')

  const configPath = isMac
    ? '~/Library/Application Support/Claude/claude_desktop_config.json'
    : '%APPDATA%\\Claude\\claude_desktop_config.json'

  const mcpConfig = `{
  "mcpServers": {
    "claudecurate": {
      "command": "npx",
      "args": ["-y", "claudecurate-mcp"],
      "env": {
        "WEBHOOK_TOKEN": "${webhookToken}",
        "API_URL": "${apiUrl}"
      }
    }
  }
}`

  const customInstruction = `At the end of every conversation, call the ClaudeCurate log_session tool with a one-sentence description of what we accomplished.`

  const steps = [
    {
      label: t('onboarding.trackB.step1Label'),
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('onboarding.trackB.step1Desc')}
          </Typography>
          <CopyBlock code={webhookToken} label={t('onboarding.trackB.copyToken')} />
          <Alert severity="info">{t('onboarding.trackB.step1Alert')}</Alert>
        </>
      )
    },
    {
      label: t('onboarding.trackB.step2Label'),
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {t('onboarding.trackB.step2Desc')}
          </Typography>
          <Box mb={1}>
            <Chip label={isMac ? 'macOS' : 'Windows'} size="small" color="primary" sx={{ mr: 1 }} />
            <CopyBlock code={configPath} label={t('onboarding.trackB.copyPath')} />
          </Box>
          <CopyBlock code={mcpConfig} label={t('onboarding.trackB.copyConfig')} />
        </>
      )
    },
    {
      label: t('onboarding.trackB.step3Label'),
      content: (
        <Box py={2}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('onboarding.trackB.step3Desc')}
          </Typography>
          <Alert severity="warning">{t('onboarding.trackB.step3Alert')}</Alert>
        </Box>
      )
    },
    {
      label: t('onboarding.trackB.step4Label'),
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('onboarding.trackB.step4Desc')}
          </Typography>
          <CopyBlock code={customInstruction} label={t('onboarding.trackB.copyInstruction')} />
          <Typography variant="body2" color="text.secondary">
            {t('onboarding.trackB.step4Where')}
          </Typography>
        </>
      )
    },
    {
      label: t('onboarding.trackB.step5Label'),
      content: (
        <Box textAlign="center" py={2}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} mb={1}>{t('onboarding.trackB.step5Title')}</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('onboarding.trackB.step5Desc')}
          </Typography>
          <Alert severity="info" sx={{ textAlign: 'left' }}>
            {t('onboarding.trackB.step5Note')}
          </Alert>
        </Box>
      )
    }
  ]

  return (
    <Box>
      {!isMobile ? (
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map(s => <Step key={s.label}><StepLabel>{s.label}</StepLabel></Step>)}
        </Stepper>
      ) : (
        <Typography variant="caption" color="text.secondary" mb={1} display="block">
          {t('onboarding.step', { current: activeStep + 1, total: steps.length })}: {steps[activeStep].label}
        </Typography>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3, minHeight: 220 }}>
        {steps[activeStep].content}
      </Paper>

      {isMobile ? (
        <MobileStepper steps={steps.length} position="static" activeStep={activeStep}
          nextButton={<Button size="small" onClick={activeStep === steps.length - 1 ? onDone : () => setActiveStep(s => s + 1)} endIcon={activeStep < steps.length - 1 ? <KeyboardArrowRightIcon /> : null}>{activeStep === steps.length - 1 ? t('onboarding.goToDashboard') : t('onboarding.next')}</Button>}
          backButton={<Button size="small" onClick={() => setActiveStep(s => s - 1)} disabled={activeStep === 0} startIcon={<KeyboardArrowLeftIcon />}>{t('onboarding.back')}</Button>} />
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setActiveStep(s => s - 1)} disabled={activeStep === 0}>{t('onboarding.back')}</Button>
          <Button variant="contained" onClick={activeStep === steps.length - 1 ? onDone : () => setActiveStep(s => s + 1)}>
            {activeStep === steps.length - 1 ? t('onboarding.goToDashboard') : t('onboarding.next')}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [method, setMethod] = useState(null)
  const [snack, setSnack] = useState('')

  const webhookToken = localStorage.getItem('webhookToken') || ''
  const apiUrl = process.env.REACT_APP_API_URL || window.location.origin

  const METHOD_CARDS = [
    { id: 'code', icon: <TerminalIcon sx={{ fontSize: 40 }} />, title: t('onboarding.claudeCodeTitle'), subtitle: t('onboarding.claudeCodeSubtitle'), color: '#5b4fcf' },
    { id: 'desktop', icon: <DesktopWindowsIcon sx={{ fontSize: 40 }} />, title: t('onboarding.claudeDesktopTitle'), subtitle: t('onboarding.claudeDesktopSubtitle'), color: '#1976d2' },
    { id: 'manual', icon: <EditNoteIcon sx={{ fontSize: 40 }} />, title: t('onboarding.manualTitle'), subtitle: t('onboarding.manualSubtitle'), color: '#9e9e9e' }
  ]

  const handleDone = () => {
    localStorage.setItem('onboardingComplete', 'true')
    navigate('/dashboard')
  }

  if (!method) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" mb={1}>{t('onboarding.connectClaude')}</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
            {t('onboarding.howDoYouUse')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            {METHOD_CARDS.map(m => (
              <Card key={m.id} sx={{ flex: 1, border: '2px solid', borderColor: 'divider', '&:hover': { borderColor: m.color } }}>
                <CardActionArea sx={{ p: 3, textAlign: 'center' }} onClick={() => setMethod(m.id)}>
                  <Box sx={{ color: m.color, mb: 1 }}>{m.icon}</Box>
                  <Typography variant="subtitle1" fontWeight={600}>{m.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{m.subtitle}</Typography>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
        <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack('')} message={snack} />
      </Box>
    )
  }

  if (method === 'manual') {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
        <Card sx={{ maxWidth: 480, width: '100%', p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <EditNoteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} mb={1}>{t('onboarding.manualTitle')}</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {t('onboarding.manualMessage')}
          </Typography>
          <Button variant="contained" onClick={handleDone} fullWidth>{t('onboarding.goToDashboard')}</Button>
          <Button sx={{ mt: 1 }} onClick={() => setMethod(null)} fullWidth>{t('onboarding.goBack')}</Button>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', px: 2, py: 4 }}>
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
          <Button onClick={() => setMethod(null)} size="small">{t('onboarding.back')}</Button>
          <Typography variant="h6" fontWeight={700}>
            {method === 'code' ? t('onboarding.connectCodeTitle') : t('onboarding.connectDesktopTitle')}
          </Typography>
        </Box>
        {method === 'code'
          ? <TrackA webhookToken={webhookToken} apiUrl={apiUrl} onDone={handleDone} />
          : <TrackB webhookToken={webhookToken} apiUrl={apiUrl} onDone={handleDone} />
        }
      </Box>
    </Box>
  )
}
