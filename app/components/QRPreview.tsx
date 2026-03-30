'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Download,
  Copy,
  Share2,
  RotateCcw,
  Check,
  Link2,
  Image as ImageIcon,
} from 'lucide-react';
import type { QRCustomization, ContentType } from '../lib/types';
import { renderQRToCanvas, generateSVG, generateShareUrl } from '../lib/qr-renderer';

interface QRPreviewProps {
  content: string;
  customization: QRCustomization;
  contentType: ContentType;
  onReset: () => void;
}

export default function QRPreview({
  content,
  customization,
  contentType,
  onReset,
}: QRPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Render QR code to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const timeout = setTimeout(async () => {
      setIsRendering(true);
      await renderQRToCanvas(canvas, content, customization);
      setIsRendering(false);
    }, 100);

    return () => clearTimeout(timeout);
  }, [content, customization]);

  const showCopied = useCallback((type: string) => {
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !content) return;

    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [content]);

  const downloadSVG = useCallback(() => {
    if (!content) return;
    const svg = generateSVG(content, customization);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [content, customization]);

  const copyImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !content) return;

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      showCopied('image');
    } catch {
      // Fallback: copy data URL
      const dataUrl = canvas.toDataURL('image/png');
      await navigator.clipboard.writeText(dataUrl);
      showCopied('image');
    }
  }, [content, showCopied]);

  const copyUrl = useCallback(async () => {
    if (!content) return;
    const url = generateShareUrl(contentType, content, customization);
    await navigator.clipboard.writeText(url);
    showCopied('url');
  }, [content, contentType, customization, showCopied]);

  const copyDataUrl = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !content) return;
    const dataUrl = canvas.toDataURL('image/png');
    await navigator.clipboard.writeText(dataUrl);
    showCopied('dataurl');
  }, [content, showCopied]);

  const shareQR = useCallback(async () => {
    if (!content) return;

    const url = generateShareUrl(contentType, content, customization);

    if (navigator.share) {
      try {
        const canvas = canvasRef.current;
        if (canvas) {
          const blob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((b) => resolve(b!), 'image/png')
          );
          const file = new File([blob], 'qrcode.png', { type: 'image/png' });
          await navigator.share({
            title: 'QR Code',
            text: 'Voici mon QR Code',
            url,
            files: [file],
          });
          return;
        }
      } catch {
        // try without file
      }

      try {
        await navigator.share({
          title: 'QR Code',
          text: 'Voici mon QR Code',
          url,
        });
        return;
      } catch {
        // fallback
      }
    }

    await navigator.clipboard.writeText(url);
    showCopied('share');
  }, [content, contentType, customization, showCopied]);

  const hasContent = !!content;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Preview area */}
      <div
        className={`relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 ${
          isRendering ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto"
          role="img"
          aria-label="QR Code généré - scannez avec votre appareil photo"
          style={{
            maxWidth: '100%',
            width: Math.min(customization.size, 400),
            height: Math.min(customization.size, 400),
          }}
        />
        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-2xl">
            <div className="text-center text-gray-400">
              <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Entrez du contenu pour générer un QR Code</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="w-full grid grid-cols-2 gap-2">
        <button
          onClick={downloadPNG}
          disabled={!hasContent}
          aria-label="Télécharger le QR Code en format PNG"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-violet-500/25 disabled:shadow-none"
        >
          <Download size={16} aria-hidden="true" />
          PNG
        </button>
        <button
          onClick={downloadSVG}
          disabled={!hasContent}
          aria-label="Télécharger le QR Code en format SVG vectoriel"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/25 disabled:shadow-none"
        >
          <Download size={16} aria-hidden="true" />
          SVG
        </button>
        <button
          onClick={copyImage}
          disabled={!hasContent}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all"
        >
          {copied === 'image' ? <Check size={16} className="text-green-500" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied === 'image' ? 'Copié !' : 'Copier image'}
        </button>
        <button
          onClick={copyUrl}
          disabled={!hasContent}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all"
        >
          {copied === 'url' ? <Check size={16} className="text-green-500" aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
          {copied === 'url' ? 'Copié !' : 'Copier le lien'}
        </button>
        <button
          onClick={copyDataUrl}
          disabled={!hasContent}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all"
        >
          {copied === 'dataurl' ? <Check size={16} className="text-green-500" aria-hidden="true" /> : <ImageIcon size={16} aria-hidden="true" />}
          {copied === 'dataurl' ? 'Copié !' : 'URL image'}
        </button>
        <button
          onClick={shareQR}
          disabled={!hasContent}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all"
        >
          {copied === 'share' ? <Check size={16} className="text-green-500" aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
          {copied === 'share' ? 'Copié !' : 'Partager'}
        </button>
      </div>

      <button
        onClick={onReset}
        aria-label="Réinitialiser le QR Code et les paramètres"
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-sm font-medium transition-all"
      >
        <RotateCcw size={16} aria-hidden="true" />
        Réinitialiser
      </button>
    </div>
  );
}
