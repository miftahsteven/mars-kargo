import React, { useState } from 'react';
import { MapPin } from '../../types/cargo';

interface IndonesiaMapProps {
  pins: MapPin[];
}

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ pins }) => {
  const [hoveredPinResi, setHoveredPinResi] = useState<string | null>(null);

  return (
    <div className="card shadow-sm gap-4 p-4">
      <div>
        <div className="card-kicker">Pelacakan Real-Time</div>
        <h3 className="text-xl font-heading font-extrabold m-0">Peta Sebaran Pengiriman</h3>
      </div>

      <div className="relative h-[360px] bg-[#f8f4f4] border-2 border-[#201e1d]/25 overflow-hidden">
        {/* Simplified Map SVG backdrop */}
        <svg viewBox="0 0 800 360" className="w-full h-full block">
          <rect width="800" height="360" fill="#f8f4f4" />
          {/* Sumatera */}
          <path
            d="M40,220 L140,180 L220,210 L300,190 L300,260 L200,280 L120,270 Z"
            fill="#d7d3d3"
            stroke="#bab6b6"
            strokeWidth="2"
          />
          {/* Jawa & Bali */}
          <path
            d="M340,150 L520,130 L620,170 L600,260 L440,280 L360,230 Z"
            fill="#d7d3d3"
            stroke="#bab6b6"
            strokeWidth="2"
          />
          {/* Kalimantan */}
          <path
            d="M560,90 L700,80 L740,140 L640,160 Z"
            fill="#d7d3d3"
            stroke="#bab6b6"
            strokeWidth="2"
          />
          {/* Sulawesi */}
          <path
            d="M600,200 L700,190 L760,240 L690,280 L610,260 Z"
            fill="#d7d3d3"
            stroke="#bab6b6"
            strokeWidth="2"
          />
        </svg>

        {/* Pins */}
        {pins.map((pin) => {
          const isHovered = hoveredPinResi === pin.resi;
          return (
            <div
              key={pin.resi}
              className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-10"
              style={{ left: pin.x, top: pin.y }}
              onMouseEnter={() => setHoveredPinResi(pin.resi)}
              onMouseLeave={() => setHoveredPinResi(null)}
            >
              <div
                className="w-3.5 h-3.5 border-2 border-white shadow-sm rounded-full animate-bounce"
                style={{ backgroundColor: pin.color }}
              />
              {isHovered && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#2d2b2b] text-white px-2.5 py-1 text-xs whitespace-nowrap font-heading font-bold shadow-lg z-20">
                  {pin.resi} · {pin.lokasi}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pin List below */}
      <div className="flex flex-col gap-2">
        {pins.map((pin) => {
          const tagBg =
            pin.status === 'Delivered'
              ? '#f8f4f4'
              : pin.status === 'Dalam Transit'
              ? '#fff2ef'
              : '#ffe0da';
          const tagColor =
            pin.status === 'Delivered'
              ? '#444141'
              : pin.status === 'Dalam Transit'
              ? '#7c1405'
              : '#471d16';

          return (
            <div
              key={pin.resi}
              className="flex items-center gap-2.5 text-xs p-2 bg-[#f8f4f4] border border-[#201e1d]/10"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-none"
                style={{ backgroundColor: pin.color }}
              />
              <span className="font-bold font-heading">{pin.resi}</span>
              <span className="flex-1 text-[#605d5d]">{pin.lokasi}</span>
              <span className="tag" style={{ backgroundColor: tagBg, color: tagColor }}>
                {pin.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
