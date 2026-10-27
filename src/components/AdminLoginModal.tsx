import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User, AlertCircle, LogIn } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Restricted credentials known only to administrator
    if (
      (cleanUser === 'pangling' || cleanUser === 'admin@pangling.com' || cleanUser === 'admin' || cleanUser === 'barberpangling@gmail.com') &&
      (cleanPass === 'pangling10' || cleanPass === 'pangling123')
    ) {
      onLoginSuccess('pangling');
      onClose();
      return;
    }

    setError('Username atau sandi admin salah. Periksa kembali data login Anda.');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        onLoginSuccess(user.email);
        onClose();
      }
    } catch (err: any) {
      console.warn('Google sign-in popup error or cancelled:', err);
      setError('Login Google dibatalkan atau dibatasi browser. Silakan gunakan Username & Sandi admin di form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header - Black & White */}
        <div className="bg-black text-white px-5 py-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold tracking-wide">Portal Admin & Kasir</h3>
              <p className="text-[11px] text-neutral-400">Pangling Hairstudio Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 bg-white text-neutral-900">
          {/* Form Login Sandi */}
          <form onSubmit={handlePasswordLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Username / Akun Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none text-sm text-neutral-900 bg-neutral-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Sandi / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none text-sm text-neutral-900 bg-neutral-50"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Black button */}
            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-white" />
              Masuk Dashboard Admin
            </button>
          </form>

          {/* Separator */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-neutral-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase tracking-wider text-neutral-400 font-bold absolute">
              atau login google
            </span>
          </div>

          {/* Quick Google Sign In - Black & White button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 border border-neutral-300 hover:border-black rounded-xl text-neutral-800 font-semibold text-xs flex items-center justify-center gap-2.5 transition shadow-sm hover:bg-neutral-50"
          >
            <ShieldCheck className="w-4 h-4 text-black" />
            Masuk dengan Akun Google Resmi
          </button>
        </div>
      </div>
    </div>
  );
};
