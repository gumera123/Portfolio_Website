import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfigError } from '../lib/supabase';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState(supabaseConfigError ? 'unconfigured' : 'checking');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError(`Could not restore the sign-in session: ${sessionError.message}`);
        setStatus('error');
        return;
      }
      setSession(data.session);
      setStatus(data.session ? 'checking' : 'signed-out');
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setError('');
      setStatus(nextSession ? 'checking' : 'signed-out');
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session) return undefined;

    let active = true;
    setStatus('checking');
    supabase
      .from('portfolio_admins')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data, error: adminError }) => {
        if (!active) return;
        if (adminError) {
          setError(`Could not verify admin access: ${adminError.message}`);
          setStatus('error');
          return;
        }
        setStatus(data ? 'admin' : 'denied');
      });

    return () => {
      active = false;
    };
  }, [session]);

  const signIn = async (credentials) => {
    if (!supabase) return { error: new Error(supabaseConfigError) };
    setError('');
    const result = await supabase.auth.signInWithPassword(credentials);
    if (result.error) {
      setError(`Sign-in failed: ${result.error.message}`);
      return result;
    }
    return result;
  };

  const signOut = async () => {
    if (!supabase) return { error: new Error(supabaseConfigError) };
    const result = await supabase.auth.signOut();
    if (result.error) setError(`Sign-out failed: ${result.error.message}`);
    return result;
  };

  return (
    <AdminAuthContext.Provider
      value={{ session, status, error, setError, signIn, signOut, isAdmin: status === 'admin' }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used inside AdminAuthProvider.');
  return context;
}
