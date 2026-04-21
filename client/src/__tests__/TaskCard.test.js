import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import TaskCard from '../components/TaskCard'

const baseTask = {
  _id: 'task1',
  title: 'Build auth',
  description: 'Implement JWT login',
  status: 'pending',
  claudeKeywords: ['auth', 'jwt'],
  subtasks: []
}

const mockEdit = jest.fn()
const mockDelete = jest.fn()
const mockToggle = jest.fn()

afterEach(() => { mockEdit.mockReset(); mockDelete.mockReset(); mockToggle.mockReset() })

test('renders task title and description', () => {
  render(<TaskCard task={baseTask} onEdit={mockEdit} onDelete={mockDelete} onToggleSubtask={mockToggle} />)
  expect(screen.getByText('Build auth')).toBeInTheDocument()
  expect(screen.getByText('Implement JWT login')).toBeInTheDocument()
})

test('renders status chip', () => {
  render(<TaskCard task={baseTask} onEdit={mockEdit} onDelete={mockDelete} onToggleSubtask={mockToggle} />)
  expect(screen.getByText('Pending')).toBeInTheDocument()
})

test('renders keyword chips', () => {
  render(<TaskCard task={baseTask} onEdit={mockEdit} onDelete={mockDelete} onToggleSubtask={mockToggle} />)
  expect(screen.getByText('auth')).toBeInTheDocument()
  expect(screen.getByText('jwt')).toBeInTheDocument()
})

test('calls onEdit when edit button clicked', () => {
  render(<TaskCard task={baseTask} onEdit={mockEdit} onDelete={mockDelete} onToggleSubtask={mockToggle} />)
  fireEvent.click(screen.getByLabelText(/edit/i))
  expect(mockEdit).toHaveBeenCalledWith(baseTask)
})

test('calls onDelete when delete button clicked', async () => {
  mockDelete.mockResolvedValueOnce({})
  render(<TaskCard task={baseTask} onEdit={mockEdit} onDelete={mockDelete} onToggleSubtask={mockToggle} />)
  await act(async () => { fireEvent.click(screen.getByLabelText(/delete/i)) })
  expect(mockDelete).toHaveBeenCalledWith('task1')
})

test('renders subtask checklist with progress', () => {
  const task = { ...baseTask, subtasks: [
    { _id: 's1', title: 'Step one', status: 'complete', completedAt: new Date() },
    { _id: 's2', title: 'Step two', status: 'pending', completedAt: null }
  ]}
  render(<TaskCard task={task} onEdit={mockEdit} onDelete={mockDelete} onToggleSubtask={mockToggle} />)
  expect(screen.getByText('Step one')).toBeInTheDocument()
  expect(screen.getByText('Step two')).toBeInTheDocument()
  expect(screen.getByText('1/2')).toBeInTheDocument()
})

test('calls onToggleSubtask when subtask checkbox clicked', () => {
  const task = { ...baseTask, subtasks: [{ _id: 's1', title: 'Step one', status: 'pending', completedAt: null }] }
  render(<TaskCard task={task} onEdit={mockEdit} onDelete={mockDelete} onToggleSubtask={mockToggle} />)
  const checkboxes = screen.getAllByRole('checkbox')
  fireEvent.click(checkboxes[0])
  expect(mockToggle).toHaveBeenCalledWith('task1', 's1')
})
