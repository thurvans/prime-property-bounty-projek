import { useState } from 'react';
import { api } from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';

const initialForm = {
  nama: '',
  email: '',
  nomor_hp: '',
  pesan: ''
};

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToast();

  function validate() {
    const next = {};
    if (!form.nama.trim()) next.nama = 'Nama wajib diisi.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Email harus valid.';
    if (form.nomor_hp.replace(/\D/g, '').length < 10) next.nomor_hp = 'Nomor HP minimum 10 digit.';
    if (!form.pesan.trim()) next.pesan = 'Pesan wajib diisi.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = await api('/contact', { method: 'POST', body: form });
      pushToast(data.message || 'Pesan terkirim, tim kami akan menghubungi Anda.');
      setForm(initialForm);
    } catch (error) {
      pushToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-prime-gray py-14">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <aside className="reveal rounded-md bg-prime-black p-6 text-white">
          <p className="text-sm font-bold uppercase tracking-normal text-prime-gold">Kontak</p>
          <h1 className="mt-3 text-3xl font-black">Bicarakan kebutuhan properti Anda.</h1>
          <div className="mt-8 grid gap-4 text-sm text-white/75">
            <p><i className="fa-solid fa-location-dot mr-3 text-prime-gold" />Jl. Prime Property, Medan, Sumatera Utara</p>
            <p><i className="fa-solid fa-phone mr-3 text-prime-gold" />+62 812-0000-2026</p>
            <p><i className="fa-solid fa-envelope mr-3 text-prime-gold" />halo@primeproperty.id</p>
            <a href="https://wa.me/6281200002026" target="_blank" rel="noreferrer" className="font-bold text-prime-gold hover:text-white">
              <i className="fa-brands fa-whatsapp mr-3" />WhatsApp Prime Property
            </a>
          </div>
          <div className="mt-8 overflow-hidden rounded-md border border-white/10">
            <iframe
              title="Lokasi Prime Property"
              src="https://maps.google.com/maps?q=Medan%20Sumatera%20Utara&t=&z=12&ie=UTF8&iwloc=&output=embed"
              className="h-56 w-full border-0"
              loading="lazy"
            />
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="reveal rounded-md border border-black/10 bg-white p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama" error={errors.nama}>
              <input
                value={form.nama}
                onChange={(event) => setForm((current) => ({ ...current, nama: event.target.value }))}
                className="h-11 w-full rounded-md border border-black/10 px-3 outline-none focus:border-prime-gold"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="h-11 w-full rounded-md border border-black/10 px-3 outline-none focus:border-prime-gold"
              />
            </Field>
            <Field label="Nomor HP" error={errors.nomor_hp}>
              <input
                value={form.nomor_hp}
                onChange={(event) => setForm((current) => ({ ...current, nomor_hp: event.target.value }))}
                className="h-11 w-full rounded-md border border-black/10 px-3 outline-none focus:border-prime-gold"
              />
            </Field>
            <Field label="Pesan" error={errors.pesan} className="sm:col-span-2">
              <textarea
                value={form.pesan}
                onChange={(event) => setForm((current) => ({ ...current, pesan: event.target.value }))}
                rows={6}
                className="w-full rounded-md border border-black/10 px-3 py-3 outline-none focus:border-prime-gold"
              />
            </Field>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-5 h-11 rounded-md bg-prime-black px-5 text-sm font-black text-white transition hover:bg-prime-gold hover:text-prime-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className={`fa-solid ${submitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'} mr-2`} />
            Kirim Pesan
          </button>
        </form>
      </div>
    </section>
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
