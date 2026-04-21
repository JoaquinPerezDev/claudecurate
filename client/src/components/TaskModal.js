import React, { useState, useEffect } from 'react'
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

const EMPTY = { title: '', description: '', status: 'pending', claudeKeywords: [], subtasks: [] }

export default function TaskModal({ open, onClose, onSave, task }) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [form, setForm] = useState(EMPTY)
  const [keywordInput, setKeywordInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(task ? {
        title: task.title,
        description: task.description || '',
        status: task.status,
        claudeKeywords: [...(task.claudeKeywords || [])],
        subtasks: (task.subtasks || []).map(s => ({ ...s }))
      } : EMPTY)
      setKeywordInput('')
      setErrors({})
    }
  }, [open, task])

  const handleAddKeyword = () => {
    const kws = keywordInput.split(',').map(k => k.trim()).filter(Boolean)
    if (kws.length) {
      setForm(f => ({ ...f, claudeKeywords: [...new Set([...f.claudeKeywords, ...kws])] }))
      setKeywordInput('')
    }
  }

  const handleAddSubtask = () => {
    setForm(f => ({ ...f, subtasks: [...f.subtasks, { title: '', status: 'pending' }] }))
  }

  const handleSubtaskChange = (i, val) => {
    setForm(f => {
      const subs = [...f.subtasks]
      subs[i] = { ...subs[i], title: val }
      return { ...f, subtasks: subs }
    })
  }

  const handleRemoveSubtask = (i) => {
    setForm(f => ({ ...f, subtasks: f.subtasks.filter((_, idx) => idx !== i) }))
  }

  const handleSave = async () => {
    if (!form.title.trim()) return setErrors({ title: 'Title is required' })
    setSaving(true)
    try {
      await onSave({
        ...form,
        title: form.title.trim(),
        subtasks: form.subtasks.filter(s => s.title.trim()).map(s => ({ ...s, title: s.title.trim() }))
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm">
      <DialogTitle>{task ? 'Edit task' : 'New task'}</DialogTitle>
      <DialogContent dividers>
        <TextField fullWidth label="Title" value={form.title}
          onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors({}) }}
          error={!!errors.title} helperText={errors.title} sx={{ mb: 2 }} autoFocus />

        <TextField fullWidth multiline rows={2} label="Description (optional)" value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} sx={{ mb: 2 }} />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select value={form.status} label="Status" onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="complete">Complete</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" mb={1}>Claude keywords</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Words Claude sessions are matched against. Comma-separated.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField size="small" label="Add keywords" value={keywordInput}
            onChange={e => setKeywordInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
            sx={{ flex: 1 }} />
          <Button variant="outlined" onClick={handleAddKeyword} size="small">Add</Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {form.claudeKeywords.map(kw => (
            <Chip key={kw} label={kw} size="small" onDelete={() => setForm(f => ({ ...f, claudeKeywords: f.claudeKeywords.filter(k => k !== kw) }))} />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">Subtasks</Typography>
          <Button startIcon={<AddIcon />} size="small" onClick={handleAddSubtask}>Add subtask</Button>
        </Box>

        {form.subtasks.map((sub, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TextField size="small" fullWidth placeholder={`Subtask ${i + 1}`} value={sub.title}
              onChange={e => handleSubtaskChange(i, e.target.value)} />
            <IconButton size="small" onClick={() => handleRemoveSubtask(i)} color="error"><DeleteIcon fontSize="small" /></IconButton>
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
