import React, { useState } from 'react';
import { ProvinceData } from '../../types/cargo';

interface GeoDrillDownProps {
  islands?: any[];
  officerId?: number | string;
}

const PROVINCES_DATA: ProvinceData[] = [
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

export const GeoDrillDown: React.FC<GeoDrillDownProps> = () => {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const totalVolume = PROVINCES_DATA.reduce((acc, curr) => acc + curr.volume, 0);
  const maxVol = Math.max(...PROVINCES_DATA.map((p) => p.volume), 1);

  return (
    <div className="card shadow-sm gap-4 p-4 min-w-0 overflow-hidden relative">
      <div>
        <div className="card-kicker">Distribusi Wilayah</div>
        <h3 className="text-xl font-heading font-extrabold m-0">
          Volume per Provinsi ({PROVINCES_DATA.length} Provinsi)
        </h3>
      </div>

      {/* Horizontal Scroll Chart Area */}
      <div className="w-full overflow-x-auto pb-4 pt-2 scrollbar-thin relative z-10">
        <div className="flex items-end gap-1 h-[290px] pt-14 min-w-max px-2 relative">
          
          {/* Background Grid Lines */}
          <div className="absolute left-0 right-0 bottom-[68px] top-[50px] flex flex-col justify-between pointer-events-none opacity-40 z-0">
            <div className="border-b border-dashed border-[#eae7e7] w-full" />
            <div className="border-b border-dashed border-[#eae7e7] w-full" />
            <div className="border-b border-dashed border-[#eae7e7] w-full" />
            <div className="border-b border-dashed border-[#eae7e7] w-full" />
          </div>

          {PROVINCES_DATA.map((pv, idx) => {
            const pct = totalVolume > 0 ? ((pv.volume / totalVolume) * 100).toFixed(1) : '0';
            const barHeight = Math.max(8, Math.round((pv.volume / maxVol) * 150));
            const isHovered = hoverId === pv.name;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoverId(pv.name)}
                onMouseLeave={() => setHoverId(null)}
                className="flex-none w-[50px] flex flex-col items-center cursor-pointer relative group z-10"
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-9 bg-[#2d2b2b] text-white px-2 py-1 text-[10px] font-bold whitespace-nowrap z-30 shadow-md rounded">
                    {pv.name}: {pct}% ({pv.volume.toLocaleString('id-ID')} pengiriman)
                  </div>
                )}

                {/* Volume Label */}
                <div className="text-[10px] font-extrabold whitespace-nowrap text-center text-[#201e1d] mb-1">
                  {pv.volume.toLocaleString('id-ID')}
                </div>

                {/* Vertical Bar */}
                <div
                  className="w-[44px] transition-all bg-[#bab6b6] group-hover:bg-[#ec3013] rounded-t-sm"
                  style={{ height: `${barHeight}px` }}
                />

                {/* Baseline separator */}
                <div className="w-full border-t border-[#eae7e7] my-2" />

                {/* Horizontal Province Name */}
                <div className="h-[36px] w-full flex items-start justify-center text-center mt-0.5 px-0.5">
                  <span className="text-[9px] font-bold text-[#605d5d] group-hover:text-[#ec3013] transition-colors leading-tight line-clamp-2 break-words" title={pv.name}>
                    {pv.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
