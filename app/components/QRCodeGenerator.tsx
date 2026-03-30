'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Sun, Moon, FileSpreadsheet, QrCode, History } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import ContentInput from './ContentInput';
import CustomizationPanel from './CustomizationPanel';
import QRPreview from './QRPreview';
import QRHistory from './QRHistory';
import CSVBulkGenerator from './CSVBulkGenerator';
import type {
  ContentType,
  QRCustomization,
  WifiData,
  EmailData,
  SmsData,
  HistoryItem,
} from '../lib/types';
import { DEFAULT_CUSTOMIZATION, MAX_CHARS } from '../lib/types';
import { encodeContent, parseShareUrl, renderQRToCanvas } from '../lib/qr-renderer';

export default function QRCodeGenerator() {
  const { theme, toggleTheme } = useTheme();
  const [contentType, setContentType] = useState<ContentType>('text');
  const [rawContent, setRawContent] = useState('');
  const [customization, setCustomization] = useState<QRCustomization>(DEFAULT_CUSTOMIZATION);
  const [wifiData, setWifiData] = useState<WifiData>({
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false,
  });
  const [emailData, setEmailData] = useState<EmailData>({
    to: '',
    subject: '',
    body: '',
  });
  const [smsData, setSmsData] = useState<SmsData>({
    phone: '',
    message: '',
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showCSV, setShowCSV] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load history and URL params on mount
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem('qr-history');
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch {
        // ignore
      }

      // Parse URL params
      const params = new URLSearchParams(window.location.search);
      const parsed = parseShareUrl(params);
      if (parsed) {
        if (parsed.contentType) setContentType(parsed.contentType);
        if (parsed.content) setRawContent(parsed.content);
        if (parsed.customization) {
          setCustomization((prev) => ({ ...prev, ...parsed.customization }));
        }
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    });

    return () => window.cancelAnimationFrame(rafId);
  }, []);

  // Encode content based on type
  const encodedContent = encodeContent(
    contentType,
    rawContent,
    wifiData,
    emailData,
    smsData
  );

  const currentChars = encodedContent.length;
  const maxChars = MAX_CHARS[customization.ecLevel];

  // Auto-save to history when content changes (debounced)
  useEffect(() => {
    if (!encodedContent || encodedContent.length < 1) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      // Use a temporary canvas to get the data URL
      const tempCanvas = document.createElement('canvas');
      renderQRToCanvas(tempCanvas, encodedContent, {
        ...customization,
        size: 200,
        logoDataUrl: null, // don't save logo in history thumbnails
      }).then(() => {
        const dataUrl = tempCanvas.toDataURL('image/png');
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          contentType,
          rawContent: contentType === 'wifi'
            ? wifiData.ssid
            : contentType === 'email'
            ? emailData.to
            : contentType === 'sms'
            ? smsData.phone
            : rawContent,
          encodedContent,
          dataUrl,
          timestamp: Date.now(),
          customization: { ...customization, logoDataUrl: null },
        };

        setHistory((prev) => {
          // Check if the same content already exists
          const filtered = prev.filter((h) => h.encodedContent !== encodedContent);
          const updated = [newItem, ...filtered].slice(0, 10);
          localStorage.setItem('qr-history', JSON.stringify(updated));
          return updated;
        });
      });
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [encodedContent, contentType, customization, rawContent, wifiData, emailData, smsData]);

  const handleReset = useCallback(() => {
    setRawContent('');
    setWifiData({ ssid: '', password: '', security: 'WPA', hidden: false });
    setEmailData({ to: '', subject: '', body: '' });
    setSmsData({ phone: '', message: '' });
    setCustomization(DEFAULT_CUSTOMIZATION);
    setContentType('text');
  }, []);

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setContentType(item.contentType);
    setRawContent(item.encodedContent);
    setCustomization({ ...item.customization, logoDataUrl: null });
    setShowHistory(false);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('qr-history');
  }, []);

  const handleAutoDetect = useCallback((type: ContentType) => {
    setContentType(type);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg"
      >
        Aller au contenu principal
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800" role="banner">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between" aria-label="Navigation principale">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-linear-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25" aria-hidden="true">
              <QrCode size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                QR Code Generator
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Créez, personnalisez et partagez vos QR Codes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              aria-expanded={showHistory}
              aria-controls="history-panel"
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                showHistory
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <History size={16} />
              <span className="hidden sm:inline">Historique</span>
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center" aria-label={`${history.length} QR codes dans l'historique`}>
                  {history.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowCSV(true)}
              className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 transition-all"
              aria-label="Import CSV pour génération en masse"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 transition-all"
              aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
              title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" role="main">
        {/* History Panel */}
        {showHistory && (
          <section id="history-panel" className="mb-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 animate-slide-down" aria-label="Historique des QR Codes">
            <QRHistory
              history={history}
              onSelect={handleHistorySelect}
              onClear={handleClearHistory}
            />
          </section>
        )}

        {/* Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Input & Customization */}
          <div className="space-y-5">
            {/* Content Input Card */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6" aria-label="Contenu du QR Code">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-1.5 h-5 bg-linear-to-b from-violet-600 to-indigo-600 rounded-full" aria-hidden="true" />
                Contenu du QR Code
              </h2>
              <ContentInput
                contentType={contentType}
                onContentTypeChange={setContentType}
                rawContent={rawContent}
                onRawContentChange={setRawContent}
                wifiData={wifiData}
                onWifiDataChange={setWifiData}
                emailData={emailData}
                onEmailDataChange={setEmailData}
                smsData={smsData}
                onSmsDataChange={setSmsData}
                maxChars={maxChars}
                currentChars={currentChars}
                onAutoDetect={handleAutoDetect}
              />
            </section>

            {/* Customization Panel */}
            <CustomizationPanel
              customization={customization}
              onCustomizationChange={setCustomization}
            />
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6" aria-label="Aperçu du QR Code">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-1.5 h-5 bg-linear-to-b from-violet-600 to-indigo-600 rounded-full" aria-hidden="true" />
                Aperçu
              </h2>
              <QRPreview
                content={encodedContent}
                customization={customization}
                contentType={contentType}
                onReset={handleReset}
              />
            </section>
          </div>
        </div>

        {/* SEO Content Section */}
        <section className="mt-16 max-w-4xl mx-auto" aria-label="À propos du générateur de QR Codes">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Générateur de QR Code en ligne gratuit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <article className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🎨 Personnalisation complète</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Changez les couleurs, choisissez entre carrés, ronds ou points, ajoutez votre logo et ajustez la taille pour un QR Code unique.
              </p>
            </article>
            <article className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📱 Multi-formats</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Encodez des URLs, du texte, des emails, des numéros de téléphone, des SMS ou des accès WiFi dans vos QR Codes.
              </p>
            </article>
            <article className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">⬇️ Export haute qualité</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Téléchargez en PNG ou SVG, copiez dans le presse-papier, ou partagez directement un lien. Résolution jusqu&apos;à 800px.
              </p>
            </article>
            <article className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Génération en masse</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Importez un fichier CSV pour créer des dizaines de QR Codes en une seule opération. Idéal pour les entreprises.
              </p>
            </article>
            <article className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔒 100% privé</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tout est généré côté client dans votre navigateur. Aucune donnée n&apos;est envoyée à un serveur. Vos informations restent privées.
              </p>
            </article>
            <article className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔗 Partage par lien</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Copiez l&apos;URL de votre QR Code pour le partager sans télécharger. Le destinataire verra instantanément votre QR Code.
              </p>
            </article>
          </div>

          {/* FAQ Section - visible for SEO */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Questions fréquentes sur les QR Codes
            </h2>
            <dl className="space-y-5">
              <div>
                <dt className="font-medium text-gray-900 dark:text-white mb-1">
                  Comment créer un QR Code gratuitement ?
                </dt>
                <dd className="text-sm text-gray-600 dark:text-gray-400">
                  Entrez votre contenu (URL, texte, email, WiFi...) dans le formulaire ci-dessus,
                  personnalisez les couleurs et le style, puis téléchargez votre QR Code en PNG ou SVG.
                  C&apos;est 100% gratuit et sans inscription.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900 dark:text-white mb-1">
                  Quels types de contenu peut-on encoder dans un QR Code ?
                </dt>
                <dd className="text-sm text-gray-600 dark:text-gray-400">
                  Vous pouvez encoder des URLs/liens web, du texte libre, des adresses email avec sujet
                  et corps, des numéros de téléphone, des SMS pré-rédigés, et des informations de
                  connexion WiFi (SSID, mot de passe, type de sécurité WPA/WEP).
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900 dark:text-white mb-1">
                  Quelle est la différence entre PNG et SVG ?
                </dt>
                <dd className="text-sm text-gray-600 dark:text-gray-400">
                  Le PNG est un format d&apos;image raster idéal pour le web et les réseaux sociaux. Le
                  SVG est un format vectoriel parfait pour l&apos;impression car il peut être agrandi sans
                  perte de qualité.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900 dark:text-white mb-1">
                  Le QR Code fonctionne-t-il avec un logo au centre ?
                </dt>
                <dd className="text-sm text-gray-600 dark:text-gray-400">
                  Oui, grâce à la correction d&apos;erreur. Pour de meilleurs résultats, utilisez le
                  niveau de correction H (30%) qui permet de masquer jusqu&apos;à 30% du code tout en
                  restant lisible.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900 dark:text-white mb-1">
                  Mes données sont-elles en sécurité ?
                </dt>
                <dd className="text-sm text-gray-600 dark:text-gray-400">
                  Absolument. Toute la génération se fait directement dans votre navigateur (côté
                  client). Aucune donnée n&apos;est transmise à un serveur. L&apos;historique est
                  stocké uniquement en local sur votre appareil.
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-gray-800 py-8" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">QR Code Generator</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Outil en ligne gratuit pour créer des QR Codes personnalisés.
                Aucune inscription requise. Vos données restent privées.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Fonctionnalités</h3>
              <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                <li>QR Code URL, Texte, Email</li>
                <li>QR Code Téléphone, SMS, WiFi</li>
                <li>Personnalisation couleurs et style</li>
                <li>Export PNG et SVG haute résolution</li>
                <li>Génération en masse via CSV</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Informations</h3>
              <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                <li>100% gratuit</li>
                <li>Aucune inscription</li>
                <li>Données privées (côté client)</li>
                <li>Compatible mobile et desktop</li>
              </ul>
            </div>
          </div>
          <div className="text-center border-t border-gray-200 dark:border-gray-800 pt-4">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              &copy; {new Date().getFullYear()} QR Code Generator &mdash; Créez et partagez des QR Codes personnalisés gratuitement
            </p>
          </div>
        </div>
      </footer>

      {/* CSV Modal */}
      <CSVBulkGenerator isOpen={showCSV} onClose={() => setShowCSV(false)} />
    </div>
  );
}
