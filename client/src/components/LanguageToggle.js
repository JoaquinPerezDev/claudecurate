import React from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const { user } = useAuth()
  const current = i18n.language?.startsWith('es') ? 'es' : 'en'

  const handleChange = async (_, newLang) => {
    if (!newLang || newLang === current) return
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
    // Sync to server so MCP language hint is correct
    if (user) {
      try { await api.patch('/api/auth/language', { language: newLang }) } catch {}
    }
  }

  return (
    <ToggleButtonGroup value={current} exclusive onChange={handleChange} size="small"
      sx={{ '& .MuiToggleButton-root': { px: 1.5, py: 0.5, fontSize: '1rem', border: '1px solid', borderColor: 'divider' } }}>
      <Tooltip title="English">
        <ToggleButton value="en" aria-label="English">🇺🇸</ToggleButton>
      </Tooltip>
      <Tooltip title="Español">
        <ToggleButton value="es" aria-label="Español">🇪🇸</ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  )
}
