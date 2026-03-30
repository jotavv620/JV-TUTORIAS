import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  Star,
  CheckCircle,
  AlertCircle,
  Plus,
  BarChart3,
  MessageSquare,
  Mic,
  Timer,
  ChevronRight,
  ClipboardList,
  Settings as SettingsIcon,
  Trash2,
  PlayCircle,
  X,
  Sparkles,
  Loader2,
  Camera,
  Upload,
  FileCheck,
  ShieldCheck,
  Trophy,
  Award,
  MapPin,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

const StatCard = ({ label, val, icon: Icon, colorClass }: { label: string; val: number; icon: React.ComponentType<any>; colorClass: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">{label}</p>
      <p className="text-2xl font-black text-slate-800 mt-1">{val}</p>
    </div>
  </div>
);

export default function TutoriaManagerIntegrated() {
  const { user } = useAuth();
  const [inputDisciplina, setInputDisciplina] = useState('');
  const [inputProfessor, setInputProfessor] = useState('');
  const [inputInstituicao, setInputInstituicao] = useState('');
  const [inputBolsista, setInputBolsista] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [activeCheckin, setActiveCheckin] = useState<number | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: string; id: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTutoria, setSelectedTutoria] = useState<any>(null);
  const [isEditingTutoria, setIsEditingTutoria] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  const { data: tutorias = [], refetch: refetchTutorias, isLoading: tutoriasLoading } = trpc.tutorias.list.useQuery();
  const { data: disciplinas = [] } = trpc.disciplinas.list.useQuery();
  const { data: professores = [] } = trpc.professores.list.useQuery();
  const { data: instituicoes = [] } = trpc.instituicoes.list.useQuery();
  const { data: bolsistas = [] } = trpc.bolsista.list.useQuery();

  const createDisciplinaMutation = trpc.disciplinas.create.useMutation({
    onSuccess: () => {
      toast.success('Disciplina criada!');
      setInputDisciplina('');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao criar disciplina');
    },
  });

  const createProfessorMutation = trpc.professores.create.useMutation({
    onSuccess: () => {
      toast.success('Professor criado!');
      setInputProfessor('');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao criar professor');
    },
  });

  const createInstituicaoMutation = trpc.instituicoes.create.useMutation({
    onSuccess: () => {
      toast.success('Instituição criada!');
      setInputInstituicao('');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao criar instituição');
    },
  });

  const createTutoriaMutation = trpc.tutorias.create.useMutation({
    onSuccess: () => {
      toast.success('Tutoria criada!');
      refetchTutorias();
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao criar tutoria');
    },
  });

  const updateTutoriaMutation = trpc.tutorias.update.useMutation({
    onSuccess: () => {
      toast.success('Tutoria atualizada!');
      refetchTutorias();
      setIsEditingTutoria(false);
      setSelectedTutoria(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao atualizar tutoria');
    },
  });

  const deleteTutoriaMutation = trpc.tutorias.delete.useMutation({
    onSuccess: () => {
      toast.success('Tutoria deletada!');
      refetchTutorias();
      setDeleteConfirmation(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao deletar tutoria');
    },
  });

  const updateStatusMutation = trpc.tutorias.updateStatus.useMutation({
    onSuccess: () => {
      refetchTutorias();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao atualizar status');
    },
  });

  const addFeedbackMutation = trpc.tutorias.addFeedback.useMutation({
    onSuccess: () => {
      toast.success('Feedback enviado!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao enviar feedback');
    },
  });

  const handleSyncGoogleCalendar = async (tutoriaId: number) => {
    try {
      toast.info('Sincronização com Google Calendar será implementada em breve');
    } catch (error: any) {
      console.error('Erro ao sincronizar:', error);
    }
  };

  const handleAddItem = async (type: string, value: string, email?: string) => {
    if (!value.trim()) return;
    try {
      if (type === 'disc') {
        await createDisciplinaMutation.mutateAsync({ nome: value });
        setInputDisciplina('');
      } else if (type === 'prof') {
        await createProfessorMutation.mutateAsync({ nome: value });
        setInputProfessor('');
      } else if (type === 'inst') {
        await createInstituicaoMutation.mutateAsync({ nome: value });
        setInputInstituicao('');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleCreateTutoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutoria) return;

    try {
      await createTutoriaMutation.mutateAsync({
        disciplina: selectedTutoria.disciplina,
        professor: selectedTutoria.professor,
        instituicao: selectedTutoria.instituicao,
        horario: selectedTutoria.horario,
        data: selectedTutoria.data,
      });
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleUpdateStatus = (tutoriaId: number, newStatus: string) => {
    updateStatusMutation.mutate({ tutoriaId, status: newStatus });
  };

  const handleAddFeedback = async (tutoriaId: number) => {
    if (!feedbackText.trim()) return;
    try {
      await addFeedbackMutation.mutateAsync({
        tutoriaId,
        feedback: feedbackText,
      });
      setFeedbackText('');
      setActiveFeedback(null);
    } catch (error: any) {
      toast.error('Erro ao enviar feedback');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
      />
    ));
  };

  const Dashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Registado" val={Array.isArray(tutorias) ? tutorias.length : 0} icon={ClipboardList} colorClass="bg-orange-50 text-orange-600" />
        <StatCard label="Pendentes" val={Array.isArray(tutorias) ? tutorias.filter((t: any) => t.status === 'scheduled').length : 0} icon={Clock} colorClass="bg-blue-50 text-blue-600" />
        <StatCard label="Em Curso" val={Array.isArray(tutorias) ? tutorias.filter((t: any) => t.status === 'in_progress').length : 0} icon={PlayCircle} colorClass="bg-orange-50 text-orange-600" />
        <StatCard label="Concluídas" val={Array.isArray(tutorias) ? tutorias.filter((t: any) => t.status === 'completed').length : 0} icon={CheckCircle} colorClass="bg-blue-50 text-blue-600" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Painel de Atividades</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Novo Agendamento
          </button>
        </div>

        {tutoriasLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
            <p className="text-slate-600">Carregando tutorias...</p>
          </div>
        ) : Array.isArray(tutorias) && tutorias.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Disciplina / Filial</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Professor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status / Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Horário</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tutorias.map((tutoria: any) => (
                  <tr key={tutoria.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={18} className="text-orange-500" />
                        <div>
                          <p className="font-semibold text-slate-900">{tutoria.disciplina}</p>
                          <p className="text-xs text-slate-500">{tutoria.instituicao}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-700">{tutoria.professor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={tutoria.status}
                        onChange={(e) => handleUpdateStatus(tutoria.id, e.target.value)}
                        className="px-3 py-1 rounded-lg text-sm font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="scheduled">Agendada</option>
                        <option value="in_progress">Em Curso</option>
                        <option value="completed">Concluída</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock size={16} />
                        {tutoria.horario}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSyncGoogleCalendar(tutoria.id)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Sincronizar com Google Calendar"
                        >
                          <Calendar size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveFeedback(tutoria.id);
                            setFeedbackText('');
                          }}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                          title="Adicionar feedback"
                        >
                          <MessageSquare size={16} className="text-green-600" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation({ type: 'tutoria', id: tutoria.id })}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Deletar tutoria"
                        >
                          <Trash2 size={16} className="text-red-600" />
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
            <ClipboardList size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-semibold">Nenhuma tutoria registada</p>
            <p className="text-slate-400 text-sm mt-1">Clique em "Novo Agendamento" para começar</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <span className="text-lg font-bold text-white">TM</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Tutoria Manager</h1>
                <p className="text-xs text-slate-500">Bem-vindo, {user?.name || 'Usuário'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'disciplinas', label: 'Disciplinas', icon: BookOpen },
              { id: 'professores', label: 'Professores', icon: User },
              { id: 'instituicoes', label: 'Instituições', icon: Building2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        
        {activeTab === 'disciplinas' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Gerenciar Disciplinas</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={inputDisciplina}
                onChange={(e) => setInputDisciplina(e.target.value)}
                placeholder="Nome da disciplina"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={() => handleAddItem('disc', inputDisciplina)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {Array.isArray(disciplinas) && disciplinas.map((d: any) => (
                <div key={d.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span className="text-slate-700">{d.nome}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'professores' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Gerenciar Professores</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={inputProfessor}
                onChange={(e) => setInputProfessor(e.target.value)}
                placeholder="Nome do professor"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={() => handleAddItem('prof', inputProfessor)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {Array.isArray(professores) && professores.map((p: any) => (
                <div key={p.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span className="text-slate-700">{p.nome}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'instituicoes' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Gerenciar Instituições</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={inputInstituicao}
                onChange={(e) => setInputInstituicao(e.target.value)}
                placeholder="Nome da instituição"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={() => handleAddItem('inst', inputInstituicao)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {Array.isArray(instituicoes) && instituicoes.map((i: any) => (
                <div key={i.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span className="text-slate-700">{i.nome}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Confirmar Exclusão</h3>
            <p className="text-slate-600 mb-6">Tem certeza que deseja deletar este item?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmation.type === 'tutoria') {
                    deleteTutoriaMutation.mutate({ tutoriaId: deleteConfirmation.id });
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
