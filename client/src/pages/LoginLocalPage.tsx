import React, { useState } from 'react';
import { BookOpen, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function LoginLocalPage() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      alert('Login realizado com sucesso!');
      navigate('/app');
    },
    onError: (error) => {
      setError(error.message || 'Erro ao fazer login');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    loginMutation.mutate({});
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-orange-500 rounded-lg">
            <BookOpen size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-800">TUTORIA MANAGER</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Fazer Login</h2>
          <p className="text-slate-600 mb-8">Acesse sua conta com email e senha</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Senha *</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-black uppercase text-sm hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Fazer Login'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Não tem uma conta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-orange-500 font-bold hover:text-orange-600"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mt-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 font-bold text-sm mx-auto"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>
    </div>
  );
}
