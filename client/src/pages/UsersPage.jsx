import { useEffect, useState } from 'react';
import Modal from '../components/Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../utils/api.js';
import { formatDate } from '../utils/formatters.js';

const emptyForm = { name: '', email: '', password: '', role: 'admin' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newPassword, setNewPassword] = useState('');
  const { pushToast } = useToast();

  async function loadUsers() {
    try {
      const data = await api('/users');
      setUsers(data.items || []);
    } catch (error) {
      pushToast(error.message, 'error');
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function createUser(event) {
    event.preventDefault();
    try {
      await api('/users', { method: 'POST', body: form });
      pushToast('Akun admin berhasil dibuat.');
      setForm(emptyForm);
      setFormOpen(false);
      loadUsers();
    } catch (error) {
      pushToast(error.message, 'error');
    }
  }

  async function updateStatus(user, enabled) {
    try {
      await api(`/users/${user.id}/status`, { method: 'PATCH', body: { enabled } });
      pushToast(enabled ? 'Akun berhasil diaktifkan.' : 'Akun berhasil dinonaktifkan.');
      loadUsers();
    } catch (error) {
      pushToast(error.message, 'error');
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    try {
      await api(`/users/${resetTarget.id}/reset-password`, { method: 'PATCH', body: { password: newPassword } });
      pushToast('Password admin berhasil direset.');
      setResetTarget(null);
      setNewPassword('');
      loadUsers();
    } catch (error) {
      pushToast(error.message, 'error');
    }
  }

  return (
    <div className="rounded-md border border-black/10 bg-white p-4 shadow-soft">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black">Akun Admin</h1>
          <p className="text-sm text-prime-black/60">Kelola akun internal yang dibuat manual oleh superadmin.</p>
        </div>
        <button type="button" onClick={() => setFormOpen(true)} className="h-10 rounded-md bg-prime-black px-4 text-sm font-black text-white hover:bg-prime-gold hover:text-prime-black">
          <i className="fa-solid fa-user-plus mr-2" />
          Tambah Admin
        </button>
      </div>

      <div className="mt-4 overflow-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-prime-gray text-xs uppercase tracking-normal text-prime-black/55">
            <tr>
              {['Nama', 'Email', 'Role', 'Status', 'Dibuat', 'Aksi'].map((header) => (
                <th key={header} className="px-4 py-3 font-black">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-bold">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-1 text-xs font-bold ${user.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-prime-red text-white'}`}>
                    {user.enabled ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => updateStatus(user, !user.enabled)} className="grid h-9 w-9 place-items-center rounded-md border border-black/10 hover:bg-prime-gray" aria-label="Ubah status">
                      <i className={`fa-solid ${user.enabled ? 'fa-user-slash' : 'fa-user-check'}`} />
                    </button>
                    <button type="button" onClick={() => setResetTarget(user)} className="grid h-9 w-9 place-items-center rounded-md border border-black/10 hover:bg-prime-gray" aria-label="Reset password">
                      <i className="fa-solid fa-key" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <Modal title="Tambah Akun Admin" onClose={() => setFormOpen(false)} width="max-w-xl">
          <form onSubmit={createUser} className="grid gap-4">
            <Input label="Nama" value={form.name} onChange={(value) => setForm((state) => ({ ...state, name: value }))} />
            <Input label="Email" value={form.email} onChange={(value) => setForm((state) => ({ ...state, email: value }))} />
            <Input label="Password" type="password" value={form.password} onChange={(value) => setForm((state) => ({ ...state, password: value }))} />
            <label className="block">
              <span className="mb-1 block text-sm font-bold">Role</span>
              <select value={form.role} onChange={(event) => setForm((state) => ({ ...state, role: event.target.value }))} className="h-10 w-full rounded-md border border-black/10 px-3 text-sm">
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </label>
            <button type="submit" className="h-10 rounded-md bg-prime-black px-4 text-sm font-black text-white hover:bg-prime-gold hover:text-prime-black">
              Simpan
            </button>
          </form>
        </Modal>
      )}

      {resetTarget && (
        <Modal title={`Reset Password ${resetTarget.name}`} onClose={() => setResetTarget(null)} width="max-w-xl">
          <form onSubmit={resetPassword} className="grid gap-4">
            <Input label="Password Baru" type="password" value={newPassword} onChange={setNewPassword} />
            <button type="submit" className="h-10 rounded-md bg-prime-black px-4 text-sm font-black text-white hover:bg-prime-gold hover:text-prime-black">
              Reset Password
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-black/10 px-3 text-sm outline-none focus:border-prime-gold" />
    </label>
  );
}
