import React from 'react';
import { X } from 'lucide-react';
import { ShipmentItem } from '../../types/cargo';
import { useAuth } from '../../context/AuthContext';

interface ShipmentDetailModalProps {
  shipment: ShipmentItem | null;
  onClose: () => void;
}

export const ShipmentDetailModal: React.FC<ShipmentDetailModalProps> = ({
  shipment,
  onClose,
}) => {
  const { user } = useAuth();
  const isGovernment = user?.customerType === 'government';

  if (!shipment) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2d2b2b]/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#f3f2f2] border border-[#201e1d]/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#201e1d]/20 pb-3">
          <span className="font-heading font-extrabold text-xl">
            Detail Pengiriman — {shipment.resi}
          </span>
          <button
            className="btn btn-icon btn-ghost text-[#201e1d]"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sender & Recipient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="card-kicker">Pengirim</div>
            <div className="font-bold text-sm">{shipment.pengirim}</div>
            <div className="text-xs text-[#605d5d] mt-1">{shipment.alamatPengirim}</div>
            <div className="text-xs text-[#605d5d]">{shipment.teleponPengirim}</div>
          </div>
          <div>
            <div className="card-kicker">Penerima</div>
            <div className="font-bold text-sm">{shipment.penerima}</div>
            <div className="text-xs text-[#605d5d] mt-1">{shipment.alamatPenerima}</div>
            <div className="text-xs text-[#605d5d]">{shipment.teleponPenerima}</div>
          </div>
        </div>

        <div className="h-0.5 bg-[#201e1d]/20 my-1" />

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#605d5d]">No. Resi</span>
            <span className="font-bold text-[#7c1405]">{shipment.resi}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#605d5d]">Jenis Barang</span>
            <span className="font-semibold">{shipment.jenisBarang}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#605d5d]">Tipe Booking</span>
            <span className="font-semibold">{shipment.tipeBooking}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#605d5d]">Tujuan</span>
            <span className="font-semibold">{shipment.tujuan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#605d5d]">Tanggal Input</span>
            <span className="font-semibold">{shipment.tanggalInput}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#605d5d]">Tanggal Angkut</span>
            <span className="font-semibold">{shipment.tanggalAngkut}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#605d5d]">Berat/Volume</span>
            <span className="font-semibold">{shipment.berat}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#605d5d]">Tarif Kontrak</span>
            <span className="font-semibold">{isGovernment ? '-' : shipment.tarif}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#605d5d]">Waktu Diterima</span>
            <span className="font-semibold">{shipment.waktuTerima}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#605d5d]">Keterangan</span>
            <span className="font-semibold">{shipment.keterangan}</span>
          </div>
        </div>

        <div className="h-0.5 bg-[#201e1d]/20 my-1" />

        {/* Photo Proof */}
        <div>
          <div className="card-kicker mb-2">Foto Bukti Penerimaan</div>
          <div
            className="w-full max-w-xs aspect-[4/3] bg-cover bg-center border border-[#201e1d]/20"
            style={{ backgroundImage: `url(${shipment.photoUrl})` }}
          />
        </div>

        <div className="h-0.5 bg-[#201e1d]/20 my-1" />

        {/* Status Timeline */}
        <div>
          <div className="card-kicker mb-2">Daftar Status / Timeline</div>
          <table className="table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Status</th>
                <th>Lokasi</th>
              </tr>
            </thead>
            <tbody>
              {shipment.statusTimeline.map((t, idx) => (
                <tr key={idx}>
                  <td>{t.waktu}</td>
                  <td className="font-bold">{t.status}</td>
                  <td>{t.lokasi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
