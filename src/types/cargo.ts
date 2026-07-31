export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  partnerInstitution: string;
  institutionSub: string;
  avatar: string;
  customerType: 'government' | 'private';
  user_id?: number | string;
  username?: string;
  ph_no?: string;
  cabang_id?: number | string;
  rawApiData?: Record<string, any>;
}

export interface StatMetric {
  label: string;
  value: string;
  sub: string;
  icon: string;
  color: string;
}

export interface ProvinceData {
  name: string;
  volume: number;
}

export interface IslandData {
  id: string;
  name: string;
  volume: number;
  provinces: ProvinceData[];
}

export interface ExceptionItem {
  resi: string;
  proyek: string;
  issue: string;
  lokasi: string;
  since: string;
  isOpen?: boolean;
}

export interface PodItem {
  resi: string;
  lokasi: string;
  tanggal: string;
  photoUrl: string;
  penerima?: string;
  subtext?: string;
  image_url?: string;
}

export interface InvoiceItem {
  no: string;
  tanggal: string;
  jumlah: string;
  status: 'Lunas' | 'Belum Dibayar';
}

export interface StatusTimeline {
  waktu: string;
  status: string;
  lokasi: string;
}

export interface ShipmentItem {
  resi: string;
  barcodeUrl?: string;
  statusTerakhir?: string;
  proyek: string;
  tglKirim: string;
  tujuan: string;
  berat: string;
  tarif: string;
  penerima: string;
  waktuTerima: string;
  photoUrl: string;
  pengirim: string;
  teleponPengirim: string;
  alamatPengirim: string;
  teleponPenerima: string;
  alamatPenerima: string;
  jenisBarang: string;
  tipeBooking: string;
  tanggalInput: string;
  tanggalAngkut: string;
  keterangan: string;
  statusTimeline: StatusTimeline[];

  // Mobile App Scanning & Courier Pickup Info
  isScannedViaApps?: boolean;
  courierName?: string;
  pickupTime?: string;
  pickupMethod?: 'Android App' | 'Manual Dashboard' | string;
  latitude?: number;
  longitude?: number;
  pickupPhotoUrl?: string;
}

export interface GetShipmentsParams {
  officer_id?: number | string;
  office_id?: number | string;
  limit?: number;
  order?: string;
  cons_no?: string;
  page?: number;
  start_date?: string;
  end_date?: string;
}


export interface MapPin {
  resi: string;
  lokasi: string;
  x?: string;
  y?: string;
  lng?: number;
  lat?: number;
  status: 'Delivered' | 'Dalam Transit' | 'Menunggu Pickup' | string;
  rawStatus?: string;
  color?: string;
}

export interface TrackingSearchResult {
  resi: string;
  lokasi: string;
  status: string;
  tagBg: string;
  tagColor: string;
}
