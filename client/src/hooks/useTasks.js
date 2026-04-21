import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/api/tasks')
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [fetchTasks])

  const createTask = async (taskData) => {
    const { data } = await api.post('/api/tasks', taskData)
    setTasks(prev => [data, ...prev])
    return data
  }

  const updateTask = async (id, taskData) => {
    const { data } = await api.put(`/api/tasks/${id}`, taskData)
    setTasks(prev => prev.map(t => t._id === id ? data : t))
    return data
  }

  const deleteTask = async (id) => {
    await api.delete(`/api/tasks/${id}`)
    setTasks(prev => prev.filter(t => t._id !== id))
  }

  const toggleSubtask = async (taskId, subtaskId) => {
    const { data } = await api.patch(`/api/tasks/${taskId}/subtasks/${subtaskId}`)
    setTasks(prev => prev.map(t => t._id === taskId ? data : t))
    return data
  }

  return { tasks, loading, error, refetch: fetchTasks, createTask, updateTask, deleteTask, toggleSubtask }
}
