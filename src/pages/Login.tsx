import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../lib/auth';
import { apiFetch } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const data = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, timezone }),
      });

      // Extract token from various possible response shapes
      const token =
        data?.data?.auth?.accessToken ??
        data?.data?.accessToken ??
        data?.data?.token ??
        data?.accessToken ??
        data?.token ??
        null;

      if (!token) throw new Error('No access token returned from server.');

      setToken(token);

      // Extract and store user info
      const userObj = data?.data?.user ?? data?.user ?? {};
      const userId = String(userObj?.id ?? userObj?._id ?? data?.data?.profile?.id ?? '').trim();
      const name =
        userObj?.name ??
        [userObj?.firstName, userObj?.lastName].filter(Boolean).join(' ') ??
        '';
      const avatar = userObj?.avatar ?? userObj?.profilePic ?? userObj?.avatarUrl ?? '';

      if (userId) {
        window.localStorage.setItem('userId', userId);
        window.localStorage.setItem('currentUserId', userId);
      }
      window.localStorage.setItem('user', JSON.stringify({ id: userId, name, avatar, timezone }));

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center">
      <div className="w-[400px]">
        <div className="text-center mb-8">
          <h1 className="font-reading text-[32px] font-semibold text-ink-1 tracking-[-0.02em]">Lumity</h1>
          <p className="text-[13px] text-ink-4 mt-1">A home for people who think for themselves.</p>
        </div>

        <div className="bg-surface-1 rounded-2xl border border-rule p-8">
          <h2 className="text-[16px] font-semibold text-ink-1 mb-6">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-ink-3 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full text-[14px] text-ink-1 bg-surface-0 border border-rule rounded-lg px-3 py-2.5 focus:outline-none focus:border-warm/60 placeholder:text-ink-4 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-ink-3 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full text-[14px] text-ink-1 bg-surface-0 border border-rule rounded-lg px-3 py-2.5 focus:outline-none focus:border-warm/60 placeholder:text-ink-4 transition-colors"
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-500 pt-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 bg-warm text-white text-[14px] font-medium rounded-lg hover:bg-warm-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
