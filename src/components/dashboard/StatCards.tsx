import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StatMetric } from '../../types/cargo';
import { cargoService } from '../../services/cargoService';

interface StatCardsProps {
  metrics?: StatMetric[];
  officerId?: number | string;
  startDate?: string;
  endDate?: string;
}

const formatDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getDefaultEndDate = (): string => {
  return formatDate(new Date());
};

const getDefaultStartDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return formatDate(date);
};

export const StatCards: React.FC<StatCardsProps> = ({
  metrics: propsMetrics,
  officerId,
  startDate,
  endDate,
}) => {
  const [items, setItems] = useState<StatMetric[]>(propsMetrics || []);
  const [isLoading, setIsLoading] = useState<boolean>(!propsMetrics);

  useEffect(() => {
    if (propsMetrics) {
      setItems(propsMetrics);
      return;
    }

    const fetchSummary = async () => {
      setIsLoading(true);
      const data = await cargoService.getSummaryMetrics({
        officer_id: officerId,
        start_date: startDate,
        end_date: endDate,
      });
      setItems(data);
      setIsLoading(false);
    };

    fetchSummary();
  }, [propsMetrics, officerId, startDate, endDate]);

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

  if (isLoading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card shadow-sm p-4 animate-pulse">
            <div className="h-3 bg-[#bab6b6] w-24 mb-2"></div>
            <div className="h-8 bg-[#bab6b6] w-16 mb-2"></div>
            <div className="h-3 bg-[#bab6b6] w-32"></div>
          </div>
        ))}
      </div>
    );
  }

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
