'use client';

import { Clock, Trash2, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import type { HistoryItem } from '../lib/types';
import { CONTENT_TYPE_LABELS } from '../lib/types';

interface QRHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export default function QRHistory({ history, onSelect, onClear }: QRHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-600">
        <Clock size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">Aucun historique</p>
        <p className="text-xs mt-1">Vos QR Codes récents apparaîtront ici</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {history.length} QR Code{history.length > 1 ? 's' : ''} récent{history.length > 1 ? 's' : ''}
        </h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
        >
          <Trash2 size={12} />
          Vider
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-200"
          >
            <Image
              src={item.dataUrl}
              alt="QR Code"
              width={200}
              height={200}
              unoptimized
              className="w-full aspect-square rounded-lg mb-2"
            />
            <div className="text-left">
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-md">
                {CONTENT_TYPE_LABELS[item.contentType]}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {item.rawContent.substring(0, 30)}
                {item.rawContent.length > 30 ? '...' : ''}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
                {new Date(item.timestamp).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-violet-600/0 group-hover:bg-violet-600/10 rounded-xl transition-all">
              <RotateCcw
                size={20}
                className="text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
