import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import MultiSelect from '../components/MultiSelect.jsx';
import PropertyForm from '../components/PropertyForm.jsx';
import SegmentedControl from '../components/SegmentedControl.jsx';
import { ReadyBadge, StatusBadge } from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../utils/api.js';
import { formatDate, formatRupiah, siapLabel, statusLabel } from '../utils/formatters.js';

const defaults = {
  search: '',
  kawasan: [],
  lebarMin: '',
  hadap: [],
  hargaMax: '',
  tipe: 'Semua',
  status: 'Semua',
  siap: [],
  carport: 'Semua',
  sort: 'nama_property:asc',
  page: 1,
  pageSize: 50
};

function parseParams(params) {
  const arrayValue = (key) => (params.get(key) ? params.get(key).split(',').filter(Boolean) : []);
  return {
    ...defaults,
    search: params.get('search') || '',
    kawasan: arrayValue('kawasan'),
    lebarMin: params.get('lebarMin') || '',
    hadap: arrayValue('hadap'),
    hargaMax: params.get('hargaMax') || '',
    tipe: params.get('tipe') || 'Semua',
    status: params.get('status') || 'Semua',
    siap: arrayValue('siap'),
    carport: params.get('carport') || 'Semua',
    sort: params.get('sort') || 'nama_property:asc',
    page: Number(params.get('page') || 1),
    pageSize: Number(params.get('pageSize') || 50)
  };
}

function buildParams(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length) params.set(key, value.join(','));
    else if (!Array.isArray(value) && value && value !== defaults[key]) params.set(key, value);
  });
  return params;
}

export default function PropertiesPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => parseParams(searchParams));
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 50, total: 0, totalPages: 1 });
  const [options, setOptions] = useState({ kawasan: [], hadap: [], siap: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [formMode, setFormMode] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [highlightId, setHighlightId] = useState(searchParams.get('highlightId'));
  const isSuperadmin = user?.role === 'superadmin';

  const fetchRows = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const params = buildParams(currentFilters);
      const data = await api(`/properties?${params.toString()}`);
      setRows(data.items || []);
      setMeta(data.meta);
      setOptions(data.options || {});
    } catch (error) {
      pushToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const params = buildParams(filters);
      if (highlightId) params.set('highlightId', highlightId);
      setSearchParams(params, { replace: true });
      fetchRows(filters);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [filters, fetchRows, highlightId, setSearchParams]);

  function updateFilter(key, value, resetPage = true) {
    setFilters((state) => ({ ...state, [key]: value, page: resetPage ? 1 : state.page }));
  }

  function resetFilters() {
    setFilters(defaults);
    setHighlightId(null);
    setSelected(null);
  }

  async function saveProperty(payload, keepOpen) {
    try {
      const data = formMode?.type === 'edit'
        ? await api(`/properties/${formMode.property.id}`, { method: 'PUT', body: payload })
        : await api('/properties', { method: 'POST', body: payload });
      pushToast(formMode?.type === 'edit' ? 'Properti berhasil diperbarui.' : 'Properti berhasil ditambahkan.');
      setHighlightId(data.item.id);
      await fetchRows(filters);
      if (!keepOpen) setFormMode(null);
      setSelected(data.item);
    } catch (error) {
      pushToast(error.message, 'error');
      throw error;
    }
  }

  async function deleteProperty() {
    if (!deleteTarget) return;
    try {
      await api(`/properties/${deleteTarget.id}`, { method: 'DELETE' });
      pushToast('Properti berhasil dihapus.');
      setDeleteTarget(null);
      setSelected(null);
      fetchRows(filters);
    } catch (error) {
      pushToast(error.message, 'error');
    }
  }

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.search) chips.push({ type: 'search', raw: filters.search, label: `Search: ${filters.search}` });
    filters.kawasan.forEach((value) => chips.push({ type: 'kawasan', raw: value, label: value }));
    filters.hadap.forEach((value) => chips.push({ type: 'hadap', raw: value, label: `Hadap ${value}` }));
    filters.siap.forEach((value) => chips.push({ type: 'siap', raw: value, label: siapLabel(value) }));
    if (filters.lebarMin) chips.push({ type: 'lebarMin', raw: filters.lebarMin, label: `Lebar min ${filters.lebarMin} m` });
    if (filters.hargaMax) chips.push({ type: 'hargaMax', raw: filters.hargaMax, label: `Max ${formatRupiah(filters.hargaMax)}` });
    if (filters.tipe !== 'Semua') chips.push({ type: 'tipe', raw: filters.tipe, label: filters.tipe });
    if (filters.status !== 'Semua') chips.push({ type: 'status', raw: filters.status, label: statusLabel(filters.status) });
    if (filters.carport !== 'Semua') chips.push({ type: 'carport', raw: filters.carport, label: `Carport ${filters.carport}` });
    return chips;
  }, [filters]);

  function removeChip(type, raw) {
    if (Array.isArray(filters[type])) {
      updateFilter(type, filters[type].filter((item) => item !== raw));
    } else {
      updateFilter(type, defaults[type]);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-black/10 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-xl font-black">Listing Properti</h1>
            <p className="text-sm text-prime-black/60">Menampilkan data ringkas dengan filter real-time.</p>
          </div>
          {isSuperadmin && (
            <button
              type="button"
              onClick={() => setFormMode({ type: 'create' })}
              className="h-10 rounded-md bg-prime-black px-4 text-sm font-black text-white hover:bg-prime-gold hover:text-prime-black"
            >
              <i className="fa-solid fa-plus mr-2" />
              Tambah Properti
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(240px,1fr)_auto_auto_auto]">
          <label className="relative block">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-prime-black/35" />
            <input
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              className="h-10 w-full rounded-md border border-black/10 bg-white pl-9 pr-3 text-sm outline-none focus:border-prime-gold"
              placeholder="Cari nama, group, kawasan"
            />
          </label>
          <MultiSelect label="Kawasan" icon="fa-location-dot" options={options.kawasan || []} value={filters.kawasan} onChange={(value) => updateFilter('kawasan', value)} />
          <MultiSelect label="Hadap" icon="fa-compass" options={options.hadap || []} value={filters.hadap} onChange={(value) => updateFilter('hadap', value)} />
          <MultiSelect label="Siap" icon="fa-key" options={options.siap || []} value={filters.siap} onChange={(value) => updateFilter('siap', value)} />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <FieldLabel label="Lebar min (m)">
            <input value={filters.lebarMin} onChange={(event) => updateFilter('lebarMin', event.target.value)} className="h-10 w-full rounded-md border border-black/10 px-3 text-sm outline-none focus:border-prime-gold" />
          </FieldLabel>
          <FieldLabel label="Harga max">
            <input value={filters.hargaMax} onChange={(event) => updateFilter('hargaMax', event.target.value.replace(/\D/g, ''))} className="h-10 w-full rounded-md border border-black/10 px-3 text-sm outline-none focus:border-prime-gold" />
          </FieldLabel>
          <SegmentedControl label="Tipe" options={['Semua', 'Ruko', 'Villa']} value={filters.tipe} onChange={(value) => updateFilter('tipe', value)} />
          <SegmentedControl label="Status" options={[{ value: 'Semua', label: 'Semua' }, { value: 'in_stock', label: 'In Stock' }, { value: 'sold_out', label: 'Sold Out' }]} value={filters.status} onChange={(value) => updateFilter('status', value)} />
          <SegmentedControl label="Carport" options={['Semua', 'Ya', 'Tidak']} value={filters.carport} onChange={(value) => updateFilter('carport', value)} />
          <FieldLabel label="Sort">
            <select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)} className="h-10 w-full rounded-md border border-black/10 px-3 text-sm outline-none focus:border-prime-gold">
              <option value="nama_property:asc">Nama A-Z</option>
              <option value="nama_property:desc">Nama Z-A</option>
              <option value="price:asc">Harga terendah</option>
              <option value="price:desc">Harga tertinggi</option>
              <option value="created_at:desc">Terbaru dibuat</option>
              <option value="status:asc">Status</option>
            </select>
          </FieldLabel>
        </div>

        {!!activeChips.length && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button
                type="button"
                key={`${chip.type}-${chip.raw}`}
                onClick={() => removeChip(chip.type, chip.raw)}
                className="rounded-full bg-prime-gold/20 px-3 py-1 text-xs font-bold text-prime-black hover:bg-prime-gold"
              >
                {chip.label}
                <i className="fa-solid fa-xmark ml-2" />
              </button>
            ))}
            <button type="button" onClick={resetFilters} className="rounded-full bg-prime-black px-3 py-1 text-xs font-bold text-white hover:bg-prime-red">
              Reset Filter
            </button>
          </div>
        )}
      </div>

      <div className="rounded-md border border-black/10 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 p-4">
          <p className="text-sm font-bold">{meta.total} properti ditemukan</p>
          <div className="flex items-center gap-2 text-sm">
            <span>Baris</span>
            <select value={filters.pageSize} onChange={(event) => updateFilter('pageSize', Number(event.target.value))} className="h-9 rounded-md border border-black/10 px-2">
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="table-scroll overflow-auto">
          <table className="min-w-[1280px] w-full text-left text-sm">
            <thead className="bg-prime-gray text-xs uppercase tracking-normal text-prime-black/60">
              <tr>
                {['Nama', 'Group', 'Lebar x Panjang', 'Hadap', 'Tipe', 'Tingkat', 'Harga', 'Carport', 'Status', 'Siap', 'Kawasan'].map((header) => (
                  <th key={header} className="px-4 py-3 font-black">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-prime-black/55">
                    <i className="fa-solid fa-spinner fa-spin mr-2 text-prime-gold" />
                    Memuat data
                  </td>
                </tr>
              ) : rows.map((property) => (
                <tr
                  key={property.id}
                  onClick={() => setSelected(property)}
                  className={`cursor-pointer border-t border-black/5 transition hover:bg-prime-gray ${
                    highlightId === property.id ? 'bg-prime-gold/20' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-bold">{property.nama_property}</td>
                  <td className="px-4 py-3 text-prime-black/65">{property.group || '-'}</td>
                  <td className="px-4 py-3">{property.lebar} x {property.panjang}</td>
                  <td className="px-4 py-3">{property.hadap.join(', ')}</td>
                  <td className="px-4 py-3">{property.tipe}</td>
                  <td className="px-4 py-3">{property.tingkat}</td>
                  <td className="px-4 py-3 font-bold">{formatRupiah(property.price)}</td>
                  <td className="px-4 py-3">{property.carport ? 'Ya' : 'Tidak'}</td>
                  <td className="px-4 py-3"><StatusBadge value={property.status} /></td>
                  <td className="px-4 py-3"><ReadyBadge value={property.siap} /></td>
                  <td className="px-4 py-3">{property.kawasan.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 p-4 text-sm">
          <p>Halaman {meta.page} dari {meta.totalPages}</p>
          <div className="flex gap-2">
            <button type="button" disabled={filters.page <= 1} onClick={() => updateFilter('page', filters.page - 1, false)} className="h-9 rounded-md border border-black/10 px-3 font-bold disabled:opacity-40">
              <i className="fa-solid fa-chevron-left" />
            </button>
            <button type="button" disabled={filters.page >= meta.totalPages} onClick={() => updateFilter('page', filters.page + 1, false)} className="h-9 rounded-md border border-black/10 px-3 font-bold disabled:opacity-40">
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>

      {formMode && (
        <Modal title={formMode.type === 'edit' ? 'Edit Properti' : 'Tambah Properti'} onClose={() => setFormMode(null)} width="max-w-4xl">
          <PropertyForm initialProperty={formMode.property} onCancel={() => setFormMode(null)} onSubmit={saveProperty} />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Konfirmasi Hapus" onClose={() => setDeleteTarget(null)} width="max-w-lg">
          <p className="text-sm leading-6">
            Yakin hapus properti <strong>{deleteTarget.nama_property}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => setDeleteTarget(null)} className="h-10 rounded-md border border-black/10 px-4 text-sm font-bold hover:bg-prime-gray">
              Batal
            </button>
            <button type="button" onClick={deleteProperty} className="h-10 rounded-md bg-prime-red px-4 text-sm font-black text-white hover:bg-prime-black">
              Hapus
            </button>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title="Detail Properti" onClose={() => setSelected(null)} width="max-w-5xl">
          <DetailPanel
            property={selected}
            isSuperadmin={isSuperadmin}
            onEdit={(property) => {
              setSelected(null);
              setFormMode({ type: 'edit', property });
            }}
            onDelete={(property) => {
              setSelected(null);
              setDeleteTarget(property);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function FieldLabel({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-normal text-prime-black/55">{label}</span>
      {children}
    </label>
  );
}

function DetailPanel({ property, isSuperadmin, onEdit, onDelete }) {
  if (!property) {
    return null;
  }

  const rows = [
    ['Nama', property.nama_property],
    ['Group', property.group || '-'],
    ['Ukuran', `${property.lebar} x ${property.panjang} m`],
    ['Hadap', property.hadap.join(', ')],
    ['Tipe', property.tipe],
    ['Tingkat', property.tingkat],
    ['Harga', formatRupiah(property.price)],
    ['Carport', property.carport ? 'Ya' : 'Tidak'],
    ['Status', statusLabel(property.status)],
    ['Siap', siapLabel(property.siap)],
    ['Kawasan', property.kawasan.join(', ')],
    ['Unit', property.unit || '-'],
    ['Dibuat', formatDate(property.created_at)],
    ['Diperbarui', formatDate(property.updated_at)]
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">{property.nama_property}</h2>
          <p className="mt-1 text-sm text-prime-black/55">{property.kawasan.join(', ')}</p>
        </div>
        {isSuperadmin && (
          <div className="flex gap-2">
            <button type="button" onClick={() => onEdit(property)} className="grid h-9 w-9 place-items-center rounded-md border border-black/10 hover:bg-prime-gray" aria-label="Edit">
              <i className="fa-solid fa-pen" />
            </button>
            <button type="button" onClick={() => onDelete(property)} className="grid h-9 w-9 place-items-center rounded-md bg-prime-red text-white hover:bg-prime-black" aria-label="Hapus">
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-md bg-prime-gray p-3">
            <dt className="text-xs font-bold uppercase tracking-normal text-prime-black/45">{label}</dt>
            <dd className="mt-1 font-bold">{value}</dd>
          </div>
        ))}
      </div>
      {property.maps_link && (
        <a
          href={property.maps_link}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex h-10 items-center rounded-md bg-prime-black px-4 text-sm font-black text-white hover:bg-prime-gold hover:text-prime-black"
        >
          <i className="fa-solid fa-map-location-dot mr-2" />
          Buka di Google Maps
        </a>
      )}
    </div>
  );
}
