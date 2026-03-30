import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Plus, Trash2, Copy, Check, Key, Shield } from 'lucide-react';

export default function AdminTokens() {
  const [showForm, setShowForm] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'bolsista'>('bolsista');
  const [copied, setCopied] = useState<string | null>(null);

  // Get list of access tokens
  const { data: tokens, isLoading } = trpc.accessTokens.list.useQuery();

  // Create token mutation
  const createMutation = trpc.accessTokens.generate.useMutation({
    onSuccess: (newToken) => {
      toast.success('Token criado com sucesso!');
      setShowForm(false);
      setUserType('bolsista');
      // Copy token to clipboard automatically
      navigator.clipboard.writeText(newToken.token);
      toast.info('Token copiado para a área de transferência!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao criar token');
    },
  });

  // Delete token mutation
  const deleteMutation = trpc.accessTokens.delete.useMutation({
    onSuccess: () => {
      toast.success('Token deletado com sucesso');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao deletar token');
    },
  });

  // Revoke token mutation
  const revokeMutation = trpc.accessTokens.revoke.useMutation({
    onSuccess: () => {
      toast.success('Token revogado com sucesso');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao revogar token');
    },
  });

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({ userType });
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = (tokenId: number) => {
    if (confirm('Tem certeza que deseja deletar este token?')) {
      deleteMutation.mutate({ tokenId });
    }
  };

  const handleRevoke = (tokenId: number) => {
    if (confirm('Tem certeza que deseja revogar este token?')) {
      revokeMutation.mutate({ tokenId });
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();
  const isUsed = (usedAt: string | null) => usedAt !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Key className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-slate-900">Gerenciar Tokens de Acesso</h1>
          </div>
          <p className="text-slate-600">Crie e gerencie tokens para acesso ao sistema</p>
        </div>

        {/* Create Token Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 mb-8">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Novo Token
            </button>
          ) : (
            <form onSubmit={handleCreateToken} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Criar Novo Token</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Usuário
                </label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as 'admin' | 'bolsista')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="bolsista">Bolsista</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? 'Criando...' : 'Criar Token'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Tokens List */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Carregando tokens...</p>
            </div>
          ) : tokens && tokens.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Token</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Criado em</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Expira em</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tokens.map((token: any) => (
                    <tr key={token.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                            {token.token.substring(0, 20)}...
                          </code>
                          <button
                            onClick={() => copyToClipboard(token.token)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                          >
                            {copied === token.token ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <Shield className="w-3 h-3" />
                          {token.userType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isExpired(token.expiresAt) ? (
                          <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            Expirado
                          </span>
                        ) : isUsed(token.usedAt) ? (
                          <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            Usado
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Ativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(token.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(token.expiresAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {!isUsed(token.usedAt) && !isExpired(token.expiresAt) && (
                            <button
                              onClick={() => handleRevoke(token.id)}
                              disabled={revokeMutation.isPending}
                              className="p-2 hover:bg-yellow-100 rounded transition-colors disabled:opacity-50"
                              title="Revogar token"
                            >
                              <Key className="w-4 h-4 text-yellow-600" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(token.id)}
                            disabled={deleteMutation.isPending}
                            className="p-2 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                            title="Deletar token"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Key className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum token criado ainda</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">Como usar tokens de acesso:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Crie um token para cada bolsista ou admin</li>
            <li>✓ Compartilhe o token com o usuário (aparece uma única vez)</li>
            <li>✓ O usuário pode fazer login usando o token na página de login</li>
            <li>✓ Tokens expiram após 30 dias ou quando usados</li>
            <li>✓ Você pode revogar ou deletar tokens a qualquer momento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
