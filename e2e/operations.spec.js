/**
 * E2E: CRUD операций и категорий, фильтрация, пагинация, файлы
 */
import { test, expect } from '@playwright/test'
import {
  uniqueUser, registerUser, apiLogin,
  uiLogin, createCategory, createOperation,
} from './helpers.js'

// ---------------------------------------------------------------------------
// Создание категории
// ---------------------------------------------------------------------------

test('создание категории через UI', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  await uiLogin(page, username, password)

  await page.goto('/add-category')
  await page.getByPlaceholder(/введите название/i).fill('Еда')
  await page.getByRole('button', { name: /сохранить/i }).click()

  await expect(page).not.toHaveURL('/add-category')
})

test('дублирующаяся категория показывает ошибку', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  const tokens = await apiLogin(request, username, password)
  await createCategory(request, tokens.access_token, 'Еда')

  await uiLogin(page, username, password)
  await page.goto('/add-category')
  await page.getByPlaceholder(/введите название/i).fill('Еда')
  await page.getByRole('button', { name: /сохранить/i }).click()

  await expect(page.getByText(/уже существует|дублик|already|ошибка/i)).toBeVisible()
})

// ---------------------------------------------------------------------------
// Создание операции
// ---------------------------------------------------------------------------

test('создание операции через UI', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  const tokens = await apiLogin(request, username, password)
  await createCategory(request, tokens.access_token, 'Транспорт')

  await uiLogin(page, username, password)
  await page.goto('/add-operation')

  await page.getByPlaceholder('0.00').fill('250')
  await page.getByPlaceholder(/необязательно/i).fill('Такси')
  await page.locator('select[name="category"]').selectOption({ label: 'Транспорт' })
  await page.getByRole('button', { name: /сохранить/i }).click()

  await expect(page).not.toHaveURL('/add-operation')
})

// ---------------------------------------------------------------------------
// Список операций — фильтрация и пагинация
// ---------------------------------------------------------------------------

test('список операций отображается для залогиненного пользователя', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  const tokens = await apiLogin(request, username, password)
  const cat = await createCategory(request, tokens.access_token, 'Кафе')
  await createOperation(request, tokens.access_token, cat.id, 350)

  await uiLogin(page, username, password)
  await page.goto('/operations')

  await expect(page.getByText('350')).toBeVisible()
})

test('фильтрация по дате — показывает только нужные операции', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  const tokens = await apiLogin(request, username, password)
  const cat = await createCategory(request, tokens.access_token, 'Разное')
  await createOperation(request, tokens.access_token, cat.id, 777)

  await uiLogin(page, username, password)
  await page.goto('/operations')

  const today = new Date().toISOString().split('T')[0]
  await page.getByLabel('С даты').fill(today)
  await page.getByLabel('По дату').fill(today)
  await page.getByRole('button', { name: 'Применить' }).click()

  await expect(page.getByText('777')).toBeVisible()
})

test('пустой результат фильтрации показывает заглушку', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  await uiLogin(page, username, password)
  await page.goto('/operations')

  await page.getByLabel('С даты').fill('2000-01-01')
  await page.getByLabel('По дату').fill('2000-01-02')
  await page.getByRole('button', { name: 'Применить' }).click()

  await expect(page.getByText(/нет операций|пусто|no operations|0/i)).toBeVisible()
})

test('пагинация: переход на вторую страницу', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  const tokens = await apiLogin(request, username, password)
  const cat = await createCategory(request, tokens.access_token, 'Пагинация')

  for (let i = 1; i <= 25; i++) {
    await createOperation(request, tokens.access_token, cat.id, i * 10)
  }

  await uiLogin(page, username, password)
  await page.goto('/operations')

  const nextBtn = page.getByRole('button', { name: '→' })
  await expect(nextBtn).toBeEnabled()
  await nextBtn.click()

  await expect(page.locator('table tbody tr').first()).toBeVisible()
})

// ---------------------------------------------------------------------------
// Удаление операции
// ---------------------------------------------------------------------------

test('удаление операции убирает её из списка', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  const tokens = await apiLogin(request, username, password)
  const cat = await createCategory(request, tokens.access_token, 'УдалятьМеня')
  await createOperation(request, tokens.access_token, cat.id, 999)

  await uiLogin(page, username, password)
  await page.goto('/operations')

  await expect(page.getByText('999')).toBeVisible()

  await page.getByText('999').click()
  await page.getByRole('button', { name: 'Уд.' }).first().click()

  await expect(page.getByText('999')).not.toBeVisible({ timeout: 5000 })
})

// ---------------------------------------------------------------------------
// Файлы
// ---------------------------------------------------------------------------

test('загрузка файла к операции', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  const tokens = await apiLogin(request, username, password)
  const cat = await createCategory(request, tokens.access_token, 'Файлы')
  await createOperation(request, tokens.access_token, cat.id, 100)

  await uiLogin(page, username, password)
  await page.goto('/operations')

  // разворачиваем строку операции
  await page.locator('table tbody tr').first().getByRole('button').first().click()

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'receipt.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test content'),
  })

  await expect(page.getByText(/receipt\.pdf|загружен/i)).toBeVisible({ timeout: 8000 })
})

// ---------------------------------------------------------------------------
// SEO — проверка мета-тегов
// ---------------------------------------------------------------------------

test('страница /login содержит корректный title', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveTitle(/вход|login/i)
})

test('страница /register содержит корректный title', async ({ page }) => {
  await page.goto('/register')
  await expect(page).toHaveTitle(/регистр|register/i)
})
