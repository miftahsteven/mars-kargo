import React, { useState, useEffect } from 'react';
import { IndonesiaMap } from '../components/tracking/IndonesiaMap';
import { cargoService } from '../services/cargoService';
import { MapPin } from '../types/cargo';

export const TrackingPage: React.FC = () => {
  const [pins, setPins] = useState<MapPin[]>([]);

  useEffect(() => {
    cargoService.getMapPins().then(setPins);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-heading font-extrabold mb-1">Pelacakan Peta Real-Time</h1>
        <div className="text-xs text-[#605d5d]">Sebaran geografis armada &amp; status kurir pengiriman terhubung.</div>
      </div>

      <IndonesiaMap pins={pins} />
    </div>
  );
};
