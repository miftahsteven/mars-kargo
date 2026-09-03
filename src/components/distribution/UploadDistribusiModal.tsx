import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Database,
  Layers,
  Sparkles,
  Info,
  ArrowRight,
} from 'lucide-react';
import { distribusiRealService } from '../../services/distribusiRealService';

interface UploadDistribusiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadDistribusiModal: React.FC<UploadDistribusiModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'replace' | 'upsert'>('replace');
  const [isUploading, setIsUploading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validExts = ['.xlsx', '.xls'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validExts.includes(fileExt)) {
        setErrorMsg('Format file tidak didukung. Harap upload file Excel dengan format .xlsx atau .xls.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validExts = ['.xlsx', '.xls'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validExts.includes(fileExt)) {
        setErrorMsg('Format file tidak didukung. Harap upload file Excel dengan format .xlsx atau .xls.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleStartUpload = async () => {
    if (!selectedFile) {
      setErrorMsg('Silakan pilih file Excel terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setProgressPercent(15);
    setStatusText('Mengunggah file ke backend MarsCargo...');
    setErrorMsg(null);

    try {
      // Simulate stepped progress while backend processes 24k records
      const progressTimer = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev < 65) {
            return prev + 15;
          }
          if (prev < 90) {
            setStatusText('Memvalidasi & menyimpan data ke PostgreSQL (marskdb)...');
            return prev + 5;
          }
          return prev;
        });
      }, 700);

      const response = await distribusiRealService.uploadExcel(
        selectedFile,
        uploadMode,
        (percent) => {
          if (percent > 20 && percent < 70) {
            setProgressPercent(percent);
          }
        }
      );

      clearInterval(progressTimer);
      setProgressPercent(100);
      setStatusText('Penyimpanan ke database selesai!');
      setSuccessData(response.data);
    } catch (err: any) {
      console.error('[UploadDistribusiModal] Upload failed:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Terjadi kesalahan saat memproses data Excel di server.';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSuccessData(null);
    setErrorMsg(null);
    setProgressPercent(0);
    setStatusText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCompleteAndClose = () => {
    handleReset();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#201e1d] shadow-2xl max-w-xl w-full flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#2d2b2b] text-white p-4 flex items-center justify-between border-b-2 border-[#ec3013]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase bg-[#ec3013] text-white">
                API UPLOADER · DATABASE POSTGRESQL
              </span>
              <span className="text-[11px] text-[#9ca3af] flex items-center gap-1 font-semibold">
                <Database className="w-3 h-3 text-[#f59e0b]" />
                marskdb
              </span>
            </div>
            <h2 className="text-lg font-heading font-extrabold text-white m-0">
              Upload Rekap Distribusi Real
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-none transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {/* Success Dialog View */}
          {successData ? (
            <div className="flex flex-col items-center text-center p-4 bg-[#f0fdf4] border border-[#bbf7d0]">
              <div className="w-14 h-14 rounded-full bg-[#16a34a]/10 text-[#16a34a] flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-heading font-extrabold text-[#15803d] m-0">
                Data Distribusi Berhasil Diperbarui!
              </h3>
              <p className="text-xs text-[#605d5d] mt-1 max-w-md">
                File Excel berhasil diparsing dan disimpan ke database PostgreSQL. Seluruh grafik, tabel, dan indikator KPI telah disinkronkan.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mt-4 text-left">
                <div className="bg-white p-2.5 border border-black/10">
                  <span className="text-[10px] text-[#605d5d] uppercase font-bold block">Total Resi</span>
                  <span className="text-base font-black font-heading text-[#201e1d]">
                    {successData.totalProcessed?.toLocaleString('id-ID') || '24.609'}
                  </span>
                </div>
                <div className="bg-white p-2.5 border border-black/10">
                  <span className="text-[10px] text-[#605d5d] uppercase font-bold block">Tersimpan</span>
                  <span className="text-base font-black font-heading text-[#16a34a]">
                    {successData.insertedCount?.toLocaleString('id-ID')} resi
                  </span>
                </div>
                <div className="bg-white p-2.5 border border-black/10">
                  <span className="text-[10px] text-[#605d5d] uppercase font-bold block">Cakupan</span>
                  <span className="text-base font-black font-heading text-[#201e1d]">
                    {successData.provincesCount || 38} Provinsi
                  </span>
                </div>
                <div className="bg-white p-2.5 border border-black/10">
                  <span className="text-[10px] text-[#605d5d] uppercase font-bold block">Total Volume</span>
                  <span className="text-base font-black font-heading text-[#ec3013]">
                    {successData.totalVolumeKoli?.toLocaleString('id-ID')} koli
                  </span>
                </div>
              </div>

              <div className="mt-5 flex gap-2.5">
                <button
                  onClick={handleCompleteAndClose}
                  className="btn btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Lihat Hasil di Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Notice / Guide */}
              <div className="p-3 bg-[#f8f6f6] border-l-4 border-[#201e1d] flex items-start gap-2.5 text-xs text-[#605d5d]">
                <Info className="w-4 h-4 text-[#ec3013] flex-none mt-0.5" />
                <div>
                  <strong className="text-[#201e1d]">Format Excel Rekap Pengiriman:</strong>
                  <p className="mt-0.5 m-0 leading-relaxed text-[11px]">
                    Sistem membaca kolom <strong>NO RESI, PROVINSI, KAB/KOTA, KECAMATAN, KODE POS, PENERIMA, NPSN, KOLI, dll.</strong> sesuai template rekap harian MarsCargo.
                  </p>
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  selectedFile
                    ? 'border-[#16a34a] bg-[#f0fdf4]'
                    : 'border-[#201e1d]/30 hover:border-[#ec3013] hover:bg-[#fff2ef]/40 bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#16a34a]/15 text-[#16a34a] flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-bold font-heading text-[#201e1d] block">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-[#605d5d]">
                        Ukuran: {formatFileSize(selectedFile.size)} · Siap diunggah
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="text-[11px] text-[#ec3013] hover:underline font-bold mt-1"
                    >
                      Ganti File
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#ec3013]/10 text-[#ec3013] flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-bold font-heading text-[#201e1d] block">
                        Tarik & Lepas File Excel di Sini
                      </span>
                      <span className="text-xs text-[#605d5d]">
                        atau <strong className="text-[#ec3013] underline">Klik untuk memilih file</strong> (.xlsx / .xls)
                      </span>
                    </div>
                    <span className="text-[10px] text-[#9ca3af] font-semibold">
                      Maksimal ukuran file 100 MB (~100.000 baris data)
                    </span>
                  </>
                )}
              </div>

              {/* Upload Mode Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#201e1d] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#ec3013]" />
                  Metode Pembaruan Database:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`p-3 border cursor-pointer flex items-start gap-2.5 transition-all ${
                      uploadMode === 'replace'
                        ? 'border-[#ec3013] bg-[#fff2ef] ring-1 ring-[#ec3013]'
                        : 'border-black/15 bg-white hover:bg-[#f8f6f6]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="uploadMode"
                      value="replace"
                      checked={uploadMode === 'replace'}
                      onChange={() => setUploadMode('replace')}
                      className="mt-0.5 text-[#ec3013] focus:ring-[#ec3013]"
                    />
                    <div>
                      <strong className="text-xs text-[#201e1d] block">
                        Ganti Seluruh Data (Replace)
                      </strong>
                      <span className="text-[10px] text-[#605d5d] leading-tight block mt-0.5">
                        Menghapus data sebelumnya & mengisi ulang dari file excel (Direkomendasikan untuk rekap penuh).
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3 border cursor-pointer flex items-start gap-2.5 transition-all ${
                      uploadMode === 'upsert'
                        ? 'border-[#ec3013] bg-[#fff2ef] ring-1 ring-[#ec3013]'
                        : 'border-black/15 bg-white hover:bg-[#f8f6f6]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="uploadMode"
                      value="upsert"
                      checked={uploadMode === 'upsert'}
                      onChange={() => setUploadMode('upsert')}
                      className="mt-0.5 text-[#ec3013] focus:ring-[#ec3013]"
                    />
                    <div>
                      <strong className="text-xs text-[#201e1d] block">
                        Perbarui & Tambah (Upsert)
                      </strong>
                      <span className="text-[10px] text-[#605d5d] leading-tight block mt-0.5">
                        Menambahkan resi baru & mempertahankan data yang sudah ada di database.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-none mt-0.5" />
                  <div>
                    <strong>Gagal:</strong> {errorMsg}
                  </div>
                </div>
              )}

              {/* Progress State */}
              {isUploading && (
                <div className="flex flex-col gap-2 p-3 bg-[#f8f6f6] border border-black/10">
                  <div className="flex items-center justify-between text-xs font-bold text-[#201e1d]">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ec3013]" />
                      {statusText || 'Sedang memproses file...'}
                    </span>
                    <span className="text-[#ec3013] font-black">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/10 overflow-hidden">
                    <div
                      className="h-full bg-[#ec3013] transition-all duration-300 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!successData && (
          <div className="p-4 bg-[#f4f2f2] border-t border-black/10 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="btn btn-secondary text-xs px-4 py-2 border border-black/20"
            >
              Batal
            </button>

            <button
              onClick={handleStartUpload}
              disabled={!selectedFile || isUploading}
              className={`btn btn-primary text-xs px-5 py-2 flex items-center gap-2 ${
                !selectedFile || isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses Data...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Mulai Upload & Simpan</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
