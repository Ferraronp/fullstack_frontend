/**
 * Unit-тесты LoginPage:
 * рендер, валидация, успешный логин, обработка ошибок, навигация
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'

// navigate mock
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

// axios mock
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    })),
  },
}))

import axios from 'axios'

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('рендерит поля username и password', () => {
    renderLogin()
    expect(screen.getByLabelText(/имя пользователя/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument()
  })

  it('рендерит кнопки Войти и Регистрация', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /регистрация/i })).toBeInTheDocument()
  })

  it('не показывает ошибку при первом рендере', () => {
    renderLogin()
    expect(screen.queryByText(/неверное/i)).not.toBeInTheDocument()
  })

  it('успешный логин: сохраняет токены и редиректит на /', async () => {
    axios.post.mockResolvedValueOnce({
      data: { access_token: 'acc123', refresh_token: 'ref123' },
    })
    renderLogin()

    await userEvent.type(screen.getByLabelText(/имя пользователя/i), 'alice')
    await userEvent.type(screen.getByLabelText(/пароль/i), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBe('acc123')
      expect(localStorage.getItem('refresh_token')).toBe('ref123')
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('при 401 показывает сообщение об ошибке', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 401 } })
    renderLogin()

    await userEvent.type(screen.getByLabelText(/имя пользователя/i), 'alice')
    await userEvent.type(screen.getByLabelText(/пароль/i), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() =>
      expect(screen.getByText(/неверное имя пользователя или пароль/i)).toBeInTheDocument()
    )
  })

  it('при сетевой ошибке показывает сообщение об ошибке', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'))
    renderLogin()

    await userEvent.type(screen.getByLabelText(/имя пользователя/i), 'alice')
    await userEvent.type(screen.getByLabelText(/пароль/i), 'pass')
    await userEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() =>
      expect(screen.getByText(/неверное имя пользователя или пароль/i)).toBeInTheDocument()
    )
  })

  it('кнопка Регистрация ведёт на /register', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: /регистрация/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/register')
  })

  it('отправляет данные как form-urlencoded', async () => {
    axios.post.mockResolvedValueOnce({
      data: { access_token: 'a', refresh_token: 'r' },
    })
    renderLogin()

    await userEvent.type(screen.getByLabelText(/имя пользователя/i), 'bob')
    await userEvent.type(screen.getByLabelText(/пароль/i), 'secret')
    await userEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => expect(axios.post).toHaveBeenCalled())
    const [, body, config] = axios.post.mock.calls[0]
    expect(config.headers['Content-Type']).toContain('application/x-www-form-urlencoded')
    expect(body.toString()).toContain('username=bob')
    expect(body.toString()).toContain('password=secret')
  })

  it('форма требует заполнения username', () => {
    renderLogin()
    const input = screen.getByLabelText(/имя пользователя/i)
    expect(input).toBeRequired()
  })

  it('форма требует заполнения password', () => {
    renderLogin()
    const input = screen.getByLabelText(/пароль/i)
    expect(input).toBeRequired()
  })

  it('при повторной ошибке после успеха — сообщение об ошибке снова видно', async () => {
    axios.post
      .mockResolvedValueOnce({ data: { access_token: 'a', refresh_token: 'r' } })
      .mockRejectedValueOnce({ response: { status: 401 } })

    renderLogin()

    // первый логин — успешный, редирект
    await userEvent.type(screen.getByLabelText(/имя пользователя/i), 'alice')
    await userEvent.type(screen.getByLabelText(/пароль/i), 'pass')
    await userEvent.click(screen.getByRole('button', { name: /войти/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())

    // второй логин — ошибка
    await userEvent.clear(screen.getByLabelText(/пароль/i))
    await userEvent.type(screen.getByLabelText(/пароль/i), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /войти/i }))
    await waitFor(() =>
      expect(screen.getByText(/неверное имя пользователя или пароль/i)).toBeInTheDocument()
    )
  })
})
