'use client';

import { useState, useCallback } from 'react';
import {
  Type,
  Link,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import type { ContentType, WifiData, EmailData, SmsData, SecurityType } from '../lib/types';
import { CONTENT_TYPE_LABELS } from '../lib/types';
import { detectContentType } from '../lib/qr-renderer';

const ICONS: Record<ContentType, React.ReactNode> = {
  text: <Type size={16} />,
  url: <Link size={16} />,
  email: <Mail size={16} />,
  phone: <Phone size={16} />,
  sms: <MessageSquare size={16} />,
  wifi: <Wifi size={16} />,
};

interface ContentInputProps {
  contentType: ContentType;
  onContentTypeChange: (type: ContentType) => void;
  rawContent: string;
  onRawContentChange: (content: string) => void;
  wifiData: WifiData;
  onWifiDataChange: (data: WifiData) => void;
  emailData: EmailData;
  onEmailDataChange: (data: EmailData) => void;
  smsData: SmsData;
  onSmsDataChange: (data: SmsData) => void;
  maxChars: number;
  currentChars: number;
  onAutoDetect: (type: ContentType) => void;
}

export default function ContentInput({
  contentType,
  onContentTypeChange,
  rawContent,
  onRawContentChange,
  wifiData,
  onWifiDataChange,
  emailData,
  onEmailDataChange,
  smsData,
  onSmsDataChange,
  maxChars,
  currentChars,
  onAutoDetect,
}: ContentInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  const handleTextChange = useCallback(
    (value: string) => {
      onRawContentChange(value);
      if (contentType === 'text' && value.length > 3) {
        const detected = detectContentType(value);
        if (detected !== 'text') {
          setAutoDetected(true);
          onAutoDetect(detected);
          setTimeout(() => setAutoDetected(false), 2000);
        }
      }
    },
    [contentType, onRawContentChange, onAutoDetect]
  );

  const types: ContentType[] = ['text', 'url', 'email', 'phone', 'sms', 'wifi'];

  return (
    <div className="space-y-4">
      {/* Content Type Selector */}
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => onContentTypeChange(type)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              contentType === type
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25 scale-105'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {ICONS[type]}
            {CONTENT_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Auto-detect indicator */}
      {autoDetected && (
        <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 animate-fade-in">
          <Sparkles size={14} />
          <span>Type détecté automatiquement</span>
        </div>
      )}

      {/* Input Forms */}
      <div className="space-y-3">
        {contentType === 'text' && (
          <div>
            <label htmlFor="qr-text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Texte
            </label>
            <textarea
              id="qr-text-input"
              value={rawContent}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Entrez votre texte ici..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        )}

        {contentType === 'url' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              URL
            </label>
            <input
              type="url"
              value={rawContent}
              onChange={(e) => onRawContentChange(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
        )}

        {contentType === 'email' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={emailData.to}
                onChange={(e) => onEmailDataChange({ ...emailData, to: e.target.value })}
                placeholder="contact@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Sujet <span className="text-gray-400">(optionnel)</span>
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => onEmailDataChange({ ...emailData, subject: e.target.value })}
                placeholder="Sujet de l'email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Corps <span className="text-gray-400">(optionnel)</span>
              </label>
              <textarea
                value={emailData.body}
                onChange={(e) => onEmailDataChange({ ...emailData, body: e.target.value })}
                placeholder="Corps de l'email"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        )}

        {contentType === 'phone' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={rawContent}
              onChange={(e) => onRawContentChange(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
        )}

        {contentType === 'sms' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={smsData.phone}
                onChange={(e) => onSmsDataChange({ ...smsData, phone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Message
              </label>
              <textarea
                value={smsData.message}
                onChange={(e) => onSmsDataChange({ ...smsData, message: e.target.value })}
                placeholder="Votre message..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        )}

        {contentType === 'wifi' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nom du réseau (SSID)
              </label>
              <input
                type="text"
                value={wifiData.ssid}
                onChange={(e) => onWifiDataChange({ ...wifiData, ssid: e.target.value })}
                placeholder="Mon WiFi"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={wifiData.password}
                  onChange={(e) => onWifiDataChange({ ...wifiData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Sécurité
              </label>
              <div className="flex gap-2">
                {(['WPA', 'WEP', 'nopass'] as SecurityType[]).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onWifiDataChange({ ...wifiData, security: sec })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      wifiData.security === sec
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {sec === 'nopass' ? 'Aucune' : sec}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={wifiData.hidden}
                onChange={(e) => onWifiDataChange({ ...wifiData, hidden: e.target.checked })}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              Réseau masqué
            </label>
          </div>
        )}
      </div>

      {/* Character counter */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 dark:text-gray-500">
          {currentChars} / {maxChars} caractères
        </span>
        <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              currentChars / maxChars > 0.9
                ? 'bg-red-500'
                : currentChars / maxChars > 0.7
                ? 'bg-yellow-500'
                : 'bg-violet-500'
            }`}
            style={{ width: `${Math.min(100, (currentChars / maxChars) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
