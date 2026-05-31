import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { formatRupiah, siapLabel } from '../utils/formatters.js';
import { StatusBadge } from '../components/StatusBadge.jsx';

const fallbackHighlights = [];

export default function LandingPage() {
  const [properties, setProperties] = useState(fallbackHighlights);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/properties/public')
      .then((data) => setProperties(data.items || []))
      .catch(() => setProperties(fallbackHighlights))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bg-prime-black text-white">
        <div className="mx-auto grid min-h-[74vh] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="reveal">
            <p className="mb-4 text-sm font-bold uppercase tracking-normal text-prime-gold">Prime Property Medan</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Listing properti ringkas untuk keputusan yang lebih cepat.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72">
              Ruko dan villa pilihan dengan data ukuran, kawasan, status, dan kesiapan unit yang mudah dibaca oleh calon pembeli.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#properti"
                className="rounded-md bg-prime-gold px-5 py-3 text-sm font-black text-prime-black transition hover:bg-white"
              >
                <i className="fa-solid fa-building mr-2" />
                Lihat Properti
              </a>
              <Link
                to="/contact"
                className="rounded-md border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-prime-gold hover:text-prime-gold"
              >
                <i className="fa-brands fa-whatsapp mr-2" />
                Hubungi Kami
              </Link>
            </div>
          </div>
          <div className="reveal relative flex items-center justify-center lg:justify-end">
            <div className="absolute h-44 w-44 rounded-full border border-prime-gold/25" />
            <img src="/logo/prime-full.png" alt="Prime Property" className="relative w-full max-w-[420px] object-contain" />
          </div>
        </div>
      </section>

      <section id="properti" className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-prime-gold">Properti Unggulan</p>
              <h2 className="mt-2 text-2xl font-black">Pilihan unit yang siap ditinjau</h2>
            </div>
            <Link to="/contact" className="text-sm font-bold text-prime-red hover:underline">
              Jadwalkan konsultasi <i className="fa-solid fa-arrow-right ml-1" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading && (
              <div className="rounded-md border border-black/10 bg-white p-5 text-sm font-semibold text-prime-black/55 shadow-soft md:col-span-2 xl:col-span-3">
                <i className="fa-solid fa-spinner fa-spin mr-2 text-prime-gold" />
                Memuat properti unggulan
              </div>
            )}
            {!loading && properties.length === 0 && (
              <div className="rounded-md border border-black/10 bg-white p-5 text-sm font-semibold text-prime-black/55 shadow-soft md:col-span-2 xl:col-span-3">
                Belum ada properti publik yang bisa ditampilkan.
              </div>
            )}
            {!loading && properties.slice(0, 6).map((property) => (
              <article key={property.id} className="rounded-md border border-black/10 bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black">{property.nama_property}</h3>
                    <p className="mt-1 text-sm text-prime-black/60">{property.group || 'Prime Property'} - {property.kawasan?.join(', ')}</p>
                  </div>
                  <StatusBadge value={property.status} />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-prime-black/50">Ukuran</dt>
                    <dd className="font-bold">{property.lebar} x {property.panjang} m</dd>
                  </div>
                  <div>
                    <dt className="text-prime-black/50">Tipe</dt>
                    <dd className="font-bold">{property.tipe}</dd>
                  </div>
                  <div>
                    <dt className="text-prime-black/50">Siap</dt>
                    <dd className="font-bold">{siapLabel(property.siap)}</dd>
                  </div>
                  <div>
                    <dt className="text-prime-black/50">Harga</dt>
                    <dd className="font-bold">{formatRupiah(property.price)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-prime-gray py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['fa-magnifying-glass-location', 'Data mudah ditemukan', 'Listing disusun ringkas dengan kawasan, dimensi, status, dan kesiapan unit.'],
              ['fa-handshake', 'Pendampingan jelas', 'Tim membantu memahami kebutuhan, budget, dan pilihan area sebelum kunjungan.'],
              ['fa-shield-halved', 'Informasi terpercaya', 'Setiap unit dicatat dengan format data yang konsisten untuk mengurangi miskomunikasi.'],
              ['fa-map-location-dot', 'Fokus area strategis', 'Pilihan ruko dan villa di titik berkembang sekitar Medan dan sekitarnya.']
            ].map(([icon, title, body]) => (
              <div key={title} className="reveal rounded-md border border-black/10 bg-white p-5">
                <i className={`fa-solid ${icon} text-2xl text-prime-gold`} />
                <h3 className="mt-4 font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-prime-black/65">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-prime-black py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo/prime-horizontal.png" alt="Prime Property" className="h-10 w-auto max-w-[150px] object-contain" />
            <p className="text-sm text-white/60">Property listing & internal agent portal.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/75">
            <span><i className="fa-solid fa-phone mr-2 text-prime-gold" />+62 812-0000-2026</span>
            <span><i className="fa-solid fa-envelope mr-2 text-prime-gold" />halo@primeproperty.id</span>
            <Link to="/about" className="hover:text-prime-gold">About Us</Link>
            <Link to="/contact" className="hover:text-prime-gold">Contact Us</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
