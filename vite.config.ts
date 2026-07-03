import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base is '/' because this project is served from the custom domain kredoc.me
// via GitHub Pages (see public/CNAME). If the custom domain is ever removed,
// change base to '/kredoc-family-academy/' to match the default Pages URL.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
