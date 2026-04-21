import React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { useColorMode } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { mode, toggleColorMode } = useColorMode()
  const isDark = mode === 'dark'

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton onClick={toggleColorMode} size="small" sx={{ fontSize: '1.1rem' }}>
        {isDark ? '☀️' : '🌙'}
      </IconButton>
    </Tooltip>
  )
}
