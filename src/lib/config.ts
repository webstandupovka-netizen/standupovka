// lib/config.ts
// Centralized configuration for environment variables and URLs

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin;
  }
  
  // Server-side: use environment variables
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Fallback for development
  return 'http://localhost:3000';
};

export const config = {
  baseUrl: getBaseUrl(),
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  maib: {
    projectId: process.env.MAIB_PROJECT_ID || '',
    projectSecret: process.env.MAIB_PROJECT_SECRET || '',
    signatureKey: process.env.MAIB_SIGNATURE_KEY || '',
  },
  proxy: {
    url: (process.env.FIXIE_URL || '').trim(),
    enabled: process.env.NODE_ENV === 'production' && !!process.env.FIXIE_URL?.trim(),
  },
  adminEmail: process.env.ADMIN_EMAIL || 'admin@standupovka.md',
};