export type ContentType = 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi';

export type ModuleStyle = 'square' | 'rounded' | 'dots';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type SecurityType = 'WPA' | 'WEP' | 'nopass';

export interface QRCustomization {
  fgColor: string;
  bgColor: string;
  size: number;
  ecLevel: ErrorCorrectionLevel;
  moduleStyle: ModuleStyle;
  logoDataUrl: string | null;
  cornerRadius: number;
}

export interface WifiData {
  ssid: string;
  password: string;
  security: SecurityType;
  hidden: boolean;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export interface SmsData {
  phone: string;
  message: string;
}

export interface HistoryItem {
  id: string;
  contentType: ContentType;
  rawContent: string;
  encodedContent: string;
  dataUrl: string;
  timestamp: number;
  customization: QRCustomization;
}

export const MAX_CHARS: Record<ErrorCorrectionLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  text: 'Texte',
  url: 'URL',
  email: 'Email',
  phone: 'Téléphone',
  sms: 'SMS',
  wifi: 'WiFi',
};

export const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  text: 'Type',
  url: 'Link',
  email: 'Mail',
  phone: 'Phone',
  sms: 'MessageSquare',
  wifi: 'Wifi',
};

export const DEFAULT_CUSTOMIZATION: QRCustomization = {
  fgColor: '#000000',
  bgColor: '#ffffff',
  size: 300,
  ecLevel: 'M',
  moduleStyle: 'square',
  logoDataUrl: null,
  cornerRadius: 0,
};
