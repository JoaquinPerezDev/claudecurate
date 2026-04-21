import React, { useState } from 'react'
import { Box, Chip, CircularProgress, Fab, Grid, Stack, Typography, Alert } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import Navbar from '../components/Navbar'
import StatsBar from '../components/StatsBar'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import { useTasks } from '../hooks/useTasks'

const FILTERS = ['All', 'Pending', 'In Progress', 'Complete']
const filterKey = { All: null, Pending: 'pending', 'In Progress': 'in_progress', Complete: 'complete' }

export default function DashboardPage() {
  const { tasks, loading, error, createTask, updateTask, deleteTask, toggleSubtask } = useTasks()
  const [filter, setFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const filtered = filterKey[filter] ? tasks.filter(t => t.status === filterKey[filter]) : tasks

  const handleSave = async (data) => {
    if (editTask) await updateTask(editTask._id, data)
    else await createTask(data)
  }

  const openEdit = (task) => { setEditTask(task); setModalOpen(true) }
  const openCreate = () => { setEditTask(null); setModalOpen(true) }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h5" fontWeight={700} mb={3}>My Tasks</Typography>

        <StatsBar tasks={tasks} />

        <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" useFlexGap>
          {FILTERS.map(f => (
            <Chip key={f} label={f} onClick={() => setFilter(f)}
              color={filter === f ? 'primary' : 'default'}
              variant={filter === f ? 'filled' : 'outlined'} />
          ))}
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">
              {filter === 'All' ? 'No tasks yet. Create your first task!' : `No ${filter.toLowerCase()} tasks.`}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filtered.map(task => (
              <Grid item xs={12} sm={6} lg={4} key={task._id}>
                <TaskCard task={task} onEdit={openEdit} onDelete={deleteTask} onToggleSubtask={toggleSubtask} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Fab color="primary" aria-label="add task" onClick={openCreate}
        sx={{ position: 'fixed', bottom: { xs: 72, sm: 24 }, right: 24 }}>
        <AddIcon />
      </Fab>

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} task={editTask} />
    </Box>
  )
}
