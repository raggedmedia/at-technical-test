import { defineConfig, type Connect, type Plugin } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The original design lives in v1/ as its own page at /v1/. Send its
// client-side routes to v1/index.html instead of the v2 app.
const toV1: Connect.NextHandleFunction = (req, _res, next) => {
  if (req.url?.startsWith('/v1') && !req.url.includes('.')) req.url = '/v1/index.html'
  next()
}
const v1Fallback: Plugin = {
  name: 'v1-fallback',
  configureServer: server => { server.middlewares.use(toV1) },
  configurePreviewServer: server => { server.middlewares.use(toV1) },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(), v1Fallback],
  build: {
    rolldownOptions: {
      input: { main: resolve(__dirname, 'index.html'), v1: resolve(__dirname, 'v1/index.html') },
    },
  },
})
