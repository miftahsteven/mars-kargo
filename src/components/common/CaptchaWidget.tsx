import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface CaptchaWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpired?: () => void;
  className?: string;
}

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark';
          size?: 'normal' | 'compact';
        }
      ) => number;
      reset: (opt_widget_id?: number) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

export const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({
  siteKey,
  onVerify,
  onExpired,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isGrecaptchaLoaded, setIsGrecaptchaLoaded] = useState(false);
  const [grecaptchaError, setGrecaptchaError] = useState(false);

  // Fallback state if Google script is unavailable or domain mismatch on localhost
  const [fallbackCode, setFallbackCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');
  const [isVerifyingFallback, setIsVerifyingFallback] = useState(false);
  const [fallbackVerified, setFallbackVerified] = useState(false);

  const generateFallbackCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFallbackCode(code);
    setUserInputCode('');
    setFallbackVerified(false);
  };

  useEffect(() => {
    generateFallbackCaptcha();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const renderRecaptcha = () => {
      if (!containerRef.current || !window.grecaptcha || widgetIdRef.current !== null) return;

      try {
        const id = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          size: 'normal',
          callback: (token: string) => {
            if (isMounted) {
              setIsVerified(true);
              onVerify(token);
            }
          },
          'expired-callback': () => {
            if (isMounted) {
              setIsVerified(false);
              onExpired?.();
            }
          },
          'error-callback': () => {
            if (isMounted) {
              setGrecaptchaError(true);
            }
          },
        });
        widgetIdRef.current = id;
        setIsGrecaptchaLoaded(true);
      } catch (err) {
        console.warn('Google reCAPTCHA render error, using Mars Cargo fallback captcha widget:', err);
        if (isMounted) {
          setGrecaptchaError(true);
        }
      }
    };

    // Check if script already loaded
    if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      renderRecaptcha();
    } else {
      // Load reCAPTCHA v2 script
      const scriptId = 'google-recaptcha-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          if (isMounted) setGrecaptchaError(true);
        };
        document.head.appendChild(script);
      }

      window.onRecaptchaLoad = () => {
        if (isMounted) {
          renderRecaptcha();
        }
      };

      // Fallback timer if script fails to load within 3.5s
      const timer = setTimeout(() => {
        if (isMounted && (!window.grecaptcha || widgetIdRef.current === null)) {
          setGrecaptchaError(true);
        }
      }, 3500);

      return () => {
        clearTimeout(timer);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [siteKey, onVerify, onExpired]);

  const handleVerifyFallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInputCode.trim().toUpperCase() === fallbackCode) {
      setIsVerifyingFallback(true);
      setTimeout(() => {
        setIsVerifyingFallback(false);
        setFallbackVerified(true);
        setIsVerified(true);
        onVerify(`mars_captcha_verified_${Date.now()}`);
      }, 300);
    } else {
      alert('Kode Captcha salah. Silakan coba lagi.');
      generateFallbackCaptcha();
    }
  };

  return (
    <div className={`w-full flex flex-col items-start justify-center ${className}`}>
      {!grecaptchaError ? (
        <div className="w-full flex flex-col items-center justify-center overflow-x-auto py-1">
          <div ref={containerRef} className="recaptcha-wrapper transform origin-center scale-95 sm:scale-100" />
          {!isGrecaptchaLoaded && !isVerified && (
            <div className="text-center py-2 text-xs text-[#605d5d] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ec3013]" />
              Memuat Captcha...
            </div>
          )}
        </div>
      ) : (
        /* Clean Horizontal Fallback Captcha */
        <div className="w-full">
          {!fallbackVerified ? (
            <form onSubmit={handleVerifyFallback} className="flex items-center gap-2 w-full bg-white p-2 border border-[#201e1d]/30">
              <div className="flex items-center gap-1.5 bg-[#201e1d] px-2 py-1 text-white flex-none">
                <span className="font-mono text-xs tracking-widest font-bold text-[#ff9783] select-none">
                  {fallbackCode}
                </span>
                <button
                  type="button"
                  onClick={generateFallbackCaptcha}
                  className="p-0.5 text-white/70 hover:text-white transition-colors"
                  title="Acak Ulang"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              <input
                type="text"
                required
                maxLength={5}
                placeholder="Ketik kode"
                value={userInputCode}
                onChange={(e) => setUserInputCode(e.target.value.toUpperCase())}
                className="flex-1 min-w-0 px-2 py-1 text-xs font-mono font-bold uppercase border border-[#201e1d]/20 focus:border-[#ec3013] focus:outline-none"
              />

              <button
                type="submit"
                disabled={isVerifyingFallback || userInputCode.length < 5}
                className="px-3 py-1 bg-[#ec3013] text-white text-xs font-bold hover:bg-[#c9240c] transition-colors disabled:opacity-50 flex-none"
              >
                {isVerifyingFallback ? 'Cek...' : 'Verifikasi'}
              </button>
            </form>
          ) : (
            <div className="w-full flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-400 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none" />
              <span>Captcha Berhasil Diverifikasi</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
