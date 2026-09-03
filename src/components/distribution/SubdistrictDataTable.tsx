import React, { useState, useMemo, useEffect } from 'react';
import { RegencyItem, SubdistrictItem } from '../../data/realDistributionData';
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Truck,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Barcode,
  X,
} from 'lucide-react';

// Set to true whenever client requests extended columns (Resi, Penerima, Status, Aksi)
const SHOW_EXTENDED_COLUMNS = false;

interface SubdistrictDataTableProps {
  provinceName: string;
  regency: RegencyItem;
  selectedSubdistrictId?: string;
  onSelectSubdistrict?: (item: SubdistrictItem) => void;
}

export const SubdistrictDataTable: React.FC<SubdistrictDataTableProps> = ({
  provinceName,
  regency,
  selectedSubdistrictId,
  onSelectSubdistrict,
}) => {
  // Cascading Filter states: Kecamatan -> Kode Pos
  const [selectedDistrict, setSelectedDistrict] = useState<string>('SEMUA_KECAMATAN');
  const [selectedPostalCode, setSelectedPostalCode] = useState<string>('SEMUA_KODE_POS');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Feedback states
  const [copiedResi, setCopiedResi] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<SubdistrictItem | null>(null);

  // Reset filters when the selected Regency changes
  useEffect(() => {
    setSelectedDistrict('SEMUA_KECAMATAN');
    setSelectedPostalCode('SEMUA_KODE_POS');
    setSearchQuery('');
    setStatusFilter('Semua');
    setCurrentPage(1);
  }, [regency.name]);

  // When selected district changes, reset postal code filter
  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    setSelectedPostalCode('SEMUA_KODE_POS');
    setCurrentPage(1);
  };

  // Extract all subdistricts from all districts in current regency
  const allSubdistrictItems: SubdistrictItem[] = useMemo(() => {
    return regency.districts.flatMap((dist) => dist.subdistricts);
  }, [regency]);

  // Available Kode Pos options based on the active Kecamatan filter (Cascading!)
  const availablePostalCodeOptions = useMemo(() => {
    if (selectedDistrict === 'SEMUA_KECAMATAN') {
      const set = new Set<string>();
      allSubdistrictItems.forEach((item) => {
        const val = item.kodePos || item.kelurahan;
        if (val) set.add(val);
      });
      return Array.from(set).sort();
    }

    const dist = regency.districts.find((d) => d.name === selectedDistrict);
    if (!dist) return [];
    const set = new Set<string>();
    dist.subdistricts.forEach((s) => {
      const val = s.kodePos || s.kelurahan;
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  }, [selectedDistrict, regency, allSubdistrictItems]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return allSubdistrictItems.filter((item) => {
      // 1. Filter Kecamatan
      if (selectedDistrict !== 'SEMUA_KECAMATAN' && item.kecamatan !== selectedDistrict) {
        return false;
      }

      // 2. Filter Kode Pos (Cascading)
      const itemPostal = item.kodePos || item.kelurahan;
      if (selectedPostalCode !== 'SEMUA_KODE_POS' && itemPostal !== selectedPostalCode) {
        return false;
      }

      // 3. Filter Status (if extended columns active)
      if (SHOW_EXTENDED_COLUMNS && statusFilter !== 'Semua' && item.status !== statusFilter) {
        return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchResi = item.resi.toLowerCase().includes(q);
        const matchPostal = (item.kodePos || item.kelurahan || '').toLowerCase().includes(q);
        const matchKec = item.kecamatan.toLowerCase().includes(q);
        const matchPenerima = item.penerima.toLowerCase().includes(q);
        const matchInstansi = item.instansi.toLowerCase().includes(q);
        const matchKurir = item.kurir.toLowerCase().includes(q);

        if (!matchResi && !matchPostal && !matchKec && !matchPenerima && !matchInstansi && !matchKurir) {
          return false;
        }
      }

      return true;
    });
  }, [allSubdistrictItems, selectedDistrict, selectedPostalCode, statusFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(resi);
    setTimeout(() => setCopiedResi(null), 2000);
  };

  // Export to CSV functionality
  const handleExportCsv = () => {
    const headers = SHOW_EXTENDED_COLUMNS
      ? [
          'No',
          'No Resi',
          'Provinsi',
          'Kabupaten / Kota',
          'Kecamatan',
          'Kode Pos',
          'Volume (Koli)',
          'Berat (Kg)',
          'Penerima',
          'Instansi',
          'Kurir',
          'Status',
          'SLA Status',
          'Waktu Update',
        ]
      : ['No', 'Provinsi', 'Kabupaten / Kota', 'Kecamatan', 'Kode Pos', 'Volume (Koli)'];

    const rows = filteredData.map((item, idx) =>
      SHOW_EXTENDED_COLUMNS
        ? [
            idx + 1,
            `"${item.resi}"`,
            `"${item.provinsi}"`,
            `"${item.kabupaten}"`,
            `"${item.kecamatan}"`,
            `"${item.kodePos || item.kelurahan}"`,
            item.volume,
            item.beratKg,
            `"${item.penerima}"`,
            `"${item.instansi}"`,
            `"${item.kurir}"`,
            `"${item.status}"`,
            `"${item.slaStatus}"`,
            `"${item.waktuUpdate}"`,
          ]
        : [
            idx + 1,
            `"${item.provinsi}"`,
            `"${item.kabupaten}"`,
            `"${item.kecamatan}"`,
            `"${item.kodePos || item.kelurahan}"`,
            item.volume,
          ]
    );

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Distribusi_Real_${regency.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (status: SubdistrictItem['status']) => {
    switch (status) {
      case 'Terkirim':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
            <CheckCircle2 className="w-3 h-3" />
            Terkirim
          </span>
        );
      case 'Dalam Pengiriman':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-[#fef7e0] text-[#b06000] border border-[#feefc3]">
            <Truck className="w-3 h-3" />
            On Delivery
          </span>
        );
      case 'Transit':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
            <Clock className="w-3 h-3" />
            Transit Hub
          </span>
        );
      case 'Kendala':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]">
            <AlertTriangle className="w-3 h-3" />
            Kendala Alamat
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
              <MapPin className="w-3.5 h-3.5" />
              DATA KECAMATAN & KODE POS
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#201e1d] m-0">
              Sebaran: {regency.name}
            </h3>
            <div className="text-xs text-[#605d5d] mt-0.5">
              Provinsi {provinceName} · Total {allSubdistrictItems.length} Titik Kode Pos
            </div>
          </div>

          <button
            onClick={handleExportCsv}
            className="btn btn-secondary text-xs py-1.5 px-3 bg-white/80 hover:bg-[#ec3013] hover:text-white border border-[#201e1d]/20 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Filter Bar (Cascading: Kecamatan -> Kode Pos) */}
        <div
          className={`grid gap-2.5 my-3 p-3 bg-white/50 border border-black/10 ${
            SHOW_EXTENDED_COLUMNS ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'
          }`}
        >
          {/* 1. Filter Kecamatan */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold tracking-wider uppercase text-[#605d5d] flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#ec3013]" />
              Filter Kecamatan
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="input py-1 text-xs bg-white border border-[#201e1d]/30 font-semibold cursor-pointer"
            >
              <option value="SEMUA_KECAMATAN">Semua Kecamatan ({regency.districts.length})</option>
              {regency.districts.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.subdistricts.length} pos)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filter Bertingkat: Kode Pos */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold tracking-wider uppercase text-[#605d5d]">
              Filter Kode Pos
            </label>
            <select
              value={selectedPostalCode}
              onChange={(e) => {
                setSelectedPostalCode(e.target.value);
                setCurrentPage(1);
              }}
              className="input py-1 text-xs bg-white border border-[#201e1d]/30 font-semibold cursor-pointer"
            >
              <option value="SEMUA_KODE_POS">
                {selectedDistrict === 'SEMUA_KECAMATAN'
                  ? `Semua Kode Pos (${availablePostalCodeOptions.length})`
                  : `Semua Kode Pos di ${selectedDistrict}`}
              </option>
              {availablePostalCodeOptions.map((pos) => (
                <option key={pos} value={pos}>
                  Kode Pos {pos}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Filter Status (Hidden unless extended columns active) */}
          {SHOW_EXTENDED_COLUMNS && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold tracking-wider uppercase text-[#605d5d]">
                Status Kirim
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input py-1 text-xs bg-white border border-[#201e1d]/30 font-semibold cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="Terkirim">Terkirim</option>
                <option value="Dalam Pengiriman">On Delivery</option>
                <option value="Transit">Transit Hub</option>
                <option value="Kendala">Kendala</option>
              </select>
            </div>
          )}

          {/* 4. Quick Search Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold tracking-wider uppercase text-[#605d5d]">
              Pencarian Cepat
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#605d5d] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kecamatan / kode pos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="input !pl-8 pr-2.5 py-1 text-xs bg-white border border-[#201e1d]/30"
              />
            </div>
          </div>
        </div>

        {/* Hint banner */}
        <div className="text-[11px] text-[#605d5d] flex items-center justify-between gap-1.5 mb-2 px-1">
          <span className="flex items-center gap-1">
            <span className="text-[#ec3013] font-black">💡 Tip:</span>
            <span>Klik salah satu baris untuk membuka grafik jenis sekolah (SD, SMP, SMA, Lainnya) di bawah.</span>
          </span>
          {selectedSubdistrictId && (
            <span className="text-[10px] text-[#137333] font-bold bg-[#e6f4ea] px-2 py-0.5 border border-[#ceead6]">
              ● 1 Baris Aktif
            </span>
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-black/15 bg-white shadow-sm">
          <table className="table w-full text-xs">
            <thead className="bg-[#e2e0e0] border-b-2 border-[#201e1d]/30">
              <tr>
                <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase w-12 text-center">
                  No.
                </th>
                {SHOW_EXTENDED_COLUMNS && (
                  <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase">
                    No. Resi
                  </th>
                )}
                <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase">
                  Kecamatan
                </th>
                <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase">
                  Kode Pos
                </th>
                <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase text-center">
                  Volume
                </th>
                {SHOW_EXTENDED_COLUMNS && (
                  <>
                    <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase">
                      Penerima & Instansi
                    </th>
                    <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase">
                      Status & Waktu
                    </th>
                    <th className="py-2.5 px-3 !text-[#201e1d] font-heading font-black tracking-wider text-[11px] uppercase text-center">
                      Aksi
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#201e1d]/10">
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={SHOW_EXTENDED_COLUMNS ? 7 : 4}
                    className="text-center py-8 text-sm text-[#605d5d]"
                  >
                    Tidak ada data yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, idx) => {
                  const isRowSelected = selectedSubdistrictId === item.id;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectSubdistrict && onSelectSubdistrict(item)}
                      className={`cursor-pointer transition-all ${
                        isRowSelected
                          ? 'bg-[#fff2ef] hover:bg-[#ffe6e1] font-semibold border-l-4 border-l-[#ec3013]'
                          : 'hover:bg-[#f8f4f4] border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Nomor Urut */}
                      <td className="py-2.5 px-3 text-center font-bold text-[#605d5d]">
                        <div className="flex items-center justify-center gap-1">
                          {isRowSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#ec3013]" />}
                          <span>{startIndex + idx + 1}</span>
                        </div>
                      </td>

                      {/* Resi (Hidden) */}
                      {SHOW_EXTENDED_COLUMNS && (
                        <td className="py-2.5 px-3 font-mono font-bold text-[#201e1d]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#ec3013]">{item.resi}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyResi(item.resi);
                              }}
                              title="Salin nomor resi"
                              className="text-[#605d5d] hover:text-[#ec3013] transition-colors p-0.5"
                            >
                              {copiedResi === item.resi ? (
                                <Check className="w-3 h-3 text-[#137333]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                      )}

                      {/* Kecamatan */}
                      <td className="py-2.5 px-3 font-bold text-[#201e1d]">
                        {item.kecamatan}
                      </td>

                      {/* Kode Pos (Replaced Kelurahan) */}
                      <td className="py-2.5 px-3 font-mono font-bold text-[#201e1d]">
                        <span className="bg-white/80 px-2 py-0.5 border border-black/10">
                          {item.kodePos || item.kelurahan || '-'}
                        </span>
                      </td>

                      {/* Volume Koli */}
                      <td className="py-2.5 px-3 text-center font-heading font-black text-[#201e1d]">
                        <span className="bg-[#f0eceb] px-2 py-0.5 rounded-none font-bold">
                          {item.volume.toLocaleString('id-ID')} koli
                        </span>
                      </td>

                      {/* Extended Columns */}
                      {SHOW_EXTENDED_COLUMNS && (
                        <>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-[#201e1d]">{item.penerima}</div>
                            <div className="text-[11px] text-[#605d5d]">{item.instansi}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div>{renderStatusBadge(item.status)}</div>
                            <div className="text-[10px] text-[#605d5d] mt-1">{item.waktuUpdate}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalItem(item);
                              }}
                              className="px-2 py-1 bg-white hover:bg-[#201e1d] hover:text-white border border-[#201e1d]/30 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                            >
                              Detail
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination & Footer summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-[#201e1d]/10 text-xs text-[#605d5d]">
        <div className="font-medium">
          Menampilkan <span className="font-bold text-[#201e1d]">{filteredData.length === 0 ? 0 : startIndex + 1}</span> -{' '}
          <span className="font-bold text-[#201e1d]">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> dari{' '}
          <span className="font-bold text-[#201e1d]">{filteredData.length}</span> baris
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1 self-start sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-[#201e1d]/20 bg-white hover:bg-[#201e1d] hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-inherit cursor-pointer transition-colors"
              title="Halaman sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-3 py-1 font-bold text-[#201e1d] bg-white/70 border border-[#201e1d]/20">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-[#201e1d]/20 bg-white hover:bg-[#201e1d] hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-inherit cursor-pointer transition-colors"
              title="Halaman berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal if row clicked */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#201e1d] shadow-2xl max-w-md w-full p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between border-b border-[#201e1d]/10 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#ec3013]">
                  Detail Distribusi Real
                </span>
                <h4 className="text-base font-heading font-extrabold text-[#201e1d] m-0">
                  {modalItem.kecamatan} (Kode Pos: {modalItem.kodePos || modalItem.kelurahan})
                </h4>
              </div>
              <button
                onClick={() => setModalItem(null)}
                className="text-[#605d5d] hover:text-[#201e1d] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-[#201e1d]">
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#605d5d]">Provinsi & Kab/Kota:</span>
                <span className="font-bold">{modalItem.provinsi}, {modalItem.kabupaten}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#605d5d]">Nomor Resi:</span>
                <span className="font-mono font-bold text-[#ec3013]">{modalItem.resi}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#605d5d]">Kode Pos:</span>
                <span className="font-mono font-bold">{modalItem.kodePos || modalItem.kelurahan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#605d5d]">Volume & Berat:</span>
                <span className="font-bold">{modalItem.volume} Koli ({modalItem.beratKg} Kg)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#605d5d]">Penerima:</span>
                <span className="font-bold">{modalItem.penerima} ({modalItem.instansi})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#605d5d]">Status:</span>
                <span>{renderStatusBadge(modalItem.status)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#605d5d]">SLA Layanan:</span>
                <span className="font-bold text-[#137333]">{modalItem.slaStatus}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalItem(null)}
                className="btn btn-secondary text-xs px-4 py-1.5 border border-black/20"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
