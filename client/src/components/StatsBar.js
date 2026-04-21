import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import ListAltIcon from '@mui/icons-material/ListAlt'

function Stat({ icon, label, value, color }) {
  return (
    <Paper sx={{ flex: 1, minWidth: 70, p: { xs: 1.5, sm: 2 }, textAlign: 'center', borderTop: `3px solid ${color}` }}>
      <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
      <Typography variant="h5" fontWeight={700} lineHeight={1}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
  )
}

export default function StatsBar({ tasks }) {
  const total = tasks.length
  const pending = tasks.filter(t => t.status === 'pending').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const complete = tasks.filter(t => t.status === 'complete').length

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
      <Stat icon={<ListAltIcon fontSize="small" />} label="Total" value={total} color="#5b4fcf" />
      <Stat icon={<RadioButtonUncheckedIcon fontSize="small" />} label="Pending" value={pending} color="#9e9e9e" />
      <Stat icon={<AutorenewIcon fontSize="small" />} label="In Progress" value={inProgress} color="#1976d2" />
      <Stat icon={<CheckCircleOutlineIcon fontSize="small" />} label="Complete" value={complete} color="#10b981" />
    </Box>
  )
}
