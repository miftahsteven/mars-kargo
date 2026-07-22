import React, { useState, useEffect } from 'react';
import { BillingLpjCard } from '../components/dashboard/BillingLpjCard';
import { cargoService } from '../services/cargoService';
import { InvoiceItem, ShipmentItem } from '../types/cargo';

export const BillingLpjPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);

  useEffect(() => {
    cargoService.getInvoices().then(setInvoices);
    cargoService.getShipments().then(setShipments);
  }, []);

  const handleExportLpj = () => {
    cargoService.exportLpjCsv(shipments);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-heading font-extrabold mb-1">Keuangan &amp; Laporan LPJ</h1>
        <div className="text-xs text-[#605d5d]">Informasi invoice B2B, status pembayaran, dan ekspor laporan pertanggungjawaban kegiatan.</div>
      </div>

      <BillingLpjCard invoices={invoices} onExportLpj={handleExportLpj} />
    </div>
  );
};
