'use client';

import { useState, useCallback, useRef } from 'react';
import { FileSpreadsheet, X, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Papa from 'papaparse';
import QRCode from 'qrcode';

interface CSVBulkGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CSVRow {
  content: string;
  type?: string;
  filename?: string;
}

interface GeneratedQR {
  content: string;
  dataUrl: string;
  filename: string;
}

export default function CSVBulkGenerator({ isOpen, onClose }: CSVBulkGeneratorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [generated, setGenerated] = useState<GeneratedQR[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setGenerated([]);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Erreur de lecture du fichier CSV');
          return;
        }

        const parsed: CSVRow[] = results.data
          .map((row) => ({
            content: row.content || row.text || row.url || row.data || Object.values(row)[0] || '',
            type: row.type,
            filename: row.filename || row.name,
          }))
          .filter((r) => r.content.trim() !== '');

        if (parsed.length === 0) {
          setError('Aucune donnée trouvée. Assurez-vous que le CSV contient une colonne "content".');
          return;
        }

        setRows(parsed);
      },
    });
  }, []);

  const generateAll = useCallback(async () => {
    setIsProcessing(true);
    const results: GeneratedQR[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const dataUrl = await QRCode.toDataURL(row.content, {
          width: 400,
          margin: 2,
          errorCorrectionLevel: 'M',
        });
        results.push({
          content: row.content,
          dataUrl,
          filename: row.filename || `qrcode-${i + 1}`,
        });
      } catch {
        results.push({
          content: row.content,
          dataUrl: '',
          filename: row.filename || `qrcode-${i + 1}`,
        });
      }
    }

    setGenerated(results);
    setIsProcessing(false);
  }, [rows]);

  const downloadAll = useCallback(() => {
    generated.forEach((qr) => {
      if (qr.dataUrl) {
        const link = document.createElement('a');
        link.download = `${qr.filename}.png`;
        link.href = qr.dataUrl;
        link.click();
      }
    });
  }, [generated]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
        handleFile(file);
      } else {
        setError('Veuillez importer un fichier CSV');
      }
    },
    [handleFile]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-violet-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Génération en masse
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-130px)]">
          {/* Upload area */}
          {rows.length === 0 && (
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-violet-400'
                }`}
              >
                <Upload size={40} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Glissez votre fichier CSV ici
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  ou <span className="text-violet-500 font-medium">parcourir</span>
                </p>
                <p className="text-xs text-gray-400 mt-4">
                  Le CSV doit contenir une colonne &quot;content&quot; avec les données à encoder
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                  className="hidden"
                />
              </div>

              {/* CSV format help */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Format CSV attendu :
                </p>
                <code className="text-xs text-gray-600 dark:text-gray-400 font-mono block whitespace-pre">
{`content,filename
https://example.com,site-web
Bonjour le monde,message
+33612345678,contact`}
                </code>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl mb-4">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Rows preview */}
          {rows.length > 0 && generated.length === 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">{rows.length}</span> QR Codes à générer
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setRows([]); setError(null); }}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={generateAll}
                    disabled={isProcessing}
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Génération...' : 'Générer tout'}
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {rows.slice(0, 20).map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                  >
                    <span className="text-gray-400 text-xs w-6">{i + 1}</span>
                    <span className="text-gray-700 dark:text-gray-300 truncate flex-1">
                      {row.content}
                    </span>
                  </div>
                ))}
                {rows.length > 20 && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    ... et {rows.length - 20} de plus
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Generated results */}
          {generated.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-medium">
                    {generated.filter((g) => g.dataUrl).length} QR Codes générés
                  </span>
                </div>
                <button
                  onClick={downloadAll}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  <Download size={16} />
                  Tout télécharger
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                {generated.map((qr, i) => (
                  <div key={i} className="text-center">
                    {qr.dataUrl ? (
                      <Image
                        src={qr.dataUrl}
                        alt={qr.content}
                        width={256}
                        height={256}
                        unoptimized
                        className="w-full aspect-square rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <AlertCircle size={20} className="text-red-400" />
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1 truncate">{qr.filename}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setRows([]); setGenerated([]); }}
                className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Nouvelle importation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
