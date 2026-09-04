import axios from 'axios';

function resolveBackendUrl(): string {
  let raw = (import.meta.env.VITE_BACKEND_API_URL || '').trim();

  // If the user or hosting environment accidentally included the variable name in the value:
  if (raw.startsWith('VITE_BACKEND_API_URL=')) {
    raw = raw.replace(/^VITE_BACKEND_API_URL=\s*/i, '').trim();
  }

  // Automatic environment detection
  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.')
  );

  // If we are in production (e.g. dashboard.marscargo.net), never allow a localhost URL
  if (!isLocal && raw.includes('localhost')) {
    return 'https://apps-api.marscargo.net';
  }

  // If raw contains a valid http/https URL, extract it
  const match = raw.match(/https?:\/\/[^\s'"]+/i);
  if (match) {
    return match[0].replace(/\/+$/, '');
  }

  return isLocal ? 'http://localhost:7030' : 'https://apps-api.marscargo.net';
}

const BACKEND_URL = resolveBackendUrl();

const client = axios.create({
  baseURL: `${BACKEND_URL}/api/distribusi-real`,
  timeout: 60000,
});

export interface RealSummaryData {
  totalVolume: number;
  totalShipments: number;
  totalProvinces: number;
  totalRegencies: number;
  slaOnTimePercentage: number;
  lastUpdated: string;
  batchId?: string;
}

export interface ProvinceItem {
  name: string;
  volume: number;
  shipments: number;
  sharePercentage: string;
}

export interface RegencyApiItem {
  id: string;
  name: string;
  volume: number;
  shipments: number;
  percentage: number;
  slaOnTime: number;
}

export interface SubdistrictApiItem {
  id: string;
  kecamatan: string;
  kodePos: string;
  volume: number;
  shipments: number;
  kabupaten: string;
  provinsi: string;
  status: string;
}

export interface SchoolCategoryApiItem {
  category: 'SD' | 'LAINNYA' | string;
  label: string;
  schoolCount: number;
  volumeKoli: number;
}

export interface SchoolApiItem {
  id: string;
  resi: string;
  name: string;
  npsn: string;
  category: 'SD' | 'SMP' | 'SMA' | 'LAINNYA';
  kecamatan: string;
  kodePos: string;
  volumeKoli: number;
  beratKg: number;
  penerima: string;
  jabatan: string;
  status: string;
  tanggalTerima: string;
  alamat: string;
}

export const distribusiRealService = {
  /**
   * 1. Get National Summary
   */
  async getSummary(): Promise<RealSummaryData> {
    const res = await client.get('/summary');
    return res.data.data;
  },

  /**
   * 2. Get Province List
   */
  async getProvinces(): Promise<{ provinces: ProvinceItem[]; totalVolume: number }> {
    const res = await client.get('/provinces');
    return {
      provinces: res.data.data,
      totalVolume: res.data.totalVolume,
    };
  },

  /**
   * 3. Get Regency breakdown for selected province
   */
  async getRegencies(provinsi: string): Promise<{
    provinceName: string;
    totalVolume: number;
    regencies: RegencyApiItem[];
  }> {
    const res = await client.get('/regencies', {
      params: { provinsi },
    });
    return res.data;
  },

  /**
   * 4. Get Subdistrict (Kecamatan & Kode Pos)
   */
  async getSubdistricts(params: {
    provinsi: string;
    kabupaten: string;
    kecamatan?: string;
    kodePos?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: SubdistrictApiItem[];
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
    districts: { name: string; count: number }[];
    postalCodes: { code: string; count: number }[];
  }> {
    const res = await client.get('/subdistricts', { params });
    return {
      items: res.data.data,
      totalItems: res.data.totalItems,
      page: res.data.page,
      limit: res.data.limit,
      totalPages: res.data.totalPages,
      districts: res.data.districts || [],
      postalCodes: res.data.postalCodes || [],
    };
  },

  /**
   * 5. Get Schools breakdown and list
   */
  async getSchools(params: {
    provinsi: string;
    kabupaten: string;
    kecamatan?: string;
    kodePos?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    categories: SchoolCategoryApiItem[];
    totalSchools: number;
    totalVolume: number;
    schools: SchoolApiItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const res = await client.get('/schools', { params });
    return {
      categories: res.data.summary.categories,
      totalSchools: res.data.summary.totalSchools,
      totalVolume: res.data.summary.totalVolume,
      schools: res.data.schools,
      pagination: res.data.pagination,
    };
  },

  /**
   * 6. Upload Excel File (.xlsx / .xls)
   */
  async uploadExcel(
    file: File,
    mode: 'replace' | 'upsert' = 'replace',
    onProgress?: (percent: number) => void
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      batchId: string;
      totalProcessed: number;
      insertedCount: number;
      totalInDatabase: number;
      provincesCount: number;
      totalVolumeKoli: number;
    };
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);

    const res = await client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return res.data;
  },
};
