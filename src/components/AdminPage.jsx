import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { supabaseConfigError } from '../lib/supabase';

export default function AdminPage() {
  const { status, session, error, signIn, signOut } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'admin') return <Navigate to="/" replace />;

  const handleSignIn = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    await signIn({ email, password });
    setPassword('');
    setSubmitting(false);
  };

  if (status === 'checking') {
    return (
      <AdminShell>
        <AdminHeader />
        <section className="admin-card admin-login"><p>Checking admin access…</p></section>
      </AdminShell>
    );
  }

  if (status === 'unconfigured') {
    return (
      <AdminShell>
        <AdminHeader />
        <section className="admin-card admin-login">
          <ShieldCheck size={30} />
          <h1>Connect your portfolio</h1>
          <p>{supabaseConfigError}</p>
          <p>Set the Supabase project URL and publishable/anon key, then restart the site.</p>
        </section>
      </AdminShell>
    );
  }

  if (session && (status === 'denied' || status === 'error')) {
    return (
      <AdminShell>
        <AdminHeader />
        <section className="admin-card admin-login">
          <ShieldCheck size={30} />
          <h1>Admin access required</h1>
          <p>This signed-in account is not listed as an admin for this portfolio.</p>
          {error && <p className="admin-alert" role="alert">{error}</p>}
          <button className="admin-button" type="button" onClick={signOut}>
            <LogOut size={17} /> Sign out
          </button>
        </section>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <AdminHeader />
      <form className="admin-card admin-login" onSubmit={handleSignIn}>
        <ShieldCheck size={30} />
        <p className="admin-kicker">PRIVATE AREA</p>
        <h1>Admin sign in</h1>
        <p>After signing in, you will see the public portfolio with editing controls.</p>
        <label>
          Email
          <input
            autoComplete="username"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="admin-alert" role="alert">{error}</p>}
        <button className="admin-button primary" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AdminShell>
  );
}

function AdminShell({ children }) {
  return <div className="admin-shell">{children}</div>;
}

function AdminHeader() {
  return (
    <header className="admin-topbar">
      <Link to="/" className="admin-back"><ArrowLeft size={17} /> View portfolio</Link>
    </header>
  );
}
