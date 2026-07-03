import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base is relative ('./') so the build works unmodified whether it's served
// from the repo subpath (https://<user>.github.io/kredoc-family-academy/)
// or from the custom domain root (https://kredoc.me) once DNS is live —
// an absolute base of '/' 404s every asset when served from the subpath.
export default defineConfig({
  plugins: [react()],
  base: './',
})
