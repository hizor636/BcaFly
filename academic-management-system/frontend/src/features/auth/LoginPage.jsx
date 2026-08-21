import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <div className="max-w-md w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 flex items-center justify-center text-[var(--gold)] bg-[var(--gold-soft)] border border-[#ead6ab] rounded-2xl shadow-sm">
                <span className="text-3xl font-display font-bold">B</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-display font-bold text-center text-[var(--text)] mb-2">
            Welcome to BcaFly
          </h2>
          <p className="text-center text-[var(--text-muted)] mb-8">
            Fly higher with academic clarity.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--brass-3)] hover:bg-[var(--brass-4)] focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
