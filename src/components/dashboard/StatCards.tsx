import React from 'react';
import { Package, Truck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StatMetric } from '../../types/cargo';

interface StatCardsProps {
  metrics?: StatMetric[];
}

export const StatCards: React.FC<StatCardsProps> = ({ metrics }) => {
  const defaultMetrics: StatMetric[] = [
    { label: 'Menunggu Pickup', value: '48', sub: 'paket siap dijemput', icon: 'package', color: '#605d5d' },
    { label: 'Dalam Transit', value: '312', sub: 'sedang dikirim', icon: 'truck', color: '#dd2b0f' },
    { label: 'Selesai', value: '3.684', sub: 'terkirim bulan ini', icon: 'check-circle-2', color: '#7c1405' },
    { label: 'Berkendala', value: '12', sub: 'perlu tindak lanjut', icon: 'alert-triangle', color: '#ec3013' },
  ];

  const items = metrics || defaultMetrics;

  const renderIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'package':
        return <Package className="w-4 h-4" style={{ color }} />;
      case 'truck':
        return <Truck className="w-4 h-4" style={{ color }} />;
      case 'check-circle-2':
        return <CheckCircle2 className="w-4 h-4" style={{ color }} />;
      case 'alert-triangle':
        return <AlertTriangle className="w-4 h-4" style={{ color }} />;
      default:
        return <Package className="w-4 h-4" style={{ color }} />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((s, idx) => (
        <div
          key={idx}
          className="card shadow-sm border-t-4"
          style={{ borderTopColor: s.color }}
        >
          <div className="flex items-center justify-between">
            <div className="card-kicker" style={{ color: s.color }}>
              {s.label}
            </div>
            {renderIcon(s.icon, s.color)}
          </div>
          <div className="font-heading font-extrabold text-3xl my-1">{s.value}</div>
          <div className="card-meta">{s.sub}</div>
        </div>
      ))}
    </div>
  );
};
