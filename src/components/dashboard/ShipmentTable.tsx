import React from 'react';
import { ShipmentItem } from '../../types/cargo';
import { useAuth } from '../../context/AuthContext';

interface ShipmentTableProps {
  shipments: ShipmentItem[];
  selectedProject: string;
  onSelectShipment: (resi: string) => void;
}

export const ShipmentTable: React.FC<ShipmentTableProps> = ({
  shipments,
  selectedProject,
  onSelectShipment,
}) => {
  const { user } = useAuth();
  const isGovernment = user?.customerType === 'government';

  return (
    <div className="card shadow-sm gap-3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="card-kicker">Detail Pengiriman</div>
          <h3 className="text-xl font-heading font-extrabold m-0">
            Riwayat Terbaru — {selectedProject}
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>No. Resi</th>
              <th>Tgl Kirim</th>
              <th>Tujuan</th>
              <th>Berat/Vol</th>
              <th>Tarif Kontrak</th>
              <th>Penerima</th>
              <th>Waktu Diterima</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((row) => (
              <tr
                key={row.resi}
                className="cursor-pointer hover:bg-[#201e1d]/5 transition-colors"
                onClick={() => onSelectShipment(row.resi)}
              >
                <td>
                  <div
                    className="w-9 h-9 bg-cover bg-center border border-black/10"
                    style={{ backgroundImage: `url(${row.photoUrl})` }}
                  />
                </td>
                <td className="font-bold font-heading text-[#ec3013]">{row.resi}</td>
                <td>{row.tglKirim}</td>
                <td>{row.tujuan}</td>
                <td>{row.berat}</td>
                <td className="font-semibold">{isGovernment ? '-' : row.tarif}</td>
                <td>{row.penerima}</td>
                <td>{row.waktuTerima}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
