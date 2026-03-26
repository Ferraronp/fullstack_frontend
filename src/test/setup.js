import '@testing-library/jest-dom'

// localStorage mock — jsdom реализует его частично, пересоздаём чистый вариант
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Сбрасываем localStorage перед каждым тестом
beforeEach(() => {
  localStorage.clear()
})

// Заглушка для window.location.href (используется в api.js при clearSession)
delete window.location
window.location = { href: '' }
