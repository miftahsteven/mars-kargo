import React, { useEffect, useRef } from 'react';
import * as maptiler from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { ExternalLink, Navigation } from 'lucide-react';

interface PackageDetailMapProps {
  latitude?: number;
  longitude?: number;
  resi: string;
  tujuan: string;
  isScannedViaApps?: boolean;
  courierName?: string;
}

const MAPTILER_API_KEY = 'BSMSxOeDudgubp5q2uYq';

export const PackageDetailMap: React.FC<PackageDetailMapProps> = ({
  latitude,
  longitude,
  resi,
  tujuan,
  isScannedViaApps,
  courierName,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maptiler.Map | null>(null);

  const lat = latitude ?? -6.2088;
  const lng = longitude ?? 106.8456;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    maptiler.config.apiKey = MAPTILER_API_KEY;

    // Initialize MapTiler interactive map centered on package location
    const map = new maptiler.Map({
      container: mapContainerRef.current,
      style: maptiler.MapStyle.STREETS,
      center: [lng, lat],
      zoom: 14,
      navigationControl: 'bottom-right',
    });

    mapRef.current = map;

    // Create Custom Red Marker Pin Element
    const el = document.createElement('div');
    el.className = 'relative flex items-center justify-center cursor-pointer group';
    el.innerHTML = `
      <div style="position: absolute; width: 30px; height: 30px; background-color: rgba(236, 48, 19, 0.35); border-radius: 50%;"></div>
      <div style="width: 22px; height: 22px; background-color: #ec3013; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.35);"></div>
    `;

    const popupHtml = `
      <div style="font-family: sans-serif; padding: 6px; color: #0F172A; max-width: 220px;">
        <div style="font-weight: 800; font-size: 13px; color: #ec3013;">${resi}</div>
        <div style="font-size: 11px; font-weight: 600; color: #334155; margin-top: 2px;">${tujuan}</div>
        ${courierName && courierName !== '-' ? `<div style="font-size: 10.5px; color: #059669; margin-top: 4px; font-weight: 700;">👤 Kurir: ${courierName}</div>` : ''}
        <div style="margin-top: 6px;">
          <span style="background-color: ${isScannedViaApps ? '#D1FAE5' : '#FEF3C7'}; color: ${isScannedViaApps ? '#065F46' : '#92400E'}; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; display: inline-block;">
            ${isScannedViaApps ? '📱 Scan Android App' : '📋 Pickup Manual'}
          </span>
        </div>
      </div>
    `;

    const popup = new maptiler.Popup({ offset: 14, closeButton: false }).setHTML(popupHtml);

    new maptiler.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    return () => {
      map.remove();
    };
  }, [lat, lng, resi, tujuan, isScannedViaApps, courierName]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-[#201e1d]/20 bg-slate-100 shadow-sm">
      {/* MapTiler Map Canvas Element */}
      <div ref={mapContainerRef} className="w-full h-56 min-h-[220px]" />

      {/* Floating Location Info Overlay */}
      <div className="absolute bottom-2 left-2 right-12 bg-slate-900/90 backdrop-blur-xs text-white p-2.5 rounded-md flex items-center justify-between text-xs z-10 shadow-md">
        <div className="truncate pr-2">
          <span className="font-extrabold block text-[11px] text-red-400 flex items-center gap-1">
            <Navigation className="w-3 h-3 shrink-0 text-red-400" />
            Posisi ({lat.toFixed(4)}, {lng.toFixed(4)})
          </span>
          <span className="text-[10.5px] text-slate-300 truncate block">{tujuan}</span>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="bg-[#ec3013] hover:bg-[#c22007] text-white px-2.5 py-1 rounded text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 shadow-xs"
        >
          <span>Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
