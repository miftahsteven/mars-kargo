import React from 'react';
import { X, Barcode, Copy, Check } from 'lucide-react';
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
  const [copied, setCopied] = React.useState(false);

  if (!shipment) return null;

  const barcodeImg =
    shipment.barcodeUrl ||
    (shipment.resi
      ? `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(
          shipment.resi
        )}&code=Code128&translate-esc=true`
      : '');

  const handleCopyResi = () => {
    if (shipment.resi) {
      navigator.clipboard.writeText(shipment.resi);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2d2b2b]/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#f3f2f2] border border-[#201e1d]/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4 shadow-2xl rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#201e1d]/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-xl">
              Detail Pengiriman — {shipment.resi}
            </span>
          </div>
          <button
            className="btn btn-icon btn-ghost text-[#201e1d]"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barcode Display Card */}
        <div className="bg-white p-4 border border-[#201e1d]/15 rounded-md flex flex-col items-center justify-center gap-2 text-center shadow-xs">
          <div className="flex items-center justify-between w-full text-xs font-semibold text-[#605d5d] px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Barcode className="w-4 h-4 text-[#ec3013]" />
              Barcode Pengiriman (Scan untuk Aplikasi Mobile)
            </span>
            <button
              onClick={handleCopyResi}
              className="flex items-center gap-1 text-[11px] text-[#7c1405] hover:underline font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Salin Resi
                </>
              )}
            </button>
          </div>

          {barcodeImg ? (
            <div className="p-3 bg-white rounded border border-gray-200 inline-block shadow-inner max-w-full">
              <img
                src={barcodeImg}
                alt={`Barcode ${shipment.resi}`}
                className="max-h-24 object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(
                    shipment.resi
                  )}&code=Code128`;
                }}
              />
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic py-3">Barcode tidak tersedia</div>
          )}

          <div className="text-xs font-mono font-bold tracking-widest text-[#201e1d] bg-gray-100 px-3 py-1 rounded">
            {shipment.resi}
          </div>
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
