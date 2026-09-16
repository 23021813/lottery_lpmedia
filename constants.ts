
export const REAL_ESTATE_AGENCIES: string[] = [
  "Đất xanh Bắc Trung Bộ",
  "Cenland Bắc Trung Bộ", 
  "Bhomes",
  "Tân Long",
  "Fivestar",
  "Hoàng Huy NT",
  "Âu Lạc Land",
  "City Homes",
  "Xứ Nghệ homes",
  "SVLand",
  "RealLand",
  "Aura Realty",
  "Titan Luxury",
  "MT group",
  "New Sky Land",
  "Fuji Land",
  "Haka Holding",
  "Phú Lâm",
  "GC Land"
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
