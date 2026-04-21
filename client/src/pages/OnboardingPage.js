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
      label: 'Download hook script',
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This script runs whenever Claude Code finishes a session. Save it as <code>~/claude-hook.sh</code> on your computer.
          </Typography>
          <CopyBlock code={scriptContent} label="Copy script" />
          <Button variant="outlined" size="small"
            onClick={() => { const b = new Blob([scriptContent], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'claude-hook.sh'; a.click() }}>
            Download claude-hook.sh
          </Button>
        </>
      )
    },
    {
      label: 'Make it executable',
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Run this once in your terminal to give the script permission to execute.
          </Typography>
          <CopyBlock code="chmod +x ~/claude-hook.sh" label="Copy command" />
        </>
      )
    },
    {
      label: 'Configure Claude Code',
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Add this to <code>~/.claude/settings.json</code>. If the file doesn't exist, create it. This tells Claude Code to run your script when a session ends.
          </Typography>
          <CopyBlock code={settingsJson} label="Copy JSON" />
          <Button size="small" variant="text" href="https://code.claude.com/docs/en/hooks" target="_blank" rel="noopener">
            Claude Code hooks docs ↗
          </Button>
        </>
      )
    },
    {
      label: 'Test the connection',
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Simulate a hook firing by running this in your terminal. Create a task with matching keywords first, then check your dashboard.
          </Typography>
          <CopyBlock code={`echo '{"description":"test task completed"}' | bash ~/claude-hook.sh`} label="Copy test command" />
          <Alert severity="info" sx={{ mt: 1 }}>
            If a task's keywords match "test task completed", it will auto-complete within 30 seconds.
          </Alert>
        </>
      )
    },
    {
      label: "You're connected!",
      content: (
        <Box textAlign="center" py={2}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} mb={1}>Claude Code is linked</Typography>
          <Typography variant="body2" color="text.secondary">
            When Claude Code finishes a session, ClaudeCurate will automatically match and complete relevant tasks.
            Add <strong>Claude keywords</strong> to your tasks to improve matching accuracy.
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
        <Typography variant="caption" color="text.secondary" mb={1} display="block">Step {activeStep + 1} of {steps.length}: {steps[activeStep].label}</Typography>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3, minHeight: 220 }}>
        {steps[activeStep].content}
      </Paper>

      {isMobile ? (
        <MobileStepper steps={steps.length} position="static" activeStep={activeStep}
          nextButton={<Button size="small" onClick={activeStep === steps.length - 1 ? onDone : () => setActiveStep(s => s + 1)} endIcon={activeStep < steps.length - 1 ? <KeyboardArrowRightIcon /> : null}>{activeStep === steps.length - 1 ? 'Go to Dashboard' : 'Next'}</Button>}
          backButton={<Button size="small" onClick={() => setActiveStep(s => s - 1)} disabled={activeStep === 0} startIcon={<KeyboardArrowLeftIcon />}>Back</Button>} />
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setActiveStep(s => s - 1)} disabled={activeStep === 0}>Back</Button>
          <Button variant="contained" onClick={activeStep === steps.length - 1 ? onDone : () => setActiveStep(s => s + 1)}>
            {activeStep === steps.length - 1 ? 'Go to Dashboard' : 'Next'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

function TrackB({ webhookToken, apiUrl, onDone }) {
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
      label: 'Your webhook token',
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This token identifies your account. It's already embedded in the config snippet in the next step.
          </Typography>
          <CopyBlock code={webhookToken} label="Copy token" />
          <Alert severity="info">Keep this token private — it grants access to your task list.</Alert>
        </>
      )
    },
    {
      label: 'Add MCP config',
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Add this to your Claude Desktop config file. Your token is already filled in.
          </Typography>
          <Box mb={1}>
            <Chip label={isMac ? 'macOS' : 'Windows'} size="small" color="primary" sx={{ mr: 1 }} />
            <CopyBlock code={configPath} label="Copy path" />
          </Box>
          <CopyBlock code={mcpConfig} label="Copy config" />
        </>
      )
    },
    {
      label: 'Restart Claude Desktop',
      content: (
        <Box py={2}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Fully quit and reopen Claude Desktop so it loads the new MCP server configuration.
          </Typography>
          <Alert severity="warning">Make sure to <strong>fully quit</strong> (not just close the window) before reopening.</Alert>
        </Box>
      )
    },
    {
      label: 'Add custom instruction',
      content: (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This tells Claude to automatically log what it accomplished at the end of every conversation.
          </Typography>
          <CopyBlock code={customInstruction} label="Copy instruction" />
          <Typography variant="body2" color="text.secondary">
            In Claude Desktop: <strong>Settings → Custom Instructions</strong> → paste the text above.
          </Typography>
        </>
      )
    },
    {
      label: "You're connected!",
      content: (
        <Box textAlign="center" py={2}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} mb={1}>Claude Desktop is linked</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Claude Desktop will call ClaudeCurate at the end of each conversation and auto-complete matching tasks.
          </Typography>
          <Alert severity="info" sx={{ textAlign: 'left' }}>
            This relies on Claude following your custom instruction — it works ~95% of the time.
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
        <Typography variant="caption" color="text.secondary" mb={1} display="block">Step {activeStep + 1} of {steps.length}: {steps[activeStep].label}</Typography>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3, minHeight: 220 }}>
        {steps[activeStep].content}
      </Paper>

      {isMobile ? (
        <MobileStepper steps={steps.length} position="static" activeStep={activeStep}
          nextButton={<Button size="small" onClick={activeStep === steps.length - 1 ? onDone : () => setActiveStep(s => s + 1)} endIcon={activeStep < steps.length - 1 ? <KeyboardArrowRightIcon /> : null}>{activeStep === steps.length - 1 ? 'Go to Dashboard' : 'Next'}</Button>}
          backButton={<Button size="small" onClick={() => setActiveStep(s => s - 1)} disabled={activeStep === 0} startIcon={<KeyboardArrowLeftIcon />}>Back</Button>} />
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setActiveStep(s => s - 1)} disabled={activeStep === 0}>Back</Button>
          <Button variant="contained" onClick={activeStep === steps.length - 1 ? onDone : () => setActiveStep(s => s + 1)}>
            {activeStep === steps.length - 1 ? 'Go to Dashboard' : 'Next'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

const METHOD_CARDS = [
  { id: 'code', icon: <TerminalIcon sx={{ fontSize: 40 }} />, title: 'Claude Code (CLI)', subtitle: 'I use `claude` in my terminal', color: '#5b4fcf' },
  { id: 'desktop', icon: <DesktopWindowsIcon sx={{ fontSize: 40 }} />, title: 'Claude Desktop app', subtitle: 'I use the desktop app', color: '#1976d2' },
  { id: 'manual', icon: <EditNoteIcon sx={{ fontSize: 40 }} />, title: 'Set up later', subtitle: "I'll track tasks manually for now", color: '#9e9e9e' }
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [method, setMethod] = useState(null)
  const [snack, setSnack] = useState('')

  const webhookToken = localStorage.getItem('webhookToken') || ''
  const apiUrl = process.env.REACT_APP_API_URL || window.location.origin

  const handleDone = () => {
    localStorage.setItem('onboardingComplete', 'true')
    navigate('/dashboard')
  }

  if (!method) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" mb={1}>Connect Claude</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
            How do you use Claude? We'll walk you through linking it to ClaudeCurate.
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
          <Typography variant="h6" fontWeight={600} mb={1}>No problem!</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            ClaudeCurate works great as a standalone task tracker. You can connect Claude at any time from <strong>Profile → Claude Integration</strong>.
          </Typography>
          <Button variant="contained" onClick={handleDone} fullWidth>Go to Dashboard</Button>
          <Button sx={{ mt: 1 }} onClick={() => setMethod(null)} fullWidth>Go back</Button>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', px: 2, py: 4 }}>
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
          <Button onClick={() => setMethod(null)} size="small">← Back</Button>
          <Typography variant="h6" fontWeight={700}>
            {method === 'code' ? 'Connect Claude Code' : 'Connect Claude Desktop'}
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
