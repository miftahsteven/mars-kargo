import React, { useState, useEffect, useMemo } from 'react';
import { IndonesiaMap } from '../components/tracking/IndonesiaMap';
import { cargoService } from '../services/cargoService';
import { MapPin } from '../types/cargo';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, MapPin as MapPinIcon, Layers } from 'lucide-react';

export const TrackingPage: React.FC = () => {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Delivered' | 'Dalam Transit' | 'Menunggu Pickup'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [apiTransit, setApiTransit] = useState<string>('0');
  const [apiDelivered, setApiDelivered] = useState<string>('0');

  const fetchPetaSebaran = async () => {
    setLoading(true);
    try {
      const [data, kpis] = await Promise.all([
        cargoService.getPetaSebaran(),
        cargoService.getSummaryMetrics()
      ]);
      setPins(data);

      const transitKpi = kpis.find(k => k.label === 'Dalam Transit');
      const deliveredKpi = kpis.find(k => k.label === 'Selesai');
      
      if (transitKpi) setApiTransit(transitKpi.value);
      if (deliveredKpi) setApiDelivered(deliveredKpi.value);
    } catch (e) {
      console.warn('Failed to fetch tracking data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetaSebaran();
  }, []);

  // Filtered pins based on search and status
  const filteredPins = useMemo(() => {
    return pins.filter((pin) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        pin.resi.toLowerCase().includes(query) ||
        pin.lokasi.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;

      const raw = (pin.rawStatus || pin.status || '').toLowerCase();
      if (statusFilter === 'Delivered') {
        return pin.status === 'Delivered' || raw.includes('complete') || raw.includes('terkirim') || raw.includes('selesai');
      }
      if (statusFilter === 'Dalam Transit') {
        return pin.status === 'Dalam Transit' || raw.includes('delivery') || raw.includes('transit') || raw.includes('proses') || raw.includes('landed');
      }
      if (statusFilter === 'Menunggu Pickup') {
        return pin.status === 'Menunggu Pickup' || raw.includes('pick');
      }
      return true;
    });
  }, [pins, searchQuery, statusFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  // Pagination calculation
  const totalItems = filteredPins.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPins = useMemo(() => {
    return filteredPins.slice(startIndex, endIndex);
  }, [filteredPins, startIndex, endIndex]);

  // Counts for summary pills
  const counts = useMemo(() => {
    let delivered = 0;
    let transit = 0;
    let pickup = 0;

    pins.forEach((pin) => {
      const raw = (pin.rawStatus || pin.status || '').toLowerCase();
      if (pin.status === 'Delivered' || raw.includes('complete') || raw.includes('terkirim') || raw.includes('selesai')) {
        delivered++;
      } else if (pin.status === 'Dalam Transit' || raw.includes('delivery') || raw.includes('transit') || raw.includes('proses') || raw.includes('landed')) {
        transit++;
      } else if (pin.status === 'Menunggu Pickup' || raw.includes('pick')) {
        pickup++;
      }
    });

    return { total: pins.length, delivered, transit, pickup };
  }, [pins]);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold mb-1 text-[#1c1a19]">Pelacakan Peta Real-Time</h1>
          <div className="text-xs text-[#605d5d]">
            Sebaran geografis armada &amp; status kurir pengiriman terhubung via API <code className="bg-[#f0eff4] px-1.5 py-0.5 rounded text-[#e53935] font-mono">get-peta-sebaran</code>.
          </div>
        </div>

        <button
          onClick={fetchPetaSebaran}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#ffffff] border border-[#d8d6dc] hover:border-[#e53935] text-[#1c1a19] rounded-lg text-xs font-bold transition-all shadow-sm self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#e53935]' : 'text-[#605d5d]'}`} />
          <span>{loading ? 'Memuat Data API...' : 'Refresh Data Peta'}</span>
        </button>
      </div>

      {/* Stats Quick Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${statusFilter === 'ALL'
              ? 'bg-[#1c1a19] text-[#ffffff] border-[#1c1a19] shadow-md'
              : 'bg-[#ffffff] text-[#1c1a19] border-[#e8e7ec] hover:border-[#1c1a19]'
            }`}
        >
          <div className="text-[10px] font-extrabold tracking-wider uppercase opacity-75">Total Titik Peta</div>
          <div className="text-2xl font-heading font-black mt-0.5">{counts.total.toLocaleString('id-ID')}</div>
        </div>

        <div
          onClick={() => setStatusFilter('Dalam Transit')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${statusFilter === 'Dalam Transit'
              ? 'bg-[#e53935] text-[#ffffff] border-[#e53935] shadow-md'
              : 'bg-[#ffffff] text-[#1c1a19] border-[#e8e7ec] hover:border-[#e53935]'
            }`}
        >
          <div className="text-[10px] font-extrabold tracking-wider uppercase opacity-75">Dalam Transit / On Delivery</div>
          <div className="text-2xl font-heading font-black mt-0.5">{apiTransit}</div>
        </div>

        <div
          onClick={() => setStatusFilter('Delivered')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${statusFilter === 'Delivered'
              ? 'bg-[#1fa96a] text-[#ffffff] border-[#1fa96a] shadow-md'
              : 'bg-[#ffffff] text-[#1c1a19] border-[#e8e7ec] hover:border-[#1fa96a]'
            }`}
        >
          <div className="text-[10px] font-extrabold tracking-wider uppercase opacity-75">Delivered / Selesai</div>
          <div className="text-2xl font-heading font-black mt-0.5">{apiDelivered}</div>
        </div>

        <div
          onClick={() => setStatusFilter('Menunggu Pickup')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${statusFilter === 'Menunggu Pickup'
              ? 'bg-[#6d281e] text-[#ffffff] border-[#6d281e] shadow-md'
              : 'bg-[#ffffff] text-[#1c1a19] border-[#e8e7ec] hover:border-[#6d281e]'
            }`}
        >
          <div className="text-[10px] font-extrabold tracking-wider uppercase opacity-75">Menunggu Pickup</div>
          <div className="text-2xl font-heading font-black mt-0.5">{counts.pickup.toLocaleString('id-ID')}</div>
        </div>
      </div>

      {/* Map View - Marker processing skipped for now as requested */}
      <IndonesiaMap pins={[]} />

      {/* Data Table Container & Filter Controls */}
      <div className="bg-[#ffffff] border border-[#e8e7ec] rounded-xl p-5 shadow-sm flex flex-col gap-4">
        {/* Table Title & Filter Bar Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-[#f0eff4]">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#e53935]" />
            <div>
              <h2 className="text-base font-heading font-extrabold text-[#1c1a19]">
                Tabel Data Sebaran Pengiriman
              </h2>
              <div className="text-xs text-[#605d5d]">
                Total: <span className="font-semibold text-[#1c1a19]">{filteredPins.length.toLocaleString('id-ID')}</span> data ditemukan
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9c]" />
              <input
                type="text"
                placeholder="Cari No. Resi atau Lokasi / Instansi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#f8f8fa] border border-[#d8d6dc] focus:border-[#e53935] rounded-lg text-xs text-[#1c1a19] focus:outline-none transition-colors"
              />
            </div>

            {/* Status Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#605d5d]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-[#f8f8fa] border border-[#d8d6dc] rounded-lg text-xs font-semibold text-[#1c1a19] focus:outline-none focus:border-[#e53935] cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="Dalam Transit">Dalam Transit / On Delivery</option>
                <option value="Delivered">Delivered / Selesai</option>
                <option value="Menunggu Pickup">Menunggu Pickup</option>
              </select>
            </div>

            {/* Page Size Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[#605d5d]">
              <span>Halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2.5 py-2 bg-[#f8f8fa] border border-[#d8d6dc] rounded-lg text-xs font-semibold text-[#1c1a19] focus:outline-none cursor-pointer"
              >
                <option value={10}>10 data / hal</option>
                <option value={25}>25 data / hal</option>
                <option value={50}>50 data / hal</option>
                <option value={100}>100 data / hal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table Rows - Matching User Reference Image */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[#605d5d] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-7 h-7 animate-spin text-[#e53935]" />
            <span className="font-semibold">Mengambil data sebaran pengiriman dari server...</span>
          </div>
        ) : paginatedPins.length > 0 ? (
          <div className="bg-[#f5f5f7] border border-[#e5e5e7] rounded-lg overflow-hidden divide-y divide-[#e5e5e7] shadow-inner">
            {paginatedPins.map((pin, idx) => {
              const raw = (pin.rawStatus || pin.status || '').toLowerCase();
              const isPickup = pin.status === 'Menunggu Pickup' || raw.includes('pick');
              const isTransit = pin.status === 'Dalam Transit' || raw.includes('delivery') || raw.includes('transit') || raw.includes('proses') || raw.includes('landed');
              const isDelivered = pin.status === 'Delivered' || raw.includes('complete') || raw.includes('terkirim') || raw.includes('selesai');

              const dotColor = isDelivered ? '#1fa96a' : isPickup ? '#9b9797' : '#ec3013';

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3.5 bg-[#f8f8fa] hover:bg-[#eaeaea] transition-colors gap-4"
                >
                  {/* Left Resi & Address Info */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="font-mono font-extrabold text-sm text-[#1e1c1b] min-w-[130px] tracking-tight">
                      {pin.resi}
                    </span>
                    <span className="text-xs text-[#504d4d] font-medium truncate">
                      {pin.lokasi}
                    </span>
                  </div>

                  {/* Right Status Badge */}
                  <div className="flex-shrink-0 text-right">
                    {isDelivered && (
                      <span className="text-xs font-extrabold text-[#3a3737]">Delivered</span>
                    )}
                    {isTransit && (
                      <span className="text-xs font-extrabold text-[#a53d30]">Dalam Transit</span>
                    )}
                    {isPickup && (
                      <span className="text-xs font-extrabold px-3 py-1 bg-[#f9ebe8] text-[#6d281e] rounded border border-[#eec9c3]">
                        Menunggu Pickup
                      </span>
                    )}
                    {!isDelivered && !isTransit && !isPickup && (
                      <span className="text-xs font-bold text-[#605d5d]">{pin.rawStatus || pin.status}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-[#9a9a9c] flex flex-col items-center gap-1">
            <span className="font-bold text-sm text-[#605d5d]">Data Tidak Ditemukan</span>
            <span>Tidak ada data sebaran yang sesuai dengan filter pencarian / status.</span>
          </div>
        )}

        {/* Interactive Pagination Bar */}
        {filteredPins.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#f0eff4]">
            <div className="text-xs text-[#605d5d]">
              Menampilkan <span className="font-bold text-[#1c1a19]">{startIndex + 1}</span> -{' '}
              <span className="font-bold text-[#1c1a19]">{endIndex}</span> dari{' '}
              <span className="font-bold text-[#1c1a19]">{totalItems.toLocaleString('id-ID')}</span> total data sebaran
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-[#d8d6dc] bg-[#ffffff] hover:bg-[#f0eff4] disabled:opacity-40 text-xs font-bold text-[#1c1a19] transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {/* Page Number Indicator */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pNum = currentPage - 2 + i;
                    if (pNum > totalPages) pNum = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-all ${currentPage === pNum
                          ? 'bg-[#e53935] text-[#ffffff]'
                          : 'bg-[#f8f8fa] border border-[#d8d6dc] text-[#1c1a19] hover:bg-[#e8e7ec]'
                        }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-[#d8d6dc] bg-[#ffffff] hover:bg-[#f0eff4] disabled:opacity-40 text-xs font-bold text-[#1c1a19] transition-all flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

