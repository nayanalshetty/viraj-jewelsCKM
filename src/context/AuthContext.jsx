import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const {
        data,
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error(
          "Unable to get admin session:",
          error
        );
      }

      if (mounted) {
        setUser(data?.session?.user || null);
        setLoading(false);
      }
    };

    getSession();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;

      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (
    email,
    password
  ) => {
    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(
        error.message ||
          "Unable to sign in."
      );
    }

    setUser(data?.user || null);

    return data?.user || null;
  };

  const logout = async () => {
    const {
      error,
    } = await supabase.auth.signOut();

    if (error) {
      console.error(
        "Unable to logout:",
        error
      );

      throw new Error(
        error.message
      );
    }

    setUser(null);
  };

  const value = {
    user,
    loading,
    isAdmin: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}