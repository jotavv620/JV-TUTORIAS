import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Key, Loader2, Copy, Check } from 'lucide-react';

export default function LoginTest() {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get list of access codes for testing
  const { data: bolsistas } = trpc.bolsista.list.useQuery();

  // Login by access code mutation
  const loginMutation = trpc.login.byAccessCode.useMutation({
    onSuccess: () => {
      toast.success('Acesso concedido! Bem-vindo!');
      setAccessCode('');
      setIsLoading(false);
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
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

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4">
            <span className="text-xl font-bold text-white">TM</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Teste de Login</h1>
          <p className="text-slate-500 mt-2">Página para testar o sistema de login por código de acesso</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Fazer Login</h2>
            
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

          {/* Available Codes */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Códigos Disponíveis</h2>
            
            {bolsistas && bolsistas.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bolsistas.map((bolsista) => (
                  <div
                    key={bolsista.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{bolsista.nome}</p>
                        <p className="text-xs text-slate-500 mt-1">Código:</p>
                        <p className="font-mono text-xs text-slate-700 break-all mt-1">{bolsista.accessCode}</p>
                        {bolsista.usedAt && (
                          <p className="text-xs text-orange-600 mt-2">✓ Já foi utilizado</p>
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard(bolsista.accessCode)}
                        className="flex-shrink-0 p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Copiar código"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">Nenhum bolsista criado ainda</p>
                <p className="text-sm text-slate-400 mt-2">Crie bolsistas em /admin/bolsistas</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Como testar:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Vá para <code className="bg-blue-100 px-2 py-1 rounded">/admin/bolsistas</code> e crie um novo bolsista</li>
            <li>Copie o código gerado (ou use um dos códigos listados à direita)</li>
            <li>Cole o código no campo "Código de Acesso" acima</li>
            <li>Clique em "Acessar"</li>
            <li>Você será redirecionado para o dashboard se o código for válido</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
