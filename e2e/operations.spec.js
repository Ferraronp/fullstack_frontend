/**
 * E2E: CRUD операций и категорий, фильтрация, пагинация, файлы
 */
import { test, expect } from '@playwright/test'
import {
  uniqueUser, registerUser, apiLogin,
  uiLogin, createCategory, createOperation,
} from './helpers.js'

const API = 'http://127.0.0.1:8000'

// ---------------------------------------------------------------------------
// Создание категории
// ---------------------------------------------------------------------------

test('создание категории через UI', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  await uiLogin(page, username, password)

  await page.goto('/add-category')
  await page.getByLabel(/название/i).fill('Еда')
  await page.getByRole('button', { name: /создать|сохранить|добавить/i }).click()

  // После создания — редирект или сообщение об успехе
  await expect(page.getByText(/еда|создана|успешно/i)).toBeVisible()
})

test('дублирующаяся категория показывает ошибку', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  const tokens = await apiLogin(request, username, password)
  await createCategory(request, tokens.access_token, 'Еда')

  await uiLogin(page, username, password)
  await page.goto('/add-category')
  await page.getByLabel(/название/i).fill('Еда')
  await page.getByRole('button', { name: /создать|сохранить|добавить/i }).click()

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

  await page.getByLabel(/сумма|amount/i).fill('250')
  await page.getByLabel(/комментарий|comment/i).fill('Такси')

  // выбираем категорию из select
  const catSelect = page.getByLabel(/категория|category/i)
  await catSelect.selectOption({ label: 'Транспорт' })

  await page.getByRole('button', { name: /создать|сохранить|добавить/i }).click()

  await expect(page.getByText(/операция|создана|250|такси/i)).toBeVisible({ timeout: 5000 })
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
  await page.getByLabel(/начало|start_date|от/i).fill(today)
  await page.getByLabel(/конец|end_date|до/i).fill(today)
  await page.getByRole('button', { name: /применить|фильтр|найти/i }).click()

  await expect(page.getByText('777')).toBeVisible()
})

test('пустой результат фильтрации показывает заглушку', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  await uiLogin(page, username, password)
  await page.goto('/operations')

  // ставим диапазон дат в прошлом — операций нет
  await page.getByLabel(/начало|start_date|от/i).fill('2000-01-01')
  await page.getByLabel(/конец|end_date|до/i).fill('2000-01-02')
  await page.getByRole('button', { name: /применить|фильтр|найти/i }).click()

  await expect(page.getByText(/нет операций|пусто|no operations|0/i)).toBeVisible()
})

test('пагинация: переход на вторую страницу', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  const tokens = await apiLogin(request, username, password)
  const cat = await createCategory(request, tokens.access_token, 'Пагинация')

  // создаём 25 операций — больше одной страницы (page_size=20)
  for (let i = 1; i <= 25; i++) {
    await createOperation(request, tokens.access_token, cat.id, i * 10)
  }

  await uiLogin(page, username, password)
  await page.goto('/operations')

  const nextBtn = page.getByRole('button', { name: /следующая|next|›|>>/i })
  await expect(nextBtn).toBeVisible()
  await nextBtn.click()

  // на второй странице что-то есть
  await expect(page.locator('table tbody tr, [data-testid="operation-item"]').first()).toBeVisible()
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

  // нажимаем удалить на этой операции
  const row = page.getByText('999').locator('..')
  await row.getByRole('button', { name: /удалить|delete/i }).click()

  // подтверждение (если есть)
  const confirm = page.getByRole('button', { name: /да|подтвердить|confirm/i })
  if (await confirm.isVisible()) await confirm.click()

  await expect(page.getByText('999')).not.toBeVisible({ timeout: 5000 })
})

// ---------------------------------------------------------------------------
// Файлы
// ---------------------------------------------------------------------------

test('загрузка файла к операции', async ({ page, request }) => {
  const { username, password } = await registerUser(request, uniqueUser())
  const tokens = await apiLogin(request, username, password)
  const cat = await createCategory(request, tokens.access_token, 'Файлы')
  const op = await createOperation(request, tokens.access_token, cat.id, 100)

  await uiLogin(page, username, password)
  await page.goto('/operations')

  // разворачиваем операцию для загрузки файла
  const expandBtn = page.getByText('100').locator('..').getByRole('button', { name: /файл|прикрепить|attach|expand/i })
  if (await expandBtn.isVisible()) await expandBtn.click()

  const fileInput = page.getByLabel(/файл|file/i)
  if (await fileInput.isVisible()) {
    await fileInput.setInputFiles({
      name: 'receipt.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 test content'),
    })
    await expect(page.getByText(/загружен|uploaded|receipt/i)).toBeVisible({ timeout: 8000 })
  }
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
