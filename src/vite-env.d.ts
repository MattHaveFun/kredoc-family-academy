/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the kredoc-daily-update Cloudflare Worker (no trailing slash). */
  readonly VITE_WORKER_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
