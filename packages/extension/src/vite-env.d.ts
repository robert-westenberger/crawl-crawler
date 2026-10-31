/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DUMMY_WIDGET_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
