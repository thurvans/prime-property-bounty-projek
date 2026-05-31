import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../utils/api.js';
import { formatDate } from '../utils/formatters.js';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const { pushToast } = useToast();

  async function loadLogs(page = 1) {
    try {
      const data = await api(`/audit-logs?page=${page}`);
      setLogs(data.items || []);
      setMeta(data.meta || { page: 1, totalPages: 1 });
    } catch (error) {
      pushToast(error.message, 'error');
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="rounded-md border border-black/10 bg-white p-4 shadow-soft">
      <h1 className="text-xl font-black">Audit Log</h1>
      <p className="text-sm text-prime-black/60">Riwayat perubahan data properti dan akun internal.</p>
      <div className="mt-4 overflow-auto">
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="bg-prime-gray text-xs uppercase tracking-normal text-prime-black/55">
            <tr>
              {['Waktu', 'Actor', 'Aksi', 'Entity', 'ID', 'Perubahan'].map((header) => (
                <th key={header} className="px-4 py-3 font-black">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-black/5 align-top">
                <td className="px-4 py-3">{formatDate(log.created_at)}</td>
                <td className="px-4 py-3">{log.actor_id}</td>
                <td className="px-4 py-3 font-bold">{log.action}</td>
                <td className="px-4 py-3">{log.entity}</td>
                <td className="px-4 py-3">{log.entity_id}</td>
                <td className="px-4 py-3">
                  <code className="block max-w-md overflow-hidden text-ellipsis rounded bg-prime-gray px-2 py-1 text-xs">
                    {log.changes ? Object.keys(log.changes).join(', ') : '-'}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <p>Halaman {meta.page} dari {meta.totalPages}</p>
        <div className="flex gap-2">
          <button type="button" disabled={meta.page <= 1} onClick={() => loadLogs(meta.page - 1)} className="h-9 rounded-md border border-black/10 px-3 font-bold disabled:opacity-40">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button type="button" disabled={meta.page >= meta.totalPages} onClick={() => loadLogs(meta.page + 1)} className="h-9 rounded-md border border-black/10 px-3 font-bold disabled:opacity-40">
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      </div>
    </div>
  );
}
