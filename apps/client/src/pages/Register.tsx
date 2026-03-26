import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRegister } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiRegister({ username, email, password });
      login(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-6 pt-16 selection:bg-blue-400 selection:text-white">
      <Link to="/" className="absolute top-8 left-8 font-black text-3xl tracking-tighter hover:bg-black hover:text-white transition-colors p-2">
        n8n<span className="text-pink-500">.clone</span>
      </Link>
      
      <div className="w-full max-w-md p-10 space-y-8 bg-blue-300 border-4 border-black shadow-[8px_8px_0_0_#000]">
        <div className="text-center">
          <h1 className="text-5xl font-black uppercase tracking-tight">Register</h1>
          <p className="text-black font-bold mt-2 text-lg">Create a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-white border-4 border-black font-bold text-red-600 shadow-[4px_4px_0_0_#000]">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="font-bold text-lg uppercase">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-6 text-lg font-bold placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all rounded-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold text-lg uppercase">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-6 text-lg font-bold placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all rounded-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold text-lg uppercase">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-6 text-lg font-bold placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all rounded-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-bold text-lg uppercase">Confirm</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-6 text-lg font-bold placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all rounded-none"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-yellow-400 text-black py-8 text-2xl font-black uppercase rounded-none border-4 border-black ${isLoading ? 'opacity-50' : 'shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all'}`}
          >
            {isLoading ? 'Creating...' : 'Sign Up'}
          </Button>
        </form>

        <div className="text-center font-bold text-lg">
          Already have an account?{' '}
          <Link to="/login" className="text-black underline decoration-4 underline-offset-4 hover:bg-black hover:text-white transition-colors p-1">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
