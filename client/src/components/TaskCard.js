import React, { useState } from 'react'
import { Box, Card, CardContent, Checkbox, Chip, IconButton, LinearProgress, Tooltip, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const STATUS_COLORS = { pending: 'default', in_progress: 'primary', complete: 'success' }
const STATUS_LABELS = { pending: 'Pending', in_progress: 'In Progress', complete: 'Complete' }

export default function TaskCard({ task, onEdit, onDelete, onToggleSubtask }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try { await onDelete(task._id) } finally { setDeleting(false) }
  }

  const doneCount = task.subtasks?.filter(s => s.status === 'complete').length ?? 0
  const totalSubs = task.subtasks?.length ?? 0
  const progress = totalSubs > 0 ? Math.round((doneCount / totalSubs) * 100) : null

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: task.status === 'complete' ? 0.7 : 1 }}>
      <CardContent sx={{ flex: 1, p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, mr: 1, textDecoration: task.status === 'complete' ? 'line-through' : 'none' }}>
            {task.title}
          </Typography>
          <Chip label={STATUS_LABELS[task.status]} color={STATUS_COLORS[task.status]} size="small" />
        </Box>

        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {task.description}
          </Typography>
        )}

        {totalSubs > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Subtasks</Typography>
              <Typography variant="caption" color="text.secondary">{doneCount}/{totalSubs}</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 1, borderRadius: 4 }} color={progress === 100 ? 'success' : 'primary'} />
            {task.subtasks.map(sub => (
              <Box key={sub._id} sx={{ display: 'flex', alignItems: 'center', py: 0.25 }}>
                <Checkbox
                  size="small" checked={sub.status === 'complete'}
                  onChange={() => onToggleSubtask(task._id, sub._id)}
                  sx={{ p: 0.5, mr: 0.5 }}
                  disabled={task.status === 'complete' && sub.status === 'complete'}
                />
                <Typography variant="body2" sx={{ textDecoration: sub.status === 'complete' ? 'line-through' : 'none', color: sub.status === 'complete' ? 'text.disabled' : 'text.primary' }}>
                  {sub.title}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {task.claudeKeywords?.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {task.claudeKeywords.map(kw => (
              <Chip key={kw} label={kw} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
            ))}
          </Box>
        )}
      </CardContent>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1.5, pb: 1, gap: 0.5 }}>
        <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(task)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={handleDelete} disabled={deleting}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    </Card>
  )
}
