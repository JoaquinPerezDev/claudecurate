import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppBar, BottomNavigation, BottomNavigationAction, Box, Button, IconButton, Paper, Snackbar, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [copied, setCopied] = useState(false)

  const copyToken = () => {
    const token = localStorage.getItem('webhookToken') || ''
    navigator.clipboard.writeText(token)
    setCopied(true)
  }

  const handleLogout = () => { logout(); navigate('/login') }

  if (isMobile) {
    const route = location.pathname
    return (
      <>
        <Box sx={{ pb: 7 }} />
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }} elevation={3}>
          <BottomNavigation value={route} onChange={(_, val) => navigate(val)} showLabels>
            <BottomNavigationAction label="Dashboard" value="/dashboard" icon={<DashboardIcon />} />
            <BottomNavigationAction label="Profile" value="/profile" icon={<PersonIcon />} />
          </BottomNavigation>
        </Paper>
        <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)} message="Webhook token copied!" />
      </>
    )
  }

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" fontWeight={700} color="primary" sx={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            ClaudeCurate
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>{user?.email}</Typography>
          <Tooltip title="Copy webhook token">
            <IconButton onClick={copyToken} size="small"><ContentCopyIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Button size="small" startIcon={<PersonIcon />} onClick={() => navigate('/profile')}>Profile</Button>
          <Button size="small" startIcon={<LogoutIcon />} onClick={handleLogout} color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>
      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)} message="Webhook token copied!" />
    </>
  )
}
