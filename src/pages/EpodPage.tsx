import React, { useState, useEffect } from 'react';
import { EpodGalleryCard } from '../components/dashboard/EpodGalleryCard';
import { cargoService } from '../services/cargoService';
import { PodItem } from '../types/cargo';

export const EpodPage: React.FC = () => {
  const [podItems, setPodItems] = useState<PodItem[]>([]);

  useEffect(() => {
    cargoService.getPodItems().then(setPodItems);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-heading font-extrabold mb-1">Galeri Bukti Penerimaan (e-POD)</h1>
        <div className="text-xs text-[#605d5d]">Arsip foto serah terima barang, dokumen fisik ttd penerima, dan unduhan file PDF pendukung.</div>
      </div>

      <EpodGalleryCard podItems={podItems} />
    </div>
  );
};
