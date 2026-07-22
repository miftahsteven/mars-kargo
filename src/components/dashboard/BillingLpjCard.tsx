import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { InvoiceItem } from '../../types/cargo';
import { useAuth } from '../../context/AuthContext';

interface BillingLpjCardProps {
  invoices: InvoiceItem[];
  onExportLpj: () => void;
}

export const BillingLpjCard: React.FC<BillingLpjCardProps> = ({ invoices, onExportLpj }) => {
  const { user } = useAuth();
  const isGovernment = user?.customerType === 'government';

  const billingData = isGovernment
    ? { outstanding: '-', creditLimit: '-', creditPercent: '-', creditPercentWidth: '0%' }
    : { outstanding: 'Rp 51.750.000', creditLimit: 'Rp 250.000.000', creditPercent: '21%', creditPercentWidth: '21%' };

  const displayedInvoices = isGovernment ? [] : invoices;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-4 items-stretch">
      {/* Transparansi Keuangan B2B */}
      <div className="card shadow-sm gap-4 p-4">
        <div className="card-kicker">Transparansi Keuangan B2B</div>
        <div>
          <div className="text-xs text-[#605d5d]">Tagihan Belum Dibayar</div>
          <div className="font-heading font-extrabold text-2xl text-[#7c1405] mt-0.5">
            {billingData.outstanding}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 font-semibold">
            <span className="text-[#605d5d]">Limit Kredit Terpakai</span>
            <span>{billingData.creditPercent} dari {billingData.creditLimit}</span>
          </div>
          <div className="h-2.5 bg-[#eae7e7]">
            <div
              className="h-full bg-[#ec3013] transition-all"
              style={{ width: billingData.creditPercentWidth }}
            />
          </div>
        </div>

        <button className="btn btn-primary w-full mt-auto text-xs sm:text-sm" onClick={onExportLpj}>
          <FileSpreadsheet className="w-4 h-4" />
          Ekspor Laporan LPJ (XLSX / CSV)
        </button>
      </div>

      {/* Riwayat Invoice */}
      <div className="card shadow-sm gap-3 p-4">
        <div className="card-kicker">Riwayat Invoice</div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>No. Invoice</th>
                <th>Tanggal</th>
                <th>Jumlah</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedInvoices.length > 0 ? (
                displayedInvoices.map((inv, idx) => (
                  <tr key={idx}>
                    <td className="font-bold">{inv.no}</td>
                    <td>{inv.tanggal}</td>
                    <td>{inv.jumlah}</td>
                    <td>
                      <span
                        className={`tag ${
                          inv.status === 'Lunas' ? 'tag-neutral' : 'tag-accent'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-[#7d7979] py-5">
                    {isGovernment
                      ? 'Instansi Pemerintah (APBN Non-Tarif Direct Contract) — Tagihan Dikelola Via LPJ'
                      : 'Belum ada riwayat invoice'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
