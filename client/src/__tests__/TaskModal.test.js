import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskModal from '../components/TaskModal'

const mockSave = jest.fn()
const mockClose = jest.fn()

afterEach(() => { mockSave.mockReset(); mockClose.mockReset() })

test('renders blank form in create mode', () => {
  render(<TaskModal open={true} onClose={mockClose} onSave={mockSave} task={null} />)
  expect(screen.getByLabelText(/title/i)).toHaveValue('')
  expect(screen.getByText('New task')).toBeInTheDocument()
})

test('renders prefilled form in edit mode', () => {
  const task = { _id: 't1', title: 'Fix bug', description: 'Urgent', status: 'in_progress', claudeKeywords: ['bug'], subtasks: [] }
  render(<TaskModal open={true} onClose={mockClose} onSave={mockSave} task={task} />)
  expect(screen.getByLabelText(/title/i)).toHaveValue('Fix bug')
  expect(screen.getByText('Edit task')).toBeInTheDocument()
})

test('shows error if saved with empty title', async () => {
  render(<TaskModal open={true} onClose={mockClose} onSave={mockSave} task={null} />)
  fireEvent.click(screen.getByRole('button', { name: /create task/i }))
  expect(await screen.findByText(/title is required/i)).toBeInTheDocument()
  expect(mockSave).not.toHaveBeenCalled()
})

test('calls onSave with correct payload on create', async () => {
  mockSave.mockResolvedValueOnce({})
  render(<TaskModal open={true} onClose={mockClose} onSave={mockSave} task={null} />)
  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New task title' } })
  fireEvent.click(screen.getByRole('button', { name: /create task/i }))
  await waitFor(() => expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'New task title' })))
})

test('renders existing keyword chips in edit mode', () => {
  const task = { _id: 't1', title: 'Task', description: '', status: 'pending', claudeKeywords: ['react', 'frontend'], subtasks: [] }
  render(<TaskModal open={true} onClose={mockClose} onSave={mockSave} task={task} />)
  expect(screen.getByText('react')).toBeInTheDocument()
  expect(screen.getByText('frontend')).toBeInTheDocument()
})

test('adds a subtask row when Add subtask clicked', () => {
  render(<TaskModal open={true} onClose={mockClose} onSave={mockSave} task={null} />)
  fireEvent.click(screen.getByRole('button', { name: /add subtask/i }))
  expect(screen.getByPlaceholderText('Subtask 1')).toBeInTheDocument()
})
