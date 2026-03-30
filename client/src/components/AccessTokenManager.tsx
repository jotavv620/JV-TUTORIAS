import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Copy, Trash2, Eye, EyeOff, Plus, Calendar } from 'lucide-react';

export default function AccessTokenManager() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'admin' | 'professor' | 'bolsista'>('bolsista');
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState<Set<number>>(new Set());

  // Fetch tokens
  const { data: tokens = [], refetch } = trpc.accessTokens.list.useQuery();

  // Generate token mutation
  const generateMutation = trpc.accessTokens.generate.useMutation({
    onSuccess: (data) => {
      toast.success('Código gerado com sucesso!');
      setName('');
      setUserType('bolsista');
      setExpiresInDays('');
      setShowForm(false);
      setIsLoading(false);
      refetch();
      
      // Show the token in a copyable format
      setTimeout(() => {
        toast.success(`Código: ${data.token}`, {
          duration: 10000,
          action: {
            label: 'Copiar',
            onClick: () => {
              navigator.clipboard.writeText(data.token);
              toast.success('Código copiado!');
            },
          },
        });
      }, 500);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao gerar código');
      setIsLoading(false);
    },
  });

  // Deactivate token mutation
  const deactivateMutation = trpc.accessTokens.revoke.useMutation({
    onSuccess: () => {
      toast.success('Código desativado com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao desativar código');
    },
  });

  // Delete token mutation
  const deleteMutation = trpc.accessTokens.delete.useMutation({
    onSuccess: () => {
      toast.success('Código deletado com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao deletar código');
    },
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Insira um nome para o código');
      return;
    }
    setIsLoading(true);
    await generateMutation.mutateAsync({
      name,
      userType,
      expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
    });
  };

  const toggleTokenVisibility = (tokenId: number) => {
    const newVisible = new Set(visibleTokens);
    if (newVisible.has(tokenId)) {
      newVisible.delete(tokenId);
    } else {
      newVisible.add(tokenId);
    }
    setVisibleTokens(newVisible);
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success('Código copiado para a área de transferência!');
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Sem expiração';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const isTokenExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      professor: 'Professor',
      bolsista: 'Bolsista',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciar Códigos de Acesso</h2>
          <p className="text-slate-500 mt-1">Crie e distribua códigos para novos usuários acessarem o sistema</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Código
        </button>
      </div>

      {/* Generate Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Gerar Novo Código de Acesso</h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome/Descrição
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João Silva - Bolsista"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isLoading}
                />
              </div>

              {/* User Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Usuário
                </label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isLoading}
                >
                  <option value="bolsista">Bolsista</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expira em (dias)
                </label>
                <input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Deixe em branco para sem expiração"
                  min="1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Gerando...' : 'Gerar Código'}
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
        </div>
      )}

      {/* Tokens List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
        {tokens.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">Nenhum código gerado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Nome</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Tipo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Código</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Expira em</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tokens.map((token: any) => (
                  <tr key={token.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{token.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {getRoleLabel(token.userType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      <div className="flex items-center gap-2">
                        {visibleTokens.has(token.id) ? (
                          <>
                            <span>{token.token}</span>
                            <button
                              onClick={() => toggleTokenVisibility(token.id)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-400">••••••••</span>
                            <button
                              onClick={() => toggleTokenVisibility(token.id)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => copyToken(token.token)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {!token.isActive ? (
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                            Inativo
                          </span>
                        ) : token.usedAt ? (
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                            Usado
                          </span>
                        ) : isTokenExpired(token.expiresAt) ? (
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                            Expirado
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                            Ativo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(token.expiresAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {token.isActive && !token.usedAt && (
                          <button
                            onClick={() => deactivateMutation.mutate({ tokenId: token.id })}
                            className="text-yellow-600 hover:text-yellow-700 font-medium text-xs"
                          >
                            Desativar
                          </button>
                        )}
                        <button
                          onClick={() => deleteMutation.mutate({ tokenId: token.id })}
                          className="text-red-600 hover:text-red-700 font-medium text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Como usar:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Clique em "Novo Código" para gerar um código de acesso</li>
          <li>Copie o código (clique no ícone de cópia)</li>
          <li>Compartilhe o código com o usuário</li>
          <li>O usuário entra na página de login e seleciona "Código"</li>
          <li>Após usar, o código fica marcado como "Usado"</li>
        </ol>
      </div>
    </div>
  );
}
