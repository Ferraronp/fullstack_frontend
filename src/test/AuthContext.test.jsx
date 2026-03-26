/**
 * Unit-тесты AuthContext
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useContext } from 'react'
import { AuthProvider, AuthContext } from '../context/AuthContext'

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

vi.mock('../api/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

import axios from 'axios'
import API from '../api/api'

function Consumer() {
  const { user, loading, login, logout } = useContext(AuthContext)
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.username : 'null'}</span>
      <button onClick={() => login('alice', 'pass123').catch(() => {})}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

function renderWithAuth() {
  return render(<AuthProvider><Consumer /></AuthProvider>)
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('loading становится false после завершения fetchMe без токена', async () => {
    renderWithAuth()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
  })

  it('без access_token: user остаётся null, API.get не вызывается', async () => {
    renderWithAuth()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
    expect(API.get).not.toHaveBeenCalled()
    expect(screen.getByTestId('user').textContent).toBe('null')
  })

  it('fetchMe загружает пользователя если есть access_token', async () => {
    localStorage.setItem('access_token', 'valid-token')
    API.get.mockResolvedValueOnce({ data: { username: 'alice' } })

    renderWithAuth()

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('alice'))
    expect(API.get).toHaveBeenCalledWith('/auth/me')
  })

  it('fetchMe при ошибке API оставляет user=null', async () => {
    localStorage.setItem('access_token', 'bad-token')
    API.get.mockRejectedValueOnce(new Error('401'))

    renderWithAuth()

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
    expect(screen.getByTestId('user').textContent).toBe('null')
  })

  it('login сохраняет токены в localStorage', async () => {
    axios.post.mockResolvedValueOnce({
      data: { access_token: 'acc', refresh_token: 'ref' },
    })
    // fetchMe после login — токен уже есть
    API.get.mockResolvedValueOnce({ data: { username: 'alice' } })

    renderWithAuth()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await act(async () => {
      await userEvent.click(screen.getByText('login'))
    })

    expect(localStorage.getItem('access_token')).toBe('acc')
    expect(localStorage.getItem('refresh_token')).toBe('ref')
  })

  it('login обновляет user после успешной аутентификации', async () => {
    axios.post.mockResolvedValueOnce({
      data: { access_token: 'acc', refresh_token: 'ref' },
    })
    API.get.mockResolvedValueOnce({ data: { username: 'alice' } })

    renderWithAuth()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await act(async () => {
      await userEvent.click(screen.getByText('login'))
    })

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('alice'))
  })

  it('login не падает при неверных credentials', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 401 } })

    renderWithAuth()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    // кнопка обёрнута в .catch() — компонент не крашится
    await act(async () => {
      await userEvent.click(screen.getByText('login'))
    })

    expect(screen.getByTestId('user').textContent).toBe('null')
  })

  it('logout очищает localStorage и сбрасывает user', async () => {
    localStorage.setItem('access_token', 'acc')
    localStorage.setItem('refresh_token', 'ref')
    API.get.mockResolvedValueOnce({ data: { username: 'alice' } })
    API.post.mockResolvedValueOnce({})

    renderWithAuth()
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('alice'))

    await act(async () => {
      await userEvent.click(screen.getByText('logout'))
    })

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(screen.getByTestId('user').textContent).toBe('null')
  })

  it('logout не падает если /auth/logout вернул ошибку', async () => {
    localStorage.setItem('access_token', 'acc')
    API.get.mockResolvedValueOnce({ data: { username: 'alice' } })
    API.post.mockRejectedValueOnce(new Error('Network Error'))

    renderWithAuth()
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('alice'))

    await act(async () => {
      await userEvent.click(screen.getByText('logout'))
    })

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(screen.getByTestId('user').textContent).toBe('null')
  })
})
