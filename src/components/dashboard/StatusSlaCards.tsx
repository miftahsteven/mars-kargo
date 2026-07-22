import React, { useState } from 'react';

export const StatusSlaCards: React.FC = () => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [hoveredSla, setHoveredSla] = useState<string | null>(null);

  const statusCounts = [
    { label: 'Menunggu Pickup', count: 48, color: '#bab6b6' },
    { label: 'Dalam Transit', count: 312, color: '#ff9783' },
    { label: 'Selesai / Delivered', count: 3684, color: '#ec3013' },
    { label: 'Berkendala', count: 12, color: '#7c1405' },
  ];

  const totalStatus = statusCounts.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Status Paket Card */}
      <div className="card shadow-sm gap-3 p-4">
        <div className="card-kicker">Status Paket</div>
        <div className="flex h-5 overflow-hidden">
          {statusCounts.map((seg, idx) => {
            const pct = ((seg.count / totalStatus) * 100).toFixed(1);
            return (
              <div
                key={idx}
                className="relative cursor-pointer transition-opacity hover:opacity-80"
                style={{ width: `${pct}%`, backgroundColor: seg.color }}
                onMouseEnter={() => setHoveredStatus(seg.label)}
                onMouseLeave={() => setHoveredStatus(null)}
              >
                {hoveredStatus === seg.label && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2d2b2b] text-white px-2 py-0.5 text-[11px] font-bold whitespace-nowrap z-10">
                    {pct}%
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5 mt-1">
          {statusCounts.map((seg, idx) => {
            const pct = ((seg.count / totalStatus) * 100).toFixed(1);
            return (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 flex-none" style={{ backgroundColor: seg.color }} />
                <div className="flex-1 text-[#444141] font-semibold">{seg.label}</div>
                <div className="font-extrabold">
                  {seg.count.toLocaleString('id-ID')}{' '}
                  <span className="text-[#7d7979] font-normal">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pemenuhan SLA Card */}
      <div className="card shadow-sm gap-3 p-4">
        <div className="card-kicker">Pemenuhan SLA</div>
        <div className="flex h-5 overflow-hidden">
          <div
            className="w-[94%] bg-[#ec3013] relative cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredSla('ontime')}
            onMouseLeave={() => setHoveredSla(null)}
          >
            {hoveredSla === 'ontime' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2d2b2b] text-white px-2 py-0.5 text-[11px] font-bold whitespace-nowrap z-10">
                94% Tepat Waktu
              </div>
            )}
          </div>
          <div
            className="w-[6%] bg-[#bab6b6] relative cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredSla('late')}
            onMouseLeave={() => setHoveredSla(null)}
          >
            {hoveredSla === 'late' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2d2b2b] text-white px-2 py-0.5 text-[11px] font-bold whitespace-nowrap z-10">
                6% Terlambat
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between text-xs pt-1">
          <span>
            <strong className="font-heading font-extrabold text-[#ec3013]">94%</strong> Tepat Waktu
          </span>
          <span className="text-[#605d5d]">
            <strong className="font-heading font-extrabold text-[#201e1d]">6%</strong> Terlambat
          </span>
        </div>
      </div>
    </div>
  );
};
