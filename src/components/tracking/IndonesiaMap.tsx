import React, { useEffect, useRef } from 'react';
import * as maptiler from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { MapPin } from '../../types/cargo';

interface IndonesiaMapProps {
  pins: MapPin[];
}

const MAPTILER_API_KEY = 'BSMSxOeDudgubp5q2uYq';

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ pins }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maptiler.Map | null>(null);
  const markersRef = useRef<maptiler.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Set MapTiler API Key
    maptiler.config.apiKey = MAPTILER_API_KEY;

    // Initialize MapTiler Map centered on Indonesia
    const map = new maptiler.Map({
      container: mapContainerRef.current,
      style: maptiler.MapStyle.STREETS, // or DATAVIZ.DARK / BASIC
      center: [118.0149, -2.5], // Center of Indonesia
      zoom: 4.6,
      navigationControl: 'bottom-right',
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []);

  // Sync Markers when pins update
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    pins.forEach((pin) => {
      // Default fallbacks for coordinates if missing
      const lng = pin.lng ?? (pin.resi === 'MC2607-88101' ? 106.8456 : pin.resi === 'MC2607-88245' ? 110.3705 : pin.resi === 'MC2607-88390' ? 115.2625 : pin.resi === 'MC2607-88512' ? 119.4327 : 95.3193);
      const lat = pin.lat ?? (pin.resi === 'MC2607-88101' ? -6.2088 : pin.resi === 'MC2607-88245' ? -7.7956 : pin.resi === 'MC2607-88390' ? -8.5069 : pin.resi === 'MC2607-88512' ? -5.1477 : 5.5483);

      // Create Custom Marker HTML Element
      const el = document.createElement('div');
      el.className = 'group relative cursor-pointer';
      
      const pinColor = pin.status === 'Delivered' ? '#ec3013' : pin.status === 'Dalam Transit' ? '#e15b47' : '#9b9797';
      const statusBg = pin.status === 'Delivered' ? '#f8f4f4' : pin.status === 'Dalam Transit' ? '#fff2ef' : '#ffe0da';
      const statusColor = pin.status === 'Delivered' ? '#444141' : pin.status === 'Dalam Transit' ? '#7c1405' : '#471d16';

      el.innerHTML = `
        <div style="width: 18px; height: 18px; background-color: ${pinColor}; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3); transition: transform 0.2s;" class="hover:scale-125"></div>
      `;

      // Create Popup HTML
      const popupHtml = `
        <div style="font-family: 'Archivo', sans-serif; padding: 6px; color: #201e1d;">
          <div style="font-weight: 800; font-size: 13px; color: #ec3013;">${pin.resi}</div>
          <div style="font-size: 12px; font-weight: 600; margin-top: 2px;">${pin.lokasi}</div>
          <div style="margin-top: 6px;">
            <span style="background-color: ${statusBg}; color: ${statusColor}; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 2px; display: inline-block;">
              ${pin.status}
            </span>
          </div>
        </div>
      `;

      const popup = new maptiler.Popup({ offset: 12, closeButton: false }).setHTML(popupHtml);

      const marker = new maptiler.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [pins]);

  return (
    <div className="card shadow-sm gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="card-kicker">Pelacakan Real-Time</div>
          <h3 className="text-xl font-heading font-extrabold m-0">Peta Sebaran Pengiriman (MapTiler)</h3>
        </div>
        <div className="text-xs text-[#605d5d] font-mono">API Key: BSMSxOeDudgubp5q2uYq</div>
      </div>

      {/* MapTiler Container */}
      <div className="relative h-[420px] bg-[#eae7e7] border-2 border-[#201e1d]/25 overflow-hidden shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
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
                style={{ backgroundColor: pin.status === 'Delivered' ? '#ec3013' : pin.status === 'Dalam Transit' ? '#e15b47' : '#9b9797' }}
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
