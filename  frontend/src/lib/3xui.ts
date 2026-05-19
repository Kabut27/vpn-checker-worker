export interface ClientTraffic {
  id: number;
  inboundId: number;
  enable: boolean;
  email: string;
  up: number;
  down: number;
  total: number;
  expiryTime: number;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatExpiry(timestamp: number): string {
  if (timestamp === 0) return "Haijaainishwa";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 0) return "Imeisha muda";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} siku ${hours} saa`;
  return `${hours} saa`;
}

export function getExpiryDate(timestamp: number): string {
  if (timestamp === 0) return "-";
  return new Date(timestamp).toLocaleDateString("sw-TZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
