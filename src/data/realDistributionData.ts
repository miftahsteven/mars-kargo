export interface SubdistrictItem {
  id: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  volume: number; // in koli
  beratKg: number;
  resi: string;
  penerima: string;
  instansi: string;
  status: 'Terkirim' | 'Dalam Pengiriman' | 'Transit' | 'Kendala';
  slaStatus: 'On Time' | 'Warning' | 'Delayed';
  kurir: string;
  waktuUpdate: string;
  alamatLengkap?: string;
}

export interface DistrictItem {
  id: string;
  name: string;
  volume: number;
  subdistricts: SubdistrictItem[];
}

export interface RegencyItem {
  id: string;
  name: string;
  volume: number;
  percentage: number;
  slaOnTime: number; // e.g. 98.5%
  districts: DistrictItem[];
}

export interface ProvinceDistributionItem {
  id: string;
  name: string;
  volume: number;
  regencies: RegencyItem[];
}

// 38 Provinsi Resmi sesuai data distribusi volume di GeoDrillDown & screenshot
export const BASE_PROVINCES: { name: string; volume: number }[] = [
  { name: 'SUMATERA UTARA', volume: 2452 },
  { name: 'JAWA BARAT', volume: 2307 },
  { name: 'JAWA TIMUR', volume: 1857 },
  { name: 'ACEH', volume: 1838 },
  { name: 'NTT', volume: 1657 },
  { name: 'SULAWESI SELATAN', volume: 1188 },
  { name: 'KALIMANTAN BARAT', volume: 983 },
  { name: 'BANTEN', volume: 945 },
  { name: 'LAMPUNG', volume: 847 },
  { name: 'SUMATERA SELATAN', volume: 844 },
  { name: 'MALUKU', volume: 835 },
  { name: 'SUMATERA BARAT', volume: 811 },
  { name: 'MALUKU UTARA', volume: 749 },
  { name: 'NTB', volume: 738 },
  { name: 'SULAWESI TENGAH', volume: 677 },
  { name: 'JAWA TENGAH', volume: 673 },
  { name: 'SULAWESI TENGGARA', volume: 592 },
  { name: 'SULAWESI UTARA', volume: 575 },
  { name: 'RIAU', volume: 572 },
  { name: 'KALIMANTAN TENGAH', volume: 451 },
  { name: 'JAMBI', volume: 363 },
  { name: 'KALIMANTAN SELATAN', volume: 343 },
  { name: 'SULAWESI BARAT', volume: 321 },
  { name: 'BENGKULU', volume: 249 },
  { name: 'GORONTALO', volume: 199 },
  { name: 'KALIMANTAN TIMUR', volume: 195 },
  { name: 'PAPUA', volume: 192 },
  { name: 'PAPUA BARAT DAYA', volume: 185 },
  { name: 'PAPUA BARAT', volume: 178 },
  { name: 'BALI', volume: 147 },
  { name: 'PAPUA SELATAN', volume: 142 },
  { name: 'KALIMANTAN UTARA', volume: 131 },
  { name: 'KEP. RIAU', volume: 125 },
  { name: 'PAPUA PEGUNUNUNGAN', volume: 67 },
  { name: 'DKI JAKARTA', volume: 63 },
  { name: 'PAPUA TENGAH', volume: 51 },
  { name: 'BANGKA BELITUNG', volume: 40 },
  { name: 'DI YOGYAKARTA', volume: 27 },
];

export type IslandName =
  | 'Sumatra'
  | 'Jawa'
  | 'Kalimantan'
  | 'Sulawesi'
  | 'Bali & Nusa Tenggara'
  | 'Maluku'
  | 'Papua';

export interface ProvinceIslandMeta {
  island: IslandName;
  order: number;
}

/**
 * Pemetaan resmi 38 Provinsi Indonesia berdasarkan urutan pulau dari Barat ke Timur:
 * Sumatra (1-10) -> Jawa (11-16) -> Kalimantan (17-21) -> Sulawesi (22-27) -> Bali & Nusa Tenggara (28-30) -> Maluku (31-32) -> Papua (33-38)
 */
export function getProvinceIslandMeta(provName: string): ProvinceIslandMeta {
  const norm = provName.toUpperCase().trim();

  // 1. Pulau Sumatra
  if (norm === 'ACEH') return { island: 'Sumatra', order: 1 };
  if (norm === 'SUMATERA UTARA') return { island: 'Sumatra', order: 2 };
  if (norm === 'SUMATERA BARAT') return { island: 'Sumatra', order: 3 };
  if (norm === 'RIAU') return { island: 'Sumatra', order: 4 };
  if (norm.includes('RIAU') && norm.includes('KEP')) return { island: 'Sumatra', order: 5 };
  if (norm === 'JAMBI') return { island: 'Sumatra', order: 6 };
  if (norm === 'BENGKULU') return { island: 'Sumatra', order: 7 };
  if (norm === 'SUMATERA SELATAN') return { island: 'Sumatra', order: 8 };
  if (norm.includes('BANGKA')) return { island: 'Sumatra', order: 9 };
  if (norm === 'LAMPUNG') return { island: 'Sumatra', order: 10 };

  // 2. Pulau Jawa
  if (norm === 'BANTEN') return { island: 'Jawa', order: 11 };
  if (norm.includes('JAKARTA')) return { island: 'Jawa', order: 12 };
  if (norm === 'JAWA BARAT') return { island: 'Jawa', order: 13 };
  if (norm === 'JAWA TENGAH') return { island: 'Jawa', order: 14 };
  if (norm.includes('YOGYAKARTA')) return { island: 'Jawa', order: 15 };
  if (norm === 'JAWA TIMUR') return { island: 'Jawa', order: 16 };

  // 3. Pulau Kalimantan
  if (norm === 'KALIMANTAN BARAT') return { island: 'Kalimantan', order: 17 };
  if (norm === 'KALIMANTAN TENGAH') return { island: 'Kalimantan', order: 18 };
  if (norm === 'KALIMANTAN SELATAN') return { island: 'Kalimantan', order: 19 };
  if (norm === 'KALIMANTAN TIMUR') return { island: 'Kalimantan', order: 20 };
  if (norm === 'KALIMANTAN UTARA') return { island: 'Kalimantan', order: 21 };

  // 4. Pulau Sulawesi
  if (norm === 'SULAWESI UTARA') return { island: 'Sulawesi', order: 22 };
  if (norm === 'GORONTALO') return { island: 'Sulawesi', order: 23 };
  if (norm === 'SULAWESI TENGAH') return { island: 'Sulawesi', order: 24 };
  if (norm === 'SULAWESI BARAT') return { island: 'Sulawesi', order: 25 };
  if (norm === 'SULAWESI SELATAN') return { island: 'Sulawesi', order: 26 };
  if (norm === 'SULAWESI TENGGARA') return { island: 'Sulawesi', order: 27 };

  // 5. Kepulauan Bali & Nusa Tenggara
  if (norm === 'BALI') return { island: 'Bali & Nusa Tenggara', order: 28 };
  if (norm === 'NTB' || (norm.includes('NUSA') && norm.includes('BARAT'))) return { island: 'Bali & Nusa Tenggara', order: 29 };
  if (norm === 'NTT' || (norm.includes('NUSA') && norm.includes('TIMUR'))) return { island: 'Bali & Nusa Tenggara', order: 30 };

  // 6. Kepulauan Maluku
  if (norm === 'MALUKU') return { island: 'Maluku', order: 31 };
  if (norm === 'MALUKU UTARA') return { island: 'Maluku', order: 32 };

  // 7. Pulau Papua
  if (norm === 'PAPUA BARAT') return { island: 'Papua', order: 33 };
  if (norm === 'PAPUA BARAT DAYA') return { island: 'Papua', order: 34 };
  if (norm === 'PAPUA') return { island: 'Papua', order: 35 };
  if (norm === 'PAPUA TENGAH') return { island: 'Papua', order: 36 };
  if (norm.includes('PEGUNUNGAN') || norm.includes('PEGUNUNUNGAN')) return { island: 'Papua', order: 37 };
  if (norm === 'PAPUA SELATAN') return { island: 'Papua', order: 38 };

  return { island: 'Papua', order: 99 };
}

// Curated Deep Data for Top Demostration Provinces
const CURATED_PROVINCE_DETAILS: Record<string, { regencies: { name: string; share: number; districts: { name: string; subdistricts: string[] }[] }[] }> = {
  'JAWA BARAT': {
    regencies: [
      {
        name: 'KOTA BANDUNG',
        share: 0.28,
        districts: [
          {
            name: 'Kecamatan Coblong',
            subdistricts: ['Kelurahan Dago', 'Kelurahan Lebak Siliwangi', 'Kelurahan Sadang Serang', 'Kelurahan Sekeloa'],
          },
          {
            name: 'Kecamatan Sukajadi',
            subdistricts: ['Kelurahan Sukawarna', 'Kelurahan Sukagalih', 'Kelurahan Sukabungah', 'Kelurahan Cipedes', 'Kelurahan Pasteur'],
          },
          {
            name: 'Kecamatan Lengkong',
            subdistricts: ['Kelurahan Malabar', 'Kelurahan Burangrang', 'Kelurahan Cijagra', 'Kelurahan Turangga', 'Kelurahan Paledang'],
          },
          {
            name: 'Kecamatan Sumur Bandung',
            subdistricts: ['Kelurahan Braga', 'Kelurahan Kebon Pisang', 'Kelurahan Merdeka', 'Kelurahan Babakan Ciamis'],
          },
          {
            name: 'Kecamatan Cicendo',
            subdistricts: ['Kelurahan Pasirkaliki', 'Kelurahan Arjuna', 'Kelurahan Pamoyanan', 'Kelurahan Husen Sastranegara'],
          },
        ],
      },
      {
        name: 'KABUPATEN BANDUNG',
        share: 0.22,
        districts: [
          {
            name: 'Kecamatan Soreang',
            subdistricts: ['Desa Soreang', 'Desa Pamekaran', 'Desa Sukanagara', 'Desa Sekarwangi'],
          },
          {
            name: 'Kecamatan Dayeuhkolot',
            subdistricts: ['Desa Dayeuhkolot', 'Desa Citeureup', 'Desa Pasawahan', 'Kelurahan Cangkuang Kulon'],
          },
          {
            name: 'Kecamatan Baleendah',
            subdistricts: ['Kelurahan Baleendah', 'Kelurahan Andir', 'Desa Bojongmalaka', 'Desa Rancamanyar'],
          },
        ],
      },
      {
        name: 'KOTA BEKASI',
        share: 0.18,
        districts: [
          {
            name: 'Kecamatan Bekasi Barat',
            subdistricts: ['Kelurahan Bintara', 'Kelurahan Kranji', 'Kelurahan Jakasampurna', 'Kelurahan Kota Baru'],
          },
          {
            name: 'Kecamatan Bekasi Selatan',
            subdistricts: ['Kelurahan Pekayon Jaya', 'Kelurahan Kayuringin Jaya', 'Kelurahan Jaka Setia', 'Kelurahan Marga Jaya'],
          },
        ],
      },
      {
        name: 'KOTA BOGOR',
        share: 0.14,
        districts: [
          {
            name: 'Kecamatan Bogor Tengah',
            subdistricts: ['Kelurahan Babakan', 'Kelurahan Paledang', 'Kelurahan Sempur', 'Kelurahan Tegallega'],
          },
          {
            name: 'Kecamatan Bogor Selatan',
            subdistricts: ['Kelurahan Batutulis', 'Kelurahan Bondongan', 'Kelurahan Empang', 'Kelurahan Lawanggintung'],
          },
        ],
      },
      {
        name: 'KABUPATEN KARAWANG',
        share: 0.10,
        districts: [
          {
            name: 'Kecamatan Karawang Barat',
            subdistricts: ['Kelurahan Nagasari', 'Kelurahan Tanjungmekar', 'Kelurahan Tunggakjati', 'Kelurahan Karangpawitan'],
          },
          {
            name: 'Kecamatan Telukjambe Timur',
            subdistricts: ['Desa Sukaharja', 'Desa Sirnabaya', 'Desa Pinayungan', 'Desa Wadas'],
          },
        ],
      },
      {
        name: 'KABUPATEN CIANJUR',
        share: 0.08,
        districts: [
          {
            name: 'Kecamatan Cianjur',
            subdistricts: ['Kelurahan Pamoyanan', 'Kelurahan Sayang', 'Kelurahan Sawah Gede', 'Kelurahan Bojongherang'],
          },
          {
            name: 'Kecamatan Cipanas',
            subdistricts: ['Desa Cipanas', 'Desa Cimacan', 'Desa Sindanglaya', 'Desa Palasari'],
          },
        ],
      },
    ],
  },
  'SUMATERA UTARA': {
    regencies: [
      {
        name: 'KOTA MEDAN',
        share: 0.35,
        districts: [
          {
            name: 'Kecamatan Medan Kota',
            subdistricts: ['Kelurahan Mesjid', 'Kelurahan Pandau Hulu I', 'Kelurahan Pasar Baru', 'Kelurahan Teladan Barat'],
          },
          {
            name: 'Kecamatan Medan Petisah',
            subdistricts: ['Kelurahan Petisah Tengah', 'Kelurahan Sekip', 'Kelurahan Sei Putih Barat', 'Kelurahan Sei Putih Timur I'],
          },
          {
            name: 'Kecamatan Medan Selayang',
            subdistricts: ['Kelurahan Padang Bulan Selayang I', 'Kelurahan Padang Bulan Selayang II', 'Kelurahan Sempakata', 'Kelurahan Beringin'],
          },
          {
            name: 'Kecamatan Medan Helvetia',
            subdistricts: ['Kelurahan Helvetia Tengah', 'Kelurahan Dwikora', 'Kelurahan Cinta Damai', 'Kelurahan Tanjung Gusta'],
          },
        ],
      },
      {
        name: 'KABUPATEN DELI SERDANG',
        share: 0.25,
        districts: [
          {
            name: 'Kecamatan Lubuk Pakam',
            subdistricts: ['Kelurahan Lubuk Pakam I', 'Kelurahan Lubuk Pakam Pekan', 'Desa Bakaran Batu', 'Desa Pasar Melintang'],
          },
          {
            name: 'Kecamatan Percut Sei Tuan',
            subdistricts: ['Desa Bandar Klippa', 'Desa Tembung', 'Desa Kenangan', 'Desa Sampali'],
          },
        ],
      },
      {
        name: 'KOTA BINJAI',
        share: 0.15,
        districts: [
          {
            name: 'Kecamatan Binjai Kota',
            subdistricts: ['Kelurahan Berngam', 'Kelurahan Satria', 'Kelurahan Tangsi', 'Kelurahan Kartini'],
          },
          {
            name: 'Kecamatan Binjai Barat',
            subdistricts: ['Kelurahan Bandar Senembah', 'Kelurahan Limau Mungkur', 'Kelurahan Payaroba'],
          },
        ],
      },
      {
        name: 'KABUPATEN SIMALUNGUN',
        share: 0.13,
        districts: [
          {
            name: 'Kecamatan Siantar',
            subdistricts: ['Nagori Dolok Marlawan', 'Nagori Karang Bangun', 'Nagori Pantoan Maju'],
          },
          {
            name: 'Kecamatan Girsang Sipangan Bolon',
            subdistricts: ['Kelurahan Parapat', 'Kelurahan Tiga Raja', 'Nagori Sibaganding'],
          },
        ],
      },
      {
        name: 'KOTA PEMATANG SIANTAR',
        share: 0.12,
        districts: [
          {
            name: 'Kecamatan Siantar Barat',
            subdistricts: ['Kelurahan Proklamasi', 'Kelurahan Timbang Galung', 'Kelurahan Simarito'],
          },
          {
            name: 'Kecamatan Siantar Timur',
            subdistricts: ['Kelurahan Kebun Sayur', 'Kelurahan Pahlawan', 'Kelurahan Siopat Suhu'],
          },
        ],
      },
    ],
  },
  'JAWA TIMUR': {
    regencies: [
      {
        name: 'KOTA SURABAYA',
        share: 0.34,
        districts: [
          {
            name: 'Kecamatan Tegalsari',
            subdistricts: ['Kelurahan Tegalsari', 'Kelurahan Dr. Soetomo', 'Kelurahan Kedungdoro', 'Kelurahan Wonorejo'],
          },
          {
            name: 'Kecamatan Gubeng',
            subdistricts: ['Kelurahan Gubeng', 'Kelurahan Airlangga', 'Kelurahan Baratajaya', 'Kelurahan Kertajaya'],
          },
          {
            name: 'Kecamatan Wonokromo',
            subdistricts: ['Kelurahan Darmo', 'Kelurahan Jagir', 'Kelurahan Sawunggaling', 'Kelurahan Ngagel'],
          },
        ],
      },
      {
        name: 'KABUPATEN SIDOARJO',
        share: 0.24,
        districts: [
          {
            name: 'Kecamatan Sidoarjo',
            subdistricts: ['Kelurahan Sidokumpul', 'Kelurahan Lemahputro', 'Kelurahan Celep', 'Kelurahan Magersari'],
          },
          {
            name: 'Kecamatan Waru',
            subdistricts: ['Desa Waru', 'Desa Bungurasih', 'Desa Medaeng', 'Desa Kureksari'],
          },
        ],
      },
      {
        name: 'KOTA MALANG',
        share: 0.20,
        districts: [
          {
            name: 'Kecamatan Klojen',
            subdistricts: ['Kelurahan Kauman', 'Kelurahan Oro-oro Dowo', 'Kelurahan Penanggungan', 'Kelurahan Rampal Celaket'],
          },
          {
            name: 'Kecamatan Lowokwaru',
            subdistricts: ['Kelurahan Dinoyo', 'Kelurahan Jatimulyo', 'Kelurahan Ketawanggede', 'Kelurahan Sumbersari'],
          },
        ],
      },
      {
        name: 'KABUPATEN JEMBER',
        share: 0.12,
        districts: [
          {
            name: 'Kecamatan Kaliwates',
            subdistricts: ['Kelurahan Kaliwates', 'Kelurahan Kepatihan', 'Kelurahan Mangli', 'Kelurahan Sempusari'],
          },
        ],
      },
      {
        name: 'KABUPATEN BANYUWANGI',
        share: 0.10,
        districts: [
          {
            name: 'Kecamatan Banyuwangi',
            subdistricts: ['Kelurahan Kepatihan', 'Kelurahan Panderejo', 'Kelurahan Taman Baru', 'Kelurahan Singotrunan'],
          },
        ],
      },
    ],
  },
  'ACEH': {
    regencies: [
      {
        name: 'KOTA BANDA ACEH',
        share: 0.32,
        districts: [
          {
            name: 'Kecamatan Baiturrahman',
            subdistricts: ['Gampong Peuniti', 'Gampong Kampung Baru', 'Gampong Neusu Jaya', 'Gampong Ateuk Pahlawan'],
          },
          {
            name: 'Kecamatan Syiah Kuala',
            subdistricts: ['Gampong Kopelma Darussalam', 'Gampong Jeulingke', 'Gampong Tibang', 'Gampong Deah Raya'],
          },
        ],
      },
      {
        name: 'KABUPATEN ACEH BESAR',
        share: 0.25,
        districts: [
          {
            name: 'Kecamatan Ingin Jaya',
            subdistricts: ['Gampong Lambaro', 'Gampong Meunasah Manyang', 'Gampong Pasie Beutong'],
          },
          {
            name: 'Kecamatan Darul Imarah',
            subdistricts: ['Gampong Lamcot', 'Gampong Garot', 'Gampong Gue Gajah'],
          },
        ],
      },
      {
        name: 'KOTA LHOKSEUMAWE',
        share: 0.18,
        districts: [
          {
            name: 'Kecamatan Banda Sakti',
            subdistricts: ['Gampong Simpang Empat', 'Gampong Lancang Garam', 'Gampong Keude Cunda'],
          },
        ],
      },
      {
        name: 'KABUPATEN ACEH UTARA',
        share: 0.15,
        districts: [
          {
            name: 'Kecamatan Lhoksukon',
            subdistricts: ['Gampong Kota Lhoksukon', 'Gampong Meunasah Dayah', 'Gampong Matang Cibrek'],
          },
        ],
      },
      {
        name: 'KOTA SABANG',
        share: 0.10,
        districts: [
          {
            name: 'Kecamatan Sukakarya',
            subdistricts: ['Gampong Kuta Ateueh', 'Gampong Kuta Barat', 'Gampong Iboih'],
          },
        ],
      },
    ],
  },
};

// Generic names generator for remaining provinces so all 38 provinces always produce rich data
const DEFAULT_REGENCY_TEMPLATES: Record<string, string[]> = {
  'NTT': ['KOTA KUPANG', 'KABUPATEN TIMOR TENGAH SELATAN', 'KABUPATEN MANGGARAI BARAT', 'KABUPATEN SIKKA', 'KABUPATEN ENDE', 'KABUPATEN SUMBA TIMUR'],
  'SULAWESI SELATAN': ['KOTA MAKASSAR', 'KABUPATEN GOWA', 'KABUPATEN MAROS', 'KOTA PAREPARE', 'KABUPATEN BONE', 'KOTA PALOPO'],
  'KALIMANTAN BARAT': ['KOTA PONTIANAK', 'KABUPATEN KUBU RAYA', 'KOTA SINGKAWANG', 'KABUPATEN SAMBAS', 'KABUPATEN KETAPANG'],
  'BANTEN': ['KOTA TANGERANG', 'KABUPATEN TANGERANG', 'KOTA TANGERANG SELATAN', 'KOTA SERANG', 'KABUPATEN SERANG', 'KABUPATEN LEBAK'],
  'LAMPUNG': ['KOTA BANDAR LAMPUNG', 'KABUPATEN LAMPUNG SELATAN', 'KABUPATEN LAMPUNG TENGAH', 'KOTA METRO', 'KABUPATEN LAMPUNG TIMUR'],
  'DKI JAKARTA': ['KOTA JAKARTA PUSAT', 'KOTA JAKARTA SELATAN', 'KOTA JAKARTA TIMUR', 'KOTA JAKARTA BARAT', 'KOTA JAKARTA UTARA', 'KABUPATEN KEPULAUAN SERIBU'],
  'JAWA TENGAH': ['KOTA SEMARANG', 'KOTA SURAKARTA', 'KABUPATEN BANYUMAS', 'KABUPATEN MAGELANG', 'KABUPATEN KUDUS', 'KOTA PEKALONGAN'],
  'BALI': ['KOTA DENPASAR', 'KABUPATEN BADUNG', 'KABUPATEN GIANYAR', 'KABUPATEN BULELENG', 'KABUPATEN TABANAN'],
  'PAPUA': ['KOTA JAYAPURA', 'KABUPATEN JAYAPURA', 'KABUPATEN KEEROM', 'KABUPATEN SARMI', 'KABUPATEN BIAK NUMFOR'],
};

const COURIER_NAMES = [
  'Budi Santoso', 'Rian Hidayat', 'Ahmad Fadillah', 'Dimas Pratama',
  'Hendra Gunawan', 'Wahyu Setiawan', 'Bayu Anggoro', 'Fajar Ramadhan',
  'Rizky Saputra', 'Dedi Kurniawan', 'Eko Prasetyo', 'Agus Suprianto'
];

const RECIPIENT_INSTITUTIONS = [
  'SMA Negeri 1', 'SMA Negeri 3', 'SMK Negeri 2', 'SMP Negeri 1',
  'Balai Bahasa Provinsi', 'Dinas Pendidikan & Kebudayaan', 'Perpustakaan Daerah',
  'Komunitas Literasi Warga', 'Pondok Pesantren Al-Hidayah', 'Kantor Pos Kecamatan',
  'Pusat Kegiatan Belajar Masyarakat (PKBM)', 'SD Negeri Model Literasi'
];

// Helper to deterministically generate realistic items for any province
export function getProvinceDistributionData(provinceName: string): ProvinceDistributionItem {
  const base = BASE_PROVINCES.find((p) => p.name.toUpperCase() === provinceName.toUpperCase()) || {
    name: provinceName.toUpperCase(),
    volume: 1200,
  };

  const curated = CURATED_PROVINCE_DETAILS[base.name];

  let regencies: RegencyItem[] = [];

  if (curated) {
    regencies = curated.regencies.map((reg, rIdx) => {
      const regVolume = Math.max(12, Math.round(base.volume * reg.share));
      const percentage = Math.round((regVolume / base.volume) * 100);
      const slaOnTime = Number((95 + ((rIdx * 7) % 5) + Math.random() * 0.4).toFixed(1));

      const districts: DistrictItem[] = reg.districts.map((dist, dIdx) => {
        const subCount = dist.subdistricts.length;
        const distVolume = Math.round(regVolume / reg.districts.length);

        const subdistricts: SubdistrictItem[] = dist.subdistricts.map((subName, sIdx) => {
          const subVol = Math.max(3, Math.round(distVolume / subCount) + ((sIdx % 3) * 2 - 2));
          const beratKg = subVol * 14; // ~14kg per box/koli
          const resiNum = `MRSK-${base.name.slice(0, 3)}-${String(rIdx + 1).padStart(2, '0')}${String(dIdx + 1).padStart(2, '0')}-${String(1000 + sIdx * 73)}`;
          const kurir = COURIER_NAMES[(rIdx + dIdx + sIdx) % COURIER_NAMES.length];
          const instansi = RECIPIENT_INSTITUTIONS[(rIdx * 3 + dIdx + sIdx) % RECIPIENT_INSTITUTIONS.length];

          // Status distribution
          let status: 'Terkirim' | 'Dalam Pengiriman' | 'Transit' | 'Kendala' = 'Terkirim';
          let slaStatus: 'On Time' | 'Warning' | 'Delayed' = 'On Time';
          if (sIdx === 0 && dIdx === 1) {
            status = 'Dalam Pengiriman';
            slaStatus = 'Warning';
          } else if (sIdx === 2 && dIdx === 0 && rIdx === 1) {
            status = 'Transit';
            slaStatus = 'On Time';
          } else if (sIdx === 3 && dIdx === 1 && rIdx === 0) {
            status = 'Kendala';
            slaStatus = 'Delayed';
          }

          const waktuJam = String(8 + (sIdx * 2) % 10).padStart(2, '0');
          const waktuMnt = String(10 + (sIdx * 13) % 50).padStart(2, '0');

          return {
            id: `${reg.name}-${dist.name}-${subName}`,
            kelurahan: subName,
            kecamatan: dist.name,
            kabupaten: reg.name,
            provinsi: base.name,
            kodePos: `${40100 + rIdx * 100 + dIdx * 20 + sIdx}`,
            volume: subVol,
            beratKg,
            resi: resiNum,
            penerima: `${instansi} (${kurir.split(' ')[0]})`,
            instansi,
            status,
            slaStatus,
            kurir,
            waktuUpdate: `Hari Ini, ${waktuJam}:${waktuMnt} WIB`,
            alamatLengkap: `Jl. Pendidikan Literasi No. ${(sIdx + 1) * 12}, ${subName}, ${dist.name}, ${reg.name}`,
          };
        });

        const calculatedDistVolume = subdistricts.reduce((sum, s) => sum + s.volume, 0);

        return {
          id: `${reg.name}-${dist.name}`,
          name: dist.name,
          volume: calculatedDistVolume,
          subdistricts,
        };
      });

      const calculatedRegVolume = districts.reduce((sum, d) => sum + d.volume, 0);

      return {
        id: `${base.name}-${reg.name}`,
        name: reg.name,
        volume: calculatedRegVolume,
        percentage,
        slaOnTime,
        districts,
      };
    });
  } else {
    // Generate realistic template for other provinces
    const regNames = DEFAULT_REGENCY_TEMPLATES[base.name] || [
      `KOTA ${base.name.split(' ')[0]} UTAMA`,
      `KABUPATEN ${base.name.split(' ')[0]} BARAT`,
      `KABUPATEN ${base.name.split(' ')[0]} TIMUR`,
      `KABUPATEN ${base.name.split(' ')[0]} SELATAN`,
      `KOTA ${base.name.split(' ')[0]} PESISIR`,
    ];

    const shares = [0.38, 0.24, 0.18, 0.12, 0.08];

    regencies = regNames.map((regName, rIdx) => {
      const share = shares[rIdx] || 0.1;
      const regVol = Math.max(10, Math.round(base.volume * share));
      const percentage = Math.round((regVol / base.volume) * 100);

      const districtTemplates = [
        `Kecamatan ${regName.replace(/KOTA|KABUPATEN/gi, '').trim()} Tengah`,
        `Kecamatan ${regName.replace(/KOTA|KABUPATEN/gi, '').trim()} Barat`,
        `Kecamatan ${regName.replace(/KOTA|KABUPATEN/gi, '').trim()} Timur`,
      ];

      const districts: DistrictItem[] = districtTemplates.map((dName, dIdx) => {
        const subNames = [
          `Kelurahan ${dName.replace('Kecamatan', '').trim()} Satu`,
          `Kelurahan ${dName.replace('Kecamatan', '').trim()} Dua`,
          `Desa Mekar Mulya`,
          `Desa Sukamaju`,
        ];

        const subdistricts: SubdistrictItem[] = subNames.map((sName, sIdx) => {
          const subVol = Math.max(2, Math.round((regVol / 3) / 4) + (sIdx % 2));
          const beratKg = subVol * 12;
          const resiNum = `MRSK-${base.name.slice(0, 3)}-${String(rIdx + 1).padStart(2, '0')}${String(dIdx + 1).padStart(2, '0')}-${String(2000 + sIdx * 51)}`;
          const kurir = COURIER_NAMES[(rIdx + dIdx + sIdx) % COURIER_NAMES.length];
          const instansi = RECIPIENT_INSTITUTIONS[(rIdx + sIdx) % RECIPIENT_INSTITUTIONS.length];

          let status: 'Terkirim' | 'Dalam Pengiriman' | 'Transit' | 'Kendala' = 'Terkirim';
          let slaStatus: 'On Time' | 'Warning' | 'Delayed' = 'On Time';
          if (sIdx === 1) {
            status = 'Dalam Pengiriman';
            slaStatus = 'On Time';
          } else if (sIdx === 3 && dIdx === 1) {
            status = 'Transit';
            slaStatus = 'Warning';
          }

          return {
            id: `${regName}-${dName}-${sName}`,
            kelurahan: sName,
            kecamatan: dName,
            kabupaten: regName,
            provinsi: base.name,
            kodePos: `${50000 + rIdx * 100 + dIdx * 20 + sIdx}`,
            volume: subVol,
            beratKg,
            resi: resiNum,
            penerima: `${instansi} (${kurir.split(' ')[0]})`,
            instansi,
            status,
            slaStatus,
            kurir,
            waktuUpdate: `Kemarin, 16:45 WIB`,
            alamatLengkap: `Jl. Lintas Provinsi Km ${(sIdx + 1) * 8}, ${sName}, ${dName}, ${regName}`,
          };
        });

        const calculatedDistVolume = subdistricts.reduce((sum, s) => sum + s.volume, 0);

        return {
          id: `${regName}-${dName}`,
          name: dName,
          volume: calculatedDistVolume,
          subdistricts,
        };
      });

      const calculatedRegVolume = districts.reduce((sum, d) => sum + d.volume, 0);

      return {
        id: `${base.name}-${regName}`,
        name: regName,
        volume: calculatedRegVolume,
        percentage,
        slaOnTime: Number((96 + (rIdx % 4)).toFixed(1)),
        districts,
      };
    });
  }

  // Adjust total sum
  const finalRegVolumeSum = regencies.reduce((sum, r) => sum + r.volume, 0);

  return {
    id: base.name.toLowerCase().replace(/\s+/g, '-'),
    name: base.name,
    volume: finalRegVolumeSum || base.volume,
    regencies,
  };
}
