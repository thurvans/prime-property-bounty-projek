import { siapLabel, statusLabel } from '../utils/formatters.js';

export function StatusBadge({ value }) {
  const className =
    value === 'in_stock'
      ? 'bg-emerald-100 text-emerald-800'
      : value === 'sold_out'
        ? 'bg-prime-red text-white'
        : 'bg-prime-gray text-prime-black';

  return <span className={`inline-flex rounded px-2 py-1 text-xs font-bold ${className}`}>{statusLabel(value)}</span>;
}

export function ReadyBadge({ value }) {
  const className =
    value === 'siap_huni'
      ? 'bg-prime-gold/25 text-prime-black'
      : value === 'siap_kosong'
        ? 'bg-purple-100 text-purple-800'
        : 'bg-amber-100 text-amber-900';

  return <span className={`inline-flex rounded px-2 py-1 text-xs font-bold ${className}`}>{siapLabel(value)}</span>;
}
