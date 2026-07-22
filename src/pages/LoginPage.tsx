import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ShieldCheck, Building2, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('KIKIMARS');
  const [password, setPassword] = useState('MarsJakarta');
  const [customerType, setCustomerType] = useState<'government' | 'private'>('government');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Username tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await login({ username, password, customerType });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login gagal. Periksa kembali username dan password Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 font-body bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/login-bg.png')` }}
    >
      {/* Dark overlay for contrast and atmosphere */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] z-0" />

      {/* Main Login Box */}
      <div className="relative z-10 w-full max-w-4xl bg-[#f3f2f2]/95 backdrop-blur-md border-2 border-[#201e1d]/40 grid grid-cols-1 md:grid-cols-2 shadow-2xl overflow-hidden">

        {/* Left Branding Column */}
        <div className="bg-[#2d2b2b]/90 text-white p-8 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ec3013] flex items-center justify-center flex-none shadow-md">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-2xl tracking-tight">MarsCargo</div>
                <div className="text-[10px] tracking-widest uppercase text-white/50 font-bold">
                  B2B Executive System
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4">
              <h2 className="text-2xl font-heading font-extrabold leading-tight text-[#ff9783]">
                Portal Mitra &amp; Instansi B2B
              </h2>
              <p className="text-sm text-white/70 leading-relaxed">
                Sistem Informasi Eksekutif pengiriman kargo terpadu. Dashboard ini dilindungi dan memerlukan autentikasi resmi dari server MarsCargo.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-[#ff9783] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#ec3013]" />
              Sistem Informasi Eksekutif B2B Terpadu
            </div>

            <div className="p-3 bg-white/5 border border-white/10 text-xs flex flex-col gap-1">
              <div className="text-white/45 uppercase tracking-wider text-[10px]">Instansi Mitra Terdaftar:</div>
              <div className="font-bold text-white mt-0.5">Pusat Pembinaan Bahasa dan Sastra</div>
              <div className="text-white/60 text-[11px]">Kemendikdasmen RI · Kontrak PKS 2026</div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="p-8 flex flex-col justify-center bg-[#f3f2f2]">
          <div className="mb-6">
            <h3 className="text-2xl font-heading font-extrabold text-[#201e1d] m-0">Masuk ke Portal</h3>
            <p className="text-xs text-[#605d5d] mt-1">Masukkan username &amp; password Anda untuk membuka akses dashboard.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Customer Type Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#605d5d] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#ec3013]" />
                Tipe Kemitraan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerType('government');
                    setUsername('KIKIMARS');
                    setPassword('MarsJakarta');
                  }}
                  className={`py-2 px-3 text-xs font-bold border transition-colors ${customerType === 'government'
                    ? 'bg-[#ec3013] text-white border-[#ec3013]'
                    : 'bg-[#eae9e9] text-[#201e1d] border-[#201e1d]/30 hover:border-[#ec3013]'
                    }`}
                >
                  Pemerintah (APBN)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerType('private');
                    setUsername('KIKIMARS');
                    setPassword('MarsJakarta');
                  }}
                  className={`py-2 px-3 text-xs font-bold border transition-colors ${customerType === 'private'
                    ? 'bg-[#ec3013] text-white border-[#ec3013]'
                    : 'bg-[#eae9e9] text-[#201e1d] border-[#201e1d]/30 hover:border-[#ec3013]'
                    }`}
                >
                  Swasta (Corporate)
                </button>
              </div>
            </div>

            {/* Username Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#605d5d]">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d7979]" />
                <input
                  type="text"
                  required
                  className="input pl-9 font-semibold"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="KIKIMARS"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#605d5d]">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d7979]" />
                <input
                  type="password"
                  required
                  className="input pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="MarsJakarta"
                />
              </div>
            </div>

            {/* Remember Me & Demo Hint */}
            <div className="flex items-center justify-between text-xs my-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#ec3013]"
                />
                <span className="text-[#605d5d]">Ingat saya</span>
              </label>

              {/* <span className="text-xs text-[#7d7979]">
                User: <code className="text-[#ec3013] font-bold">KIKIMARS</code> / <code className="text-[#ec3013] font-bold">MarsJakarta</code>
              </span> */}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                'Menghubungi API Auth MarsCargo...'
              ) : (
                <>
                  Masuk ke B2B Portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
