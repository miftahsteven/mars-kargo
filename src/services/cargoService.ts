import { IslandData, ExceptionItem, PodItem, InvoiceItem, ShipmentItem, MapPin, TrackingSearchResult, StatMetric, GetShipmentsParams } from '../types/cargo';
import axios from 'axios';
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

  getKurirCompletion: async (officerIdParam?: number | string): Promise<{ total_on_delivery: number; total_completed: number } | null> => {
    const currentUser = authService.getCurrentUser();
    const rawUserData = authService.getRawUserData();
    const loggedInUserId = currentUser?.user_id || rawUserData?.user_id || 886;
    const officerId = officerIdParam ?? loggedInUserId;

    try {
      const response = await axios.get('https://cargo.marscargo.net/api.php', {
        params: {
          action: 'get-kurir-completion',
          officer_id: officerId,
        },
        headers: {
          Authorization: 'KODE_RAHASIA_DASHBOARD_123',
        },
      });

      let resData = response.data;
      if (typeof resData === 'string') {
        const jsonStartIndex = resData.indexOf('{');
        if (jsonStartIndex !== -1) {
          try {
            resData = JSON.parse(resData.substring(jsonStartIndex));
          } catch (e) {
            console.warn('Failed to parse sanitized response:', e);
          }
        }
      }

      if (resData && resData.status === 'success' && resData.data_akumulasi) {
        return {
          total_on_delivery: Number(resData.data_akumulasi.total_on_delivery ?? 0),
          total_completed: Number(resData.data_akumulasi.total_completed ?? 0),
        };
      }
    } catch (err) {
      console.warn('Failed to fetch kurir completion data:', err);
    }
    return null;
  },

  getSummaryMetrics: async (params?: {
    officer_id?: number | string;
    start_date?: string;
    end_date?: string;
  }): Promise<StatMetric[]> => {
    const currentUser = authService.getCurrentUser();
    const rawUserData = authService.getRawUserData();
    const loggedInUserId = currentUser?.user_id || rawUserData?.user_id || 886;
    const officerId = params?.officer_id ?? loggedInUserId;

    const [d, kurirCompletion] = await Promise.all([
      cargoService.getRawSummaryMetrics(params),
      cargoService.getKurirCompletion(officerId),
    ]);

    if (d) {
      const transitValue = kurirCompletion !== null ? kurirCompletion.total_on_delivery : 18991;
      const selesaiValue = kurirCompletion !== null ? kurirCompletion.total_completed : 5618;

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
          value: transitValue.toLocaleString('id-ID'),
          sub: 'sedang dikirim',
          icon: 'truck',
          color: '#dd2b0f',
        },
        {
          label: 'Selesai',
          value: selesaiValue.toLocaleString('id-ID'),
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

  getIslandsData: async (params?: { officer_id?: number | string; office_id?: number | string }): Promise<IslandData[]> => {
    const currentUser = authService.getCurrentUser();
    const rawUserData = authService.getRawUserData();
    const loggedInUserId = currentUser?.user_id || rawUserData?.user_id || 886;
    const loggedInCabangId = currentUser?.cabang_id || rawUserData?.cabang_id || 846;
    const officerId = params?.officer_id ?? loggedInUserId;
    const officeId = params?.office_id ?? loggedInCabangId;

    try {
      const response = await apiClient.get('', {
        params: {
          action: 'get-pengiriman-per-wilayah',
          officer_id: officerId,
          office_id: officeId,
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

  getExceptions: async (params?: { officer_id?: number | string; office_id?: number | string }): Promise<ExceptionItem[]> => {
    const currentUser = authService.getCurrentUser();
    const rawUserData = authService.getRawUserData();
    const loggedInUserId = currentUser?.user_id || rawUserData?.user_id || 886;
    const loggedInCabangId = currentUser?.cabang_id || rawUserData?.cabang_id || 846;
    const officerId = params?.officer_id ?? loggedInUserId;
    const officeId = params?.office_id ?? loggedInCabangId;

    // 1. Integrasi data kendala aktif dari Mobile Apps Backend (Prisma DB /api/packages)
    try {
      const backendResponse = await axios.get('https://apps-api.marscargo.net/api/packages', { timeout: 8000 });
      if (
        backendResponse.data &&
        (backendResponse.data.success || backendResponse.data.status === 'success') &&
        Array.isArray(backendResponse.data.data)
      ) {
        const rawPackages: any[] = backendResponse.data.data;
        const kendalaItems = rawPackages.filter((item: any) => {
          const statusLower = String(item.status || '').toLowerCase();
          const notesUpper = String(item.notes || '').toUpperCase();
          return statusLower.includes('kendala') || notesUpper.includes('KENDALA');
        });

        if (kendalaItems.length > 0) {
          return kendalaItems.map((item: any) => {
            const rawNotes = String(item.notes || 'Terdapat kendala pengiriman dilaporkan kurir');
            const cleanIssue = rawNotes.replace(/^(KENDALA:\s*)+/i, '').trim();

            const dateStr = item.updatedAt || item.createdAt;
            const formattedDate = dateStr
              ? new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Hari ini';

            return {
              resi: item.resi || 'RESI-UNKNOWN',
              proyek: item.category ? `Distribusi ${item.category}` : 'Distribusi Buku 2026',
              issue: cleanIssue || 'Terdapat kendala pengiriman dilaporkan kurir',
              lokasi: item.recipientAddress ? `${item.recipientName} (${item.recipientAddress.replace(/[\r\n]+/g, ', ')})` : (item.recipientName || 'Lokasi tidak diketahui'),
              since: formattedDate,
            };
          });
        }
      }
    } catch (backendErr) {
      console.warn('Mobile apps backend packages fetch notice:', backendErr);
    }

    // 2. Fallback ke endpoint legacy get-kendala-aktif (Legacy API)
    try {
      const response = await apiClient.get('', {
        params: {
          action: 'get-kendala-aktif',
          officer_id: officerId,
          office_id: officeId,
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
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        return response.data.data.map((item: any) => {
          let realTanggal = item.tanggal;
          if (!realTanggal || realTanggal === '01 Jan 1970' || realTanggal === '1970-01-01') {
            if (item.image_url) {
              const match = item.image_url.match(/20\d\d-\d\d-\d\d/);
              if (match) {
                const [yyyy, mm, dd] = match[0].split('-');
                const mIdx = parseInt(mm, 10) - 1;
                if (mIdx >= 0 && mIdx < 12) {
                  const dayStr = String(parseInt(dd, 10)).padStart(2, '0');
                  realTanggal = `${dayStr} ${months[mIdx]} ${yyyy}`;
                }
              }
            }
          }
          if (!realTanggal || realTanggal === '01 Jan 1970') {
            realTanggal = 'Hari ini';
          }

          const penerimaName = item.penerima || 'Lokasi Penerima';
          const subTextFormatted = `${penerimaName} · ${realTanggal}`;

          return {
            resi: item.cons_no || 'RESI-UNKNOWN',
            lokasi: penerimaName,
            tanggal: realTanggal,
            photoUrl: item.image_url || MOCK_PHOTOS.podHandoff1,
            penerima: penerimaName,
            subtext: subTextFormatted,
            image_url: item.image_url,
          };
        });
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

  getRiwayatPengirimanAll: async (params?: GetShipmentsParams): Promise<{ shipments: ShipmentItem[]; totalData: number }> => {
    const currentUser = authService.getCurrentUser();
    const rawUserData = authService.getRawUserData();
    const loggedInOfficeId = currentUser?.cabang_id || rawUserData?.cabang_id || 866;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const queryParams: Record<string, any> = {
      action: 'get-riwayat-pengiriman-all',
      start_date: params?.start_date ?? '2026-07-17',
      end_date: params?.end_date ?? todayStr,
      office_id: params?.office_id ?? params?.officer_id ?? loggedInOfficeId,
    };

    if (params?.cons_no) {
      queryParams.cons_no = params.cons_no;
    }

    if (params?.limit !== undefined) {
      queryParams.limit = params.limit;
    }

    queryParams.order = params?.order ?? 'desc';

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

      // 2. Integrasi data paket dari Mobile Apps Backend (Prisma DB /api/packages)
      let appsPackagesMap: Record<string, any> = {};
      try {
        const appsRes = await axios.get('https://apps-api.marscargo.net/api/packages', { timeout: 8000 });
        if (appsRes.data && (appsRes.data.success || appsRes.data.status === 'success') && Array.isArray(appsRes.data.data)) {
          appsRes.data.data.forEach((p: any) => {
            if (p.resi) {
              appsPackagesMap[String(p.resi).trim().toUpperCase()] = p;
            }
          });
        }
      } catch (appsErr) {
        console.warn('Mobile apps backend packages map notice:', appsErr);
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

          const cleanResiUpper = String(resiStr).trim().toUpperCase();
          const appsPkg = appsPackagesMap[cleanResiUpper];

          const isScannedViaApps = !!appsPkg;

          let courierName = '-';
          let pickupTime = '-';
          let pickupMethod = '-';

          if (isScannedViaApps) {
            const rawCourier =
              appsPkg.courierName ||
              appsPkg.courier?.fullName ||
              appsPkg.courier?.email ||
              appsPkg.courierId;

            if (rawCourier && rawCourier !== 'null' && rawCourier !== 'undefined') {
              courierName = rawCourier;
            } else {
              courierName = 'Kurir Apps';
            }
            const rawTime = appsPkg.updatedAt || appsPkg.createdAt;
            pickupTime = rawTime
              ? new Date(rawTime).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              : 'Waktu Scan Apps';
            pickupMethod = 'Android App';
          } else if (item.status_terakhir && (item.status_terakhir.toLowerCase().includes('pickup') || item.status_terakhir.toLowerCase().includes('pick up'))) {
            pickupMethod = 'Manual Dashboard';
            courierName = 'Pickup Manual';
            pickupTime = item.tgl_kirim || '-';
          }

          let itemLat: number | undefined = appsPkg?.shareLat || appsPkg?.scanLat || appsPkg?.latitude || appsPkg?.dashboardLat;
          let itemLng: number | undefined = appsPkg?.shareLng || appsPkg?.scanLng || appsPkg?.longitude || appsPkg?.dashboardLng;

          if ((itemLat === undefined || itemLng === undefined) && Array.isArray(item.timeline)) {
            const validLoc = item.timeline.find((t: any) => t && t.lat && t.lon);
            if (validLoc) {
              const pLat = parseFloat(validLoc.lat);
              const pLng = parseFloat(validLoc.lon);
              if (!isNaN(pLat) && !isNaN(pLng) && (pLat !== 0 || pLng !== 0)) {
                itemLat = pLat;
                itemLng = pLng;
              }
            }
          }

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
            statusTerakhir: appsPkg?.status || item.status_terakhir || 'Menunggu Pickup',
            proyek: projName,
            tglKirim: infoPaket.tanggal_angkut || item.tgl_kirim || '-',
            tujuan: item.tujuan || penerimaObj.alamat || '-',
            berat: item.berat_vol || '0 kg',
            tarif: item.tarif_kontrak || '-',
            penerima: item.penerima || penerimaObj.nama || '-',
            waktuTerima: item.waktu_diterima || '-',
            photoUrl: appsPkg?.pickupPhotoUrl || item.foto || '',
            pengirim: pengirimObj.nama || 'PUSAT PEMBINAAN BAHASA DAN SASTRA',
            teleponPengirim: pengirimObj.telepon || '-',
            alamatPengirim: pengirimObj.alamat || '-',
            teleponPenerima: penerimaObj.telepon || '-',
            alamatPenerima: penerimaObj.alamat || item.tujuan || '-',
            jenisBarang: infoPaket.jenis_barang || 'BUKU',
            tipeBooking: infoPaket.tipe_booking || 'Tidak Langsung',
            tanggalInput: infoPaket.tanggal_angkut || item.tgl_kirim || '-',
            tanggalAngkut: infoPaket.tanggal_angkut || '-',
            keterangan: infoPaket.keterangan || '-',
            isScannedViaApps,
            courierName,
            pickupTime,
            pickupMethod,
            latitude: itemLat,
            longitude: itemLng,
            pickupPhotoUrl: appsPkg?.pickupPhotoUrl || item.foto,
            statusTimeline: Array.isArray(item.timeline)
              ? item.timeline.map((t: any) => ({
                waktu: t.waktu || '-',
                status: t.status || '-',
                lokasi: t.lokasi || '-',
              }))
              : [],
          };
        });

        const parseTanggalAngkut = (dateStr?: string): Date | null => {
          if (!dateStr || dateStr === '-') return null;
          const parts = dateStr.trim().split(' ');
          if (parts.length < 3) return null;
          const day = parseInt(parts[0], 10);
          const monthStr = parts[1].toLowerCase();
          const year = parseInt(parts[2], 10);

          const months: Record<string, number> = {
            jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5, jul: 6, ags: 7, sep: 8, okt: 9, nov: 10, des: 11,
            january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
          };

          const month = months[monthStr] !== undefined ? months[monthStr] : 0;
          return new Date(year, month, day);
        };

        const startLimit = new Date(params?.start_date ?? '2026-07-17');
        startLimit.setHours(0, 0, 0, 0);

        const endLimit = new Date(params?.end_date ?? todayStr);
        endLimit.setHours(23, 59, 59, 999);

        const filteredMapped = mapped.filter((item: any) => {
          const tglAngkut = parseTanggalAngkut(item.tanggalAngkut);
          if (!tglAngkut) return false;
          return tglAngkut >= startLimit && tglAngkut <= endLimit;
        });

        return { shipments: filteredMapped, totalData: filteredMapped.length };
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

  getPetaSebaran: async (params?: { officer_id?: number | string }): Promise<MapPin[]> => {
    const CITY_MAP: Record<string, { lat: number; lng: number }> = {
      'yogyakarta': { lat: -7.7956, lng: 110.3695 },
      'sleman': { lat: -7.7156, lng: 110.3556 },
      'bantul': { lat: -7.8897, lng: 110.3294 },
      'bandung': { lat: -6.9175, lng: 107.6191 },
      'surabaya': { lat: -7.2575, lng: 112.7521 },
      'bali': { lat: -8.4095, lng: 115.1889 },
      'ubud': { lat: -8.5069, lng: 115.2625 },
      'denpasar': { lat: -8.6705, lng: 115.2126 },
      'makassar': { lat: -5.1477, lng: 119.4327 },
      'aceh': { lat: 5.5483, lng: 95.3193 },
      'medan': { lat: 3.5952, lng: 98.6722 },
      'palembang': { lat: -2.9761, lng: 104.7754 },
      'padang': { lat: -0.9471, lng: 100.4172 },
      'pekanbaru': { lat: 0.5071, lng: 101.4478 },
      'lampung': { lat: -5.4500, lng: 105.2667 },
      'semarang': { lat: -6.9667, lng: 110.4167 },
      'solo': { lat: -7.5755, lng: 110.8243 },
      'surakarta': { lat: -7.5755, lng: 110.8243 },
      'malang': { lat: -7.9666, lng: 112.6326 },
      'pontianak': { lat: -0.0263, lng: 109.3425 },
      'banjarmasin': { lat: -3.3167, lng: 114.5900 },
      'samarinda': { lat: -0.5022, lng: 117.1536 },
      'balikpapan': { lat: -1.2379, lng: 116.8529 },
      'manado': { lat: 1.4748, lng: 124.8428 },
      'ambon': { lat: -3.6554, lng: 128.1906 },
      'jayapura': { lat: -2.5489, lng: 140.7196 },
      'belitung': { lat: -2.7412, lng: 107.6688 },
      'lombok': { lat: -8.6500, lng: 116.3249 },
      'kupang': { lat: -10.1772, lng: 123.6070 },
      'bekasi': { lat: -6.2383, lng: 106.9756 },
      'bogor': { lat: -6.5971, lng: 106.8060 },
      'depok': { lat: -6.4025, lng: 106.7942 },
      'tangerang': { lat: -6.1783, lng: 106.6300 },
      'cikarang': { lat: -6.3060, lng: 107.1578 },
      'jakarta barat': { lat: -6.1683, lng: 106.7583 },
      'jakarta timur': { lat: -6.2250, lng: 106.9004 },
      'jakarta selatan': { lat: -6.2615, lng: 106.8106 },
      'jakarta utara': { lat: -6.1384, lng: 106.8640 },
      'jakarta pusat': { lat: -6.1805, lng: 106.8284 },
    };

    try {
      let rawData: any[] = [];

      // 1. Try with officer_id if passed
      if (params?.officer_id) {
        try {
          const res = await apiClient.get('', {
            params: { action: 'get-peta-sebaran', officer_id: params.officer_id },
          });
          if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            rawData = res.data.data;
          }
        } catch (e) { }
      }

      // 2. If empty, fetch get-peta-sebaran without officer_id
      if (rawData.length === 0) {
        const response = await apiClient.get('', {
          params: { action: 'get-peta-sebaran' },
        });
        if (response.data && Array.isArray(response.data.data)) {
          rawData = response.data.data;
        }
      }

      if (rawData.length > 0) {
        return rawData.map((item: any, index: number) => {
          const rawStatus = (item.status || '').toString().trim();
          let normStatus = rawStatus;
          if (rawStatus.toLowerCase().includes('complete') || rawStatus.toLowerCase().includes('terkirim') || rawStatus.toLowerCase().includes('selesai')) {
            normStatus = 'Delivered';
          } else if (rawStatus.toLowerCase().includes('delivery') || rawStatus.toLowerCase().includes('transit') || rawStatus.toLowerCase().includes('proses') || rawStatus.toLowerCase().includes('landed')) {
            normStatus = 'Dalam Transit';
          } else if (rawStatus.toLowerCase().includes('pick')) {
            normStatus = 'Menunggu Pickup';
          }

          const label = item.label_teks || 'Alamat Penerima';
          const labelLower = label.toLowerCase();

          let lat = typeof item.lat === 'number' ? item.lat : parseFloat(item.lat || '-6.164889');
          let lng = typeof item.lon === 'number' ? item.lon : parseFloat(item.lon || '106.87388');

          // City coordinate resolution if default Jakarta coordinates
          if ((isNaN(lat) || Math.abs(lat - (-6.164889)) < 0.001) && (isNaN(lng) || Math.abs(lng - 106.87388) < 0.001)) {
            for (const city in CITY_MAP) {
              if (labelLower.includes(city)) {
                lat = CITY_MAP[city].lat;
                lng = CITY_MAP[city].lng;
                break;
              }
            }
            // Small deterministic offset to scatter pins across city
            const hash = (index * 37 + (label.length * 13)) % 1000 - 500;
            lat += (hash * 0.00012);
            lng += (((index * 59) % 1000 - 500) * 0.00012);
          }

          const resiNo = item.no_resi && item.no_resi.trim() ? item.no_resi.trim() : `GLN${String(index + 2014).padStart(5, '0')}`;

          return {
            resi: resiNo,
            lokasi: label,
            lat,
            lng,
            status: normStatus as any,
            rawStatus: rawStatus || normStatus,
            color: normStatus === 'Delivered' ? '#1fa96a' : normStatus === 'Dalam Transit' ? '#e53935' : '#9b9797',
          };
        });
      }
    } catch (err) {
      console.warn('Failed to fetch get-peta-sebaran from API:', err);
    }
    return [];
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
