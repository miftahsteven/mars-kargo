import React from 'react';
import { NavLink } from 'react-router-dom';
import { Truck, LayoutDashboard, MapPin, AlertTriangle, Image as ImageIcon, Receipt, FileSpreadsheet, Building2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tracking', label: 'Pelacakan', icon: MapPin },
    { to: '/exceptions', label: 'Kendala', icon: AlertTriangle },
    { to: '/epod', label: 'Bukti Kirim (e-POD)', icon: ImageIcon },
    { to: '/billing', label: 'Tagihan', icon: Receipt },
    { to: '/lpj', label: 'Laporan LPJ', icon: FileSpreadsheet },
  ];

  const sidebarContent = (
    <aside className="w-[248px] h-full bg-[#2d2b2b] text-[#f3f2f2] flex flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b-2 border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#ec3013] flex items-center justify-center flex-none">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="font-heading font-extrabold text-xl tracking-tight">MarsCargo</div>
            </div>
            <div className="mt-1 text-[10px] tracking-widest uppercase text-white/45 font-semibold">
              Partner B2B Portal
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-white/70 hover:text-white p-1"
              aria-label="Tutup menu"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors border-l-4 ${
                  isActive
                    ? 'text-white bg-[#ec3013]/20 border-[#ec3013]'
                    : 'text-white/65 hover:text-white hover:bg-white/5 border-transparent'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-none" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Institution Footer */}
      <div className="p-4 border-t-2 border-white/10 bg-white/5">
        <div className="flex items-center gap-1.5 text-[11px] text-white/45 uppercase tracking-wider mb-1">
          <Building2 className="w-3 h-3 text-[#ec3013]" />
          Instansi Mitra
        </div>
        <div className="text-xs font-bold leading-snug">
          {user?.partnerInstitution || 'Pusat Pembinaan Bahasa dan Sastra'}
        </div>
        <div className="text-[11px] text-white/60 mt-0.5">
          {user?.institutionSub || 'Kemendikdasmen RI'}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <div className="hidden md:block w-[248px] flex-none sticky top-0 h-screen z-20">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar (Slide-over Drawer with Backdrop) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 max-w-xs w-full bg-[#2d2b2b] shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
