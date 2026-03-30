import QRCode from 'qrcode';
import type { QRCustomization, ContentType, WifiData, EmailData, SmsData } from './types';

export function encodeContent(
  type: ContentType,
  rawContent: string,
  wifiData?: WifiData,
  emailData?: EmailData,
  smsData?: SmsData
): string {
  switch (type) {
    case 'url':
      if (rawContent && !rawContent.match(/^https?:\/\//i)) {
        return `https://${rawContent}`;
      }
      return rawContent;
    case 'email':
      if (emailData) {
        const params = new URLSearchParams();
        if (emailData.subject) params.set('subject', emailData.subject);
        if (emailData.body) params.set('body', emailData.body);
        const paramStr = params.toString();
        return `mailto:${emailData.to}${paramStr ? '?' + paramStr : ''}`;
      }
      return `mailto:${rawContent}`;
    case 'phone':
      return `tel:${rawContent}`;
    case 'sms':
      if (smsData) {
        return `smsto:${smsData.phone}:${smsData.message}`;
      }
      return `smsto:${rawContent}`;
    case 'wifi':
      if (wifiData) {
        const escaped = (s: string) => s.replace(/[\\;,:""]/g, '\\$&');
        return `WIFI:T:${wifiData.security};S:${escaped(wifiData.ssid)};P:${escaped(wifiData.password)};H:${wifiData.hidden ? 'true' : 'false'};;`;
      }
      return rawContent;
    default:
      return rawContent;
  }
}

export function detectContentType(content: string): ContentType {
  if (!content) return 'text';
  
  const trimmed = content.trim();
  
  if (/^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed)) return 'url';
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) return 'email';
  if (/^[\+]?[0-9\s\-\(\)]{7,15}$/.test(trimmed)) return 'phone';
  if (/\.(com|org|net|io|dev|fr|co|app|me)\b/i.test(trimmed)) return 'url';
  
  return 'text';
}

export async function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  content: string,
  customization: QRCustomization
): Promise<void> {
  if (!content) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = customization.size;
    canvas.height = customization.size;
    ctx.fillStyle = customization.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = customization.fgColor + '30';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', canvas.width / 2, canvas.height / 2);
    return;
  }

  const qr = QRCode.create(content, {
    errorCorrectionLevel: customization.ecLevel,
  });

  const modules = qr.modules;
  const moduleCount = modules.size;
  const size = customization.size;
  const quietZone = 4;
  const totalModules = moduleCount + quietZone * 2;
  const moduleSize = size / totalModules;

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = customization.bgColor;
  if (customization.cornerRadius > 0) {
    drawRoundedRect(ctx, 0, 0, size, size, customization.cornerRadius);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, size, size);
  }

  // Clip to rounded corners if needed
  if (customization.cornerRadius > 0) {
    ctx.save();
    ctx.beginPath();
    drawRoundedRect(ctx, 0, 0, size, size, customization.cornerRadius);
    ctx.clip();
  }

  // Draw modules
  const offset = quietZone * moduleSize;
  ctx.fillStyle = customization.fgColor;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules.get(row, col)) {
        const x = offset + col * moduleSize;
        const y = offset + row * moduleSize;

        switch (customization.moduleStyle) {
          case 'dots':
            ctx.beginPath();
            ctx.arc(
              x + moduleSize / 2,
              y + moduleSize / 2,
              moduleSize * 0.38,
              0,
              2 * Math.PI
            );
            ctx.fill();
            break;
          case 'rounded':
            drawRoundedRect(ctx, x + 0.5, y + 0.5, moduleSize - 1, moduleSize - 1, moduleSize * 0.3);
            ctx.fill();
            break;
          default:
            ctx.fillRect(x, y, moduleSize, moduleSize);
        }
      }
    }
  }

  // Draw logo if present
  if (customization.logoDataUrl) {
    await drawLogo(ctx, customization.logoDataUrl, size);
  }

  if (customization.cornerRadius > 0) {
    ctx.restore();
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function drawLogo(
  ctx: CanvasRenderingContext2D,
  logoDataUrl: string,
  size: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const logoSize = size * 0.22;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;
      const padding = 6;

      // White background behind logo
      ctx.fillStyle = '#ffffff';
      drawRoundedRect(
        ctx,
        logoX - padding,
        logoY - padding,
        logoSize + padding * 2,
        logoSize + padding * 2,
        8
      );
      ctx.fill();

      // Draw logo
      ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = logoDataUrl;
  });
}

export function generateSVG(
  content: string,
  customization: QRCustomization
): string {
  if (!content) return '';

  const qr = QRCode.create(content, {
    errorCorrectionLevel: customization.ecLevel,
  });

  const modules = qr.modules;
  const moduleCount = modules.size;
  const quietZone = 4;
  const totalModules = moduleCount + quietZone * 2;
  const moduleSize = customization.size / totalModules;
  const size = customization.size;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;

  // Background
  if (customization.cornerRadius > 0) {
    svg += `<rect width="${size}" height="${size}" fill="${customization.bgColor}" rx="${customization.cornerRadius}" ry="${customization.cornerRadius}"/>`;
  } else {
    svg += `<rect width="${size}" height="${size}" fill="${customization.bgColor}"/>`;
  }

  const offset = quietZone * moduleSize;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules.get(row, col)) {
        const x = offset + col * moduleSize;
        const y = offset + row * moduleSize;

        switch (customization.moduleStyle) {
          case 'dots':
            svg += `<circle cx="${x + moduleSize / 2}" cy="${y + moduleSize / 2}" r="${moduleSize * 0.38}" fill="${customization.fgColor}"/>`;
            break;
          case 'rounded':
            svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" rx="${moduleSize * 0.3}" ry="${moduleSize * 0.3}" fill="${customization.fgColor}"/>`;
            break;
          default:
            svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${customization.fgColor}"/>`;
        }
      }
    }
  }

  svg += '</svg>';
  return svg;
}

export function generateShareUrl(
  contentType: ContentType,
  encodedContent: string,
  customization: QRCustomization
): string {
  const params = new URLSearchParams();
  params.set('t', contentType);
  params.set('c', encodedContent);
  params.set('fg', customization.fgColor);
  params.set('bg', customization.bgColor);
  params.set('s', String(customization.size));
  params.set('ec', customization.ecLevel);
  params.set('ms', customization.moduleStyle);
  if (customization.cornerRadius > 0) {
    params.set('cr', String(customization.cornerRadius));
  }
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  return `${baseUrl}?${params.toString()}`;
}

export function parseShareUrl(searchParams: URLSearchParams): {
  contentType?: ContentType;
  content?: string;
  customization?: Partial<QRCustomization>;
} | null {
  const t = searchParams.get('t') as ContentType | null;
  const c = searchParams.get('c');
  
  if (!t || !c) return null;

  const customization: Partial<QRCustomization> = {};
  const fg = searchParams.get('fg');
  const bg = searchParams.get('bg');
  const s = searchParams.get('s');
  const ec = searchParams.get('ec');
  const ms = searchParams.get('ms');
  const cr = searchParams.get('cr');

  if (fg) customization.fgColor = fg;
  if (bg) customization.bgColor = bg;
  if (s) customization.size = parseInt(s);
  if (ec) customization.ecLevel = ec as QRCustomization['ecLevel'];
  if (ms) customization.moduleStyle = ms as QRCustomization['moduleStyle'];
  if (cr) customization.cornerRadius = parseInt(cr);

  return { contentType: t, content: c, customization };
}
