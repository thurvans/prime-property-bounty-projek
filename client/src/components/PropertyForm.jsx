import { useMemo, useState } from 'react';
import { formatRupiah, toNumberInput } from '../utils/formatters.js';

const emptyForm = {
  nama_property: '',
  group: '',
  lebar: '',
  panjang: '',
  hadap: ['Utara'],
  tipe: 'Ruko',
  tingkat: 1,
  price: '',
  carport: false,
  status: 'in_stock',
  siap: 'siap_huni',
  maps_link: 'https://www.google.com/maps/search/?api=1&query=Prime+Property+Medan',
  kawasan: '',
  unit: '',
  highlighted: false
};

function fromProperty(property) {
  if (!property) return emptyForm;
  return {
    ...emptyForm,
    ...property,
    kawasan: property.kawasan?.join(', ') || '',
    group: property.group || '',
    unit: property.unit || ''
  };
}

function normalize(form) {
  return {
    nama_property: form.nama_property.trim(),
    group: form.group.trim() || null,
    lebar: Number(form.lebar),
    panjang: Number(form.panjang),
    hadap: form.hadap,
    tipe: form.tipe,
    tingkat: Number(form.tingkat),
    price: Number(form.price),
    carport: Boolean(form.carport),
    status: form.status,
    siap: form.siap,
    maps_link: form.maps_link.trim(),
    kawasan: form.kawasan
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    unit: form.unit.trim() || null,
    highlighted: Boolean(form.highlighted)
  };
}

export default function PropertyForm({ initialProperty, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => fromProperty(initialProperty));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const original = useMemo(() => normalize(fromProperty(initialProperty)), [initialProperty]);
  const current = useMemo(() => normalize(form), [form]);
  const dirty = JSON.stringify(original) !== JSON.stringify(current);

  function setField(name, value) {
    setForm((state) => ({ ...state, [name]: value }));
  }

  function toggleHadap(value) {
    setForm((state) => {
      const selected = new Set(state.hadap);
      if (selected.has(value)) selected.delete(value);
      else selected.add(value);
      return { ...state, hadap: selected.size ? [...selected] : [value] };
    });
  }

  function validate(payload) {
    const next = {};
    if (payload.nama_property.length < 3 || payload.nama_property.length > 100) next.nama_property = 'Nama 3-100 karakter.';
    if (!(payload.lebar > 0) || !/^\d+(\.\d{1,2})?$/.test(String(form.lebar))) next.lebar = 'Lebar > 0, maksimal 2 desimal.';
    if (!(payload.panjang > 0) || !/^\d+(\.\d{1,2})?$/.test(String(form.panjang))) next.panjang = 'Panjang > 0, maksimal 2 desimal.';
    if (!(payload.price > 0) || !Number.isInteger(payload.price)) next.price = 'Harga wajib integer rupiah.';
    if (payload.tingkat < 1 || payload.tingkat > 10 || !/^\d+(\.\d{1})?$/.test(String(form.tingkat))) next.tingkat = 'Tingkat 1-10, maksimal 1 desimal.';
    if (!payload.maps_link.includes('google.com/maps')) next.maps_link = 'Link wajib domain google.com/maps.';
    if (!payload.kawasan.length) next.kawasan = 'Isi minimal satu kawasan.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event, keepOpen = false) {
    event.preventDefault();
    const payload = normalize(form);
    if (!validate(payload)) return;
    setSaving(true);
    try {
      await onSubmit(payload, keepOpen);
      if (keepOpen && !initialProperty) setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = (name) =>
    `h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-prime-gold ${
      errors[name] ? 'border-prime-red' : initialProperty && JSON.stringify(original[name]) !== JSON.stringify(current[name]) ? 'border-prime-gold bg-prime-gold/10' : 'border-black/10'
    }`;

  return (
    <form onSubmit={submit}>
      {initialProperty && dirty && (
        <p className="mb-4 rounded-md bg-prime-gold/20 px-3 py-2 text-sm font-bold text-prime-black">
          <i className="fa-solid fa-pen-to-square mr-2" />
          Ada perubahan yang belum disimpan.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama Properti" error={errors.nama_property}>
          <input className={inputClass('nama_property')} value={form.nama_property} onChange={(event) => setField('nama_property', event.target.value)} />
        </Field>
        <Field label="Group" error={errors.group}>
          <input className={inputClass('group')} value={form.group} onChange={(event) => setField('group', event.target.value)} />
        </Field>
        <Field label="Lebar (m)" error={errors.lebar}>
          <input className={inputClass('lebar')} value={form.lebar} onChange={(event) => setField('lebar', event.target.value)} />
        </Field>
        <Field label="Panjang (m)" error={errors.panjang}>
          <input className={inputClass('panjang')} value={form.panjang} onChange={(event) => setField('panjang', event.target.value)} />
        </Field>
        <Field label="Hadap">
          <div className="grid grid-cols-4 gap-2">
            {['Utara', 'Selatan', 'Timur', 'Barat'].map((item) => (
              <label key={item} className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-black/10 text-sm">
                <input type="checkbox" checked={form.hadap.includes(item)} onChange={() => toggleHadap(item)} className="accent-prime-gold" />
                {item}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Tipe">
          <select className={inputClass('tipe')} value={form.tipe} onChange={(event) => setField('tipe', event.target.value)}>
            <option>Ruko</option>
            <option>Villa</option>
          </select>
        </Field>
        <Field label="Tingkat" error={errors.tingkat}>
          <input className={inputClass('tingkat')} value={form.tingkat} onChange={(event) => setField('tingkat', event.target.value)} />
        </Field>
        <Field label="Harga" error={errors.price}>
          <input
            className={inputClass('price')}
            value={form.price ? formatRupiah(form.price) : ''}
            onChange={(event) => setField('price', toNumberInput(event.target.value))}
          />
        </Field>
        <Field label="Status">
          <select className={inputClass('status')} value={form.status} onChange={(event) => setField('status', event.target.value)}>
            <option value="in_stock">In Stock</option>
            <option value="sold_out">Sold Out</option>
          </select>
        </Field>
        <Field label="Siap">
          <select className={inputClass('siap')} value={form.siap} onChange={(event) => setField('siap', event.target.value)}>
            <option value="siap_huni">Siap Huni</option>
            <option value="siap_kosong">Siap Kosong</option>
            <option value="siap_huni_renovasi">Siap Huni Renovasi</option>
          </select>
        </Field>
        <Field label="Kawasan" error={errors.kawasan}>
          <input className={inputClass('kawasan')} value={form.kawasan} onChange={(event) => setField('kawasan', event.target.value)} />
        </Field>
        <Field label="Unit">
          <input className={inputClass('unit')} value={form.unit} onChange={(event) => setField('unit', event.target.value)} />
        </Field>
        <Field label="Maps Link" error={errors.maps_link} className="sm:col-span-2">
          <input className={inputClass('maps_link')} value={form.maps_link} onChange={(event) => setField('maps_link', event.target.value)} />
        </Field>
        <label className="flex h-10 items-center gap-3 rounded-md border border-black/10 px-3 text-sm font-bold">
          <input type="checkbox" checked={form.carport} onChange={(event) => setField('carport', event.target.checked)} className="accent-prime-gold" />
          Carport
        </label>
        <label className="flex h-10 items-center gap-3 rounded-md border border-black/10 px-3 text-sm font-bold">
          <input type="checkbox" checked={form.highlighted} onChange={(event) => setField('highlighted', event.target.checked)} className="accent-prime-gold" />
          Properti unggulan
        </label>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="h-10 rounded-md border border-black/10 px-4 text-sm font-bold hover:bg-prime-gray">
          Batal
        </button>
        {!initialProperty && (
          <button
            type="button"
            onClick={(event) => submit(event, true)}
            disabled={saving}
            className="h-10 rounded-md border border-prime-gold px-4 text-sm font-bold text-prime-black hover:bg-prime-gold disabled:opacity-60"
          >
            Simpan & Tambah Lagi
          </button>
        )}
        <button type="submit" disabled={saving} className="h-10 rounded-md bg-prime-black px-4 text-sm font-black text-white hover:bg-prime-gold hover:text-prime-black disabled:opacity-60">
          <i className={`fa-solid ${saving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'} mr-2`} />
          Simpan
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-prime-red">{error}</span>}
    </label>
  );
}
