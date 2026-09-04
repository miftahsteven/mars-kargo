import React, { useState, useMemo, useRef } from 'react';
import { BASE_PROVINCES, getProvinceIslandMeta } from '../../data/realDistributionData';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface ProvinceBarChartProps {
  selectedProvince: string;
  onSelectProvince: (provName: string) => void;
  provinces?: { name: string; volume: number }[];
}

export const ProvinceBarChart: React.FC<ProvinceBarChartProps> = ({
  selectedProvince,
  onSelectProvince,
  provinces,
}) => {
  const activeProvincesList = provinces && provinces.length > 0 ? provinces : BASE_PROVINCES;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'volume-desc' | 'volume-asc' | 'island' | 'name'>('volume-desc');
  const [hoverId, setHoverId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalVolumeAll = useMemo(() => {
    return activeProvincesList.reduce((acc, curr) => acc + curr.volume, 0);
  }, [activeProvincesList]);

  const sortedProvinces = useMemo(() => {
    let list = [...activeProvincesList];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (sortBy === 'volume-desc') {
      list.sort((a, b) => b.volume - a.volume);
    } else if (sortBy === 'volume-asc') {
      list.sort((a, b) => a.volume - b.volume);
    } else if (sortBy === 'island') {
      list.sort((a, b) => {
        const metaA = getProvinceIslandMeta(a.name);
        const metaB = getProvinceIslandMeta(b.name);
        return metaA.order - metaB.order;
      });
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [activeProvincesList, searchTerm, sortBy]);

  const maxVol = useMemo(() => {
    return Math.max(...activeProvincesList.map((p) => p.volume), 1);
  }, [activeProvincesList]);

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = dir === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const selectedData = activeProvincesList.find((p) => p.name === selectedProvince);

  return (
    <div className="card shadow-sm p-4 sm:p-5 min-w-0 overflow-hidden relative border border-black/10 bg-[#eae9e9]">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-[#201e1d]/10">
        <div>
          <div className="card-kicker text-[11px] tracking-widest text-[#ec3013] font-extrabold uppercase">
            DISTRIBUSI WILAYAH
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#201e1d] m-0">
              Volume per Provinsi ({activeProvincesList.length} Provinsi)
            </h3>
            {selectedData && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold bg-[#ec3013] text-white rounded-none shadow-sm">
                <CheckCircle className="w-3.5 h-3.5" />
                Terpilih: {selectedData.name} ({selectedData.volume.toLocaleString('id-ID')} pengiriman)
              </span>
            )}
          </div>
          <p className="text-xs text-[#605d5d] mt-0.5">
            Klik salah satu batang provinsi untuk melihat rincian Kabupaten/Kota dan Kecamatan di bawahnya.
          </p>
        </div>

        {/* Search, Sort, and Scroll navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#605d5d] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari provinsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input !pl-8 pr-2.5 py-1 text-xs w-36 sm:w-44 bg-white/70 border border-[#201e1d]/25 focus:border-[#ec3013]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#605d5d]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input py-1 text-xs bg-white/70 border border-[#201e1d]/25 cursor-pointer font-bold text-[#201e1d]"
            >
              <option value="volume-desc">Volume Tertinggi</option>
              <option value="volume-asc">Volume Terendah</option>
              <option value="island">Urutan Pulau (Sumatra - Papua)</option>
              <option value="name">Nama (A-Z)</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScroll('left')}
              className="p-1.5 bg-white/80 hover:bg-[#ec3013] hover:text-white text-[#201e1d] border border-[#201e1d]/20 transition-colors"
              title="Geser ke kiri"
              aria-label="Scroll kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-1.5 bg-white/80 hover:bg-[#ec3013] hover:text-white text-[#201e1d] border border-[#201e1d]/20 transition-colors"
              title="Geser ke kanan"
              aria-label="Scroll kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Chart Area */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto pb-4 pt-2 scrollbar-thin relative z-10 select-none"
      >
        <div className="flex items-end gap-1 h-[290px] pt-14 min-w-max px-2 relative">
          {/* Background Grid Lines */}
          <div className="absolute left-0 right-0 bottom-[68px] top-[50px] flex flex-col justify-between pointer-events-none opacity-40 z-0">
            <div className="border-b border-dashed border-[#201e1d]/20 w-full" />
            <div className="border-b border-dashed border-[#201e1d]/20 w-full" />
            <div className="border-b border-dashed border-[#201e1d]/20 w-full" />
            <div className="border-b border-dashed border-[#201e1d]/20 w-full" />
          </div>

          {sortedProvinces.map((pv, idx) => {
            const isSelected = selectedProvince === pv.name;
            const pct = totalVolumeAll > 0 ? ((pv.volume / totalVolumeAll) * 100).toFixed(1) : '0';
            const barHeight = Math.max(10, Math.round((pv.volume / maxVol) * 150));
            const isHovered = hoverId === pv.name;
            const islandMeta = getProvinceIslandMeta(pv.name);
            const prevIslandMeta = idx > 0 ? getProvinceIslandMeta(sortedProvinces[idx - 1].name) : null;
            const isFirstOfIsland = sortBy === 'island' && (!prevIslandMeta || prevIslandMeta.island !== islandMeta.island);

            return (
              <React.Fragment key={pv.name}>
                {/* Island Section Divider when sorted by island */}
                {isFirstOfIsland && (
                  <div className="flex-none flex flex-col justify-end items-center mx-1.5 h-[210px] pb-9 z-10 select-none">
                    <div className="bg-[#201e1d] text-white px-2 py-0.5 text-[9px] font-heading font-black tracking-widest uppercase shadow-xs whitespace-nowrap border-b-2 border-[#ec3013]">
                      {islandMeta.island}
                    </div>
                    <div className="w-[1.5px] h-20 bg-[#201e1d]/25 mt-1 border-dashed border-l border-[#ec3013]/60" />
                  </div>
                )}

                <div
                  onClick={() => onSelectProvince(pv.name)}
                  onMouseEnter={() => setHoverId(pv.name)}
                  onMouseLeave={() => setHoverId(null)}
                  className={`flex-none w-[54px] flex flex-col items-center cursor-pointer relative group z-10 transition-all ${
                    isSelected ? 'scale-[1.03] z-20' : 'hover:scale-[1.02]'
                  }`}
                >
                  {/* Tooltip on Hover / Selected */}
                  {(isHovered || (isSelected && !hoverId)) && (
                    <div
                      className={`absolute -top-14 px-2.5 py-1 text-[10px] font-extrabold whitespace-nowrap z-30 shadow-lg border ${
                        isSelected
                          ? 'bg-[#ec3013] text-white border-white/40'
                          : 'bg-[#2d2b2b] text-white border-[#444141]'
                      }`}
                    >
                      <div className="text-[9px] font-bold text-white/80 uppercase tracking-wider mb-0.5">
                        Wilayah: {islandMeta.island}
                      </div>
                      <div>
                        {pv.name}: {pct}% ({pv.volume.toLocaleString('id-ID')} pengiriman)
                      </div>
                      {isSelected && (
                        <span className="block text-[9px] font-normal text-white/90">
                          ● Sedang Ditampilkan
                        </span>
                      )}
                    </div>
                  )}

                  {/* Active Indicator Arrow */}
                  {isSelected && (
                    <div className="absolute -top-3 text-[#ec3013] animate-bounce">
                      ▼
                    </div>
                  )}

                  {/* Volume Label on Top */}
                  <div
                    className={`text-[10px] font-extrabold whitespace-nowrap text-center mb-1 transition-colors ${
                      isSelected ? 'text-[#ec3013] font-black scale-105' : 'text-[#201e1d]'
                    }`}
                  >
                    {pv.volume.toLocaleString('id-ID')}
                  </div>

                  {/* Vertical Bar */}
                  <div
                    className={`w-[46px] transition-all relative ${
                      isSelected
                        ? 'bg-[#ec3013] shadow-md ring-2 ring-[#ec3013]/50'
                        : 'bg-[#bab6b6] group-hover:bg-[#ec3013]'
                    }`}
                    style={{ height: `${barHeight}px` }}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                    )}
                  </div>

                  {/* Baseline separator */}
                  <div
                    className={`w-full border-t my-2 transition-colors ${
                      isSelected ? 'border-[#ec3013] border-t-2' : 'border-[#201e1d]/20'
                    }`}
                  />

                  {/* Province Name Label */}
                  <div
                    className={`h-[42px] w-full flex flex-col items-center justify-start text-center mt-0.5 px-0.5 transition-colors ${
                      isSelected ? 'bg-[#ec3013]/10 font-black' : ''
                    }`}
                  >
                    <span
                      className={`text-[9px] leading-tight line-clamp-2 break-words transition-colors ${
                        isSelected
                          ? 'font-extrabold text-[#ec3013]'
                          : 'font-bold text-[#605d5d] group-hover:text-[#ec3013]'
                      }`}
                      title={pv.name}
                    >
                      {pv.name}
                    </span>
                    {sortBy === 'island' && (
                      <span className="text-[7.5px] uppercase font-bold text-[#ec3013]/70 truncate max-w-full">
                        {islandMeta.island.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
