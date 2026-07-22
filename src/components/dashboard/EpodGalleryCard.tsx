import React from 'react';
import { FolderDown } from 'lucide-react';
import { PodItem } from '../../types/cargo';

interface EpodGalleryCardProps {
  podItems: PodItem[];
  onBulkExport?: () => void;
}

export const EpodGalleryCard: React.FC<EpodGalleryCardProps> = ({ podItems, onBulkExport }) => {
  const handleDownload = (pod: PodItem, type: string) => {
    if (!type) return;
    alert(`Mengunduh ${type.toUpperCase()} untuk resi ${pod.resi}`);
  };

  return (
    <div className="card shadow-sm gap-4 p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="card-kicker">Bukti Penerimaan (e-POD)</div>
          <h3 className="text-xl font-heading font-extrabold m-0">Galeri Foto &amp; Tanda Tangan Digital</h3>
        </div>

        <button
          className="btn btn-secondary text-xs"
          onClick={onBulkExport || (() => alert('Mengunduh semua file e-POD (.ZIP)...'))}
        >
          <FolderDown className="w-4 h-4" />
          Unduh Semua (ZIP)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {podItems.map((pod, idx) => (
          <div key={idx} className="flex flex-col gap-1.5 bg-white p-2 border border-[#201e1d]/15">
            <div
              className="w-full aspect-[4/3] bg-cover bg-center filter grayscale contrast-105"
              style={{ backgroundImage: `url(${pod.photoUrl})` }}
            />
            <div className="text-xs font-bold font-heading">{pod.resi}</div>
            <div className="text-[11px] text-[#605d5d]">
              {pod.lokasi} · {pod.tanggal}
            </div>
            <select
              className="input text-[11px] py-1 px-2 cursor-pointer mt-1"
              onChange={(e) => handleDownload(pod, e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Pilih unduhan…</option>
              <option value="foto">Unduh Foto (JPG)</option>
              <option value="ttd">Unduh Tanda Tangan (PNG)</option>
              <option value="pdf">Unduh Laporan (PDF)</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};
