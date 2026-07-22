import { IslandData, ExceptionItem, PodItem, InvoiceItem, ShipmentItem, MapPin, TrackingSearchResult } from '../types/cargo';
import { apiClient } from './api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

// Default mock images from Unsplash / SVG fallbacks
const MOCK_PHOTOS = {
  podHandoff1: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop',
  podHandoff2: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=400&auto=format&fit=crop',
  podHandoff3: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=400&auto=format&fit=crop',
  podTeam: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=400&auto=format&fit=crop',
  podFragile: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=400&auto=format&fit=crop',
};

export const cargoService = {
  getMapPins: async (): Promise<MapPin[]> => {
    if (USE_MOCK) {
      return [
        { resi: 'MC2607-88101', lokasi: 'SD Negeri 2 Menteng, Jakarta', x: '46%', y: '52%', status: 'Delivered', color: '#7c1405' },
        { resi: 'MC2607-88245', lokasi: 'SMP Negeri 5 Yogyakarta', x: '52%', y: '58%', status: 'Dalam Transit', color: '#ff9783' },
        { resi: 'MC2607-88390', lokasi: 'SD Negeri 1 Ubud, Bali', x: '68%', y: '64%', status: 'Delivered', color: '#7c1405' },
        { resi: 'MC2607-88512', lokasi: 'SMP Negeri 3 Makassar', x: '80%', y: '48%', status: 'Dalam Transit', color: '#ff9783' },
        { resi: 'MC2607-88677', lokasi: 'SD Negeri 4 Banda Aceh', x: '10%', y: '38%', status: 'Menunggu Pickup', color: '#9b9797' },
      ];
    }
    const response = await apiClient.get('/cargo/map-pins');
    return response.data;
  },

  getIslandsData: async (): Promise<IslandData[]> => {
    if (USE_MOCK) {
      return [
        {
          id: 'sumatera',
          name: 'Sumatera',
          volume: 842,
          provinces: [
            { name: 'Aceh', volume: 112 },
            { name: 'Sumatera Utara', volume: 245 },
            { name: 'Riau', volume: 98 },
            { name: 'Sumatera Barat', volume: 87 },
            { name: 'Jambi', volume: 65 },
            { name: 'Sumatera Selatan', volume: 134 },
            { name: 'Lampung', volume: 101 },
          ],
        },
        {
          id: 'jawa',
          name: 'Jawa',
          volume: 2140,
          provinces: [
            { name: 'DKI Jakarta', volume: 520 },
            { name: 'Jawa Barat', volume: 610 },
            { name: 'Jawa Tengah', volume: 480 },
            { name: 'DI Yogyakarta', volume: 210 },
            { name: 'Jawa Timur', volume: 320 },
          ],
        },
        {
          id: 'kalimantan',
          name: 'Kalimantan',
          volume: 398,
          provinces: [
            { name: 'Kalimantan Barat', volume: 88 },
            { name: 'Kalimantan Tengah', volume: 64 },
            { name: 'Kalimantan Selatan', volume: 102 },
            { name: 'Kalimantan Timur', volume: 110 },
            { name: 'Kalimantan Utara', volume: 34 },
          ],
        },
        {
          id: 'sulawesi',
          name: 'Sulawesi',
          volume: 276,
          provinces: [
            { name: 'Sulawesi Utara', volume: 52 },
            { name: 'Sulawesi Tengah', volume: 41 },
            { name: 'Sulawesi Selatan', volume: 118 },
            { name: 'Sulawesi Tenggara', volume: 38 },
            { name: 'Gorontalo', volume: 15 },
            { name: 'Sulawesi Barat', volume: 12 },
          ],
        },
        {
          id: 'balinusa',
          name: 'Bali & Nusa Tenggara',
          volume: 184,
          provinces: [
            { name: 'Bali', volume: 76 },
            { name: 'Nusa Tenggara Barat', volume: 58 },
            { name: 'Nusa Tenggara Timur', volume: 50 },
          ],
        },
        {
          id: 'malukupapua',
          name: 'Maluku & Papua',
          volume: 96,
          provinces: [
            { name: 'Maluku', volume: 22 },
            { name: 'Maluku Utara', volume: 14 },
            { name: 'Papua', volume: 35 },
            { name: 'Papua Barat', volume: 25 },
          ],
        },
      ];
    }
    const response = await apiClient.get('/cargo/islands-distribution');
    return response.data;
  },

  getExceptions: async (): Promise<ExceptionItem[]> => {
    if (USE_MOCK) {
      return [
        {
          resi: 'MC2607-88231',
          proyek: 'Distribusi Buku Sastra 2026',
          issue: 'Alamat Balai Bahasa tutup sementara',
          lokasi: 'Balai Bahasa Provinsi Riau',
          since: '2 hari lalu',
        },
        {
          resi: 'MC2607-88452',
          proyek: 'Pengiriman Kamus Balai Bahasa',
          issue: 'Nomor telepon penerima tidak aktif',
          lokasi: 'SMP Negeri 2 Pontianak',
          since: '1 hari lalu',
        },
        {
          resi: 'MC2607-89011',
          proyek: 'Distribusi Buku Sastra 2026',
          issue: 'Cuaca ekstrem — akses jalan terputus',
          lokasi: 'SD Negeri 5 Kupang',
          since: '6 jam lalu',
        },
      ];
    }
    const response = await apiClient.get('/cargo/exceptions');
    return response.data;
  },

  getPodItems: async (): Promise<PodItem[]> => {
    if (USE_MOCK) {
      return [
        { resi: 'MC2607-87102', lokasi: 'SD Negeri 6 Ambon', tanggal: '14 Jul 2026', photoUrl: MOCK_PHOTOS.podTeam },
        { resi: 'MC2607-87209', lokasi: 'SMP Negeri 1 Jayapura', tanggal: '14 Jul 2026', photoUrl: MOCK_PHOTOS.podFragile },
        { resi: 'MC2607-87344', lokasi: 'SD Negeri 3 Palembang', tanggal: '15 Jul 2026', photoUrl: MOCK_PHOTOS.podHandoff2 },
        { resi: 'MC2607-87450', lokasi: 'SMP Negeri 7 Manado', tanggal: '15 Jul 2026', photoUrl: MOCK_PHOTOS.podHandoff3 },
      ];
    }
    const response = await apiClient.get('/cargo/epod');
    return response.data;
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

  getShipments: async (): Promise<ShipmentItem[]> => {
    if (USE_MOCK) {
      return [
        {
          resi: 'MC2607-88101',
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
        {
          resi: 'MC2607-88245',
          proyek: 'Pengiriman Kamus Balai Bahasa',
          tglKirim: '11 Jul 2026',
          tujuan: 'SMP Negeri 5 Yogyakarta',
          berat: '32 kg',
          tarif: 'Rp 210.000',
          penerima: 'Siti Rahayu',
          waktuTerima: '13 Jul 2026, 09:40',
          photoUrl: MOCK_PHOTOS.podHandoff2,
          pengirim: 'Pusat Pembinaan Bahasa dan Sastra',
          teleponPengirim: '021-4896558',
          alamatPengirim: 'Jl. Daksinapati Barat IV, Jakarta Timur',
          teleponPenerima: '0813-2345-6702',
          alamatPenerima: 'Jl. Kaliurang KM 5, Yogyakarta',
          jenisBarang: 'Kamus Besar Bahasa Indonesia',
          tipeBooking: 'Tidak Langsung',
          tanggalInput: '09 Jul 2026',
          tanggalAngkut: '11 Jul 2026',
          keterangan: '-',
          statusTimeline: [
            { waktu: '11 Jul 2026, 09:00', status: 'Pick Up', lokasi: 'Gudang Jakarta' },
            { waktu: '12 Jul 2026, 16:10', status: 'In Transit', lokasi: 'Hub Yogyakarta' },
            { waktu: '13 Jul 2026, 09:40', status: 'Completed', lokasi: 'SMP Negeri 5 Yogyakarta' },
          ],
        },
        {
          resi: 'MC2607-88390',
          proyek: 'Distribusi Modul Literasi 2026',
          tglKirim: '12 Jul 2026',
          tujuan: 'SD Negeri 1 Ubud, Bali',
          berat: '9 kg',
          tarif: 'Rp 98.000',
          penerima: 'Budi Santoso',
          waktuTerima: '13 Jul 2026, 15:02',
          photoUrl: MOCK_PHOTOS.podHandoff3,
          pengirim: 'Pusat Pembinaan Bahasa dan Sastra',
          teleponPengirim: '021-4896558',
          alamatPengirim: 'Jl. Daksinapati Barat IV, Jakarta Timur',
          teleponPenerima: '0812-9876-5403',
          alamatPenerima: 'Jl. Raya Ubud No. 10, Gianyar, Bali',
          jenisBarang: 'Modul Literasi Dasar',
          tipeBooking: 'Langsung',
          tanggalInput: '10 Jul 2026',
          tanggalAngkut: '12 Jul 2026',
          keterangan: '-',
          statusTimeline: [
            { waktu: '12 Jul 2026, 07:30', status: 'Pick Up', lokasi: 'Gudang Jakarta' },
            { waktu: '12 Jul 2026, 20:00', status: 'In Transit', lokasi: 'Hub Denpasar' },
            { waktu: '13 Jul 2026, 15:02', status: 'Completed', lokasi: 'SD Negeri 1 Ubud' },
          ],
        },
        {
          resi: 'MC2607-88512',
          proyek: 'Distribusi Buku Sastra 2026',
          tglKirim: '13 Jul 2026',
          tujuan: 'SMP Negeri 3 Makassar',
          berat: '24 kg',
          tarif: 'Rp 178.000',
          penerima: 'Nur Aini',
          waktuTerima: '15 Jul 2026, 11:26',
          photoUrl: MOCK_PHOTOS.podTeam,
          pengirim: 'Pusat Pembinaan Bahasa dan Sastra',
          teleponPengirim: '021-4896558',
          alamatPengirim: 'Jl. Daksinapati Barat IV, Jakarta Timur',
          teleponPenerima: '0811-4567-8904',
          alamatPenerima: 'Jl. Perintis Kemerdekaan, Makassar',
          jenisBarang: 'Buku Sastra & Rak Buku',
          tipeBooking: 'Tidak Langsung',
          tanggalInput: '11 Jul 2026',
          tanggalAngkut: '13 Jul 2026',
          keterangan: '-',
          statusTimeline: [
            { waktu: '13 Jul 2026, 08:45', status: 'Pick Up', lokasi: 'Gudang Jakarta' },
            { waktu: '14 Jul 2026, 13:00', status: 'In Transit', lokasi: 'Hub Makassar' },
            { waktu: '15 Jul 2026, 11:26', status: 'Completed', lokasi: 'SMP Negeri 3 Makassar' },
          ],
        },
        {
          resi: 'MC2607-88677',
          proyek: 'Pengiriman Kamus Balai Bahasa',
          tglKirim: '14 Jul 2026',
          tujuan: 'SD Negeri 4 Banda Aceh',
          berat: '15 kg',
          tarif: 'Rp 132.000',
          penerima: 'Made Wirawan',
          waktuTerima: '16 Jul 2026, 08:55',
          photoUrl: MOCK_PHOTOS.podFragile,
          pengirim: 'Pusat Pembinaan Bahasa dan Sastra',
          teleponPengirim: '021-4896558',
          alamatPengirim: 'Jl. Daksinapati Barat IV, Jakarta Timur',
          teleponPenerima: '0852-1122-3305',
          alamatPenerima: 'Jl. Sultan Iskandar Muda, Banda Aceh',
          jenisBarang: 'Kamus Besar Bahasa Indonesia',
          tipeBooking: 'Tidak Langsung',
          tanggalInput: '12 Jul 2026',
          tanggalAngkut: '14 Jul 2026',
          keterangan: 'Sempat tertahan cuaca, tiba 1 hari lebih lambat',
          statusTimeline: [
            { waktu: '14 Jul 2026, 09:15', status: 'Pick Up', lokasi: 'Gudang Jakarta' },
            { waktu: '15 Jul 2026, 18:40', status: 'In Transit', lokasi: 'Hub Banda Aceh' },
            { waktu: '16 Jul 2026, 08:55', status: 'Completed', lokasi: 'SD Negeri 4 Banda Aceh' },
          ],
        },
      ];
    }
    const response = await apiClient.get('/cargo/shipments');
    return response.data;
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
