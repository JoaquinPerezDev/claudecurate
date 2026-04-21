import React, { createContext, useContext, useMemo, useState } from 'react'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'

const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'dark' })

export function useColorMode() {
  return useContext(ColorModeContext)
}

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'dark')

  const toggleColorMode = () => {
    setMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('themeMode', next)
      return next
    })
  }

  const theme = useMemo(() => createTheme({
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
    },
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#7c6de8' : '#5b4fcf' },
      secondary: { main: '#10b981' },
      background: mode === 'dark'
        ? { default: '#0f1117', paper: '#1a1b26' }
        : { default: '#f8f9fc', paper: '#ffffff' }
    },
    shape: { borderRadius: 10 },
    components: {
      MuiButton: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'dark'
              ? '0 1px 4px rgba(0,0,0,0.4)'
              : '0 1px 4px rgba(0,0,0,0.08)'
          }
        }
      }
    }
  }), [mode])

  return (
    <ColorModeContext.Provider value={{ toggleColorMode, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
