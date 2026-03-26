/**
 * Общие хелперы для E2E тестов.
 * Предполагается, что бэкенд запущен на http://127.0.0.1:8000
 * и фронт на http://localhost:5173.
 */

import { expect } from '@playwright/test'

const API = 'http://127.0.0.1:8000'

let _counter = Date.now()
export function uniqueUser() {
  return `e2e_user_${_counter++}`
}

/** Регистрирует пользователя через API и возвращает credentials */
export async function registerUser(request, username, password = 'E2ePass1!', role = 'user') {
  const res = await request.post(`${API}/auth/register`, {
    data: { username, password, currency: '$', role },
  })
  expect(res.status()).toBe(200)
  return { username, password }
}

/** Логинится через API и возвращает токены */
export async function apiLogin(request, username, password = 'E2ePass1!') {
  const params = new URLSearchParams({ username, password })
  const res = await request.post(`${API}/auth/login`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: params.toString(),
  })
  expect(res.status()).toBe(200)
  return await res.json()
}

/** Логинится через UI */
export async function uiLogin(page, username, password = 'E2ePass1!') {
  await page.goto('/login')
  await page.getByLabel(/имя пользователя/i).fill(username)
  await page.getByLabel(/пароль/i).fill(password)
  await page.getByRole('button', { name: /войти/i }).click()
  await expect(page).not.toHaveURL(/login/)
}

/** Заполняет поле пароля на странице регистрации (два поля — нужен точный label) */
async function fillRegisterPassword(page, label, value) {
  await page.getByLabel(label, { exact: true }).fill(value)
}

/** Создаёт категорию через API */
export async function createCategory(request, token, name) {
  const res = await request.post(`${API}/categories/`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name, color: '#FF5500' },
  })
  expect(res.status()).toBe(200)
  return await res.json()
}

/** Создаёт операцию через API */
export async function createOperation(request, token, categoryId, amount = 100) {
  const res = await request.post(`${API}/operations/`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      date: new Date().toISOString().split('T')[0],
      amount,
      category_id: categoryId,
      comment: `E2E operation ${amount}`,
    },
  })
  expect(res.status()).toBe(200)
  return await res.json()
}
