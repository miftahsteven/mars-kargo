import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { IslandData } from '../../types/cargo';

interface GeoDrillDownProps {
  islands: IslandData[];
}

export const GeoDrillDown: React.FC<GeoDrillDownProps> = ({ islands }) => {
  const [selectedIslandId, setSelectedIslandId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const selectedIsland = islands.find((i) => i.id === selectedIslandId) || null;
  const totalVolume = islands.reduce((acc, curr) => acc + curr.volume, 0);
  const maxIslandVol = Math.max(...islands.map((i) => i.volume));

  const maxProvVol = selectedIsland
    ? Math.max(...selectedIsland.provinces.map((p) => p.volume))
    : 1;

  return (
    <div className="card shadow-sm gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="card-kicker">Distribusi Wilayah</div>
          <h3 className="text-xl font-heading font-extrabold m-0">
            {selectedIsland ? `${selectedIsland.name} — Rincian Provinsi` : 'Volume per Pulau'}
          </h3>
        </div>
        {selectedIsland && (
          <button
            className="btn btn-secondary text-xs"
            onClick={() => setSelectedIslandId(null)}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </button>
        )}
      </div>

      {!selectedIsland ? (
        /* Island Bar Chart */
        <div className="overflow-x-auto pb-2">
          <div className="flex items-end gap-3 sm:gap-4 h-[220px] pt-14 min-w-[360px]">
          {islands.map((isl) => {
            const pct = ((isl.volume / totalVolume) * 100).toFixed(1);
            const barHeight = Math.max(8, Math.round((isl.volume / maxIslandVol) * 160));
            const isHovered = hoverId === isl.id;

            return (
              <div
                key={isl.id}
                onClick={() => setSelectedIslandId(isl.id)}
                onMouseEnter={() => setHoverId(isl.id)}
                onMouseLeave={() => setHoverId(null)}
                className="flex-1 flex flex-col items-center gap-2 cursor-pointer relative group"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-7 bg-[#2d2b2b] text-white px-2 py-1 text-[11px] font-bold whitespace-nowrap z-10 shadow-md">
                    {pct}%
                  </div>
                )}
                <div className="text-xs font-bold whitespace-nowrap">
                  {isl.volume}{' '}
                  <span className="text-[#7d7979] font-normal">({pct}%)</span>
                </div>

                {/* Bar */}
                <div
                  className="w-full max-w-[44px] transition-colors bg-[#bab6b6] group-hover:bg-[#ec3013]"
                  style={{ height: `${barHeight}px` }}
                />

                <div className="text-[11px] text-center text-[#605d5d] leading-tight font-semibold">
                  {isl.name}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      ) : (
        /* Province List Breakdown */
        <div className="flex flex-col gap-2.5 pt-1">
          {selectedIsland.provinces.map((pv, idx) => {
            const widthPct = Math.max(4, Math.round((pv.volume / maxProvVol) * 100));
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-36 text-xs flex-none text-[#444141] font-semibold">{pv.name}</div>
                <div className="flex-1 bg-[#eae7e7] h-4 relative">
                  <div
                    className="h-full bg-[#ec3013] transition-all"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <div className="w-9 text-right text-xs font-extrabold flex-none">
                  {pv.volume}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
