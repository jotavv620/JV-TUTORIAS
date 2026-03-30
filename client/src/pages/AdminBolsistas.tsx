import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Plus, Copy, Trash2, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useRouter } from 'wouter';

export default function AdminBolsistas() {
  const router = useRouter();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '' });
  const [visibleCodes, setVisibleCodes] = useState<Set<number>>(new Set());

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Lock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso Negado</h1>
          <p className="text-slate-600 mb-6">Apenas administradores podem acessar esta página</p>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  // Queries and mutations
  const { data: bolsistas = [], isLoading, refetch } = trpc.bolsistas.list.useQuery();
  
  const createMutation = trpc.bolsistas.create.useMutation({
    onSuccess: () => {
      toast.success('Bolsista criado com sucesso!');
      setFormData({ nome: '', email: '' });
      setShowForm(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao criar bolsista');
    },
  });

  const deleteMutation = trpc.bolsistas.delete.useMutation({
    onSuccess: () => {
      toast.success('Bolsista deletado com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao deletar bolsista');
    },
  });

  const deactivateMutation = trpc.bolsistas.deactivate.useMutation({
    onSuccess: () => {
      toast.success('Bolsista desativado com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao desativar bolsista');
    },
  });

  const handleCreateBolsista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast.error('Insira o nome do bolsista');
      return;
    }
    await createMutation.mutateAsync({
      nome: formData.nome,
      email: formData.email || undefined,
    });
  };

  const toggleCodeVisibility = (id: number) => {
    const newSet = new Set(visibleCodes);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleCodes(newSet);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gerenciar Bolsistas</h1>
          <p className="text-slate-600">Crie e gerencie códigos de acesso para bolsistas</p>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Criar Novo Bolsista</h2>
            <form onSubmit={handleCreateBolsista} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome do bolsista"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={createMutation.isPending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={createMutation.isPending}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Criando...' : 'Criar Bolsista'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-2 px-6 rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Bolsista
          </button>
        )}

        {/* Bolsistas List */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-slate-600 mt-2">Carregando bolsistas...</p>
            </div>
          ) : bolsistas.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600">Nenhum bolsista criado ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Nome</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Código de Acesso</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bolsistas.map((bolsista: any) => (
                    <tr key={bolsista.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{bolsista.nome}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{bolsista.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 px-3 py-1 rounded font-mono text-xs">
                            {visibleCodes.has(bolsista.id) ? bolsista.accessCode : '••••••••'}
                          </code>
                          <button
                            onClick={() => toggleCodeVisibility(bolsista.id)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                            title={visibleCodes.has(bolsista.id) ? 'Ocultar' : 'Mostrar'}
                          >
                            {visibleCodes.has(bolsista.id) ? (
                              <EyeOff className="w-4 h-4 text-slate-600" />
                            ) : (
                              <Eye className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(bolsista.accessCode)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                            title="Copiar"
                          >
                            <Copy className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {bolsista.isActive ? (
                          <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {bolsista.isActive && (
                            <button
                              onClick={() => deactivateMutation.mutate({ bolsistaId: bolsista.id })}
                              disabled={deactivateMutation.isPending}
                              className="text-orange-600 hover:text-orange-700 font-semibold text-xs disabled:opacity-50"
                            >
                              Desativar
                            </button>
                          )}
                          <button
                            onClick={() => deleteMutation.mutate({ bolsistaId: bolsista.id })}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700 font-semibold text-xs disabled:opacity-50 flex items-center gap-1"
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
      </div>
    </div>
  );
}
