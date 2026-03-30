'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Palette,
  Maximize,
  Shield,
  ImagePlus,
  Square,
  Circle,
  RectangleHorizontal,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { QRCustomization, ErrorCorrectionLevel, ModuleStyle } from '../lib/types';

interface CustomizationPanelProps {
  customization: QRCustomization;
  onCustomizationChange: (customization: QRCustomization) => void;
}

const EC_LEVELS: { value: ErrorCorrectionLevel; label: string; desc: string }[] = [
  { value: 'L', label: 'L', desc: '7% correction' },
  { value: 'M', label: 'M', desc: '15% correction' },
  { value: 'Q', label: 'Q', desc: '25% correction' },
  { value: 'H', label: 'H', desc: '30% correction' },
];

const MODULE_STYLES: { value: ModuleStyle; label: string; icon: React.ReactNode }[] = [
  { value: 'square', label: 'Carré', icon: <Square size={16} /> },
  { value: 'rounded', label: 'Arrondi', icon: <RectangleHorizontal size={16} /> },
  { value: 'dots', label: 'Points', icon: <Circle size={16} /> },
];

export default function CustomizationPanel({
  customization,
  onCustomizationChange,
}: CustomizationPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(
    (partial: Partial<QRCustomization>) => {
      onCustomizationChange({ ...customization, ...partial });
    },
    [customization, onCustomizationChange]
  );

  const handleLogoUpload = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        update({ logoDataUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    },
    [update]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleLogoUpload(file);
    },
    [handleLogoUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Palette size={18} className="text-violet-500" />
          <span className="font-semibold text-gray-900 dark:text-white">Personnalisation</span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 space-y-5 animate-fade-in">
          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Couleur QR
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <input
                    type="color"
                    value={customization.fgColor}
                    onChange={(e) => update({ fgColor: e.target.value })}
                    aria-label="Couleur du QR Code"
                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                  />
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: customization.fgColor }}
                  />
                </div>
                <input
                  type="text"
                  value={customization.fgColor}
                  onChange={(e) => update({ fgColor: e.target.value })}
                  aria-label="Code hexadécimal couleur QR"
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Couleur fond
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <input
                    type="color"
                    value={customization.bgColor}
                    onChange={(e) => update({ bgColor: e.target.value })}
                    aria-label="Couleur de fond du QR Code"
                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                  />
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: customization.bgColor }}
                  />
                </div>
                <input
                  type="text"
                  value={customization.bgColor}
                  onChange={(e) => update({ bgColor: e.target.value })}
                  aria-label="Code hexadécimal couleur de fond"
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Size slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Maximize size={14} />
                Taille
              </label>
              <span className="text-xs font-mono text-gray-400">{customization.size}px</span>
            </div>
            <input
              type="range"
              min={150}
              max={800}
              step={10}
              value={customization.size}
              onChange={(e) => update({ size: parseInt(e.target.value) })}
              aria-label="Taille du QR Code en pixels"
              className="w-full accent-violet-600"
            />
          </div>

          {/* Error Correction Level */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2">
              <Shield size={14} />
              Niveau de correction
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EC_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => update({ ecLevel: level.value })}
                  className={`p-2 rounded-lg text-center transition-all ${
                    customization.ecLevel === level.value
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="text-sm font-bold">{level.label}</div>
                  <div className={`text-[10px] ${customization.ecLevel === level.value ? 'text-violet-200' : 'text-gray-400'}`}>
                    {level.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Module Style */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
              Style des modules
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MODULE_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => update({ moduleStyle: style.value })}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-sm transition-all ${
                    customization.moduleStyle === style.value
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {style.icon}
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Corner Radius */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Coins arrondis
              </label>
              <span className="text-xs font-mono text-gray-400">{customization.cornerRadius}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={2}
              value={customization.cornerRadius}
              onChange={(e) => update({ cornerRadius: parseInt(e.target.value) })}
              aria-label="Rayon des coins arrondis en pixels"
              className="w-full accent-violet-600"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2">
              <ImagePlus size={14} />
              Logo central
            </label>
            {customization.logoDataUrl ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Image
                  src={customization.logoDataUrl}
                  alt="Logo"
                  width={48}
                  height={48}
                  unoptimized
                  className="w-12 h-12 object-contain rounded-lg"
                />
                <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                  Logo ajouté
                </div>
                <button
                  onClick={() => update({ logoDataUrl: null })}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10'
                }`}
              >
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Glissez une image ou <span className="text-violet-500 font-medium">parcourir</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, SVG • Conseil : utilisez un niveau H
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Télécharger un logo pour le QR Code"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
