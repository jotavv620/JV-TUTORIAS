import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Key, AlertCircle } from 'lucide-react';

export default function LoginTest() {
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Login with access token mutation
  const loginWithTokenMutation = trpc.auth.loginWithToken.useMutation({
    onSuccess: (data) => {
      console.log('Login success:', data);
      setDebugInfo({ success: true, data });
      toast.success('✅ Login realizado com sucesso!');
      setAccessToken('');
      setIsLoading(false);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      setDebugInfo({ success: false, error: error?.message });
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
    setDebugInfo(null);
    console.log('Attempting login with token:', accessToken);
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
          <p className="text-slate-500 mt-2">Teste de Login por Token</p>
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
                  autoFocus
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

          {/* Debug Info */}
          {debugInfo && (
            <div className={`mt-6 p-4 rounded-lg border ${debugInfo.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex gap-2 items-start">
                <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${debugInfo.success ? 'text-green-600' : 'text-red-600'}`} />
                <div className="flex-1">
                  <p className={`font-semibold ${debugInfo.success ? 'text-green-900' : 'text-red-900'}`}>
                    {debugInfo.success ? '✅ Sucesso!' : '❌ Erro'}
                  </p>
                  <p className={`text-sm mt-1 ${debugInfo.success ? 'text-green-700' : 'text-red-700'}`}>
                    {debugInfo.success ? JSON.stringify(debugInfo.data) : debugInfo.error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Página de teste para validar login por token
        </p>
      </div>
    </div>
  );
}
