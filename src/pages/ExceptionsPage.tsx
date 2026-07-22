import React, { useState, useEffect } from 'react';
import { ExceptionLogCard } from '../components/dashboard/ExceptionLogCard';
import { cargoService } from '../services/cargoService';
import { ExceptionItem } from '../types/cargo';

export const ExceptionsPage: React.FC = () => {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);

  useEffect(() => {
    cargoService.getExceptions().then(setExceptions);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-heading font-extrabold mb-1">Manajemen Kendala Pengiriman</h1>
        <div className="text-xs text-[#605d5d]">Daftar aktif paket yang memerlukan penanganan khusus, koreksi nomor hp, atau pengalihan alamat.</div>
      </div>

      <ExceptionLogCard exceptions={exceptions} />
    </div>
  );
};
