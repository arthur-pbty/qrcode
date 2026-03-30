import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QR Code Generator - Générateur de QR Codes Gratuit',
    short_name: 'QR Generator',
    description:
      'Créez, personnalisez et téléchargez des QR Codes gratuitement. Supports URL, texte, email, téléphone, SMS, WiFi. Export PNG et SVG.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7c3aed',
    orientation: 'portrait-primary',
    categories: ['utilities', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
