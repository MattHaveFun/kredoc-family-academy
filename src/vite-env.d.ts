/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Twelve Data API key — market quotes and time series. */
  readonly VITE_TWELVEDATA_API_KEY?: string
  /** Optional restricted OpenAI key for the daily narrative panel. */
  readonly VITE_OPENAI_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
