import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppBar, BottomNavigation, BottomNavigationAction, Box, Button, IconButton, Paper, Snackbar, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
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
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar variant="dense" sx={{ gap: 0.5, minHeight: 44 }}>
            <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              ClaudeCurate
            </Typography>
            <LanguageToggle />
            <ThemeToggle />
          </Toolbar>
        </AppBar>
        <Box sx={{ pb: 7 }} />
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }} elevation={3}>
          <BottomNavigation value={route} onChange={(_, val) => navigate(val)} showLabels>
            <BottomNavigationAction label={t('nav.dashboard')} value="/dashboard" icon={<DashboardIcon />} />
            <BottomNavigationAction label={t('nav.profile')} value="/profile" icon={<PersonIcon />} />
          </BottomNavigation>
        </Paper>
        <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)} message={t('nav.tokenCopied')} />
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
          <LanguageToggle />
          <ThemeToggle />
          <Tooltip title={t('nav.copyToken')}>
            <IconButton onClick={copyToken} size="small"><ContentCopyIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Button size="small" startIcon={<PersonIcon />} onClick={() => navigate('/profile')}>{t('nav.profile')}</Button>
          <Button size="small" startIcon={<LogoutIcon />} onClick={handleLogout} color="inherit">{t('nav.logout')}</Button>
        </Toolbar>
      </AppBar>
      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)} message={t('nav.tokenCopied')} />
    </>
  )
}
