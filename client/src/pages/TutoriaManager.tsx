import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { Button } from '@/components/ui/button';
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
  LogOut,
  FileDown,
  TrendingUp,
  Bell,
  LineChart,
  Activity
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { AnalyticsTab, NotificationsTab, CalendarTab } from './AdvancedComponents';
import { Leaderboard, MedalsShowcase, AchievementsShowcase, PointsSummary } from './GamificationComponents';

// --- COMPONENTES DE INTERFACE ---

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

interface Tutoria {
  id: number;
  disciplina: string;
  professor: string;
  instituicao: string;
  tutor: string;
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

const Dashboard = ({ tutorias, setIsModalOpen, updateStatus, setDeleteConfirmation, setActiveCheckin, setActiveFeedback, renderStars }: any) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard label="Total Registado" val={tutorias.length} icon={ClipboardList} colorClass="bg-orange-50 text-orange-600" />
      <StatCard label="Pendentes" val={tutorias.filter((t: Tutoria) => t.status === 'scheduled').length} icon={Clock} colorClass="bg-blue-50 text-blue-600" />
      <StatCard label="Em Curso" val={tutorias.filter((t: Tutoria) => t.status === 'in_progress').length} icon={PlayCircle} colorClass="bg-orange-50 text-orange-600" />
      <StatCard label="Concluídas" val={tutorias.filter((t: Tutoria) => t.status === 'completed').length} icon={CheckCircle} colorClass="bg-blue-50 text-blue-600" />
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
          <thead className="bg-white text-slate-400 font-black uppercase text-[9px] tracking-widest border-b">
            <tr>
              <th className="px-6 py-4">Disciplina / Filial</th>
              <th className="px-6 py-4">Professor</th>
              <th className="px-6 py-4">Status / Check-in</th>
              <th className="px-6 py-4">Horário</th>
              <th className="px-6 py-4 text-right">Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tutorias.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center opacity-30 italic font-bold text-xs uppercase tracking-widest">
                  Nenhuma tutoria agendada no momento
                </td>
              </tr>
            ) : (
              tutorias.map((t: Tutoria) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{t.disciplina}</p>
                    <div className="flex items-center gap-1 text-[10px] text-orange-500 font-black uppercase">
                      <MapPin size={10} /> {t.instituicao}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.professor}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)} className="text-[9px] font-black px-2 py-1 rounded-md border-slate-100 outline-none w-fit uppercase bg-slate-100 cursor-pointer">
                        <option value="scheduled">Pendente</option>
                        <option value="in_progress">Em Curso</option>
                        <option value="completed">Concluída</option>
                      </select>
                      {t.checkin ? (
                        <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                          <ShieldCheck size={10} /> Check-in: {t.checkin.timestamp}
                        </span>
                      ) : t.status === 'in_progress' ? (
                        <button onClick={() => setActiveCheckin(t)} className="flex items-center gap-1 text-[8px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-full w-fit hover:bg-orange-100 uppercase transition-all">
                          <Camera size={10} /> Fazer Check-in
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-slate-600 tracking-tighter">
                    {t.data.split('-').reverse().join('/')} 
                    <br/> <span className="text-slate-400 text-[9px] font-bold">{t.horario} — {t.horarioTermino}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setDeleteConfirmation(t.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      {t.status !== 'completed' ? (
                        <button onClick={() => setActiveFeedback(t)} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-500">Avaliar</button>
                      ) : (
                        <div className="flex items-center">
                          {renderStars(t.feedback?.conteudo || 0)}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const Ranking = ({ ranking, renderStars, onExportPDF }: any) => (
  <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-8 py-6 border-b flex items-center justify-between bg-slate-50/30">
        <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
          <Trophy size={16} className="text-orange-500" /> Relatório de Desempenho Docente
        </h3>
        <button onClick={onExportPDF} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-orange-600 transition-all">
          <FileDown size={14} /> Exportar PDF
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-slate-400 font-black uppercase text-[9px] tracking-widest border-b">
            <tr>
              <th className="px-4 py-3">Pos.</th>
              <th className="px-4 py-3">Professor</th>
              <th className="px-4 py-3">Sessões</th>
              <th className="px-4 py-3">Média Geral</th>
              <th className="px-4 py-3">Classificação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {ranking.map((prof: any, i: number) => (
              <tr key={prof.name} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-5 font-black text-slate-400 text-sm">{i + 1}º</td>
                <td className="px-4 py-5 font-bold text-slate-800 text-sm uppercase tracking-tight">{prof.name}</td>
                <td className="px-4 py-5">
                   <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                     <ClipboardList size={12} /> {prof.count}
                   </div>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800">{prof.avg}</span>
                    <div className="flex">{renderStars(Math.round(parseFloat(prof.avg)))}</div>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                    prof.status === 'Excelente' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                    prof.status === 'Bom' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                  }`}>
                    {prof.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ranking.length === 0 && (
          <div className="text-center py-20">
            <Award className="mx-auto text-slate-200 mb-2" size={48} />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sem dados de avaliação disponíveis</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const Settings = ({ 
  disciplinas, professores, instituicoes, 
  inputDisciplina, setInputDisciplina, 
  inputProfessor, setInputProfessor, 
  inputInstituicao, setInputInstituicao, 
  handleAddItem, handleRemoveItem 
}: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in zoom-in duration-500">
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2 text-orange-500"><BookOpen size={16} /> Disciplinas</h3>
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Nome..." 
          className="flex-1 px-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none border-0 focus:ring-2 focus:ring-orange-200 transition-all" 
          value={inputDisciplina} 
          onChange={(e) => setInputDisciplina(e.target.value)} 
        />
        <button onClick={() => handleAddItem('disc', inputDisciplina)} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"><Plus size={16} /></button>
      </div>
      <div className="space-y-2">
        {disciplinas.map((d: string) => (
          <div key={d} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-600">
            <span>{d}</span>
            <button onClick={() => handleRemoveItem('disc', d)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={14} /></button>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2 text-orange-500"><User size={16} /> Professores</h3>
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Nome..." 
          className="flex-1 px-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none border-0 focus:ring-2 focus:ring-orange-200 transition-all" 
          value={inputProfessor} 
          onChange={(e) => setInputProfessor(e.target.value)} 
        />
        <button onClick={() => handleAddItem('prof', inputProfessor)} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"><Plus size={16} /></button>
      </div>
      <div className="space-y-2">
        {professores.map((p: string) => (
          <div key={p} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-600">
            <span>{p}</span>
            <button onClick={() => handleRemoveItem('prof', p)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={14} /></button>
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
          className="flex-1 px-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none border-0 focus:ring-2 focus:ring-orange-200 transition-all" 
          value={inputInstituicao} 
          onChange={(e) => setInputInstituicao(e.target.value)} 
        />
        <button onClick={() => handleAddItem('inst', inputInstituicao)} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"><Plus size={16} /></button>
      </div>
      <div className="space-y-2">
        {instituicoes.map((i: string) => (
          <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-600">
            <span>{i}</span>
            <button onClick={() => handleRemoveItem('inst', i)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function TutoriaManager() {
  const { user, logout, isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [tutorias, setTutorias] = useState<Tutoria[]>([
    {
      id: 1,
      disciplina: 'Matemática',
      professor: 'Dr. Silva',
      instituicao: 'Campus A',
      tutor: 'João Santos',
      data: '2026-03-25',
      horario: '14:00',
      horarioTermino: '15:30',
      status: 'completed',
      feedback: { pontualidade: 5, audio: 4, conteudo: 5, comentarios: 'Excelente aula, muito didático!' },
      checkin: { timestamp: '14:02' }
    },
    {
      id: 2,
      disciplina: 'Física',
      professor: 'Dra. Costa',
      instituicao: 'Campus B',
      tutor: 'Maria Oliveira',
      data: '2026-03-26',
      horario: '10:00',
      horarioTermino: '11:30',
      status: 'in_progress',
      feedback: null,
      checkin: null
    }
  ]);

  const [disciplinas, setDisciplinas] = useState(['Matemática', 'Física', 'Química', 'Português']);
  const [professores, setProfessores] = useState(['Dr. Silva', 'Dra. Costa', 'Prof. João']);
  const [instituicoes, setInstituicoes] = useState(['Campus A', 'Campus B', 'Campus C']);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCheckin, setActiveCheckin] = useState<Tutoria | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<Tutoria | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [newTutoria, setNewTutoria] = useState<Omit<Tutoria, 'id' | 'status' | 'feedback' | 'checkin'>>({
    instituicao: '',
    disciplina: '',
    professor: '',
    tutor: '',
    data: '',
    horario: '',
    horarioTermino: ''
  });

  const [checkinForm, setCheckinForm] = useState({ description: '' });
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({ pontualidade: 0, audio: 0, conteudo: 0, comentarios: '' });

  const [inputDisciplina, setInputDisciplina] = useState('');
  const [inputProfessor, setInputProfessor] = useState('');
  const [inputInstituicao, setInputInstituicao] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center">
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

  const handleAddTutoria = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(...tutorias.map(t => t.id), 0) + 1;
    setTutorias([...tutorias, { ...newTutoria, id: newId, status: 'scheduled', feedback: null, checkin: null } as Tutoria]);
    setNewTutoria({ instituicao: '', disciplina: '', professor: '', tutor: '', data: '', horario: '', horarioTermino: '' });
    setIsModalOpen(false);
  };

  const updateStatus = (id: number, newStatus: string) => {
    setTutorias(tutorias.map(t => t.id === id ? { ...t, status: newStatus as 'scheduled' | 'in_progress' | 'completed' } : t));
  };

  const deleteTutoria = (id: number) => {
    setTutorias(tutorias.filter(t => t.id !== id));
    setDeleteConfirmation(null);
  };

  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTutorias(tutorias.map(t => 
      t.id === (activeCheckin as Tutoria | null)?.id 
        ? { ...t, checkin: { timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) } }
        : t
    ));
    setActiveCheckin(null);
    setCheckinForm({ description: '' });
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setTutorias(tutorias.map(t => 
      t.id === (activeFeedback as Tutoria | null)?.id 
        ? { ...t, feedback: feedbackForm, status: 'completed' }
        : t
    ));
    setActiveFeedback(null);
    setFeedbackForm({ pontualidade: 0, audio: 0, conteudo: 0, comentarios: '' });
  };

  const handleImproveComment = async () => {
    setLoadingAI(true);
    setTimeout(() => {
      setFeedbackForm({...feedbackForm, comentarios: feedbackForm.comentarios + ' (Melhorado com IA)'});
      setLoadingAI(false);
    }, 1500);
  };

  const handleAddItem = (type: string, value: string) => {
    if (!value.trim()) return;
    if (type === 'disc') {
      setDisciplinas([...disciplinas, value]);
      setInputDisciplina('');
    } else if (type === 'prof') {
      setProfessores([...professores, value]);
      setInputProfessor('');
    } else if (type === 'inst') {
      setInstituicoes([...instituicoes, value]);
      setInputInstituicao('');
    }
  };

  const handleRemoveItem = (type: string, value: string) => {
    if (type === 'disc') setDisciplinas(disciplinas.filter(d => d !== value));
    else if (type === 'prof') setProfessores(professores.filter(p => p !== value));
    else if (type === 'inst') setInstituicoes(instituicoes.filter(i => i !== value));
  };

  const calculateProfessorStats = () => {
    const professors: { [key: string]: any } = {};
    
    tutorias.forEach((t: Tutoria) => {
      if (!professors[t.professor]) {
        professors[t.professor] = {
          name: t.professor,
          totalPoints: 0,
          tutoriasCompleted: 0,
          ratings: [],
          currentMedal: 'none'
        };
      }
      
      if (t.status === 'completed') {
        professors[t.professor].tutoriasCompleted += 1;
        professors[t.professor].totalPoints += 10;
        
        if (t.feedback) {
          const avgRating = (t.feedback.pontualidade + t.feedback.audio + t.feedback.conteudo) / 3;
          professors[t.professor].ratings.push(avgRating);
          
          if (avgRating >= 4.5) {
            professors[t.professor].totalPoints += 15;
          } else if (avgRating >= 3.5) {
            professors[t.professor].totalPoints += 10;
          } else {
            professors[t.professor].totalPoints += 5;
          }
        }
      }
    });
    
    Object.values(professors).forEach((prof: any) => {
      prof.averageRating = prof.ratings.length > 0 
        ? (prof.ratings.reduce((a: number, b: number) => a + b, 0) / prof.ratings.length).toFixed(1)
        : '0.0';
      
      if (prof.totalPoints >= 500) prof.currentMedal = 'platinum';
      else if (prof.totalPoints >= 300) prof.currentMedal = 'gold';
      else if (prof.totalPoints >= 150) prof.currentMedal = 'silver';
      else if (prof.totalPoints >= 50) prof.currentMedal = 'bronze';
    });
    
    return Object.values(professors);
  };

  const calculateAchievements = () => {
    const achievements: any[] = [];
    const professors = calculateProfessorStats();
    
    professors.forEach((prof: any) => {
      if (prof.tutoriasCompleted >= 1) {
        achievements.push({ id: 'first_tutoria', type: 'first_tutoria' });
      }
      if (prof.tutoriasCompleted >= 10) {
        achievements.push({ id: 'ten_tutorias', type: 'ten_tutorias' });
      }
      if (prof.tutoriasCompleted >= 50) {
        achievements.push({ id: 'fifty_tutorias', type: 'fifty_tutorias' });
      }
      if (prof.averageRating === '5.0') {
        achievements.push({ id: 'perfect_rating', type: 'perfect_rating' });
      }
      if (prof.totalPoints >= 300) {
        achievements.push({ id: 'master_teacher', type: 'master_teacher' });
      }
      if (prof.totalPoints >= 500) {
        achievements.push({ id: 'legendary', type: 'legendary' });
      }
    });
    
    return achievements;
  };

  const renderStars = (count: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} className={i <= count ? 'fill-orange-400 text-orange-400' : 'text-slate-200'} />
      ))}
    </div>
  );

  const calculateRanking = () => {
    const profMap: Record<string, { count: number; total: number }> = {};
    tutorias.forEach(t => {
      if (!profMap[t.professor]) {
        profMap[t.professor] = { count: 0, total: 0 };
      }
      profMap[t.professor].count++;
      if (t.feedback?.conteudo) {
        profMap[t.professor].total += t.feedback.conteudo;
      }
    });

    return Object.entries(profMap).map(([name, data]: [string, { count: number; total: number }]) => {
      const avg = data.count > 0 ? data.total / data.count : 0;
      return {
        name,
        count: data.count,
        avg: data.count > 0 ? (data.total / data.count).toFixed(1) : '0',
        status: avg >= 4.5 ? 'Excelente' : avg >= 3.5 ? 'Bom' : 'Regular'
      };
    }).sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));
  };

  const handleExportPDF = () => {
    const ranking = calculateRanking();
    const csvContent = [
      ['Posição', 'Professor', 'Sessões', 'Média Geral', 'Classificação'],
      ...ranking.map((prof, i) => [
        (i + 1).toString(),
        prof.name,
        prof.count.toString(),
        prof.avg,
        prof.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-desempenho-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 rounded-xl">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase italic">Tutoria Manager</h1>
              <p className="text-[10px] text-slate-500 font-bold">Bem-vindo, {user?.name || 'Usuário'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'ranking', label: 'Ranking', icon: Trophy },
                { id: 'analytics', label: 'Analítica', icon: LineChart },
                { id: 'notifications', label: 'Notificações', icon: Bell },
                { id: 'calendar', label: 'Calendário', icon: Calendar },
                { id: 'gamification', label: 'Gamificação', icon: Star },
                { id: 'settings', label: 'Configurações', icon: SettingsIcon }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    currentTab === tab.id
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </nav>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentTab === 'dashboard' && <Dashboard tutorias={tutorias} setIsModalOpen={setIsModalOpen} updateStatus={updateStatus} setDeleteConfirmation={setDeleteConfirmation} setActiveCheckin={setActiveCheckin} setActiveFeedback={setActiveFeedback} renderStars={renderStars} />}
        {currentTab === 'ranking' && <Ranking ranking={calculateRanking()} renderStars={renderStars} onExportPDF={handleExportPDF} />}
        {currentTab === 'analytics' && <AnalyticsTab tutorias={tutorias} />}
        {currentTab === 'notifications' && <NotificationsTab tutorias={tutorias} />}
        {currentTab === 'calendar' && <CalendarTab tutorias={tutorias} />}
        {currentTab === 'gamification' && (
          <div className="space-y-6">
            <PointsSummary professors={calculateProfessorStats()} />
            <Leaderboard professors={calculateProfessorStats()} />
            <MedalsShowcase professors={calculateProfessorStats()} />
            <AchievementsShowcase achievements={calculateAchievements()} />
          </div>
        )}
        {currentTab === 'settings' && <Settings disciplinas={disciplinas} professores={professores} instituicoes={instituicoes} inputDisciplina={inputDisciplina} setInputDisciplina={setInputDisciplina} inputProfessor={inputProfessor} setInputProfessor={setInputProfessor} inputInstituicao={inputInstituicao} setInputInstituicao={setInputInstituicao} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} />}
      </main>

      {/* --- MODAIS --- */}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-2xl font-black tracking-tighter uppercase italic text-slate-800">Agendar Sessão</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:text-orange-500 transition-colors p-1"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddTutoria} className="p-8 space-y-6">
              <div className="space-y-4">
                <select required className="w-full px-6 py-4 bg-slate-100 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-4 focus:ring-orange-100 transition-all cursor-pointer" value={newTutoria.instituicao} onChange={(e) => setNewTutoria({...newTutoria, instituicao: e.target.value})}>
                  <option value="">Selecione a Filial...</option>
                  {instituicoes.map((inst: string) => <option key={inst} value={inst}>{inst}</option>)}
                </select>
                <select required className="w-full px-6 py-4 bg-slate-100 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-4 focus:ring-orange-100 transition-all cursor-pointer" value={newTutoria.disciplina} onChange={(e) => setNewTutoria({...newTutoria, disciplina: e.target.value})}>
                  <option value="">Selecione a Disciplina...</option>
                  {disciplinas.map((d: string) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select required className="w-full px-6 py-4 bg-slate-100 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-4 focus:ring-orange-100 transition-all cursor-pointer" value={newTutoria.professor} onChange={(e) => setNewTutoria({...newTutoria, professor: e.target.value})}>
                  <option value="">Selecione o Professor...</option>
                  {professores.map((p: string) => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <input required type="text" className="w-full px-6 py-4 bg-slate-100 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-4 focus:ring-orange-100 transition-all" placeholder="Nome Bolsista..." value={newTutoria.tutor} onChange={(e) => setNewTutoria({...newTutoria, tutor: e.target.value})} />
                    <input required type="date" className="w-full px-6 py-4 bg-slate-100 rounded-2xl text-[10px] font-bold border-0 focus:ring-4 focus:ring-orange-100 outline-none transition-all" value={newTutoria.data} onChange={(e) => setNewTutoria({...newTutoria, data: e.target.value})} />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block ml-2">Período</label>
                    <div className="flex items-center gap-2">
                      <input required type="time" className="flex-1 px-3 py-3 bg-white rounded-xl text-xs font-bold border-0 outline-none focus:ring-2 focus:ring-orange-200 transition-all" value={newTutoria.horario} onChange={(e) => setNewTutoria({...newTutoria, horario: e.target.value})} />
                      <input required type="time" className="flex-1 px-3 py-3 bg-white rounded-xl text-xs font-bold border-0 outline-none focus:ring-2 focus:ring-orange-200 transition-all" value={newTutoria.horarioTermino} onChange={(e) => setNewTutoria({...newTutoria, horarioTermino: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-orange-500 text-white font-black py-5 rounded-3xl uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all">Confirmar Agendamento</button>
            </form>
          </div>
        </div>
      )}

      {activeCheckin && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-1 leading-none">Check-in</h3>
                <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest">{activeCheckin.disciplina}</p>
              </div>
              <Camera size={32} className="text-orange-400" />
            </div>
            <form onSubmit={handleCheckinSubmit} className="p-10 space-y-6">
              <div className="border-4 border-dashed border-slate-100 rounded-3xl p-8 text-center bg-slate-50 group hover:border-orange-300 cursor-pointer transition-all">
                <Upload size={32} className="mx-auto text-slate-200 mb-2 group-hover:text-orange-400" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Carregar Print da Aula</p>
              </div>
              <textarea required placeholder="Relato da atividade realizada..." className="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold h-32 resize-none outline-none focus:ring-4 focus:ring-orange-100" value={checkinForm.description} onChange={(e) => setCheckinForm({...checkinForm, description: e.target.value})} />
              <div className="flex gap-4">
                <button type="button" onClick={() => setActiveCheckin(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-3xl uppercase text-xs">Voltar</button>
                <button type="submit" className="flex-[2] py-5 bg-orange-500 text-white font-black rounded-3xl uppercase text-xs shadow-xl">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeFeedback && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase italic leading-none mb-1">Avaliação</h3>
                <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest">{activeFeedback.disciplina} • Prof. {activeFeedback.professor}</p>
              </div>
              <Sparkles size={32} className="text-orange-400" />
            </div>
            <form onSubmit={handleSubmitFeedback} className="p-10 space-y-8">
              <div className="space-y-4">
                {['pontualidade', 'audio', 'conteudo'].map((k) => (
                  <div key={k} className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <span className="font-black text-slate-800 text-[10px] uppercase tracking-widest capitalize">{k}</span>
                    <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map(star => (
                         <button 
                           key={star} 
                           type="button" 
                           onClick={() => setFeedbackForm({...feedbackForm, [k]: star})}
                           className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${(feedbackForm[k] as number) >= star ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-slate-200 border border-slate-100'}`}
                         >
                           <Star size={14} className={(feedbackForm[k] as number) >= star ? 'fill-current' : ''} />
                         </button>
                       ))}
                    </div>
                  </div>
                ))}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback Escrito</label>
                    <button type="button" onClick={handleImproveComment} disabled={loadingAI || !feedbackForm.comentarios} className="text-[9px] font-black text-orange-600 flex items-center gap-1 uppercase hover:text-orange-800 disabled:opacity-30">
                      {loadingAI ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Polir ✨
                    </button>
                  </div>
                  <textarea className="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold h-32 resize-none outline-none focus:ring-4 focus:ring-orange-100" value={feedbackForm.comentarios} onChange={(e) => setFeedbackForm({...feedbackForm, comentarios: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setActiveFeedback(null)} className="flex-1 py-5 bg-slate-100 font-black rounded-3xl uppercase text-xs">Sair</button>
                <button type="submit" className="flex-[2] py-5 bg-blue-600 text-white font-black rounded-3xl uppercase text-xs shadow-xl">Submeter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 text-center animate-in zoom-in">
            <AlertCircle size={40} className="text-red-600 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase italic leading-none">Eliminar?</h3>
            <p className="text-slate-400 text-[10px] font-bold mb-10 leading-relaxed uppercase tracking-widest">Esta ação removerá o registo permanentemente.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirmation(null)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-500 font-black rounded-3xl text-xs uppercase tracking-widest">Não</button>
              <button onClick={() => deleteTutoria(deleteConfirmation)} className="flex-1 px-4 py-3 bg-red-600 text-white font-black rounded-3xl shadow-xl shadow-red-100 text-xs uppercase tracking-widest">Sim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
