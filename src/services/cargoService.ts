import { IslandData, ExceptionItem, PodItem, InvoiceItem, ShipmentItem, MapPin, TrackingSearchResult, StatMetric } from '../types/cargo';
import { apiClient } from './api';
import { authService } from './authService';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

// Default mock images from Unsplash / SVG fallbacks
const MOCK_PHOTOS = {
  podHandoff1: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop',
  podHandoff2: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=400&auto=format&fit=crop',
  podHandoff3: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=400&auto=format&fit=crop',
  podTeam: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=400&auto=format&fit=crop',
  podFragile: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=400&auto=format&fit=crop',
};

const formatDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getDefaultEndDate = (): string => formatDate(new Date());
const getDefaultStartDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return formatDate(d);
};

export interface SummaryMetricsRaw {
  menunggu_pickup: number;
  persentase_menunggu_pickup: number;
  dalam_transit: number;
  persentase_dalam_transit: number;
  selesai: number;
  persentase_selesai: number;
  berkendala: number;
  persentase_berkendala: number;
  total_volume: number;
}

let activeSummaryPromise: Promise<SummaryMetricsRaw | null> | null = null;
let cachedSummaryParamKey: string = '';

export const cargoService = {
  getRawSummaryMetrics: async (params?: {
    officer_id?: number | string;
    start_date?: string;
    end_date?: string;
  }): Promise<SummaryMetricsRaw | null> => {
    const currentUser = authService.getCurrentUser();
    const rawUserData = authService.getRawUserData();
    const loggedInUserId = currentUser?.user_id || rawUserData?.user_id || 886;
    const officerId = params?.officer_id ?? loggedInUserId;

    const queryParams: Record<string, any> = {
      action: 'get-ringkasan-pengiriman-per-officer',
      officer_id: officerId,
    };

    if (params?.start_date) queryParams.start_date = params.start_date;
    if (params?.end_date) queryParams.end_date = params.end_date;

    const paramKey = JSON.stringify(queryParams);

    if (activeSummaryPromise && cachedSummaryParamKey === paramKey) {
      return activeSummaryPromise;
    }

    cachedSummaryParamKey = paramKey;
    activeSummaryPromise = (async () => {
      try {
        const response = await apiClient.get('', { params: queryParams });
        if (response.data && response.data.status === 'success' && response.data.data) {
          const d = response.data.data;
          return {
            menunggu_pickup: Number(d.menunggu_pickup ?? 0),
            persentase_menunggu_pickup: Number(d.persentase_menunggu_pickup ?? 0),
            dalam_transit: Number(d.dalam_transit ?? 0),
            persentase_dalam_transit: Number(d.persentase_dalam_transit ?? 0),
            selesai: Number(d.selesai ?? 0),
            persentase_selesai: Number(d.persentase_selesai ?? 0),
            berkendala: Number(d.berkendala ?? 0),
            persentase_berkendala: Number(d.persentase_berkendala ?? 0),
            total_volume: Number(d.total_volume ?? 0),
          };
        }
      } catch (err) {
        console.warn('Failed to fetch raw summary metrics from API:', err);
      } finally {
        setTimeout(() => {
          activeSummaryPromise = null;
        }, 300);
      }
      return null;
    })();

    return activeSummaryPromise;
  },

  getSummaryMetrics: async (params?: {
    officer_id?: number | string;
    start_date?: string;
    end_date?: string;
  }): Promise<StatMetric[]> => {
    const d = await cargoService.getRawSummaryMetrics(params);

    if (d) {
      return [
        {
          label: 'Menunggu Pickup',
          value: d.menunggu_pickup.toLocaleString('id-ID'),
          sub: 'paket siap dijemput',
          icon: 'package',
          color: '#605d5d',
        },
        {
          label: 'Dalam Transit',
          value: d.dalam_transit.toLocaleString('id-ID'),
          sub: 'sedang dikirim',
          icon: 'truck',
          color: '#dd2b0f',
        },
        {
          label: 'Selesai',
          value: d.selesai.toLocaleString('id-ID'),
          sub: `terkirim (${d.total_volume ? d.total_volume.toLocaleString('id-ID') + ' kg' : 'periode ini'})`,
          icon: 'check-circle-2',
          color: '#7c1405',
        },
        {
          label: 'Berkendala',
          value: d.berkendala.toLocaleString('id-ID'),
          sub: 'perlu tindak lanjut',
          icon: 'alert-triangle',
          color: '#ec3013',
        },
      ];
    }

    return [
      { label: 'Menunggu Pickup', value: '0', sub: 'paket siap dijemput', icon: 'package', color: '#605d5d' },
      { label: 'Dalam Transit', value: '0', sub: 'sedang dikirim', icon: 'truck', color: '#dd2b0f' },
      { label: 'Selesai', value: '0', sub: 'terkirim (0 kg)', icon: 'check-circle-2', color: '#7c1405' },
      { label: 'Berkendala', value: '0', sub: 'perlu tindak lanjut', icon: 'alert-triangle', color: '#ec3013' },
    ];
  },
  getMapPins: async (): Promise<MapPin[]> => {
    if (USE_MOCK) {
      return [
        { resi: 'MC2607-88101', lokasi: 'SD Negeri 2 Menteng, Jakarta', x: '46%', y: '52%', lng: 106.8456, lat: -6.2088, status: 'Delivered', color: '#7c1405' },
        { resi: 'MC2607-88245', lokasi: 'SMP Negeri 5 Yogyakarta', x: '52%', y: '58%', lng: 110.3705, lat: -7.7956, status: 'Dalam Transit', color: '#ff9783' },
        { resi: 'MC2607-88390', lokasi: 'SD Negeri 1 Ubud, Bali', x: '68%', y: '64%', lng: 115.2625, lat: -8.5069, status: 'Delivered', color: '#7c1405' },
        { resi: 'MC2607-88512', lokasi: 'SMP Negeri 3 Makassar', x: '80%', y: '48%', lng: 119.4327, lat: -5.1477, status: 'Dalam Transit', color: '#ff9783' },
        { resi: 'MC2607-88677', lokasi: 'SD Negeri 4 Banda Aceh', x: '10%', y: '38%', lng: 95.3193, lat: 5.5483, status: 'Menunggu Pickup', color: '#9b9797' },
      ];
    }
    const response = await apiClient.get('/cargo/map-pins');
    return response.data;
  },

  getIslandsData: async (params?: { officer_id?: number | string }): Promise<IslandData[]> => {
    const currentUser = authService.getCurrentUser();
    const rawUserData = authService.getRawUserData();
    const loggedInUserId = currentUser?.user_id || rawUserData?.user_id || 886;
    const officerId = params?.officer_id ?? loggedInUserId;

    try {
      const response = await apiClient.get('', {
        params: {
          action: 'get-pengiriman-per-wilayah',
          officer_id: officerId,
        },
      });

      if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          id: (item.pulau_nama || 'wilayah').toLowerCase().replace(/\s+/g, '-'),
          name: item.pulau_nama || 'Lainnya',
          volume: Number(item.total_pengiriman_pulau ?? 0),
          provinces: (item.detail_kota || []).map((k: any) => ({
            name: k.kota_nama || 'Kota/Kab',
            volume: Number(k.total_pengiriman ?? 0),
          })),
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch pengiriman per wilayah from API:', err);
    }

    // Mock data fallback if network or endpoint error
    return [
      {
        id: 'sumatera',
        name: 'Sumatera',
        volume: 7384,
        provinces: [
          { name: 'MEDAN', volume: 450 },
          { name: 'PALEMBANG', volume: 320 },
          { name: 'PADANG', volume: 210 },
        ],
      },
      {
        id: 'jawa',
        name: 'Jawa',
        volume: 5786,
        provinces: [
          { name: 'SAMPANG', volume: 343 },
          { name: 'CIANJUR', volume: 303 },
          { name: 'SERANG', volume: 282 },
        ],
      },
      {
        id: 'sulawesi',
        name: 'Sulawesi',
        volume: 3093,
        provinces: [
          { name: 'MAKASSAR', volume: 210 },
          { name: 'MANADO', volume: 140 },
        ],
      },
    ];
  },

  getExceptions: async (params?: { officer_id?: number | string }): Promise<ExceptionItem[]> => {
    const currentUser = authService.getCurrentUser();
    const rawUserData = authService.getRawUserData();
    const loggedInUserId = currentUser?.user_id || rawUserData?.user_id || 886;
    const officerId = params?.officer_id ?? loggedInUserId;

    try {
      const response = await apiClient.get('', {
        params: {
          action: 'get-kendala-aktif',
          officer_id: officerId,
        },
      });

      if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          resi: item.cons_no || 'RESI-UNKNOWN',
          proyek: item.project_label || 'Umum',
          issue: item.kendala_text || 'Terdapat kendala pengiriman',
          lokasi: item.lokasi_waktu || 'Lokasi tidak diketahui',
          since: item.raw_date || 'Hari ini',
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch kendala aktif from API:', err);
    }

    return [];
  },

  getPodItems: async (params?: { officer_id?: number | string; limit?: number; order?: string }): Promise<PodItem[]> => {
    const currentUser = authService.getCurrentUser();
    const rawUserData = authService.getRawUserData();
    const loggedInUserId = currentUser?.user_id || rawUserData?.user_id || 886;
    const officerId = params?.officer_id ?? loggedInUserId;
    const limit = params?.limit ?? 10;
    const order = params?.order ?? 'desc';

    try {
      const response = await apiClient.get('', {
        params: {
          action: 'get-epod-gallery',
          officer_id: officerId,
          limit: limit,
          order: order,
        },
      });

      if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          resi: item.cons_no || 'RESI-UNKNOWN',
          lokasi: item.penerima || item.subtext || 'Lokasi Penerima',
          tanggal: item.tanggal || 'Hari ini',
          photoUrl: item.image_url || MOCK_PHOTOS.podHandoff1,
          penerima: item.penerima,
          subtext: item.subtext,
          image_url: item.image_url,
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch get-epod-gallery from API:', err);
    }

    return [
      { resi: 'GLN08618', lokasi: 'SD KARYA PUTRA (NPSN:20539175)', tanggal: '06 Jul 2026', photoUrl: MOCK_PHOTOS.podTeam },
      { resi: 'GLN08611', lokasi: 'SD BAITU ILMIN (NPSN:20531950)', tanggal: '06 Jul 2026', photoUrl: MOCK_PHOTOS.podFragile },
      { resi: 'GLN08608', lokasi: 'SD BUDI DHARMA (NPSN:20531905)', tanggal: '06 Jul 2026', photoUrl: MOCK_PHOTOS.podHandoff2 },
      { resi: 'GLN08606', lokasi: 'SD AL - FURQON (NPSN:20531860)', tanggal: '06 Jul 2026', photoUrl: MOCK_PHOTOS.podHandoff3 },
    ];
  },

  getInvoices: async (): Promise<InvoiceItem[]> => {
    if (USE_MOCK) {
      return [
        { no: 'INV/2026/06/0198', tanggal: '05 Jun 2026', jumlah: 'Rp 38.200.000', status: 'Lunas' },
        { no: 'INV/2026/07/0231', tanggal: '05 Jul 2026', jumlah: 'Rp 42.500.000', status: 'Lunas' },
        { no: 'INV/2026/07/0255', tanggal: '15 Jul 2026', jumlah: 'Rp 51.750.000', status: 'Belum Dibayar' },
      ];
    }
    const response = await apiClient.get('/cargo/invoices');
    return response.data;
  },

  getRiwayatPengirimanAll: async (params?: {
    officer_id?: number | string;
    limit?: number;
    cons_no?: string;
    order?: string;
  }): Promise<{ shipments: ShipmentItem[]; totalData: number }> => {
    const currentUser = authService.getCurrentUser();
    const rawUserData = authService.getRawUserData();
    const loggedInUserId = currentUser?.user_id || rawUserData?.user_id || 886;

    const queryParams: Record<string, any> = {
      action: 'get-riwayat-pengiriman-all',
    };

    if (params?.cons_no) {
      queryParams.cons_no = params.cons_no;
    } else {
      queryParams.officer_id = params?.officer_id ?? loggedInUserId;
    }

    if (params?.limit !== undefined) {
      queryParams.limit = params.limit;
    }

    if (params?.order) {
      queryParams.order = params.order;
    }

    try {
      const response = await apiClient.get('', { params: queryParams });
      let resData = response.data;
      if (typeof resData === 'string') {
        const jsonStart = resData.indexOf('{');
        if (jsonStart !== -1) {
          try {
            resData = JSON.parse(resData.substring(jsonStart));
          } catch (e) {
            console.warn('Failed to parse sanitized response:', e);
          }
        }
      }

      if (resData && resData.status === 'success' && Array.isArray(resData.data)) {
        const rawData = resData.data;
        const totalData = Number(resData.total_data ?? rawData.length);

        const projectNames = [
          'Distribusi Buku Sastra 2026',
          'Pengiriman Kamus Balai Bahasa',
          'Distribusi Modul Literasi 2026',
        ];

        const mapped: ShipmentItem[] = rawData.map((item: any, idx: number) => {
          const detail = item.detail_pengiriman || {};
          const pengirimObj = detail.pengirim || {};
          const penerimaObj = detail.penerima || {};
          const infoPaket = detail.info_paket || {};
          const resiStr = item.no_resi || item.cons_no || 'RESI-UNKNOWN';

          const barcode =
            item.barcode_url ||
            (resiStr !== 'RESI-UNKNOWN'
              ? `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(
                  resiStr
                )}&code=Code128&translate-esc=true`
              : '');

          const projName =
            item.proyek ||
            projectNames[idx % projectNames.length];

          return {
            resi: resiStr,
            barcodeUrl: barcode,
            statusTerakhir: item.status_terakhir || 'Menunggu Pickup',
            proyek: projName,
            tglKirim: item.tgl_kirim || '-',
            tujuan: item.tujuan || penerimaObj.alamat || '-',
            berat: item.berat_vol || '0 kg',
            tarif: item.tarif_kontrak || '-',
            penerima: item.penerima || penerimaObj.nama || '-',
            waktuTerima: item.waktu_diterima || '-',
            photoUrl: item.foto || MOCK_PHOTOS.podHandoff1,
            pengirim: pengirimObj.nama || 'PUSAT PEMBINAAN BAHASA DAN SASTRA',
            teleponPengirim: pengirimObj.telepon || '-',
            alamatPengirim: pengirimObj.alamat || '-',
            teleponPenerima: penerimaObj.telepon || '-',
            alamatPenerima: penerimaObj.alamat || item.tujuan || '-',
            jenisBarang: infoPaket.jenis_barang || 'BUKU',
            tipeBooking: infoPaket.tipe_booking || 'Tidak Langsung',
            tanggalInput: infoPaket.tanggal_input || item.tgl_kirim || '-',
            tanggalAngkut: infoPaket.tanggal_angkut || '-',
            keterangan: infoPaket.keterangan || '-',
            statusTimeline: Array.isArray(item.timeline)
              ? item.timeline.map((t: any) => ({
                  waktu: t.waktu || '-',
                  status: t.status || '-',
                  lokasi: t.lokasi || '-',
                }))
              : [],
          };
        });

        return { shipments: mapped, totalData };
      }
    } catch (err) {
      console.warn('Failed to fetch get-riwayat-pengiriman-all from API:', err);
    }

    return { shipments: [], totalData: 0 };
  },

  getShipments: async (params?: { officer_id?: number | string; limit?: number }): Promise<ShipmentItem[]> => {
    const res = await cargoService.getRiwayatPengirimanAll(params);
    if (res.shipments && res.shipments.length > 0) {
      return res.shipments;
    }

    return [
      {
        resi: 'MC2607-88101',
        barcodeUrl: 'https://barcode.tec-it.com/barcode.ashx?data=MC2607-88101&code=Code128',
        statusTerakhir: 'Completed',
        proyek: 'Distribusi Buku Sastra 2026',
        tglKirim: '10 Jul 2026',
        tujuan: 'SD Negeri 2 Menteng, Jakarta',
        berat: '18 kg',
        tarif: 'Rp 145.000',
        penerima: 'Ahmad Fauzi',
        waktuTerima: '12 Jul 2026, 10:14',
        photoUrl: MOCK_PHOTOS.podHandoff1,
        pengirim: 'Pusat Pembinaan Bahasa dan Sastra',
        teleponPengirim: '021-4896558',
        alamatPengirim: 'Jl. Daksinapati Barat IV, Jakarta Timur',
        teleponPenerima: '0812-3456-7801',
        alamatPenerima: 'Jl. Pendidikan No. 2, Menteng, Jakarta Pusat',
        jenisBarang: 'Buku Sastra & Bahan Bacaan',
        tipeBooking: 'Tidak Langsung',
        tanggalInput: '08 Jul 2026',
        tanggalAngkut: '10 Jul 2026',
        keterangan: '-',
        statusTimeline: [
          { waktu: '10 Jul 2026, 08:00', status: 'Pick Up', lokasi: 'Gudang Jakarta' },
          { waktu: '11 Jul 2026, 14:20', status: 'In Transit', lokasi: 'Hub Jakarta Pusat' },
          { waktu: '12 Jul 2026, 10:14', status: 'Completed', lokasi: 'SD Negeri 2 Menteng' },
        ],
      },
    ];
  },

  trackResi: async (input: string): Promise<TrackingSearchResult[]> => {
    const raw = input.trim();
    if (!raw) return [];

    const statuses = [
      { status: 'Dalam Transit', tagBg: '#fff2ef', tagColor: '#7c1405' },
      { status: 'Delivered', tagBg: '#f8f4f4', tagColor: '#444141' },
      { status: 'Menunggu Pickup', tagBg: '#ffe0da', tagColor: '#471d16' },
    ];
    const locs = [
      'SD Negeri 2 Menteng, Jakarta',
      'SMP Negeri 5 Yogyakarta',
      'SD Negeri 1 Ubud, Bali',
      'SMP Negeri 3 Makassar',
      'SD Negeri 4 Banda Aceh',
    ];

    return raw.split(',').map((r, i) => {
      const resi = r.trim() || 'MC2607-00000';
      const st = statuses[i % statuses.length];
      return { resi, lokasi: locs[i % locs.length], ...st };
    });
  },

  exportLpjCsv: (shipments: ShipmentItem[]) => {
    const header = ['No. Resi', 'Proyek', 'Tanggal Kirim', 'Tujuan', 'Berat/Volume', 'Tarif Kontrak', 'Penerima', 'Waktu Diterima'];
    const csv = [header.join(',')].concat(
      shipments.map((r) => [r.resi, r.proyek, r.tglKirim, r.tujuan, r.berat, r.tarif, r.penerima, r.waktuTerima]
        .map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(','))
    ).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LPJ_MarsCargo_PusatBahasa_Jul2026.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
};
