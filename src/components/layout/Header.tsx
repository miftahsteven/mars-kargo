import React, { useState } from 'react';
import { Search, Radar, Bell, X, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cargoService } from '../../services/cargoService';
import { TrackingSearchResult } from '../../types/cargo';

export const Header: React.FC = () => {
  const { user, logout, toggleCustomerType } = useAuth();
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResults, setTrackingResults] = useState<TrackingSearchResult[] | null>(null);

  const handleTrackingSubmit = async () => {
    if (!trackingInput.trim()) return;
    const results = await cargoService.trackResi(trackingInput);
    setTrackingResults(results);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTrackingSubmit();
    }
  };

  return (
    <>
      <header className="flex items-center gap-4 px-7 py-3.5 border-b-2 border-[#201e1d]/25 bg-[#f3f2f2] sticky top-0 z-10">
        {/* Search Bar */}
        <div className="flex-1 relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d7979]" />
          <input
            className="input pl-9 text-xs sm:text-sm"
            placeholder="Lacak banyak resi, pisahkan dengan koma…"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button className="btn btn-primary text-xs sm:text-sm" onClick={handleTrackingSubmit}>
          <Radar className="w-4 h-4" />
          Lacak Sekarang
        </button>

        <div className="flex-1"></div>

        {/* Customer Type Switcher (Gov vs Private) */}
        <button
          onClick={toggleCustomerType}
          title="Klik untuk beralih mode instansi (Pemerintah vs Swasta)"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white border border-[#201e1d]/20 hover:border-[#ec3013] text-[#201e1d]"
        >
          <RefreshCw className="w-3 h-3 text-[#ec3013]" />
          <span>{user?.customerType === 'government' ? 'Pemerintah (Non-Tarif)' : 'Swasta (B2B Commercial)'}</span>
        </button>

        {/* Bell Notification */}
        <button className="btn btn-icon btn-secondary relative" title="Notifikasi Kendala & Status">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ec3013] rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ec3013] rounded-full" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l-2 border-[#201e1d]/20">
          <div className="w-8 h-8 bg-[#fff2ef] text-[#7c1405] flex items-center justify-center font-heading font-extrabold text-xs border border-[#ec3013]/30">
            {user?.avatar || 'PB'}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold leading-tight">{user?.name || 'Pusat Bahasa'}</div>
            <div className="text-[11px] text-[#7d7979]">{user?.role || 'Admin Pengiriman'}</div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-[#7d7979] hover:text-[#ec3013] transition-colors ml-1"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Quick Tracking Results Drawer */}
      {trackingResults && (
        <div className="mx-7 mt-4 p-4 bg-[#2d2b2b] text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="font-heading font-extrabold text-sm tracking-wider">HASIL PELACAKAN CEPAT</div>
            <button
              className="btn btn-ghost text-white hover:bg-white/10"
              onClick={() => setTrackingResults(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {trackingResults.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 bg-white/10 text-xs font-mono"
              >
                <span className="font-heading font-extrabold text-sm tracking-wide text-[#ff9783]">
                  {r.resi}
                </span>
                <span className="flex-1 text-white/70">{r.lokasi}</span>
                <span
                  className="tag"
                  style={{ backgroundColor: r.tagBg, color: r.tagColor }}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
