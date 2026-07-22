import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f3f2f2] font-body text-[#201e1d]">
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setMobileSidebarOpen(true)} />
        <main className="p-4 sm:p-7 pb-16 flex flex-col gap-6 sm:gap-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
