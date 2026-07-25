import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { IslandData } from '../../types/cargo';
import { cargoService } from '../../services/cargoService';

interface GeoDrillDownProps {
  islands?: IslandData[];
  officerId?: number | string;
}

export const GeoDrillDown: React.FC<GeoDrillDownProps> = ({ islands: propsIslands, officerId }) => {
  const [data, setData] = useState<IslandData[]>(propsIslands || []);
  const [isLoading, setIsLoading] = useState<boolean>(!propsIslands || propsIslands.length === 0);
  const [selectedIslandId, setSelectedIslandId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  useEffect(() => {
    if (propsIslands && propsIslands.length > 0) {
      setData(propsIslands);
      setIsLoading(false);
      return;
    }

    const fetchWilayahData = async () => {
      setIsLoading(true);
      const res = await cargoService.getIslandsData({ officer_id: officerId });
      setData(res);
      setIsLoading(false);
    };

    fetchWilayahData();
  }, [propsIslands, officerId]);

  const selectedIsland = data.find((i) => i.id === selectedIslandId) || null;
  const totalVolume = data.reduce((acc, curr) => acc + curr.volume, 0);
  const maxIslandVol = Math.max(...data.map((i) => i.volume), 1);

  const maxProvVol = selectedIsland
    ? Math.max(...selectedIsland.provinces.map((p) => p.volume), 1)
    : 1;

  if (isLoading && data.length === 0) {
    return (
      <div className="card shadow-sm p-4 h-[300px] flex items-center justify-center text-xs text-[#605d5d] font-semibold">
        Memuat data pengiriman per wilayah...
      </div>
    );
  }

  return (
    <div className="card shadow-sm gap-4 p-4 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="card-kicker">Distribusi Wilayah</div>
          <h3 className="text-xl font-heading font-extrabold m-0">
            {selectedIsland
              ? `${selectedIsland.name} — Rincian Kota (${selectedIsland.provinces.length} Kota)`
              : 'Volume per Pulau / Wilayah'}
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
        /* Island Bar Chart with Horizontal Scroll */
        <div className="w-full overflow-x-auto pb-3 pt-2 scrollbar-thin">
          <div className="flex items-end gap-5 h-[235px] pt-14 min-w-max px-2">
            {data.map((isl) => {
              const pct = totalVolume > 0 ? ((isl.volume / totalVolume) * 100).toFixed(1) : '0';
              const barHeight = Math.max(10, Math.round((isl.volume / maxIslandVol) * 160));
              const isHovered = hoverId === isl.id;

              return (
                <div
                  key={isl.id}
                  onClick={() => setSelectedIslandId(isl.id)}
                  onMouseEnter={() => setHoverId(isl.id)}
                  onMouseLeave={() => setHoverId(null)}
                  className="flex-none w-[64px] flex flex-col items-center gap-2 cursor-pointer relative group"
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-7 bg-[#2d2b2b] text-white px-2 py-1 text-[11px] font-bold whitespace-nowrap z-10 shadow-md">
                      {pct}% ({isl.volume.toLocaleString('id-ID')} pengiriman)
                    </div>
                  )}
                  <div className="text-[11px] font-bold whitespace-nowrap text-center text-[#201e1d]">
                    {isl.volume.toLocaleString('id-ID')}{' '}
                    <span className="text-[#7d7979] font-normal text-[10px]">({pct}%)</span>
                  </div>

                  {/* Bar */}
                  <div
                    className="w-[36px] transition-colors bg-[#bab6b6] group-hover:bg-[#ec3013]"
                    style={{ height: `${barHeight}px` }}
                  />

                  <div
                    className="text-[11px] text-center text-[#605d5d] leading-tight font-semibold truncate w-full"
                    title={isl.name}
                  >
                    {isl.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* City / Region Breakdown List */
        <div className="flex flex-col gap-2.5 pt-1 max-h-[340px] overflow-y-auto pr-1.5 scrollbar-thin">
          {selectedIsland.provinces.length === 0 ? (
            <div className="text-xs text-[#605d5d] italic py-4">
              Tidak ada data kota untuk wilayah ini.
            </div>
          ) : (
            selectedIsland.provinces.map((pv, idx) => {
              const widthPct = Math.max(2, Math.round((pv.volume / maxProvVol) * 100));
              return (
                <div key={idx} className="flex items-center gap-3 hover:bg-[#eae7e7]/60 p-1 transition-colors">
                  <div className="w-40 sm:w-52 text-xs flex-none text-[#444141] font-semibold truncate" title={pv.name}>
                    {pv.name}
                  </div>
                  <div className="flex-1 bg-[#eae7e7] h-4 relative">
                    <div
                      className="h-full bg-[#ec3013] transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-xs font-extrabold flex-none">
                    {pv.volume.toLocaleString('id-ID')}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
