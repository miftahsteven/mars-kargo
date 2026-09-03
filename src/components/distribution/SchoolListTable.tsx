import React, { useState, useMemo } from 'react';
import { SchoolItem, SchoolCategory } from '../../data/schoolDistributionData';
import {
  Search,
  School,
  Download,
  CheckCircle2,
  Truck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface SchoolListTableProps {
  subdistrictName: string;
  districtName: string;
  schools: SchoolItem[];
  selectedCategory: SchoolCategory | 'ALL';
  onSelectCategory: (cat: SchoolCategory | 'ALL') => void;
}

export const SchoolListTable: React.FC<SchoolListTableProps> = ({
  subdistrictName,
  districtName,
  schools,
  selectedCategory,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      // 1. Category filter
      if (selectedCategory !== 'ALL' && s.category !== selectedCategory) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = s.name.toLowerCase().includes(q);
        const matchNpsn = s.npsn.toLowerCase().includes(q);
        const matchRec = s.penerima.toLowerCase().includes(q);
        const matchAddr = s.alamat.toLowerCase().includes(q);

        if (!matchName && !matchNpsn && !matchRec && !matchAddr) {
          return false;
        }
      }

      return true;
    });
  }, [schools, selectedCategory, searchQuery]);

  // Reset page when category changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredSchools.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSlice = filteredSchools.slice(startIndex, startIndex + itemsPerPage);

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'No',
      'Nama Sekolah',
      'NPSN',
      'Jenjang',
      'Kecamatan',
      'Kelurahan',
      'Jumlah Koli',
      'Berat (Kg)',
      'Nama Penerima',
      'Jabatan',
      'Status Pengiriman',
      'Tanggal Terima',
      'Alamat Sekolah',
    ];

    const rows = filteredSchools.map((s, idx) => [
      idx + 1,
      `"${s.name}"`,
      `"${s.npsn}"`,
      `"${s.category}"`,
      `"${s.kecamatan}"`,
      `"${s.kelurahan}"`,
      s.volumeKoli,
      s.beratKg,
      `"${s.penerima}"`,
      `"${s.jabatan}"`,
      `"${s.status}"`,
      `"${s.tanggalTerima}"`,
      `"${s.alamat}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Daftar_Sekolah_${subdistrictName.replace(/\s+/g, '_')}_${selectedCategory}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (status: SchoolItem['status']) => {
    switch (status) {
      case 'Terkirim':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
            <CheckCircle2 className="w-3 h-3" />
            Terkirim
          </span>
        );
      case 'Dalam Pengiriman':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#fef7e0] text-[#b06000] border border-[#feefc3]">
            <Truck className="w-3 h-3" />
            Dalam Kirim
          </span>
        );
      case 'Transit':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
            <Clock className="w-3 h-3" />
            Transit
          </span>
        );
    }
  };

  return (
    <div className="card h-full p-4 sm:p-5 flex flex-col justify-between border border-black/10 bg-[#eae9e9]">
      <div>
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#201e1d]/10">
          <div>
            <div className="card-kicker flex items-center gap-1.5 text-[10px] tracking-widest text-[#ec3013] font-extrabold uppercase">
              <School className="w-3.5 h-3.5" />
              DETAIL SEKOLAH PENERIMA PAKET
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#201e1d] m-0">
              {selectedCategory === 'ALL' ? 'Semua Sekolah' : `Daftar Sekolah ${selectedCategory}`} di {subdistrictName}
            </h3>
            <div className="text-xs text-[#605d5d] mt-0.5">
              {districtName} · Menampilkan {filteredSchools.length} sekolah penerima
            </div>
          </div>

          <button
            onClick={handleExportCsv}
            className="btn btn-secondary text-xs py-1.5 px-3 bg-white/80 hover:bg-[#ec3013] hover:text-white border border-[#201e1d]/20 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV Sekolah
          </button>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 my-3 p-2.5 bg-white/50 border border-black/10">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold text-[#605d5d] uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#ec3013]" />
              Filter Jenjang:
            </span>
            {(['ALL', 'SD', 'SMP', 'SMA', 'Lainnya'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`text-xs font-bold px-2.5 py-1 transition-all border ${
                  selectedCategory === cat
                    ? 'bg-[#ec3013] text-white border-[#ec3013] shadow-xs'
                    : 'bg-white text-[#201e1d] border-black/10 hover:bg-black/5'
                }`}
              >
                {cat === 'ALL' ? 'Semua' : cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#605d5d] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama sekolah / NPSN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input !pl-8 pr-2 py-1 text-xs bg-white border border-[#201e1d]/30 w-full"
            />
          </div>
        </div>

        {/* Table of Schools */}
        <div className="overflow-x-auto border border-black/15 bg-white shadow-sm">
          <table className="table w-full text-xs">
            <thead className="bg-[#e2e0e0] border-b-2 border-[#201e1d]/30">
              <tr>
                <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase w-10 text-center">
                  No.
                </th>
                <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase">
                  Nama Sekolah & NPSN
                </th>
                <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase text-center w-20">
                  Jenjang
                </th>
                <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase text-center">
                  Paket Buku
                </th>
                <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase">
                  Penerima & Jabatan
                </th>
                <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase">
                  Status & Waktu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#201e1d]/10">
              {currentSlice.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-sm text-[#605d5d]">
                    Tidak ada sekolah yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                currentSlice.map((school, idx) => (
                  <tr key={school.id} className="hover:bg-[#f8f4f4] transition-colors">
                    {/* No */}
                    <td className="py-2.5 px-3 text-center font-bold text-[#605d5d]">
                      {startIndex + idx + 1}
                    </td>

                    {/* School Name & NPSN */}
                    <td className="py-2.5 px-3">
                      <div className="font-heading font-extrabold text-[#201e1d] text-xs">
                        {school.name}
                      </div>
                      <div className="text-[10px] text-[#605d5d] font-mono mt-0.5 flex items-center gap-1.5">
                        <span>NPSN: {school.npsn}</span>
                        <span>·</span>
                        <span className="truncate">{school.alamat}</span>
                      </div>
                    </td>

                    {/* Jenjang */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="font-heading font-black text-[10px] px-2 py-0.5 bg-[#2d2b2b] text-white">
                        {school.category}
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="font-extrabold font-heading text-sm text-[#ec3013]">
                        {school.volumeKoli}
                      </span>
                      <span className="text-[10px] text-[#201e1d] font-semibold ml-1">
                        koli ({school.beratKg} kg)
                      </span>
                    </td>

                    {/* Penerima */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#201e1d] text-xs">{school.penerima}</div>
                      <div className="text-[10px] text-[#605d5d]">{school.jabatan}</div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div>{renderStatusBadge(school.status)}</div>
                      <div className="text-[10px] text-[#605d5d] mt-0.5">{school.tanggalTerima}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 mt-2 border-t border-[#201e1d]/10">
        <div className="text-xs text-[#605d5d]">
          Menampilkan <span className="font-bold text-[#201e1d]">{filteredSchools.length > 0 ? startIndex + 1 : 0}</span> -{' '}
          <span className="font-bold text-[#201e1d]">{Math.min(startIndex + itemsPerPage, filteredSchools.length)}</span> dari{' '}
          <span className="font-bold text-[#201e1d]">{filteredSchools.length}</span> sekolah
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 text-xs border border-[#201e1d]/20 bg-white hover:bg-[#ec3013] hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#201e1d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-bold text-[#201e1d]">
            Halaman {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 text-xs border border-[#201e1d]/20 bg-white hover:bg-[#ec3013] hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#201e1d] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
