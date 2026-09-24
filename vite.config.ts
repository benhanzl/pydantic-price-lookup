/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The package's `exports` map doesn't expose its package.json, so read the
// installed copy from disk. This reports the version actually bundled, not the
// range written in our package.json.
const genaiPricesPkg = JSON.parse(
  readFileSync(
    new URL('./node_modules/@pydantic/genai-prices/package.json', import.meta.url),
    'utf8',
  ),
) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __GENAI_PRICES_VERSION__: JSON.stringify(genaiPricesPkg.version),
  },
  build: {
    // genai-prices bundles its full price dataset (~700 kB); that's expected.
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
