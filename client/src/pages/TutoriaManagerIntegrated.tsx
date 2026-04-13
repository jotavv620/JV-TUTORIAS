import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useWebSocket } from '@/_core/hooks/useWebSocket';
import { getLoginUrl } from '@/const';
import { trpc } from '@/lib/trpc';
import { 
  Calendar, Clock, User, BookOpen, Star, CheckCircle, AlertCircle, Plus, BarChart3, 
  MessageSquare, Mic, Timer, ChevronRight, ClipboardList, Settings as SettingsIcon,
  Trash2, PlayCircle, X, Sparkles, Loader2, Camera, Upload, FileCheck, ShieldCheck,
  Trophy, Award, MapPin, Building2, LogOut, FileDown, TrendingUp, Bell, LineChart, Activity
} from 'lucide-react';
import { AnalyticsTab, NotificationsTab, CalendarTab } from './AdvancedComponents';
import { Leaderboard, MedalsShowcase, AchievementsShowcase, PointsSummary } from './GamificationComponents';
import AccessTokenManager from '@/components/AccessTokenManager';
import { toast } from 'sonner';

interface Tutoria {
  id: number;
  disciplina: string;
  professor: string;
  instituicao: string;
  bolsista: string;
  data: string;
  horario: string;
  horarioTermino: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  feedback: { pontualidade: number; audio: number; conteudo: number; comentarios: string } | null;
  checkin: { timestamp: string } | null;
}

interface FeedbackForm {
  pontualidade: number;
  audio: number;
  conteudo: number;
  comentarios: string;
  [key: string]: number | string;
}

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
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  useWebSocket(); // Initialize WebSocket for real-time updates
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // tRPC queries - Tutorias (with real-time polling)
  const utils = trpc.useUtils();
  const { data: tutorias = [], isLoading: tutoriasLoading, refetch: refetchTutorias } = 
    trpc.tutorias.list.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 3000 } as any);
  const createTutoriaMutation = trpc.tutorias.create.useMutation({
    onSuccess: () => utils.tutorias.list.invalidate(),
  });
  const updateStatusMutation = trpc.tutorias.update.useMutation({
    onSuccess: () => utils.tutorias.list.invalidate(),
  });
  const deleteTutoriaMutation = trpc.tutorias.delete.useMutation({
    onSuccess: () => utils.tutorias.list.invalidate(),
  });
  const createFeedbackMutation = trpc.feedback.create.useMutation({
    onSuccess: () => utils.tutorias.list.invalidate(),
  });
  const createCheckinMutation = trpc.checkin.create.useMutation({
    onSuccess: () => utils.tutorias.list.invalidate(),
  });

  // tRPC queries - Configuration (with real-time polling every 3 seconds)
  const { data: disciplinasData = [], refetch: refetchDisciplinas } = 
    trpc.disciplinas.list.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 3000 } as any);
  const { data: professoresData = [], refetch: refetchProfessores } = 
    trpc.professores.list.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 3000 } as any);
  const { data: instituicoesData = [], refetch: refetchInstituicoes } = 
    trpc.instituicoes.list.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 3000 } as any);
  const { data: bolsistasData = [], refetch: refetchBolsistas } = 
    trpc.bolsista.list.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 3000 } as any);
  
  // Mutations for configuration
  const createDisciplinaMutation = trpc.disciplinas.create.useMutation({
    onSuccess: () => utils.disciplinas.list.invalidate(),
  });
  const deleteDisciplinaMutation = trpc.disciplinas.delete.useMutation({
    onSuccess: () => utils.disciplinas.list.invalidate(),
  });
  const createProfessorMutation = trpc.professores.create.useMutation({
    onSuccess: () => utils.professores.list.invalidate(),
  });
  const deleteProfessorMutation = trpc.professores.delete.useMutation({
    onSuccess: () => utils.professores.list.invalidate(),
  });
  const createInstituicaoMutation = trpc.instituicoes.create.useMutation({
    onSuccess: () => utils.instituicoes.list.invalidate(),
  });
  const deleteInstituicaoMutation = trpc.instituicoes.delete.useMutation({
    onSuccess: () => utils.instituicoes.list.invalidate(),
  });
  const createBolsistaMutation = trpc.bolsista.create.useMutation({
    onSuccess: () => utils.bolsista.list.invalidate(),
  });
  const deleteBolsistaMutation = trpc.bolsista.delete.useMutation({
    onSuccess: () => utils.bolsista.list.invalidate(),
  });

  // Keep full objects for proper key handling
  const disciplinas = disciplinasData;
  const professores = professoresData;
  const instituicoes = instituicoesData;
  
  // Extract just names for dropdowns
  const disciplinasNames = disciplinas.map((d: any) => d.nome || d);
  const professoresNames = professores.map((p: any) => p.nome || p);
  const instituicoesNames = instituicoes.map((i: any) => i.nome || i);
  const bolsistasNames = bolsistasData.map((b: any) => b.nome || b);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCheckin, setActiveCheckin] = useState<Tutoria | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<Tutoria | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);

  const [newTutoria, setNewTutoria] = useState<Omit<Tutoria, 'id' | 'status' | 'feedback' | 'checkin'>>({
    instituicao: '',
    disciplina: '',
    professor: '',
    bolsista: '',
    data: '',
    horario: '',
    horarioTermino: ''
  });

  const [checkinForm, setCheckinForm] = useState({ description: '' });
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({ pontualidade: 0, audio: 0, conteudo: 0, comentarios: '' });

  const [inputDisciplina, setInputDisciplina] = useState('');
  const [inputProfessor, setInputProfessor] = useState('');
  const [inputProfessorEmail, setInputProfessorEmail] = useState('');
  const [inputInstituicao, setInputInstituicao] = useState('');
  const [inputBolsista, setInputBolsista] = useState('');
  const [inputBolsistaEmail, setInputBolsistaEmail] = useState('');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="p-4 bg-orange-500 rounded-2xl w-fit mx-auto mb-6">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2 uppercase italic">Tutoria Manager</h1>
          <p className="text-slate-600 text-sm mb-8">Sistema de gestão de tutorias com autenticação segura</p>
          <a href={getLoginUrl()} className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg transition-all">
            Entrar com Manus
          </a>
        </div>
      </div>
    );
  }

  const handleAddTutoria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createTutoriaMutation.mutateAsync(newTutoria);
      setNewTutoria({ instituicao: '', disciplina: '', professor: '', bolsista: '', data: '', horario: '', horarioTermino: '' });
      setIsModalOpen(false);
      refetchTutorias();
      
      const emailStatus = (result as any)?.emailsSent;
      if (emailStatus?.professor || emailStatus?.bolsista) {
        const emailsInfo = [];
        if (emailStatus.professor) emailsInfo.push('professor');
        if (emailStatus.bolsista) emailsInfo.push('bolsista');
        toast.success(`Tutoria criada! Emails enviados para: ${emailsInfo.join(' e ')}`);
      } else {
        toast.success('Tutoria criada com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao criar tutoria');
      console.error(error);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ 
        tutoriaId: id, 
        status: newStatus as 'scheduled' | 'in_progress' | 'completed'
      });
      refetchTutorias();
      toast.success('Status atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeleteTutoria = async (id: number) => {
    try {
      await deleteTutoriaMutation.mutateAsync({ tutoriaId: id });
      setDeleteConfirmation(null);
      refetchTutorias();
      toast.success('Tutoria deletada!');
    } catch (error) {
      toast.error('Erro ao deletar tutoria');
    }
  };

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckin) return;
    try {
      await createCheckinMutation.mutateAsync({
        tutoriaId: activeCheckin.id,
        timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        description: checkinForm.description
      });
      setActiveCheckin(null);
      setCheckinForm({ description: '' });
      refetchTutorias();
      toast.success('Check-in realizado!');
    } catch (error) {
      toast.error('Erro ao fazer check-in');
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFeedback) return;
    try {
      await createFeedbackMutation.mutateAsync({
        tutoriaId: activeFeedback.id,
        pontualidade: Number(feedbackForm.pontualidade),
        audio: Number(feedbackForm.audio),
        conteudo: Number(feedbackForm.conteudo),
        comentarios: feedbackForm.comentarios
      });
      await handleUpdateStatus(activeFeedback.id, 'completed');
      setActiveFeedback(null);
      setFeedbackForm({ pontualidade: 0, audio: 0, conteudo: 0, comentarios: '' });
      refetchTutorias();
      toast.success('Feedback enviado!');
    } catch (error) {
      toast.error('Erro ao enviar feedback');
    }
  };

  // Check Google Calendar connection status
  const { data: googleStatus } = trpc.google.getStatus.useQuery();
  
  const getGoogleAuthUrlMutation = trpc.google.getAuthUrl.useMutation({
    onSuccess: (data) => {
      window.location.href = data.authUrl;
    },
    onError: () => {
      toast.error('Erro ao conectar com Google');
    },
  });

  const syncGoogleCalendarMutation = trpc.tutorias.syncGoogleCalendar?.useMutation({
    onSuccess: () => {
      refetchTutorias();
      toast.success('Tutoria sincronizada com Google Calendar!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao sincronizar com Google Calendar');
    },
  });

  const handleSyncGoogleCalendar = async (tutoriaId: number) => {
    // Check if user is connected to Google
    if (!googleStatus?.connected) {
      toast.info('Conectando com Google Calendar...');
      await getGoogleAuthUrlMutation.mutateAsync();
      return;
    }
    
    try {
      if (syncGoogleCalendarMutation) {
        await syncGoogleCalendarMutation.mutateAsync({ tutoriaId });
      }
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
        refetchDisciplinas();
        toast.success('Disciplina adicionada!');
      } else if (type === 'prof') {
        if (!email || !email.trim()) {
          toast.error('Email do professor é obrigatório');
          return;
        }
        await createProfessorMutation.mutateAsync({ nome: value, email });
        setInputProfessor('');
        setInputProfessorEmail('');
        refetchProfessores();
        toast.success('Professor adicionado!');
      } else if (type === 'inst') {
        await createInstituicaoMutation.mutateAsync({ nome: value });
        setInputInstituicao('');
        refetchInstituicoes();
        toast.success('Filial adicionada!');
      } else if (type === 'bol') {
        if (!email || !email.trim()) {
          toast.error('Email do bolsista é obrigatório');
          return;
        }
        await createBolsistaMutation.mutateAsync({ nome: value, email });
        setInputBolsista('');
        setInputBolsistaEmail('');
        refetchBolsistas();
        toast.success('Bolsista adicionado!');
      }
    } catch (error) {
      toast.error('Erro ao adicionar item');
      console.error(error);
    }
  };

  const handleRemoveItem = async (type: string, value: string) => {
    try {
      if (type === 'disc') {
        const item = disciplinasData.find((d: any) => (d.nome || d) === value);
        if (item?.id) {
          await deleteDisciplinaMutation.mutateAsync({ disciplinaId: item.id });
          refetchDisciplinas();
          toast.success('Disciplina removida!');
        }
      } else if (type === 'prof') {
        const item = professoresData.find((p: any) => (p.nome || p) === value);
        if (item?.id) {
          await deleteProfessorMutation.mutateAsync({ professorId: item.id });
          refetchProfessores();
          toast.success('Professor removido!');
        }
      } else if (type === 'inst') {
        const item = instituicoesData.find((i: any) => (i.nome || i) === value);
        if (item?.id) {
          await deleteInstituicaoMutation.mutateAsync({ instituicaoId: item.id });
          refetchInstituicoes();
          toast.success('Filial removida!');
        }
      } else if (type === 'bol') {
        const item = bolsistasData.find((b: any) => b.nome === value);
        if (item?.id) {
          await deleteBolsistaMutation.mutateAsync({ bolsistaId: item.id });
          refetchBolsistas();
          toast.success('Bolsista removido!');
        }
      }
    } catch (error) {
      toast.error('Erro ao remover item');
      console.error(error);
    }
  };

  const tutoriasArray = Array.isArray(tutorias) ? tutorias : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-slate-800 uppercase text-sm tracking-widest">Tutoria Manager</h1>
              <p className="text-xs text-slate-500">Bem-vindo, {user?.name || 'Usuário'}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold text-xs uppercase tracking-widest transition-all">
            <LogOut size={14} /> SAIR
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto border-t border-slate-100">
          {
            [
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              ...(user?.role === 'admin' ? [{ id: 'analytics', label: 'Analítica', icon: LineChart }] : []),
              { id: 'notifications', label: 'Notificações', icon: Bell },
              { id: 'calendar', label: 'Calendário', icon: Calendar },
              ...(user?.role === 'admin' ? [{ id: 'feedbacks', label: 'Feedbacks', icon: Star }] : []),
              ...(user?.role === 'admin' ? [{ id: 'gamification', label: 'Gamificação', icon: Trophy }] : []),
              ...(user?.role === 'admin' ? [{ id: 'settings', label: 'Configurações', icon: SettingsIcon }] : []),
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 font-black text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })
          }
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {tutoriasLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-500" size={40} />
          </div>
        ) : activeTab === 'dashboard' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Total Registado" val={tutoriasArray.length} icon={ClipboardList} colorClass="bg-orange-50 text-orange-600" />
              <StatCard label="Pendentes" val={tutoriasArray.filter((t: any) => t.status === 'scheduled').length} icon={Clock} colorClass="bg-blue-50 text-blue-600" />
              <StatCard label="Em Curso" val={tutoriasArray.filter((t: any) => t.status === 'in_progress').length} icon={PlayCircle} colorClass="bg-orange-50 text-orange-600" />
              <StatCard label="Concluídas" val={tutoriasArray.filter((t: any) => t.status === 'completed').length} icon={CheckCircle} colorClass="bg-blue-50 text-blue-600" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                <h2 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                   <BarChart3 size={16} className="text-orange-500" /> Painel de Atividades
                </h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95">
                  <Plus size={14} /> Novo Agendamento
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600">Disciplina / Filial</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600">Professor</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600">Status / Check-in</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600">Horário</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600">Gestão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutoriasArray.map((tutoria: any) => (
                      <tr key={tutoria.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                        <td className="px-4 py-5">
                          <div>
                            <p className="font-black text-slate-800">{tutoria.disciplina}</p>
                            <p className="text-xs text-slate-500 font-bold">● {tutoria.instituicao}</p>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <p className="font-black text-slate-800">{tutoria.professor}</p>
                        </td>
                        <td className="px-4 py-5">
                          <select
                            value={tutoria.status}
                            onChange={(e) => handleUpdateStatus(tutoria.id, e.target.value)}
                            className="px-3 py-1 rounded-lg text-xs font-black uppercase border-0 focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="scheduled">AGENDADA</option>
                            <option value="in_progress">EM CURSO</option>
                            <option value="completed">CONCLUÍDA</option>
                          </select>
                          {tutoria.checkin && <p className="text-xs text-green-600 font-bold mt-1">✓ CHECK-IN {tutoria.checkin.timestamp}</p>}
                        </td>
                        <td className="px-4 py-5">
                          <p className="font-black text-slate-800">{tutoria.data}</p>
                          <p className="text-xs text-slate-500 font-bold">{tutoria.horario} - {tutoria.horarioTermino}</p>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => setActiveCheckin(tutoria)} className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600">Check-in</button>
                            <button onClick={() => setActiveFeedback(tutoria)} className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600">Feedback</button>
                            <button 
                              onClick={() => handleSyncGoogleCalendar(tutoria.id)} 
                              disabled={getGoogleAuthUrlMutation.isPending || syncGoogleCalendarMutation?.isPending}
                              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                googleStatus?.connected 
                                  ? 'bg-purple-500 text-white hover:bg-purple-600' 
                                  : 'bg-orange-500 text-white hover:bg-orange-600'
                              } disabled:opacity-50`}
                            >
                              {getGoogleAuthUrlMutation.isPending ? 'Conectando...' : googleStatus?.connected ? 'Google Cal' : 'Conectar Google'}
                            </button>
                            <button onClick={() => setDeleteConfirmation(tutoria.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600">Deletar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          <AnalyticsTab tutorias={tutoriasArray as any} />
        ) : activeTab === 'notifications' ? (
          <NotificationsTab tutorias={tutoriasArray as any} />
        ) : activeTab === 'calendar' ? (
          <CalendarTab tutorias={tutoriasArray as any} />
        ) : activeTab === 'feedbacks' ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Star className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Histórico de Feedbacks</h2>
              <p className="text-slate-600 mb-6">Visualize e analise todos os feedbacks das tutorias</p>
              <a href="/admin/feedbacks" className="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition">
                Abrir Histórico
              </a>
            </div>
          </div>
        ) : activeTab === 'gamification' ? (
          <div className="space-y-6">
            <Leaderboard professors={[]} />
            <MedalsShowcase professors={[]} />
            <AchievementsShowcase achievements={[]} />
          </div>
        ) : activeTab === 'settings' ? (
          <div className="space-y-6">
            {/* Access Token Manager */}
            <AccessTokenManager />
            
            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2 text-orange-500"><BookOpen size={16} /> Disciplinas</h3>
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Nome..." 
                  className="flex-1 px-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none border-0 focus:ring-2 focus:ring-orange-200" 
                  value={inputDisciplina} 
                  onChange={(e) => setInputDisciplina(e.target.value)} 
                />
                <button onClick={() => handleAddItem('disc', inputDisciplina)} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"><Plus size={16} /></button>
              </div>
              <div className="space-y-2">
                {disciplinas.map((d: any) => (
                  <div key={d.id || d.nome} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-600">
                    <span>{d.nome || d}</span>
                    <button onClick={() => handleRemoveItem('disc', d.nome || d)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2 text-orange-500"><User size={16} /> Professores</h3>
              <div className="grid grid-cols-1 gap-4 mb-6">
                <input 
                  type="text" 
                  placeholder="Nome do professor..." 
                  className="px-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none border-0 focus:ring-2 focus:ring-orange-200" 
                  value={inputProfessor} 
                  onChange={(e) => setInputProfessor(e.target.value)} 
                />
                <input 
                  type="email" 
                  placeholder="Email..." 
                  className="px-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none border-0 focus:ring-2 focus:ring-orange-200" 
                  value={inputProfessorEmail}
                  onChange={(e) => setInputProfessorEmail(e.target.value)}
                />
              </div>
              <button onClick={() => handleAddItem('prof', inputProfessor, inputProfessorEmail)} className="w-full p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-bold text-sm flex items-center justify-center gap-2"><Plus size={16} />Adicionar Professor</button>
              <div className="space-y-2 mt-4">
                {professores.map((p: any) => (
                  <div key={p.id || p.nome} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-600">
                    <div>
                      <p>{p.nome || p}</p>
                      <p className="text-slate-400">{p.email || 'Sem email'}</p>
                    </div>
                    <button onClick={() => handleRemoveItem('prof', p.nome || p)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2 text-orange-500"><Building2 size={16} /> Filiais</h3>
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Nome..." 
                  className="flex-1 px-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none border-0 focus:ring-2 focus:ring-orange-200" 
                  value={inputInstituicao} 
                  onChange={(e) => setInputInstituicao(e.target.value)} 
                />
                <button onClick={() => handleAddItem('inst', inputInstituicao)} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"><Plus size={16} /></button>
              </div>
              <div className="space-y-2">
                {instituicoes.map((i: any) => (
                  <div key={i.id || i.nome} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-600">
                    <span>{i.nome || i}</span>
                    <button onClick={() => handleRemoveItem('inst', i.nome || i)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bolsistas Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2 text-orange-500"><Trophy size={16} /> Bolsistas</h3>
              <div className="grid grid-cols-1 gap-4 mb-6">
                <input 
                  type="text" 
                  placeholder="Nome do bolsista..." 
                  className="px-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none border-0 focus:ring-2 focus:ring-orange-200" 
                  value={inputBolsista}
                  onChange={(e) => setInputBolsista(e.target.value)}
                />
                <input 
                  type="email" 
                  placeholder="Email..." 
                  className="px-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none border-0 focus:ring-2 focus:ring-orange-200" 
                  value={inputBolsistaEmail}
                  onChange={(e) => setInputBolsistaEmail(e.target.value)}
                />
              </div>
              <button onClick={() => handleAddItem('bol', inputBolsista, inputBolsistaEmail)} className="w-full p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-sm flex items-center justify-center gap-2"><Plus size={16} />Adicionar Bolsista</button>
              <div className="space-y-2 mt-4">
                {bolsistasData.map((b: any) => (
                  <div key={b.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-600">
                    <div>
                      <p>{b.nome}</p>
                      <p className="text-slate-400">{b.email}</p>
                    </div>
                    <button onClick={() => handleRemoveItem('bol', b.nome)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Modal - Nova Tutoria */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Nova Tutoria</h2>
            <form onSubmit={handleAddTutoria} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Disciplina *</label>
                <select value={newTutoria.disciplina} onChange={(e) => setNewTutoria({...newTutoria, disciplina: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" required>
                  <option value="">-- Selecione uma disciplina --</option>
                  {disciplinasNames.map((d: string) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Professor *</label>
                <select value={newTutoria.professor} onChange={(e) => setNewTutoria({...newTutoria, professor: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" required>
                  <option value="">-- Selecione um professor --</option>
                  {professoresNames.map((p: string) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Filial *</label>
                <select value={newTutoria.instituicao} onChange={(e) => setNewTutoria({...newTutoria, instituicao: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" required>
                  <option value="">-- Selecione uma filial --</option>
                  {instituicoesNames.map((i: string) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Bolsista *</label>
                <select value={newTutoria.bolsista} onChange={(e) => setNewTutoria({...newTutoria, bolsista: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" required>
                  <option value="">-- Selecione um bolsista --</option>
                  {bolsistasNames.map((b: string) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Data *</label>
                <input type="date" value={newTutoria.data} onChange={(e) => setNewTutoria({...newTutoria, data: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700">Início *</label>
                  <input type="time" value={newTutoria.horario} onChange={(e) => setNewTutoria({...newTutoria, horario: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700">Término *</label>
                  <input type="time" value={newTutoria.horarioTermino} onChange={(e) => setNewTutoria({...newTutoria, horarioTermino: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" required />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-black uppercase text-sm transition-all">Criar</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-lg font-black uppercase text-sm transition-all">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Check-in */}
      {activeCheckin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Check-in</h2>
            <form onSubmit={handleCheckinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Descrição</label>
                <textarea value={checkinForm.description} onChange={(e) => setCheckinForm({description: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" rows={4}></textarea>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-black uppercase text-sm transition-all">Confirmar</button>
                <button type="button" onClick={() => setActiveCheckin(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-lg font-black uppercase text-sm transition-all">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Feedback */}
      {activeFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Feedback</h2>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Pontualidade (0-5)</label>
                <input type="number" min="0" max="5" value={feedbackForm.pontualidade} onChange={(e) => setFeedbackForm({...feedbackForm, pontualidade: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Áudio (0-5)</label>
                <input type="number" min="0" max="5" value={feedbackForm.audio} onChange={(e) => setFeedbackForm({...feedbackForm, audio: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Conteúdo (0-5)</label>
                <input type="number" min="0" max="5" value={feedbackForm.conteudo} onChange={(e) => setFeedbackForm({...feedbackForm, conteudo: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Comentários</label>
                <textarea value={feedbackForm.comentarios} onChange={(e) => setFeedbackForm({...feedbackForm, comentarios: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" rows={4}></textarea>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-black uppercase text-sm transition-all">Enviar</button>
                <button type="button" onClick={() => setActiveFeedback(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-lg font-black uppercase text-sm transition-all">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Confirmação de Deleção */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Confirmar Deleção</h2>
            <p className="text-slate-600 mb-6">Tem certeza que deseja deletar esta tutoria?</p>
            <div className="flex gap-3">
              <button onClick={() => handleDeleteTutoria(deleteConfirmation)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-black uppercase text-sm transition-all">Deletar</button>
              <button onClick={() => setDeleteConfirmation(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-lg font-black uppercase text-sm transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
