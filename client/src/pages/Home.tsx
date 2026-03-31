import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Key, Loader2 } from 'lucide-react';

export default function Home() {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const utils = trpc.useUtils();

  // Login with access code mutation
  const loginMutation = trpc.auth.loginWithToken.useMutation({
    onSuccess: () => {
      toast.success('Acesso concedido! Bem-vindo!', {
        description: 'Redirecionando para o aplicativo...',
        duration: 2000,
      });
      setAccessCode('');
      setIsLoading(false);
      // Invalidate auth cache to trigger re-render
      utils.auth.me.invalidate().then(() => {
        window.location.href = '/';
      });
    },
    onError: (error: any) => {
      toast.error('Erro ao acessar', {
        description: error?.message || 'Código de acesso inválido',
      });
      setIsLoading(false);
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error('Insira o código de acesso');
      return;
    }
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ token: accessCode.trim() });
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
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
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Código de Acesso
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Cole seu código aqui"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Código fornecido pelo administrador</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Acessar
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Não tem código? Solicite ao administrador do sistema
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 right-4 text-xs text-slate-400">
        Made with Manus
      </div>
    </div>
  );
}
