export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  partnerInstitution: string;
  institutionSub: string;
  avatar: string;
  customerType: 'government' | 'private';
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
}

export interface MapPin {
  resi: string;
  lokasi: string;
  x: string;
  y: string;
  status: 'Delivered' | 'Dalam Transit' | 'Menunggu Pickup';
  color: string;
}

export interface TrackingSearchResult {
  resi: string;
  lokasi: string;
  status: string;
  tagBg: string;
  tagColor: string;
}
