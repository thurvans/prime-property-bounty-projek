import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/agent/properties" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      pushToast('Login berhasil.');
      navigate('/agent/properties', { replace: true });
    } catch (error) {
      pushToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#F5F5F5_0%,#FFFFFF_48%,#F7EED7_100%)] text-prime-black">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="w-full max-w-[430px] rounded-md border border-black/10 bg-white/95 p-6 shadow-soft sm:p-7"
        >
          <div className="mb-7 flex items-center justify-between gap-4 border-b border-black/10 pb-5">
            <img src="/logo/prime-horizontal.png" alt="Prime Property" className="h-14 w-auto max-w-[220px] object-contain" />
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-prime-black text-white">
              <i className="fa-solid fa-lock" />
            </span>
          </div>

          <h1 className="text-2xl font-black">Login Agent</h1>
          <p className="mt-2 text-sm leading-6 text-prime-black/60">Masuk ke portal internal untuk mengelola listing Prime Property.</p>

          <label className="mt-6 block">
            <span className="mb-1 block text-sm font-bold">Email</span>
            <input
              type="email"
              value={form.email}
              autoComplete="off"
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-prime-gold focus:ring-2 focus:ring-prime-gold/20"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-bold">Password</span>
            <input
              type="password"
              value={form.password}
              autoComplete="new-password"
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-prime-gold focus:ring-2 focus:ring-prime-gold/20"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 h-11 w-full rounded-md bg-prime-black text-sm font-black text-white transition hover:bg-prime-gold hover:text-prime-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className={`fa-solid ${submitting ? 'fa-spinner fa-spin' : 'fa-right-to-bracket'} mr-2`} />
            Masuk
          </button>
        </form>
      </section>
    </main>
  );
}
