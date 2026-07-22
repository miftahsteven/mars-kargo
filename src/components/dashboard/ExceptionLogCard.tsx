import React, { useState } from 'react';
import { AlertTriangle, Edit3, X, Check } from 'lucide-react';
import { ExceptionItem } from '../../types/cargo';

interface ExceptionLogCardProps {
  exceptions: ExceptionItem[];
  onResolve?: (resi: string, newAddress: string, newPhone: string) => void;
}

export const ExceptionLogCard: React.FC<ExceptionLogCardProps> = ({ exceptions, onResolve }) => {
  const [activeExceptionResi, setActiveExceptionResi] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggleForm = (resi: string) => {
    if (activeExceptionResi === resi) {
      setActiveExceptionResi(null);
    } else {
      setActiveExceptionResi(resi);
      setNewAddress('');
      setNewPhone('');
    }
  };

  const handleSubmit = (resi: string) => {
    if (onResolve) {
      onResolve(resi, newAddress, newPhone);
    }
    setSuccessMessage(`Update alamat & no. telp untuk resi ${resi} berhasil dikirim ke pengemudi.`);
    setActiveExceptionResi(null);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  if (!exceptions || exceptions.length === 0) return null;

  return (
    <div className="card shadow-sm gap-3.5 border-l-4 border-l-[#ec3013] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#7c1405]" />
          <h3 className="text-xl font-heading font-extrabold m-0">Kendala Aktif</h3>
          <span className="tag tag-accent font-bold">{exceptions.length} paket</span>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 flex-none" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {exceptions.map((ex) => {
          const isOpen = activeExceptionResi === ex.resi;
          return (
            <div key={ex.resi} className="border-t border-[#201e1d]/20 pt-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-extrabold text-sm">{ex.resi}</span>
                    <span className="tag tag-neutral">{ex.proyek}</span>
                  </div>
                  <div className="text-sm font-semibold text-[#201e1d]">{ex.issue}</div>
                  <div className="text-xs text-[#7d7979] mt-0.5">
                    {ex.lokasi} · {ex.since}
                  </div>
                </div>

                <div className="flex gap-2 flex-none">
                  <button
                    className="btn btn-secondary text-xs"
                    onClick={() => toggleForm(ex.resi)}
                  >
                    {isOpen ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        Tutup Form
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        Input Alamat/No. Baru
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Inline Form */}
              {isOpen && (
                <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 mt-3 p-3 bg-[#f8f4f4] border border-[#201e1d]/20">
                  <div className="flex-1 min-w-[200px] flex flex-col gap-1">
                    <label className="text-xs text-[#605d5d] font-semibold">Alamat Alternatif</label>
                    <input
                      className="input text-xs"
                      placeholder="Masukkan alamat pengganti…"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                    />
                  </div>

                  <div className="w-full sm:w-[180px] flex flex-col gap-1">
                    <label className="text-xs text-[#605d5d] font-semibold">No. Telepon Baru</label>
                    <input
                      className="input text-xs"
                      placeholder="08…"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                  </div>

                  <div className="flex items-end w-full sm:w-auto">
                    <button
                      className="btn btn-primary text-xs w-full sm:w-auto"
                      onClick={() => handleSubmit(ex.resi)}
                    >
                      Simpan &amp; Kirim Ulang
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
