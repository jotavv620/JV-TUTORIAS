import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Key, Loader2 } from 'lucide-react';
import { useCustomAuth } from '@/_core/hooks/useCustomAuth';
import TutoriaManagerIntegrated from './TutoriaManagerIntegrated';

export default function Home() {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, loading: authLoading, logout } = useCustomAuth();
  
  // Clear auth state on mount to ensure login page shows
  React.useEffect(() => {
    // If somehow authenticated on login page, clear it
    if (isAuthenticated && !authLoading) {
      // This shouldn't happen, but if it does, show login page anyway
      console.log('Warning: User authenticated on login page');
    }
  }, []);

  // Login by access code mutation - MOVED TO TOP
  const loginMutation = trpc.login.byAccessCode.useMutation({
    onSuccess: () => {
      toast.success('Acesso concedido! Bem-vindo!');
      setAccessCode('');
      setIsLoading(false);
      // Invalidate auth cache to trigger re-render
      const utils = trpc.useUtils();
      utils.auth.me.invalidate();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Código de acesso inválido');
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
    await loginMutation.mutateAsync({
      accessCode: accessCode.trim(),
    });
  };

  // If still loading auth, show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show login form when not authenticated
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
          {/* Access Code Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                  disabled={isLoading}
                  autoComplete="off"
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
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Não tem código? Solicite ao administrador do sistema
        </p>
      </div>
    </div>
  );
}
