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
  const [totalShipments, setTotalShipments] = useState<number>(0);
  const [isLoadingShipments, setIsLoadingShipments] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);
  const [selectedShipmentResi, setSelectedShipmentResi] = useState<string | null>(null);
  const [detailedShipment, setDetailedShipment] = useState<ShipmentItem | null>(null);

  const projects = [
    'Semua Proyek',
    'Distribusi Buku Sastra 2026',
    'Pengiriman Kamus Balai Bahasa',
    'Distribusi Modul Literasi 2026',
  ];

  const fetchShipmentData = async (limitVal: number = 500) => {
    setIsLoadingShipments(true);
    try {
      const res = await cargoService.getRiwayatPengirimanAll({ limit: limitVal, order: 'DESC' });
      setShipments(res.shipments);
      setTotalShipments(res.totalData);
    } catch (err) {
      console.warn('Failed to load real shipments:', err);
    } finally {
      setIsLoadingShipments(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const islData = await cargoService.getIslandsData();
      const exData = await cargoService.getExceptions();
      const podData = await cargoService.getPodItems();
      const invData = await cargoService.getInvoices();

      setIslands(islData);
      setExceptions(exData);
      setPodItems(podData);
      setInvoices(invData);
    };

    fetchData();
    fetchShipmentData(500);
  }, []);

  // When a resi is selected, fetch single detail using cons_no parameter or use cached item
  useEffect(() => {
    if (!selectedShipmentResi) {
      setDetailedShipment(null);
      return;
    }

    const found = shipments.find((s) => s.resi === selectedShipmentResi);
    if (found) {
      setDetailedShipment(found);
    }

    // Also fetch fresh detail from API via cons_no for 100% full info
    cargoService
      .getRiwayatPengirimanAll({ cons_no: selectedShipmentResi })
      .then((res) => {
        if (res.shipments && res.shipments.length > 0) {
          setDetailedShipment(res.shipments[0]);
        }
      })
      .catch((e) => console.warn('Detail fetch error:', e));
  }, [selectedShipmentResi, shipments]);

  const filteredShipments =
    selectedProject === 'Semua Proyek'
      ? shipments
      : shipments.filter(
        (s) => s.proyek === selectedProject || s.jenisBarang === selectedProject
      );

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
            Periode: Semua Periode · Kontrak No. 042/PKS/KEMENDIKDASMEN/2026
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2 min-w-0">
          <GeoDrillDown islands={islands} />
        </div>
        <div className="lg:col-span-1 min-w-0">
          <StatusSlaCards />
        </div>
      </div>

      {/* Exception Log */}
      <ExceptionLogCard exceptions={exceptions} />

      {/* e-POD Gallery */}
      <EpodGalleryCard podItems={podItems} />

      {/* Billing & LPJ Exporter */}
      <BillingLpjCard invoices={invoices} onExportLpj={handleExportLpj} />

      {/* Shipment Table Preview with Real Data & Pagination */}
      <ShipmentTable
        shipments={filteredShipments}
        totalItems={totalShipments || filteredShipments.length}
        selectedProject={selectedProject}
        onSelectShipment={(resi) => setSelectedShipmentResi(resi)}
        isLoading={isLoadingShipments}
        limit={limit}
        onLimitChange={(newLimit) => setLimit(newLimit)}
        onRefresh={() => fetchShipmentData(500)}
      />

      {/* Shipment Detail Modal with Barcode Display */}
      <ShipmentDetailModal
        shipment={detailedShipment}
        onClose={() => setSelectedShipmentResi(null)}
      />
    </div>
  );
};

