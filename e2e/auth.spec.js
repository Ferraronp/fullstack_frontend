/**
 * E2E: Аутентификация
 * - регистрация через UI
 * - вход / выход
 * - восстановление сессии по токену
 * - истечение сессии → редирект на /login
 */
import { test, expect } from '@playwright/test'
import { uniqueUser, registerUser, uiLogin } from './helpers.js'

// ---------------------------------------------------------------------------
// Регистрация
// ---------------------------------------------------------------------------

test('регистрация нового пользователя через UI', async ({ page }) => {
  const username = uniqueUser()
  await page.goto('/register')

  await page.getByLabel(/имя пользователя/i).fill(username)
  await page.getByLabel('Пароль:', { exact: true }).fill('E2ePass1!')
  await page.getByLabel('Повторите пароль:', { exact: true }).fill('E2ePass1!')
  await page.getByRole('button', { name: /зарегистрироваться/i }).click()

  // После успешной регистрации → редирект (логин или дашборд)
  await expect(page).not.toHaveURL('/register')
})

test('регистрация с уже существующим username показывает ошибку', async ({ page, request }) => {
  const username = uniqueUser()
  await registerUser(request, username)

  await page.goto('/register')
  await page.getByLabel(/имя пользователя/i).fill(username)
  await page.getByLabel('Пароль:', { exact: true }).fill('E2ePass1!')
  await page.getByLabel('Повторите пароль:', { exact: true }).fill('E2ePass1!')
  await page.getByRole('button', { name: /зарегистрироваться/i }).click()

  await expect(page.getByText(/уже существует|занято|already/i)).toBeVisible()
})

// ---------------------------------------------------------------------------
// Вход
// ---------------------------------------------------------------------------

test('успешный вход сохраняет токены и редиректит на главную', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  await page.goto('/login')

  await page.getByLabel(/имя пользователя/i).fill(username)
  await page.getByLabel(/пароль/i).fill(password)
  await page.getByRole('button', { name: /войти/i }).click()

  await expect(page).not.toHaveURL('/login')

  const accessToken = await page.evaluate(() => localStorage.getItem('access_token'))
  const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'))
  expect(accessToken).toBeTruthy()
  expect(refreshToken).toBeTruthy()
})

test('вход с неверным паролем показывает ошибку', async ({ page, request }) => {
  const { username } = await registerUser(request, uniqueUser())
  await page.goto('/login')

  await page.getByLabel(/имя пользователя/i).fill(username)
  await page.getByLabel(/пароль/i).fill('wrongpassword')
  await page.getByRole('button', { name: /войти/i }).click()

  await expect(page.getByText(/неверное|ошибка|invalid/i)).toBeVisible()
  await expect(page).toHaveURL('/login')
})

test('вход с несуществующим пользователем показывает ошибку', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel(/имя пользователя/i).fill('nonexistent_xyz_123')
  await page.getByLabel(/пароль/i).fill('anypassword')
  await page.getByRole('button', { name: /войти/i }).click()

  await expect(page.getByText(/неверное|ошибка|invalid/i)).toBeVisible()
})

// ---------------------------------------------------------------------------
// Выход
// ---------------------------------------------------------------------------

test('выход очищает токены из localStorage', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  await uiLogin(page, username, password)

  // находим и нажимаем кнопку выхода
  await page.getByRole('button', { name: /выйти|logout/i }).click()

  const accessToken = await page.evaluate(() => localStorage.getItem('access_token'))
  expect(accessToken).toBeNull()
  await expect(page).toHaveURL('/login')
})

// ---------------------------------------------------------------------------
// Восстановление сессии
// ---------------------------------------------------------------------------

test('перезагрузка страницы восстанавливает сессию по токену', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  await uiLogin(page, username, password)

  // перезагружаем — AuthContext делает fetchMe при монтировании
  await page.reload()
  await expect(page).not.toHaveURL('/login')
})

// ---------------------------------------------------------------------------
// Защита маршрутов
// ---------------------------------------------------------------------------

test('незалогиненный пользователь редиректится с /operations на /login', async ({ page }) => {
  await page.goto('/operations')
  await expect(page).toHaveURL('/login')
})

test('незалогиненный пользователь редиректится с /add-operation на /login', async ({ page }) => {
  await page.goto('/add-operation')
  await expect(page).toHaveURL('/login')
})

test('обычный пользователь не попадает на /settings (admin)', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  await uiLogin(page, username, password)

  await page.goto('/settings')
  // редирект на главную (не на /settings)
  await expect(page).not.toHaveURL('/settings')
})

test('после logout защищённые маршруты снова недоступны', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  await uiLogin(page, username, password)

  await page.getByRole('button', { name: /выйти|logout/i }).click()
  await expect(page).toHaveURL('/login')

  await page.goto('/operations')
  await expect(page).toHaveURL('/login')
})
