import React, { useState, useMemo, useEffect } from 'react';
import { BASE_PROVINCES, getProvinceDistributionData, SubdistrictItem } from '../data/realDistributionData';
import { getSchoolDistributionData, SchoolCategory } from '../data/schoolDistributionData';
import { ProvinceBarChart } from '../components/distribution/ProvinceBarChart';
import { RegencyDonutChart } from '../components/distribution/RegencyDonutChart';
import { SubdistrictDataTable } from '../components/distribution/SubdistrictDataTable';
import { SchoolTypeDistributionCard } from '../components/distribution/SchoolTypeDistributionCard';
import { SchoolListTable } from '../components/distribution/SchoolListTable';
import {
  BarChart3,
  Layers,
  MapPin,
  Building2,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Package,
  GraduationCap,
} from 'lucide-react';

export const DistribusiRealPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState('Semua Proyek');
  const [selectedProvince, setSelectedProvince] = useState('JAWA BARAT');
  const [selectedRegency, setSelectedRegency] = useState('KOTA BANDUNG');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<SubdistrictItem | null>(null);
  const [selectedSchoolCategory, setSelectedSchoolCategory] = useState<SchoolCategory | 'ALL'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const projects = [
    'Semua Proyek',
    'Distribusi Buku Sastra 2026',
    'Pengiriman Kamus Balai Bahasa',
    'Distribusi Modul Literasi 2026',
  ];

  // Fetch or generate rich distribution data for selected province
  const provinceData = useMemo(() => {
    return getProvinceDistributionData(selectedProvince);
  }, [selectedProvince]);

  // When province changes, default selected regency to the first regency of the province
  useEffect(() => {
    if (provinceData.regencies.length > 0) {
      const exists = provinceData.regencies.some((r) => r.name === selectedRegency);
      if (!exists) {
        setSelectedRegency(provinceData.regencies[0].name);
      }
    }
    // Reset selected subdistrict when province changes
    setSelectedSubdistrict(null);
  }, [provinceData, selectedRegency]);

  // Reset selected subdistrict when regency changes
  const handleSelectRegency = (regName: string) => {
    setSelectedRegency(regName);
    setSelectedSubdistrict(null);
  };

  const activeRegencyItem = useMemo(() => {
    return (
      provinceData.regencies.find((r) => r.name === selectedRegency) ||
      provinceData.regencies[0]
    );
  }, [provinceData, selectedRegency]);

  // School distribution data for selected subdistrict
  const schoolDistributionData = useMemo(() => {
    if (!selectedSubdistrict) return null;
    return getSchoolDistributionData(selectedSubdistrict);
  }, [selectedSubdistrict]);

  const handleSelectProvince = (provName: string) => {
    setSelectedProvince(provName);
    setSelectedSubdistrict(null);
    const newData = getProvinceDistributionData(provName);
    if (newData.regencies.length > 0) {
      setSelectedRegency(newData.regencies[0].name);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const totalNationalVolume = useMemo(() => {
    return BASE_PROVINCES.reduce((acc, curr) => acc + curr.volume, 0);
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-black tracking-widest uppercase bg-[#ec3013] text-white">
              B2B EIS · LIVE MONITORING
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#137333]">
              <span className="w-2 h-2 rounded-full bg-[#137333] animate-ping" />
              Sistem Aktif & Terhubung
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#201e1d] m-0">
            Distribusi Real
          </h1>
          <p className="text-xs text-[#605d5d] mt-1 max-w-2xl">
            Visualisasi terintegrasi volume pengiriman logistik bertingkat dari tingkat{' '}
            <strong className="text-[#201e1d]">Provinsi</strong>,{' '}
            <strong className="text-[#201e1d]">Kabupaten / Kota</strong>, hingga detail{' '}
            <strong className="text-[#201e1d]">Kecamatan & Kelurahan</strong> secara real-time.
          </p>
        </div>

        {/* Project Selector & Refresh Button */}
        <div className="flex items-center gap-2.5 self-start lg:self-end">
          <div className="flex flex-col gap-1 w-52 sm:w-64">
            <label className="text-[10px] font-extrabold tracking-wider uppercase text-[#605d5d]">
              Filter Proyek / Kontrak
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="input py-1.5 text-xs bg-white border border-[#201e1d]/30 font-bold cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRefresh}
            className="btn btn-secondary mt-auto py-2 px-3 bg-white hover:bg-[#2d2b2b] hover:text-white border border-[#201e1d]/20 transition-all flex items-center gap-1.5 text-xs"
            title="Muat Ulang Data Distribusi"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#ec3013]' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="card p-3.5 bg-white border border-black/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#605d5d]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Volume Nasional</span>
            <Package className="w-4 h-4 text-[#ec3013]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-heading text-[#201e1d]">
              {totalNationalVolume.toLocaleString('id-ID')}
              <span className="text-xs font-semibold text-[#605d5d] ml-1">koli</span>
            </div>
            <div className="text-[10px] text-[#137333] font-bold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              100% dari target kontrak
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card p-3.5 bg-white border border-black/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#605d5d]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cakupan Wilayah</span>
            <MapPin className="w-4 h-4 text-[#ec3013]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-heading text-[#201e1d]">
              38 <span className="text-sm font-bold text-[#605d5d]">/ 38</span>
            </div>
            <div className="text-[10px] text-[#605d5d] font-semibold mt-0.5">
              Provinsi di seluruh Indonesia
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card p-3.5 bg-white border border-black/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#605d5d]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kabupaten / Kota</span>
            <Building2 className="w-4 h-4 text-[#ec3013]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-heading text-[#201e1d]">
              514
            </div>
            <div className="text-[10px] text-[#137333] font-bold mt-0.5">
              Jangkauan titik hub Mars Cargo
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card p-3.5 bg-white border border-black/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#605d5d]">
            <span className="text-[11px] font-bold uppercase tracking-wider">On-Time SLA Delivery</span>
            <ShieldCheck className="w-4 h-4 text-[#137333]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-heading text-[#137333]">
              98.6%
            </div>
            <div className="text-[10px] text-[#605d5d] font-semibold mt-0.5">
              Standar Layanan Kemendikdasmen
            </div>
          </div>
        </div>
      </div>

      {/* 1. Bar Chart: Volume per Provinsi (38 Provinsi) */}
      <section aria-label="Grafik Volume per Provinsi">
        <ProvinceBarChart
          selectedProvince={selectedProvince}
          onSelectProvince={handleSelectProvince}
        />
      </section>

      {/* Visual Transition Breadcrumbs Bar */}
      <div className="p-3 bg-[#2d2b2b] text-white border-l-4 border-[#ec3013] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-white/60 font-semibold">Hierarki Wilayah:</span>
          <span className="font-extrabold text-white">Indonesia</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#ec3013]" />
          <span className="bg-[#ec3013] text-white px-2 py-0.5 font-bold">
            {selectedProvince}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-white/50" />
          <span className="bg-white/20 text-white px-2 py-0.5 font-bold">
            {selectedRegency}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-white/50" />
          <span className="text-white/70 italic">Kecamatan & Kelurahan</span>
        </div>

        <div className="text-[11px] text-white/70 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#ec3013]" />
          <span>Klik potongan donat untuk mengganti kota/kabupaten tujuan</span>
        </div>
      </div>

      {/* 2 & 3. Split Row: Donut Chart (Left) + DataTable (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Donut Graph Breakdown per Kabupaten/Kota */}
        <div className="lg:col-span-5 min-w-0">
          <RegencyDonutChart
            provinceName={provinceData.name}
            regencies={provinceData.regencies}
            selectedRegency={selectedRegency}
            onSelectRegency={handleSelectRegency}
          />
        </div>

        {/* Right: Data Table Kecamatan & Kelurahan */}
        <div className="lg:col-span-7 min-w-0">
          {activeRegencyItem ? (
            <SubdistrictDataTable
              provinceName={provinceData.name}
              regency={activeRegencyItem}
              selectedSubdistrictId={selectedSubdistrict?.id}
              onSelectSubdistrict={(item) => setSelectedSubdistrict(item)}
            />
          ) : (
            <div className="card h-full p-8 flex items-center justify-center text-center text-[#605d5d]">
              Silakan pilih salah satu Kabupaten/Kota pada grafik donat.
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Distribusi Jenis Sekolah & Detail Sekolah Penerima Paket */}
      <div className="mt-1 flex flex-col gap-4">
        {/* Section Divider / Breadcrumb Header */}
        <div className="p-3 bg-[#2d2b2b] text-white border-l-4 border-[#ec3013] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-white/60 font-semibold">Tingkat Sekolah & Penerima Paket:</span>
            {selectedSubdistrict ? (
              <>
                <span className="bg-[#ec3013] text-white px-2 py-0.5 font-bold">
                  {selectedSubdistrict.kecamatan}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                <span className="bg-white/20 text-white px-2 py-0.5 font-bold">
                  {selectedSubdistrict.kelurahan}
                </span>
                <span className="text-white/70 italic ml-1">
                  ({selectedSubdistrict.volume} koli terdistribusi)
                </span>
              </>
            ) : (
              <span className="text-white/70 italic">
                (Pilih salah satu baris kelurahan/kecamatan pada tabel di atas)
              </span>
            )}
          </div>

          {selectedSubdistrict && (
            <button
              onClick={() => setSelectedSubdistrict(null)}
              className="text-[11px] text-white/70 hover:text-white underline self-start sm:self-auto cursor-pointer"
            >
              Reset Pilihan
            </button>
          )}
        </div>

        {/* Conditional Grid or Empty State */}
        {schoolDistributionData && selectedSubdistrict ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch animate-in fade-in duration-200">
            {/* Left: Distribusi Jenis Sekolah (Grafik Batang Horizontal: SD, SMP, SMA, Lainnya) */}
            <div className="lg:col-span-5 min-w-0">
              <SchoolTypeDistributionCard
                subdistrictName={selectedSubdistrict.kelurahan}
                districtName={selectedSubdistrict.kecamatan}
                categories={schoolDistributionData.categories}
                selectedCategory={selectedSchoolCategory}
                onSelectCategory={setSelectedSchoolCategory}
                totalSchools={schoolDistributionData.totalSchools}
                totalVolume={schoolDistributionData.totalVolume}
              />
            </div>

            {/* Right: List Data Sekolah Penerima Paket */}
            <div className="lg:col-span-7 min-w-0">
              <SchoolListTable
                subdistrictName={selectedSubdistrict.kelurahan}
                districtName={selectedSubdistrict.kecamatan}
                schools={schoolDistributionData.schools}
                selectedCategory={selectedSchoolCategory}
                onSelectCategory={setSelectedSchoolCategory}
              />
            </div>
          </div>
        ) : (
          /* Empty State Placeholder when no subdistrict is clicked yet */
          <div className="card p-8 border border-dashed border-[#201e1d]/30 bg-white/40 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#ec3013]/10 text-[#ec3013] flex items-center justify-center mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="text-base font-heading font-extrabold text-[#201e1d] m-0">
              Belum Ada Kecamatan / Kelurahan yang Dipilih
            </h4>
            <p className="text-xs text-[#605d5d] max-w-md mt-1 mb-3">
              Silakan klik salah satu baris pada tabel <strong>DATA KECAMATAN & KELURAHAN</strong> di atas untuk melihat grafik distribusi jenis sekolah (SD, SMP, SMA, Lainnya) dan daftar sekolah penerima paket.
            </p>
            <div className="text-[11px] font-bold text-[#ec3013] bg-[#fff2ef] px-3 py-1 border border-[#ec3013]/20">
              👆 Klik baris pada tabel di atas untuk mulai eksplorasi
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
