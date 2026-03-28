import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Key } from 'lucide-react';

export default function Home() {
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login with access token mutation
  const loginWithTokenMutation = trpc.auth.loginWithToken.useMutation({
    onSuccess: () => {
      toast.success('Acesso concedido! Bem-vindo!');
      setAccessToken('');
      setIsLoading(false);
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Código de acesso inválido');
      setIsLoading(false);
    },
  });

  const handleLoginWithToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error('Insira o código de acesso');
      return;
    }
    setIsLoading(true);
    await loginWithTokenMutation.mutateAsync({
      token: accessToken,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">TM</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Tutoria Manager</h1>
          <p className="text-slate-500 mt-2">Gerencie suas tutorias com facilidade</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          {/* Token Login Form */}
          <form onSubmit={handleLoginWithToken} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Código de Acesso
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Cole seu código aqui"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Código fornecido pelo administrador</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Acessar com Código
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Não tem código? Solicite ao administrador do sistema
        </p>
      </div>
    </div>
  );
}
