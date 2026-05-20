import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, session, isLoading, setUser, setSession, logout, initialize, setLoading } = useAuthStore();
  const [error, setError] = useState(null);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          initialize(session.user, session);
        } else {
          initialize(null, null);
        }
      }
    );

    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        initialize(session.user, session);
      } else {
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, [initialize, setLoading]);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        setError(authError.message);
        toast.error(authError.message);
        return { error: authError };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        toast.success('Login successful');
      }
      return { data };
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      toast.error(message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        setError(authError.message);
        toast.error(authError.message);
        return { error: authError };
      }

      toast.success('Signup successful! Check your email to confirm.');
      return { data };
    } catch (err) {
      const message = err.message || 'Signup failed';
      setError(message);
      toast.error(message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (authError) {
        setError(authError.message);
        toast.error(authError.message);
        return { error: authError };
      }

      return { data };
    } catch (err) {
      const message = err.message || 'Google login failed';
      setError(message);
      toast.error(message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error: authError } = await supabase.auth.signOut();
      
      if (authError) {
        toast.error(authError.message);
        return { error: authError };
      }

      logout();
      toast.success('Logged out successfully');
      return { success: true };
    } catch (err) {
      const message = err.message || 'Logout failed';
      toast.error(message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    isLoading,
    error,
    login,
    signup,
    logout: handleLogout,
    loginWithGoogle,
  };
};
