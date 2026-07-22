import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#f3f2f2] font-body text-[#201e1d]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-7 pb-16 flex flex-col gap-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
