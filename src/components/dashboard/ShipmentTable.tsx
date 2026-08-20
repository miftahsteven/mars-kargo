import React, { useState, useMemo } from 'react';
import { ShipmentItem } from '../../types/cargo';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Barcode,
  RotateCw,
  Smartphone,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Truck,
  ImageOff,
} from 'lucide-react';

interface ShipmentTableProps {
  shipments: ShipmentItem[];
  totalItems?: number;
  selectedProject: string;
  onSelectShipment: (resi: string) => void;
  isLoading?: boolean;
  limit?: number;
  onLimitChange?: (newLimit: number) => void;
  onRefresh?: () => void;
}

const DEFAULT_WAKTU_TERIMA =
  import.meta.env.VITE_DEFAULT_WAKTU_TERIMA ||
  import.meta.env.VITE_DEFAULT_TANGGAL_TERIMA ||
  '15 Jul 2026, 14:30';

export const formatDisplayWaktuTerima = (val?: string | null): string => {
  if (!val) return DEFAULT_WAKTU_TERIMA;
  const trimmed = String(val).trim();
  if (
    trimmed === '' ||
    trimmed === '-' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined'
  ) {
    return DEFAULT_WAKTU_TERIMA;
  }
  return trimmed;
};

export const hasValidPhoto = (url?: string | null): boolean => {
  if (!url) return false;
  const trimmed = String(url).trim();
  if (
    trimmed === '' ||
    trimmed === '-' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed.includes('photo-1586528116311-ad8dd3c8310d')
  ) {
    return false;
  }
  return true;
};

export const ShipmentTable: React.FC<ShipmentTableProps> = ({
  shipments,
  totalItems,
  selectedProject,
  onSelectShipment,
  isLoading = false,
  limit = 5,
  onLimitChange,
  onRefresh,
}) => {
  const { user } = useAuth();
  const isGovernment = user?.customerType === 'government';

  // Local state for search & client pagination fallback
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Filter options
  const statusFilterOptions = [
    { label: 'Semua Status', value: 'Semua' },
    { label: 'Belum Ada Status', value: 'Belum Ada Status' },
    { label: 'Pick Up', value: 'Pick Up' },
    { label: 'Pickup by Apps 📱', value: 'Pickup by Apps' },
    { label: 'Pick Up (Manual)', value: 'Pick Up (Manual)' },
    { label: 'Dalam Transit', value: 'Dalam Transit' },
    { label: 'Terkirim / Selesai', value: 'Terkirim' },
    { label: 'Berkendala', value: 'Berkendala' },
  ];

  // Filter shipments based on search query & status filter
  const filteredShipments = useMemo(() => {
    let result = shipments;

    if (statusFilter !== 'Semua') {
      if (statusFilter === 'Belum Ada Status') {
        result = result.filter(
          (s) =>
            !s.statusTerakhir ||
            s.statusTerakhir.toLowerCase().includes('menunggu') ||
            s.statusTerakhir.toLowerCase().includes('belum')
        );
      } else if (statusFilter === 'Pickup by Apps') {
        result = result.filter((s) => s.isScannedViaApps === true);
      } else if (statusFilter === 'Pick Up (Manual)') {
        result = result.filter(
          (s) =>
            (s.statusTerakhir?.toLowerCase().includes('pickup') || s.statusTerakhir?.toLowerCase().includes('pick up')) &&
            !s.isScannedViaApps
        );
      } else if (statusFilter === 'Pick Up') {
        result = result.filter(
          (s) => s.statusTerakhir?.toLowerCase().includes('pickup') || s.statusTerakhir?.toLowerCase().includes('pick up')
        );
      } else {
        result = result.filter((s) => s.statusTerakhir?.toLowerCase().includes(statusFilter.toLowerCase()));
      }
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.resi.toLowerCase().includes(term) ||
          s.penerima.toLowerCase().includes(term) ||
          s.tujuan.toLowerCase().includes(term) ||
          s.proyek.toLowerCase().includes(term) ||
          (s.courierName && s.courierName.toLowerCase().includes(term)) ||
          (s.statusTerakhir && s.statusTerakhir.toLowerCase().includes(term))
      );
    }
    return result;
  }, [shipments, statusFilter, searchTerm]);

  // Calculate pagination parameters
  const pageSize = limit || 10;
  const totalRecords = totalItems ?? filteredShipments.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Auto-clamp currentPage if out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Determine current displayed page slice
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const currentSlice = useMemo(() => {
    return filteredShipments.slice(startIndex, startIndex + pageSize);
  }, [filteredShipments, startIndex, pageSize]);

  // Handle Page Changes
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p)) {
      goToPage(p);
      setJumpPageInput('');
    }
  };

  // Generate dynamic page numbers array with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // Status Badge Helper
  const renderStatusBadge = (status?: string, isScannedViaApps?: boolean) => {
    const st = status || 'Menunggu Pickup';
    const lower = st.toLowerCase();

    let bg = 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    let icon = <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />;

    if (lower.includes('selesai') || lower.includes('completed') || lower.includes('terima')) {
      bg = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    } else if (lower.includes('transit')) {
      bg = 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
      icon = <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    } else if (lower.includes('pickup') || lower.includes('jemput')) {
      bg = 'bg-blue-50 text-blue-900 border-blue-300 font-bold';
      icon = <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    } else if (lower.includes('kendala') || lower.includes('berkendala')) {
      bg = 'bg-red-50 text-red-900 border-red-300 font-extrabold';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />;
    }

    return (
      <div className="flex flex-col items-start gap-1">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border shadow-2xs whitespace-nowrap ${bg}`}>
          {icon}
          <span>{st}</span>
        </span>
        {isScannedViaApps && (
          <span className="inline-flex items-center gap-1 text-[10.5px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
            <Smartphone className="w-3 h-3 text-white shrink-0" />
            <span>Scan App Android</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="card shadow-sm gap-4 p-5 bg-[#fcfbfb]">
      {/* Header & Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#201e1d]/15 pb-4">
        <div>
          <div className="card-kicker text-xs font-semibold uppercase tracking-wider text-[#605d5d]">
            Detail & Riwayat Pengiriman
          </div>
          <h3 className="text-xl font-heading font-extrabold m-0 text-[#201e1d]">
            Riwayat Terbaru — {selectedProject}
          </h3>
        </div>

        {/* Search & Limit Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Search Input */}
          <div className="relative min-w-[220px] sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#605d5d]" />
            <input
              type="text"
              placeholder="Cari Resi, Kurir, Penerima, Tujuan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#201e1d]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c1405]/30 focus:border-[#7c1405]"
            />
          </div>

          {/* Items Per Page Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#605d5d] font-medium">
            <span>Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newLimit = parseInt(e.target.value, 10);
                if (onLimitChange) onLimitChange(newLimit);
                setCurrentPage(1);
              }}
              className="bg-white border border-[#201e1d]/20 px-2 py-1.5 rounded-md text-xs font-bold text-[#201e1d] focus:outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>baris</span>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Data"
              className="p-1.5 bg-white border border-[#201e1d]/20 rounded-md hover:bg-gray-50 text-[#201e1d] transition-colors"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#7c1405]' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Status Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-1 text-xs">
        <span className="text-xs font-bold text-[#605d5d] shrink-0 mr-1">Filter Status:</span>
        {statusFilterOptions.map((opt) => {
          const isActive = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#7c1405] text-white border-[#7c1405] shadow-xs scale-102'
                  : 'bg-white text-[#201e1d]/80 border-[#201e1d]/20 hover:bg-[#7c1405]/10 hover:border-[#7c1405]/30'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Shipment Data Table */}
      <div className="overflow-x-auto min-h-[320px]">
        <table className="table w-full text-xs">
          <thead>
            <tr className="bg-[#f0eeee] text-left text-[#605d5d]">
              <th className="py-3 px-3.5">Foto / Bukti</th>
              <th className="py-3 px-3.5 whitespace-nowrap">No. Resi</th>
              <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
              <th className="py-3 px-3.5 whitespace-nowrap min-w-[170px]">Kurir Pickup & Waktu</th>
              <th className="py-3 px-3.5 whitespace-nowrap">Tgl Angkut</th>
              <th className="py-3 px-3.5">Tujuan</th>
              <th className="py-3 px-3.5 whitespace-nowrap">Berat / Vol</th>
              <th className="py-3 px-3.5 whitespace-nowrap">Tarif Kontrak</th>
              <th className="py-3 px-3.5">Penerima</th>
              <th className="py-3 px-3.5 whitespace-nowrap">Waktu Diterima</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse border-b border-[#201e1d]/10">
                  <td className="py-3 px-3.5">
                    <div className="w-9 h-9 bg-gray-200 rounded" />
                  </td>
                  <td className="py-3 px-3.5"><div className="w-24 h-4 bg-gray-200 rounded" /></td>
                  <td className="py-3 px-3.5"><div className="w-24 h-4 bg-gray-200 rounded" /></td>
                  <td className="py-3 px-3.5"><div className="w-32 h-4 bg-gray-200 rounded" /></td>
                  <td className="py-3 px-3.5"><div className="w-16 h-4 bg-gray-200 rounded" /></td>
                  <td className="py-3 px-3.5"><div className="w-32 h-4 bg-gray-200 rounded" /></td>
                  <td className="py-3 px-3.5"><div className="w-12 h-4 bg-gray-200 rounded" /></td>
                  <td className="py-3 px-3.5"><div className="w-16 h-4 bg-gray-200 rounded" /></td>
                  <td className="py-3 px-3.5"><div className="w-28 h-4 bg-gray-200 rounded" /></td>
                  <td className="py-3 px-3.5"><div className="w-20 h-4 bg-gray-200 rounded" /></td>
                </tr>
              ))
            ) : currentSlice.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-[#605d5d]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Barcode className="w-8 h-8 text-gray-300" />
                    <span className="font-semibold">Tidak ada data pengiriman yang ditemukan.</span>
                    {(searchTerm || statusFilter !== 'Semua') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('Semua');
                        }}
                        className="text-xs text-[#7c1405] underline font-bold mt-1"
                      >
                        Bersihkan Filter & Pencarian
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              currentSlice.map((row) => (
                <tr
                  key={row.resi}
                  className="border-b border-[#201e1d]/10 cursor-pointer hover:bg-[#7c1405]/5 transition-colors group"
                  onClick={() => onSelectShipment(row.resi)}
                >
                  <td className="py-3 px-3.5">
                    {hasValidPhoto(row.photoUrl) ? (
                      <div
                        className="w-9 h-9 rounded bg-cover bg-center border border-black/10 shadow-xs"
                        style={{ backgroundImage: `url(${row.photoUrl})` }}
                        title="Foto Bukti Pengiriman"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded bg-[#f5f4f4] border border-dashed border-[#201e1d]/25 flex flex-col items-center justify-center text-gray-400 select-none shadow-xs"
                        title="Belum ada foto bukti pengiriman"
                      >
                        <ImageOff className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[7px] leading-none font-medium text-gray-400 mt-0.5 scale-90">No Foto</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 font-bold font-heading text-[#7c1405] group-hover:underline whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Barcode className="w-3.5 h-3.5 text-[#ec3013] shrink-0" />
                      <span>{row.resi}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">{renderStatusBadge(row.statusTerakhir, row.isScannedViaApps)}</td>
                  <td className="py-3 px-3.5 whitespace-nowrap min-w-[170px]">
                    {row.isScannedViaApps ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#201e1d] text-xs flex items-center gap-1">
                          <span>{row.courierName || 'Kurir Apps'}</span>
                        </span>
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{row.pickupTime || row.tglKirim}</span>
                        </span>
                      </div>
                    ) : row.pickupMethod === 'Manual Dashboard' ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-amber-900 text-xs">Pickup Manual</span>
                        <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                          <ClipboardList className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Dashboard Lama</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 font-medium">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">{row.tglKirim}</td>
                  <td className="py-3 px-3.5 max-w-[220px] truncate" title={row.tujuan}>
                    {row.tujuan}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">{row.berat}</td>
                  <td className="py-3 px-3.5 font-semibold whitespace-nowrap">
                    {isGovernment ? '-' : row.tarif}
                  </td>
                  <td className="py-3 px-3.5 font-medium max-w-[200px] truncate" title={row.penerima}>
                    {row.penerima}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap text-[#605d5d]">
                    {formatDisplayWaktuTerima(row.waktuTerima)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Professional & Powerful Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#201e1d]/15 text-xs text-[#605d5d]">
        {/* Info Range */}
        <div className="font-medium">
          {totalRecords > 0 ? (
            <span>
              Menampilkan <strong className="text-[#201e1d]">{startIndex + 1}</strong> –{' '}
              <strong className="text-[#201e1d]">{endIndex}</strong> dari{' '}
              <strong className="text-[#7c1405]">{totalRecords.toLocaleString('id-ID')}</strong> data pengiriman
            </span>
          ) : (
            <span>0 Data</span>
          )}
        </div>

        {/* Page Buttons & Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1 || isLoading}
              title="Halaman Pertama"
              className="p-1.5 rounded bg-white border border-[#201e1d]/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              title="Halaman Sebelumnya"
              className="p-1.5 rounded bg-white border border-[#201e1d]/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((num, idx) =>
              num === '...' ? (
                <span key={`dots-${idx}`} className="px-1 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${num}`}
                  onClick={() => goToPage(num as number)}
                  disabled={isLoading}
                  className={`px-2.5 py-1 rounded font-bold transition-colors ${currentPage === num
                    ? 'bg-[#7c1405] text-white shadow-xs'
                    : 'bg-white border border-[#201e1d]/20 hover:bg-gray-100 text-[#201e1d]'
                    }`}
                >
                  {num}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              title="Halaman Berikutnya"
              className="p-1.5 rounded bg-white border border-[#201e1d]/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              title="Halaman Terakhir"
              className="p-1.5 rounded bg-white border border-[#201e1d]/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Jump to Page Form */}
          <form onSubmit={handleJumpPage} className="flex items-center gap-1 ml-2">
            <span className="text-[11px] text-gray-500">Ke:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              placeholder={`${currentPage}`}
              className="w-11 px-1.5 py-1 text-center bg-white border border-[#201e1d]/20 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#7c1405]"
            />
            <button
              type="submit"
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-[#201e1d] rounded text-[11px] font-bold"
            >
              Go
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

