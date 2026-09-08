/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECIPIENT_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
