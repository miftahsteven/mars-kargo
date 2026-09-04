import React from 'react';
import { SchoolCategory, CategorySummary } from '../../data/schoolDistributionData';
import { GraduationCap, BarChart2, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface SchoolTypeDistributionCardProps {
  subdistrictName: string;
  districtName: string;
  categories: CategorySummary[];
  selectedCategory: SchoolCategory | 'ALL';
  onSelectCategory: (cat: SchoolCategory | 'ALL') => void;
  totalSchools: number;
  totalVolume: number;
}

export const SchoolTypeDistributionCard: React.FC<SchoolTypeDistributionCardProps> = ({
  subdistrictName,
  districtName,
  categories,
  selectedCategory,
  onSelectCategory,
  totalSchools,
  totalVolume,
}) => {
  const maxVolume = Math.max(...categories.map((c) => c.volumeKoli), 1);

  return (
    <div className="card h-full p-4 sm:p-5 flex flex-col justify-between border border-black/10 bg-[#eae9e9]">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#201e1d]/10">
          <div>
            <div className="card-kicker flex items-center gap-1.5 text-[10px] tracking-widest text-[#ec3013] font-extrabold uppercase">
              <GraduationCap className="w-3.5 h-3.5" />
              DISTRIBUSI JENIS SEKOLAH
            </div>
            <h3 className="text-lg font-heading font-extrabold text-[#201e1d] m-0">
              {subdistrictName}
            </h3>
            <div className="text-xs text-[#605d5d] mt-0.5">
              {districtName} · Total {totalSchools} Sekolah ({totalVolume} koli)
            </div>
          </div>

          <button
            onClick={() => onSelectCategory('ALL')}
            className={`text-xs font-bold px-2.5 py-1 transition-colors border ${
              selectedCategory === 'ALL'
                ? 'bg-[#ec3013] text-white border-[#ec3013]'
                : 'bg-white/80 text-[#201e1d] border-[#201e1d]/20 hover:bg-[#201e1d] hover:text-white'
            }`}
          >
            Semua ({totalSchools})
          </button>
        </div>

        <div className="text-[11px] text-[#605d5d] flex items-center gap-1 my-3">
          <Info className="w-3.5 h-3.5 text-[#ec3013] flex-none" />
          Klik pada salah satu jenis sekolah untuk memfilter daftar sekolah di sebelah kanan.
        </div>

        {/* Horizontal Bar Chart for School Types */}
        <div className="flex flex-col gap-3 my-2">
          {categories.map((cat) => {
            const isSelected =
              selectedCategory !== 'ALL' &&
              selectedCategory.toUpperCase() === cat.category.toUpperCase();
            const barWidthPercent = Math.max(8, Math.round((cat.volumeKoli / maxVolume) * 100));

            return (
              <div
                key={cat.category}
                onClick={() => onSelectCategory(cat.category as any)}
                className={`p-3 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-white border-[#ec3013] shadow-md ring-1 ring-[#ec3013]'
                    : 'bg-white/70 hover:bg-white border-black/10'
                }`}
              >
                {/* Row Header: Category Name & Stats */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black font-heading px-2 py-0.5 uppercase tracking-wide ${
                        isSelected
                          ? 'bg-[#ec3013] text-white'
                          : 'bg-[#2d2b2b] text-white'
                      }`}
                    >
                      {cat.category}
                    </span>
                    <span className="text-xs font-bold text-[#201e1d]">{cat.label}</span>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <span className="text-xs font-black font-heading text-[#201e1d]">
                      {cat.volumeKoli} koli
                    </span>
                    <span className="text-[11px] text-[#605d5d] font-semibold">
                      ({cat.schoolCount} sekolah)
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#ec3013] flex-none" />}
                  </div>
                </div>

                {/* Horizontal Bar Visual */}
                <div className="w-full bg-[#eae7e7] h-3.5 relative overflow-hidden border border-black/10">
                  <div
                    className="h-full transition-all duration-300 relative"
                    style={{
                      width: `${barWidthPercent}%`,
                      backgroundColor: isSelected ? '#ec3013' : (cat.color || '#605d5d'),
                    }}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Percentage and indicator */}
                <div className="flex justify-between items-center mt-1 text-[10px] text-[#605d5d] font-semibold">
                  <span>Kontribusi: {cat.percentage}% dari total wilayah</span>
                  <span className={isSelected ? 'text-[#ec3013] font-bold' : ''}>
                    {isSelected ? '● Sedang Ditampilkan' : 'Klik untuk melihat'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-[#201e1d]/10 text-[10px] text-[#605d5d] text-center">
        Data terhubung langsung dengan Surat Jalan dan tanda terima B2B Mars Cargo.
      </div>
    </div>
  );
};
