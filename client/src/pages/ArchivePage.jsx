import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../utils/api.js';
import { formatDate, formatRupiah } from '../utils/formatters.js';

export default function ArchivePage() {
  const [items, setItems] = useState([]);
  const { pushToast } = useToast();

  async function loadArchive() {
    try {
      const data = await api('/properties/archive');
      setItems(data.items || []);
    } catch (error) {
      pushToast(error.message, 'error');
    }
  }

  useEffect(() => {
    loadArchive();
  }, []);

  async function restore(item) {
    try {
      await api(`/properties/${item.id}/restore`, { method: 'PATCH' });
      pushToast('Properti berhasil direstore.');
      loadArchive();
    } catch (error) {
      pushToast(error.message, 'error');
    }
  }

  return (
    <div className="rounded-md border border-black/10 bg-white p-4 shadow-soft">
      <h1 className="text-xl font-black">Arsip Properti</h1>
      <p className="text-sm text-prime-black/60">Properti soft delete tidak tampil di listing default.</p>
      <div className="mt-4 overflow-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-prime-gray text-xs uppercase tracking-normal text-prime-black/55">
            <tr>
              {['Nama', 'Kawasan', 'Harga', 'Dihapus', 'Aksi'].map((header) => (
                <th key={header} className="px-4 py-3 font-black">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-prime-black/55">Belum ada properti di arsip.</td>
              </tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-bold">{item.nama_property}</td>
                <td className="px-4 py-3">{item.kawasan.join(', ')}</td>
                <td className="px-4 py-3">{formatRupiah(item.price)}</td>
                <td className="px-4 py-3">{formatDate(item.deleted_at)}</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => restore(item)} className="h-9 rounded-md bg-prime-black px-3 text-xs font-black text-white hover:bg-prime-gold hover:text-prime-black">
                    <i className="fa-solid fa-rotate-left mr-2" />
                    Restore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
