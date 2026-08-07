export const formatIDR = (value: number): string => {
  if (isNaN(value)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatShortNumber = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, '') + ' Jt';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + ' Rb';
  }
  return value.toString();
};

export const formatDateID = (dateStr?: string | number): string => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return String(dateStr);
  }
};

export const formatTimeID = (timestamp?: number): string => {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
};

export const generateInvoiceNo = (): string => {
  const now = new Date();
  const ymd = now.toISOString().split('T')[0].replace(/-/g, '');
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `INV-${ymd}-${random4}`;
};
