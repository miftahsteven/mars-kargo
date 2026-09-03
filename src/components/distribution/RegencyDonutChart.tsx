import React, { useState, useMemo } from 'react';
import { RegencyItem } from '../../data/realDistributionData';
import { PieChart, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface RegencyDonutChartProps {
  provinceName: string;
  regencies: RegencyItem[];
  selectedRegency: string;
  onSelectRegency: (regencyName: string) => void;
}

const DONUT_COLORS = [
  '#ec3013', // Mars Red
  '#2d2b2b', // Dark Charcoal
  '#d97706', // Deep Amber
  '#e15b47', // Coral
  '#444141', // Steel
  '#0f766e', // Teal
  '#991b1b', // Crimson
  '#605d5d', // Slate
  '#b45309', // Dark Orange
  '#374151', // Cool Grey
];

export const RegencyDonutChart: React.FC<RegencyDonutChartProps> = ({
  provinceName,
  regencies,
  selectedRegency,
  onSelectRegency,
}) => {
  const [hoveredRegency, setHoveredRegency] = useState<string | null>(null);

  const totalVolume = useMemo(() => {
    return regencies.reduce((acc, curr) => acc + curr.volume, 0);
  }, [regencies]);

  // Generate SVG arcs data
  const slices = useMemo(() => {
    if (totalVolume === 0 || regencies.length === 0) return [];

    let accumulatedAngle = 0;
    return regencies.map((reg, idx) => {
      const share = reg.volume / totalVolume;
      const angle = share * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle += angle;

      const color = DONUT_COLORS[idx % DONUT_COLORS.length];
      const isSelected = selectedRegency === reg.name;
      const isHovered = hoveredRegency === reg.name;

      return {
        ...reg,
        color,
        startAngle,
        endAngle,
        angle,
        share,
        isSelected,
        isHovered,
      };
    });
  }, [regencies, totalVolume, selectedRegency, hoveredRegency]);

  // Coordinate helper for SVG arcs
  const getCoordinatesForPercent = (percent: number, radius: number) => {
    const x = Math.cos(2 * Math.PI * percent) * radius;
    const y = Math.sin(2 * Math.PI * percent) * radius;
    return [x, y];
  };

  const activeRegencyData = useMemo(() => {
    return regencies.find((r) => r.name === (hoveredRegency || selectedRegency)) || regencies[0];
  }, [regencies, hoveredRegency, selectedRegency]);

  const activePercentage = totalVolume > 0 && activeRegencyData
    ? ((activeRegencyData.volume / totalVolume) * 100).toFixed(1)
    : '0';

  return (
    <div className="card h-full p-4 sm:p-5 flex flex-col justify-between border border-black/10 bg-[#eae9e9]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#201e1d]/10">
          <div>
            <div className="card-kicker flex items-center gap-1.5 text-[10px] tracking-widest text-[#ec3013] font-extrabold uppercase">
              <PieChart className="w-3.5 h-3.5" />
              BREAKDOWN KABUPATEN / KOTA
            </div>
            <h3 className="text-lg font-heading font-extrabold text-[#201e1d] m-0">
              {provinceName}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#605d5d] font-semibold">Total Pengiriman</div>
            <div className="text-sm font-extrabold font-heading text-[#201e1d]">
              {totalVolume.toLocaleString('id-ID')} koli
            </div>
          </div>
        </div>

        {/* Donut Chart Visual */}
        <div className="relative flex flex-col items-center justify-center my-4">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            <svg
              viewBox="-120 -120 240 240"
              className="w-full h-full transform -rotate-90 filter drop-shadow-sm select-none"
            >
              {slices.map((slice) => {
                const radius = slice.isSelected || slice.isHovered ? 108 : 100;
                const innerRadius = 66;

                const startAngleRad = (slice.startAngle * Math.PI) / 180;
                const endAngleRad = (slice.endAngle * Math.PI) / 180;

                const x1 = Math.cos(startAngleRad) * radius;
                const y1 = Math.sin(startAngleRad) * radius;
                const x2 = Math.cos(endAngleRad) * radius;
                const y2 = Math.sin(endAngleRad) * radius;

                const x3 = Math.cos(endAngleRad) * innerRadius;
                const y3 = Math.sin(endAngleRad) * innerRadius;
                const x4 = Math.cos(startAngleRad) * innerRadius;
                const y4 = Math.sin(startAngleRad) * innerRadius;

                const largeArcFlag = slice.angle > 180 ? 1 : 0;

                const pathData = [
                  `M ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `L ${x3} ${y3}`,
                  `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                  'Z',
                ].join(' ');

                return (
                  <path
                    key={slice.name}
                    d={pathData}
                    fill={slice.color}
                    stroke="#eae9e9"
                    strokeWidth={slice.isSelected ? '3' : '2'}
                    className="cursor-pointer transition-all duration-200 hover:opacity-90"
                    onClick={() => onSelectRegency(slice.name)}
                    onMouseEnter={() => setHoveredRegency(slice.name)}
                    onMouseLeave={() => setHoveredRegency(null)}
                  />
                );
              })}
            </svg>

            {/* Center Information Cutout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
              <span className="text-[10px] uppercase tracking-wider text-[#605d5d] font-bold">
                {hoveredRegency ? 'Ditunjuk' : 'Terpilih'}
              </span>
              <div className="text-xs font-black font-heading text-[#201e1d] leading-snug line-clamp-2 px-3">
                {activeRegencyData?.name || 'Pilih Kab/Kota'}
              </div>
              <div className="text-xl font-heading font-black text-[#ec3013] mt-0.5">
                {activeRegencyData?.volume.toLocaleString('id-ID')}
                <span className="text-xs font-semibold text-[#201e1d] ml-1">koli</span>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#201e1d]/80 bg-white/70 px-2 py-0.5 mt-1 border border-black/10">
                <span>{activePercentage}%</span>
                <span>·</span>
                <span className="text-[#0f766e]">SLA {activeRegencyData?.slaOnTime || 98}%</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#605d5d] flex items-center gap-1 mt-1 text-center">
            <Info className="w-3.5 h-3.5 text-[#ec3013] flex-none" />
            Klik potongan grafik atau daftar di bawah untuk membuka tabel kecamatan.
          </div>
        </div>

        {/* Interactive Legend List */}
        <div className="mt-3 flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
          {slices.map((slice) => {
            const isSelected = selectedRegency === slice.name;

            return (
              <button
                key={slice.name}
                onClick={() => onSelectRegency(slice.name)}
                onMouseEnter={() => setHoveredRegency(slice.name)}
                onMouseLeave={() => setHoveredRegency(null)}
                className={`w-full text-left p-2.5 transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#ec3013] shadow-sm ring-1 ring-[#ec3013]'
                    : 'bg-white/60 hover:bg-white border-black/10'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3.5 h-3.5 flex-none rounded-none shadow-sm"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div className="truncate">
                    <div
                      className={`text-xs font-extrabold truncate ${
                        isSelected ? 'text-[#ec3013]' : 'text-[#201e1d]'
                      }`}
                    >
                      {slice.name}
                    </div>
                    <div className="text-[10px] text-[#605d5d]">
                      {slice.districts.length} Kecamatan · SLA {slice.slaOnTime}%
                    </div>
                  </div>
                </div>

                <div className="text-right flex-none flex items-center gap-2">
                  <div>
                    <div className="text-xs font-black text-[#201e1d]">
                      {slice.volume.toLocaleString('id-ID')} koli
                    </div>
                    <div className="text-[10px] font-bold text-[#605d5d]">
                      {(slice.share * 100).toFixed(1)}%
                    </div>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-[#ec3013] flex-none" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#605d5d]/50 flex-none" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
