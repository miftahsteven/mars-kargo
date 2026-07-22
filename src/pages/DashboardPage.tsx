import React, { useState, useEffect } from 'react';
import { StatCards } from '../components/dashboard/StatCards';
import { GeoDrillDown } from '../components/dashboard/GeoDrillDown';
import { StatusSlaCards } from '../components/dashboard/StatusSlaCards';
import { ExceptionLogCard } from '../components/dashboard/ExceptionLogCard';
import { EpodGalleryCard } from '../components/dashboard/EpodGalleryCard';
import { BillingLpjCard } from '../components/dashboard/BillingLpjCard';
import { ShipmentTable } from '../components/dashboard/ShipmentTable';
import { ShipmentDetailModal } from '../components/common/ShipmentDetailModal';

import { cargoService } from '../services/cargoService';
import { IslandData, ExceptionItem, PodItem, InvoiceItem, ShipmentItem } from '../types/cargo';

export const DashboardPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState('Semua Proyek');
  const [islands, setIslands] = useState<IslandData[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [podItems, setPodItems] = useState<PodItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [selectedShipmentResi, setSelectedShipmentResi] = useState<string | null>(null);

  const projects = [
    'Semua Proyek',
    'Distribusi Buku Sastra 2026',
    'Pengiriman Kamus Balai Bahasa',
    'Distribusi Modul Literasi 2026',
  ];

  useEffect(() => {
    const fetchData = async () => {
      const islData = await cargoService.getIslandsData();
      const exData = await cargoService.getExceptions();
      const podData = await cargoService.getPodItems();
      const invData = await cargoService.getInvoices();
      const shipData = await cargoService.getShipments();

      setIslands(islData);
      setExceptions(exData);
      setPodItems(podData);
      setInvoices(invData);
      setShipments(shipData);
    };

    fetchData();
  }, []);

  const filteredShipments =
    selectedProject === 'Semua Proyek'
      ? shipments
      : shipments.filter((s) => s.proyek === selectedProject);

  const selectedShipment =
    shipments.find((s) => s.resi === selectedShipmentResi) || null;

  const handleExportLpj = () => {
    cargoService.exportLpjCsv(filteredShipments);
  };

  return (
    <div className="flex flex-col gap-7">
      {/* Header Row: Title & Project Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold mb-1">
            Ringkasan Pengiriman
          </h1>
          <div className="text-xs text-[#605d5d]">
            Periode: 1–17 Juli 2026 · Kontrak No. 042/PKS/KEMENDIKDASMEN/2026
          </div>
        </div>

        <div className="w-full sm:w-72 flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#605d5d]">
            Filter Proyek / Kegiatan
          </label>
          <select
            className="input text-xs font-semibold cursor-pointer"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <StatCards />

      {/* Geographic Drill Down & Status / SLA Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 items-stretch">
        <GeoDrillDown islands={islands} />
        <StatusSlaCards />
      </div>

      {/* Exception Log */}
      <ExceptionLogCard exceptions={exceptions} />

      {/* e-POD Gallery */}
      <EpodGalleryCard podItems={podItems} />

      {/* Billing & LPJ Exporter */}
      <BillingLpjCard invoices={invoices} onExportLpj={handleExportLpj} />

      {/* Shipment Table Preview */}
      <ShipmentTable
        shipments={filteredShipments}
        selectedProject={selectedProject}
        onSelectShipment={(resi) => setSelectedShipmentResi(resi)}
      />

      {/* Shipment Detail Modal */}
      <ShipmentDetailModal
        shipment={selectedShipment}
        onClose={() => setSelectedShipmentResi(null)}
      />
    </div>
  );
};
