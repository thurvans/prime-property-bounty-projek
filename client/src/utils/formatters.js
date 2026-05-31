export const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
});

export function formatRupiah(value) {
  return rupiah.format(Number(value || 0)).replace(/\u00a0/g, ' ');
}

export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(new Date(value));
}

export function siapLabel(value) {
  return {
    siap_huni: 'Siap Huni',
    siap_kosong: 'Siap Kosong',
    siap_huni_renovasi: 'Siap Huni Renovasi'
  }[value] || value;
}

export function statusLabel(value) {
  return {
    in_stock: 'In Stock',
    sold_out: 'Sold Out'
  }[value] || value;
}

export function toNumberInput(value) {
  const numeric = String(value || '').replace(/[^\d]/g, '');
  return numeric ? Number(numeric) : '';
}
