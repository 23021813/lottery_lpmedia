
export const REAL_ESTATE_AGENCIES: string[] = [
  "RED LAND",
  "NAM VIỆT",
  "EMG",
  "WINTON",
  "EASTERN",
  "MASTER REALTY",
  "UNI",
  "HAYHOME",
  "QT PROPERTY",
  "THIÊN PHÁT REALTY",
  "HS HOLDINGS",
  "TREND REALTY",
  "VISIONNARY",
  "VIỆT TRUNG TV",
  "BVM",
  "KHỞI MINH",
  "A&T",
  "THE GLOBAL",
  "PAVILION",
  "ART",
  "SKY REAL"
];

// Cloudflare Turnstile configuration
export const getTurnstileSiteKey = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Nếu chạy qua tunnel, local, ngrok hoặc IP thì tự động fallback test key để tránh lỗi 110200 domain mismatch
    if (
      host.includes('trycloudflare.com') ||
      host.includes('ngrok') ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      /^\d+\.\d+\.\d+\.\d+$/.test(host)
    ) {
      return '1x00000000000000000000AA';
    }
  }
  return import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
};

export const TURNSTILE_SITE_KEY = getTurnstileSiteKey();
