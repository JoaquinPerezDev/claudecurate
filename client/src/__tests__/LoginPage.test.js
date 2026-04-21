import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import { AuthContext } from '../context/AuthContext'

jest.mock('../api/axios')

const mockLogin = jest.fn()
const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

function renderLogin() {
  return render(
    <AuthContext.Provider value={{ user: null, login: mockLogin }}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

beforeEach(() => { mockLogin.mockReset(); mockNavigate.mockReset() })

test('renders email and password fields', () => {
  renderLogin()
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
})

test('shows validation errors on empty submit', async () => {
  renderLogin()
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
  expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
  expect(screen.getByText(/password is required/i)).toBeInTheDocument()
})

test('calls login and navigates to dashboard on success', async () => {
  mockLogin.mockResolvedValueOnce({})
  renderLogin()
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
})

test('shows API error on failed login', async () => {
  mockLogin.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } })
  renderLogin()
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@example.com' } })
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } })
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
  expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
})
