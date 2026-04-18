import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('autocerts-dark-mode') === 'true';
    setIsDarkMode(saved);
    document.documentElement.classList.toggle('dark-mode', saved);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const base = "flex items-center gap-2 py-1 rounded-2xl transition-colors";

  const activeClass = `${base} bg-yellow-400 text-slate-950 px-6`;
  const inactiveClass = `${base} bg-yellow-200 text-slate-950 hover:bg-yellow-300 px-6`;

  const activeDarkClass = `${base} bg-slate-900 text-white px-6`;
  const inactiveDarkClass = `${base} bg-slate-800 text-white hover:bg-slate-700 px-6`;

  const items = [];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSwitchAccount = () => {
    setMenuOpen(false);
    navigate('/signup');
  };

  const handleHistory = () => {
    setMenuOpen(false);
    navigate('/history');
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      window.localStorage.setItem('autocerts-dark-mode', next);
      document.documentElement.classList.toggle('dark-mode', next);
      return next;
    });
  };

  return (
    <div
      className={`m-0  px-4 py-4 transition-colors ${
        isDarkMode ? 'bg-slate-950 text-white' : 'bg-yellow-300 text-slate-950'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            AutoCerts
          </Link>
          <span className={`hidden text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} md:inline`}>
            Certificate builder
          </span>
        </div>

        <div className="relative" ref={menuRef}>
          {user ? (
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={`inline-flex items-center gap-3 rounded-full px-2 py-1 text-sm transition ${
                isDarkMode
                  ? 'bg-transparent text-white'
                  : 'bg-transparent text-slate-950'
              }`}
            >
              <span className="hidden sm:inline font-medium truncate max-w-40">
                {user.displayName}
              </span>
              <img
                src={user.photoURL}
                alt={user.displayName || 'Profile'}
                className="h-10 w-10 rounded-full object-cover"
              />
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
            >
              Sign in
            </Link>
          )}

          {menuOpen && user && (
            <div
              className={`absolute right-0 z-30 mt-3 min-w-56 overflow-hidden rounded-2xl border p-1 shadow-lg ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-900 text-slate-100'
                  : 'border-yellow-400 bg-yellow-50 text-slate-950'
              }`}
            >
              <button
                type="button"
                onClick={handleSwitchAccount}
                className={`w-full rounded-xl px-4 py-3 text-left transition ${
                  isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-yellow-100'
                }`}
              >
                Switch account
              </button>

              <div
                className={`flex items-center justify-between rounded-xl px-4 py-3 transition ${
                  isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-yellow-100'
                }`}
              >
                <span>Dark mode</span>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition ${
                    isDarkMode ? 'bg-emerald-500' : 'bg-yellow-400'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={handleHistory}
                className={`w-full rounded-xl px-4 py-3 text-left transition ${
                  isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-yellow-100'
                }`}
              >
                History
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className={`w-full rounded-xl px-4 py-3 text-left font-medium transition ${
                  isDarkMode
                    ? 'text-rose-300 hover:bg-slate-800'
                    : 'text-red-600 hover:bg-yellow-100'
                }`}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
