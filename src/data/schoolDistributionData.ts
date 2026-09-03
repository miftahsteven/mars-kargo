import { SubdistrictItem } from './realDistributionData';

export type SchoolCategory = 'SD' | 'SMP' | 'SMA' | 'Lainnya';

export interface SchoolItem {
  id: string;
  name: string;
  npsn: string;
  category: SchoolCategory;
  jenjangLabel: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  volumeKoli: number;
  beratKg: number;
  status: 'Terkirim' | 'Dalam Pengiriman' | 'Transit';
  tanggalTerima: string;
  penerima: string;
  jabatan: string;
  alamat: string;
}

export interface CategorySummary {
  category: SchoolCategory;
  label: string;
  schoolCount: number;
  volumeKoli: number;
  percentage: number;
  color: string;
}

export interface SchoolDistributionData {
  subdistrictId: string;
  subdistrictName: string;
  districtName: string;
  regencyName: string;
  totalSchools: number;
  totalVolume: number;
  categories: CategorySummary[];
  schools: SchoolItem[];
}

// Pseudo-random deterministic generator for consistent demo data
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function getSchoolDistributionData(subdistrict: SubdistrictItem): SchoolDistributionData {
  // Generate a deterministic numerical seed from the subdistrict ID
  let seed = 0;
  for (let i = 0; i < subdistrict.id.length; i++) {
    seed += subdistrict.id.charCodeAt(i) * (i + 1);
  }

  const cleanKel = subdistrict.kelurahan.replace(/Kelurahan|Desa/gi, '').trim();
  const cleanKec = subdistrict.kecamatan.replace(/Kecamatan/gi, '').trim();

  // Template names for SD
  const sdNames = [
    `SD Negeri 01 ${cleanKel}`,
    `SD Negeri 02 ${cleanKel}`,
    `SD Negeri 03 ${cleanKec}`,
    `SD Swasta Bintang Literasi ${cleanKel}`,
    `SD IT Insan Cendekia ${cleanKel}`,
    `Madrasah Ibtidaiyah (MI) Al-Falah ${cleanKel}`,
  ];

  // Template names for SMP
  const smpNames = [
    `SMP Negeri 1 ${cleanKec}`,
    `SMP Negeri 2 ${cleanKec}`,
    `SMP Swasta Mandiri Bangsa ${cleanKel}`,
    `MTs Negeri Model ${cleanKec}`,
  ];

  // Template names for SMA / SMK
  const smaNames = [
    `SMA Negeri 1 ${cleanKec}`,
    `SMA Swasta Pasundan ${cleanKel}`,
    `SMK Negeri 1 Bidang Kejuruan ${cleanKec}`,
    `MA Negeri ${cleanKec}`,
  ];

  // Template names for Lainnya
  const otherNames = [
    `PKBM Cahaya Ilmu ${cleanKel}`,
    `Komunitas Literasi Pojok Baca ${cleanKel}`,
    `Taman Bacaan Masyarakat (TBM) Mandiri`,
    `SLB Negeri Pembina ${cleanKec}`,
  ];

  const schools: SchoolItem[] = [];

  const recipientTitles = [
    { nama: 'Dra. Hj. Nurjanah, M.Pd', jabatan: 'Kepala Sekolah' },
    { nama: 'Bambang Irawan, S.Pd', jabatan: 'Kepala Perpustakaan' },
    { nama: 'Siti Aminah, S.Sos', jabatan: 'Pengelola Sarpras' },
    { nama: 'H. Suhendra, M.Si', jabatan: 'Wakil Kepala Sekolah' },
    { nama: 'Ratna Dewi, A.Md', jabatan: 'Staf Administrasi' },
  ];

  let npsnBase = 20200000 + Math.abs(seed % 80000);

  // Helper to push items
  const addCategorySchools = (
    names: string[],
    category: SchoolCategory,
    jenjangLabel: string,
    count: number
  ) => {
    for (let i = 0; i < count; i++) {
      const idx = (seed + i) % names.length;
      const schoolName = names[idx];
      const volumeKoli = Math.max(3, Math.round(subdistrict.volume / 8) + ((i % 3) + 1));
      const beratKg = volumeKoli * 14;
      const rec = recipientTitles[(seed + i) % recipientTitles.length];
      const status: 'Terkirim' | 'Dalam Pengiriman' | 'Transit' =
        i === 0 && seed % 4 === 0
          ? 'Dalam Pengiriman'
          : i === 1 && seed % 5 === 0
          ? 'Transit'
          : 'Terkirim';

      const jam = String(9 + ((seed + i) % 6)).padStart(2, '0');
      const mnt = String(15 + ((seed + i * 7) % 40)).padStart(2, '0');

      schools.push({
        id: `${subdistrict.id}-${category}-${i}`,
        name: schoolName,
        npsn: String(npsnBase++),
        category,
        jenjangLabel,
        kelurahan: subdistrict.kelurahan,
        kecamatan: subdistrict.kecamatan,
        kabupaten: subdistrict.kabupaten,
        volumeKoli,
        beratKg,
        status,
        tanggalTerima: `Hari ini, ${jam}:${mnt} WIB`,
        penerima: rec.nama,
        jabatan: rec.jabatan,
        alamat: `Jl. Pendidikan No. ${(i + 1) * 14}, ${subdistrict.kelurahan}, ${subdistrict.kecamatan}`,
      });
    }
  };

  // Generate proportionate schools per category
  addCategorySchools(sdNames, 'SD', 'Sekolah Dasar (SD/MI)', 4);
  addCategorySchools(smpNames, 'SMP', 'Sekolah Menengah Pertama (SMP/MTs)', 3);
  addCategorySchools(smaNames, 'SMA', 'Sekolah Menengah Atas/Kejuruan (SMA/SMK)', 2);
  addCategorySchools(otherNames, 'Lainnya', 'Lembaga Pendidikan Non-Formal (PKBM/TBM)', 2);

  const totalSchools = schools.length;
  const totalVolume = schools.reduce((sum, s) => sum + s.volumeKoli, 0);

  const categoryConfigs: { category: SchoolCategory; label: string; color: string }[] = [
    { category: 'SD', label: 'SD / MI', color: '#ec3013' }, // Red
    { category: 'SMP', label: 'SMP / MTs', color: '#1e40af' }, // Blue
    { category: 'SMA', label: 'SMA / SMK', color: '#0f766e' }, // Teal
    { category: 'Lainnya', label: 'Lainnya (PKBM/TBM)', color: '#605d5d' }, // Charcoal Slate
  ];

  const categories: CategorySummary[] = categoryConfigs.map((cfg) => {
    const catSchools = schools.filter((s) => s.category === cfg.category);
    const catVol = catSchools.reduce((sum, s) => sum + s.volumeKoli, 0);
    const percentage = totalVolume > 0 ? Math.round((catVol / totalVolume) * 100) : 0;

    return {
      category: cfg.category,
      label: cfg.label,
      schoolCount: catSchools.length,
      volumeKoli: catVol,
      percentage,
      color: cfg.color,
    };
  });

  return {
    subdistrictId: subdistrict.id,
    subdistrictName: subdistrict.kelurahan,
    districtName: subdistrict.kecamatan,
    regencyName: subdistrict.kabupaten,
    totalSchools,
    totalVolume,
    categories,
    schools,
  };
}
