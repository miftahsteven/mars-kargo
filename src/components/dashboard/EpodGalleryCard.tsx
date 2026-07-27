import React, { useState, useEffect } from 'react';
import { FolderDown, Eye, X, Download } from 'lucide-react';
import { PodItem } from '../../types/cargo';
import { cargoService } from '../../services/cargoService';

interface EpodGalleryCardProps {
  podItems?: PodItem[];
  officerId?: number | string;
  limit?: number;
  order?: string;
  onBulkExport?: () => void;
}

export const EpodGalleryCard: React.FC<EpodGalleryCardProps> = ({
  podItems: propsPodItems,
  officerId,
  limit = 10,
  order = 'desc',
  onBulkExport,
}) => {
  const [data, setData] = useState<PodItem[]>(propsPodItems || []);
  const [isLoading, setIsLoading] = useState<boolean>(!propsPodItems || propsPodItems.length === 0);
  const [previewPod, setPreviewPod] = useState<PodItem | null>(null);

  useEffect(() => {
    if (propsPodItems && propsPodItems.length > 0) {
      setData(propsPodItems);
      setIsLoading(false);
      return;
    }

    const fetchEpodGallery = async () => {
      setIsLoading(true);
      const res = await cargoService.getPodItems({
        officer_id: officerId,
        limit,
        order,
      });
      setData(res);
      setIsLoading(false);
    };

    fetchEpodGallery();
  }, [propsPodItems, officerId, limit, order]);

  const handleDownload = (pod: PodItem, type: string) => {
    if (!type) return;
    const imgUrl = pod.image_url || pod.photoUrl;

    if (type === 'foto') {
      const link = document.createElement('a');
      link.href = imgUrl;
      link.target = '_blank';
      link.download = `ePOD_${pod.resi}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Mengunduh ${type.toUpperCase()} untuk resi ${pod.resi}`);
    }
  };

  if (isLoading && data.length === 0) {
    return (
      <div className="card shadow-sm p-4 h-[220px] flex items-center justify-center text-xs text-[#605d5d] font-semibold">
        Memuat galeri e-POD...
      </div>
    );
  }

  return (
    <div className="card shadow-sm gap-4 p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="card-kicker">Bukti Penerimaan (e-POD)</div>
          <h3 className="text-xl font-heading font-extrabold m-0 flex items-center gap-2">
            Galeri Foto &amp; Dokumen Digital
            <span className="text-xs bg-[#201e1d]/10 text-[#201e1d] px-2 py-0.5 font-bold rounded-full">
              {data.length} Terbaru
            </span>
          </h3>
        </div>

        <button
          className="btn btn-secondary text-xs"
          onClick={onBulkExport || (() => alert('Mengunduh semua 10 file e-POD (.ZIP)...'))}
        >
          <FolderDown className="w-4 h-4" />
          Unduh Semua (ZIP)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {data.map((pod, idx) => {
          const imgUrl = pod.image_url || pod.photoUrl;
          return (
            <div
              key={idx}
              className="flex flex-col gap-2 bg-white p-2 border border-[#201e1d]/15 shadow-xs hover:border-[#ec3013] transition-all group"
            >
              {/* Image Preview Box */}
              <div
                className="w-full aspect-[4/3] relative cursor-pointer overflow-hidden border border-black/5 bg-[#eae7e7]"
                onClick={() => setPreviewPod(pod)}
              >
                <img
                  src={imgUrl}
                  alt={pod.resi}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold z-10">
                  <Eye className="w-4 h-4" />
                  <span>Lihat Foto</span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="text-xs font-bold font-heading text-[#201e1d] truncate" title={pod.resi}>
                  {pod.resi}
                </div>
                <div className="text-[11px] text-[#605d5d] line-clamp-2 leading-snug font-medium" title={pod.lokasi}>
                  {pod.lokasi}
                </div>
                <div className="text-[10px] text-[#7d7979] font-semibold mt-0.5">
                  {pod.tanggal}
                </div>
              </div>

              <select
                className="input text-[11px] py-1 px-2 cursor-pointer mt-auto bg-[#eae7e7]/50 border-[#201e1d]/20"
                onChange={(e) => {
                  handleDownload(pod, e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>Pilih unduhan…</option>
                <option value="foto">Unduh Foto Original</option>
                <option value="ttd">Unduh Tanda Tangan (PNG)</option>
                <option value="pdf">Unduh Laporan POD (PDF)</option>
              </select>
            </div>
          );
        })}
      </div>

      {/* Modal Preview Image */}
      {previewPod && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full border-2 border-[#201e1d] shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-[#2d2b2b] text-white p-3.5 flex items-center justify-between">
              <div>
                <div className="font-heading font-extrabold text-base">Bukti Penerimaan: {previewPod.resi}</div>
                <div className="text-xs text-white/70">{previewPod.lokasi} · {previewPod.tanggal}</div>
              </div>
              <button
                className="p-1 hover:bg-white/20 text-white"
                onClick={() => setPreviewPod(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black/90 flex justify-center items-center max-h-[70vh] overflow-hidden">
              <img
                src={previewPod.image_url || previewPod.photoUrl}
                alt={previewPod.resi}
                className="max-h-[65vh] w-auto object-contain border border-white/20 shadow-lg"
              />
            </div>

            <div className="p-3.5 bg-[#f8f4f4] border-t border-[#201e1d]/20 flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-[#605d5d]">
                Penerima: <strong className="text-[#201e1d]">{previewPod.penerima || previewPod.lokasi}</strong>
              </div>

              <div className="flex gap-2">
                <a
                  href={previewPod.image_url || previewPod.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={`ePOD_${previewPod.resi}.jpg`}
                  className="btn btn-primary text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Foto High-Res
                </a>
                <button
                  className="btn btn-secondary text-xs"
                  onClick={() => setPreviewPod(null)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
