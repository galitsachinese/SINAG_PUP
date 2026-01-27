import { createContext, useContext, useEffect, useRef, useState } from 'react';

const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* =========================
   AUTH PROVIDER
========================= */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on refresh
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          // 🔥 Token invalid or expired
          localStorage.removeItem('token');
          setUser(null);
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => {}) // optional logging
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     AUTH ACTIONS
  ========================= */
  const login = async (token) => {
    localStorage.setItem('token', token);

    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      localStorage.removeItem('token');
      throw new Error('Invalid login token');
    }

    const data = await res.json();
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('moaWarningShown'); // Clear MOA warning flag on logout
    sessionStorage.removeItem('passwordReminderShown'); // Clear password reminder flag on logout
    setUser(null);
  };

  /* =========================
     FORGOT PASSWORD
  ========================= */
  const sendResetCode = async (email) => {
    const res = await fetch(`${API_BASE}/api/forgot-password/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send code');
    return data;
  };

  const verifyResetCode = async (email, code) => {
    const res = await fetch(`${API_BASE}/api/forgot-password/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid or expired code');
    return data;
  };

  const resetPassword = async (email, code, newPassword) => {
    const res = await fetch(`${API_BASE}/api/forgot-password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reset password');
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,

        // 🔐 Forgot password
        sendResetCode,
        verifyResetCode,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================
   HOOKS
========================= */
export const useAuth = () => useContext(AuthContext);

/* =========================
   INACTIVITY LOGOUT HOOK
========================= */
export const useInactivityLogout = (timeoutMinutes = 5) => {
  const { logout } = useAuth();
  const timeoutRef = useRef(null);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(
      () => {
        logout();
      },
      timeoutMinutes * 60 * 1000,
    );
  };

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [logout]);
};
