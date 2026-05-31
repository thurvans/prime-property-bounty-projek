export default function AboutPage() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <div className="reveal">
          <p className="text-sm font-bold uppercase tracking-normal text-prime-gold">Tentang Kami</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Prime Property membantu calon pembeli membaca peluang properti dengan lebih tenang.</h1>
          <p className="mt-5 leading-7 text-prime-black/70">
            Prime Property berfokus pada pemasaran ruko dan villa dengan informasi yang jelas, ringkas, dan mudah diverifikasi. Kami percaya keputusan properti yang baik dimulai dari data yang rapi: lokasi, ukuran, orientasi bangunan, status stok, kesiapan unit, dan harga.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-md border border-black/10 bg-prime-gray p-5">
              <i className="fa-solid fa-bullseye text-xl text-prime-red" />
              <h2 className="mt-3 font-black">Visi</h2>
              <p className="mt-2 text-sm leading-6 text-prime-black/65">
                Menjadi partner properti yang dipercaya karena konsisten memberi informasi akurat dan pengalaman konsultasi yang efisien.
              </p>
            </div>
            <div className="rounded-md border border-black/10 bg-prime-gray p-5">
              <i className="fa-solid fa-route text-xl text-prime-gold" />
              <h2 className="mt-3 font-black">Misi</h2>
              <p className="mt-2 text-sm leading-6 text-prime-black/65">
                Menghubungkan pembeli dengan listing yang relevan, menjaga data tetap terstruktur, dan mendampingi proses survei hingga keputusan.
              </p>
            </div>
          </div>
        </div>
        <aside className="reveal rounded-md bg-prime-black p-8 text-white">
          <img src="/logo/prime-mark.png" alt="Prime Property" className="h-20 w-20 object-contain" />
          <blockquote className="mt-8 text-2xl font-black leading-snug">
            Properti bukan hanya soal unit yang tersedia, tetapi soal informasi yang membuat keputusan terasa jelas.
          </blockquote>
          <div className="mt-8 grid gap-3 text-sm text-white/75">
            {['Integritas data listing', 'Respons cepat dan terarah', 'Konsultasi berbasis kebutuhan', 'Fokus pada kawasan potensial'].map((item) => (
              <p key={item}>
                <i className="fa-solid fa-check mr-2 text-prime-gold" />
                {item}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
