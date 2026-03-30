import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { LogOut, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch bolsistas list
  const { data: bolsistas = [], isLoading: isLoadingBolsistas, refetch } = trpc.bolsista.list.useQuery();

  // Create bolsista mutation
  const createMutation = trpc.bolsista.create.useMutation({
    onSuccess: () => {
      toast.success('Bolsista criado com sucesso!');
      setNome('');
      setEmail('');
      setShowCreateForm(false);
      setIsLoading(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao criar bolsista');
      setIsLoading(false);
    },
  });

  // Delete bolsista mutation
  const deleteMutation = trpc.bolsista.delete.useMutation({
    onSuccess: () => {
      toast.success('Bolsista deletado com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao deletar bolsista');
    },
  });

  const handleCreateBolsista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    setIsLoading(true);
    await createMutation.mutateAsync({ nome: nome.trim(), email: email.trim() });
  };

  const handleDeleteBolsista = (bolsistaId: number) => {
    if (confirm('Tem certeza que deseja deletar este bolsista?')) {
      deleteMutation.mutate({ bolsistaId });
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tutoria Manager</h1>
            <p className="text-sm text-slate-500">Bem-vindo, {user?.name || 'Usuário'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Create Bolsista Form */}
        {user?.userType === 'admin' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Criar Novo Bolsista</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {showCreateForm ? 'Cancelar' : 'Novo Bolsista'}
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateBolsista} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo do bolsista"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Criando...' : 'Criar Bolsista'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Bolsistas List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-slate-900">Bolsistas Cadastrados</h2>
          </div>

          {isLoadingBolsistas ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-slate-600 mt-2">Carregando...</p>
            </div>
          ) : bolsistas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">Nenhum bolsista cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Código de Acesso</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                    {user?.userType === 'admin' && (
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bolsistas.map((bolsista: any) => (
                    <tr key={bolsista.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-900">{bolsista.nome}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{bolsista.email || '-'}</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">
                        <code className="bg-slate-100 px-2 py-1 rounded text-xs">{bolsista.accessCode}</code>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          bolsista.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {bolsista.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      {user?.userType === 'admin' && (
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDeleteBolsista(bolsista.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Deletar
                          </button>
                        </td>
                      )}
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
