import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Запускать бэкенд и фронт перед тестами (опционально, если нет CI)
  // webServer: [
  //   { command: 'cd ../fullstack_backend && uvicorn main:app --port 8000', port: 8000 },
  //   { command: 'npm run dev', port: 5173, reuseExistingServer: true },
  // ],
})
