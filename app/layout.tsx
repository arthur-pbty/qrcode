import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://qrcode-generator.fr";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Générateur de QR Code Gratuit en Ligne - Personnalisé et Haute Qualité",
    template: "%s | QR Code Generator",
  },
  description:
    "Créez des QR Codes personnalisés gratuitement : URL, texte, email, téléphone, SMS, WiFi. Personnalisez les couleurs, la forme et le style. Téléchargez en PNG ou SVG haute résolution. Aucune inscription requise.",
  keywords: [
    "qr code",
    "générateur qr code",
    "qr code gratuit",
    "créer qr code",
    "qr code personnalisé",
    "qr code en ligne",
    "qr code url",
    "qr code wifi",
    "qr code email",
    "qr code téléphone",
    "qr code sms",
    "qr code png",
    "qr code svg",
    "qr code couleur",
    "qr code logo",
    "qr code generator",
    "qr code maker",
    "free qr code",
    "générateur code qr",
    "code qr gratuit",
  ],
  authors: [{ name: "QR Code Generator" }],
  creator: "QR Code Generator",
  publisher: "QR Code Generator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: BASE_URL,
    siteName: "QR Code Generator",
    title: "Générateur de QR Code Gratuit - Personnalisé et Haute Qualité",
    description:
      "Créez des QR Codes personnalisés gratuitement. URL, texte, email, WiFi. Couleurs, logo, styles variés. Téléchargez en PNG ou SVG.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QR Code Generator - Créez des QR Codes personnalisés",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Générateur de QR Code Gratuit en Ligne",
    description:
      "Créez et personnalisez des QR Codes gratuitement. Téléchargez en PNG ou SVG. Aucune inscription.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  classification: "Utility",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "QR Code Generator",
  url: BASE_URL,
  description:
    "Générateur de QR Codes gratuit et personnalisable. Créez des QR Codes pour URLs, textes, emails, WiFi et plus encore.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  featureList: [
    "Génération de QR Code en temps réel",
    "Personnalisation des couleurs et du style",
    "Téléchargement PNG et SVG",
    "Support URL, texte, email, téléphone, SMS, WiFi",
    "Ajout de logo au centre",
    "Historique local des QR Codes",
    "Génération en masse via CSV",
    "Mode sombre et clair",
    "Partage par lien",
  ],
  inLanguage: "fr-FR",
  isAccessibleForFree: true,
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  screenshot: `${BASE_URL}/og-image.png`,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Comment créer un QR Code gratuitement ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Utilisez notre générateur en ligne : entrez votre contenu (URL, texte, email, WiFi...), personnalisez les couleurs et le style, puis téléchargez votre QR Code en PNG ou SVG. C'est 100% gratuit et sans inscription.",
      },
    },
    {
      "@type": "Question",
      name: "Quels types de contenu peut-on encoder dans un QR Code ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vous pouvez encoder : des URLs/liens web, du texte libre, des adresses email, des numéros de téléphone, des SMS, et des informations de connexion WiFi (SSID, mot de passe, type de sécurité).",
      },
    },
    {
      "@type": "Question",
      name: "Peut-on personnaliser l'apparence d'un QR Code ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui ! Vous pouvez modifier la couleur du QR Code et du fond, choisir la taille, le style des modules (carré, arrondi, points), ajouter un logo central, et ajuster les coins arrondis et le niveau de correction d'erreur.",
      },
    },
    {
      "@type": "Question",
      name: "En quels formats peut-on télécharger le QR Code ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les QR Codes peuvent être téléchargés en haute résolution au format PNG (image raster) ou SVG (image vectorielle). Vous pouvez aussi copier l'image dans le presse-papier ou partager un lien direct.",
      },
    },
    {
      "@type": "Question",
      name: "Peut-on générer plusieurs QR Codes en une fois ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, grâce à notre fonction d'import CSV, vous pouvez générer des dizaines voire des centaines de QR Codes en une seule opération. Importez simplement un fichier CSV avec vos données.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
