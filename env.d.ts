/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface MetaEnv {
  readonly env: ImportMetaEnv
}
