/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_AUTH_TOKEN: string;
  readonly VITE_USE_MOCK_API: string;
  readonly VITE_EPOD_TOTAL_COUNT?: string;
  readonly VITE_DEFAULT_WAKTU_TERIMA?: string;
  readonly VITE_DEFAULT_TANGGAL_TERIMA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
