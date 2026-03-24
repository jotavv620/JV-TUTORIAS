import React from 'react';
import { TrendingUp, Bell, Calendar, Activity, MessageSquare, Plus, X } from 'lucide-react';

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

// Analytics Component
export const AnalyticsTab = ({ tutorias }: { tutorias: Tutoria[] }) => {
  const completedCount = tutorias.filter(t => t.status === 'completed').length;
  const completionRate = tutorias.length > 0 ? Math.round((completedCount / tutorias.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-orange-500" /> Tutorias por Mês
          </h3>
          <div className="w-full h-64 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center text-slate-600 text-sm font-bold">
            <div className="text-center">
              <p className="text-3xl font-black text-orange-600 mb-2">{tutorias.length}</p>
              <p className="text-xs uppercase tracking-widest">Total de Tutorias</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
            <Activity size={16} className="text-blue-500" /> Média de Avaliações
          </h3>
          <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-slate-600 text-sm font-bold">
            <div className="text-center">
              <p className="text-3xl font-black text-blue-600 mb-2">4.5</p>
              <p className="text-xs uppercase tracking-widest">Média Geral ⭐</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6">Estatísticas Gerais</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
            <p className="text-xs text-orange-600 font-black uppercase mb-2">Total Concluídas</p>
            <p className="text-3xl font-black text-orange-700">{completedCount}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
            <p className="text-xs text-blue-600 font-black uppercase mb-2">Taxa de Conclusão</p>
            <p className="text-3xl font-black text-blue-700">{completionRate}%</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl">
            <p className="text-xs text-emerald-600 font-black uppercase mb-2">Média Geral</p>
            <p className="text-3xl font-black text-emerald-700">4.5⭐</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
            <p className="text-xs text-purple-600 font-black uppercase mb-2">Professores Ativos</p>
            <p className="text-3xl font-black text-purple-700">{new Set(tutorias.map(t => t.professor)).size}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications Component
export const NotificationsTab = ({ tutorias }: { tutorias: Tutoria[] }) => {
  const upcomingTutorias = tutorias.filter(t => t.status === 'scheduled').slice(0, 5);
  
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b bg-slate-50/30 flex items-center gap-2">
          <Bell size={18} className="text-orange-500" />
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Próximas Tutorias</h3>
        </div>
        <div className="divide-y">
          {upcomingTutorias.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhuma tutoria agendada</div>
          ) : (
            upcomingTutorias.map((t: Tutoria) => (
              <div key={t.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-slate-800 text-sm">{t.disciplina}</p>
                    <p className="text-xs text-slate-500 font-bold mt-1">Prof. {t.professor} • {t.data} às {t.horario}</p>
                  </div>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">Pendente</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
          <MessageSquare size={16} className="text-blue-500" /> Configurar Notificações
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-orange-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Email 30 minutos antes da tutoria</span>
          </label>
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-orange-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Notificação quando feedback é recebido</span>
          </label>
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
            <input type="checkbox" className="w-4 h-4 accent-orange-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">SMS para tutorias críticas</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Calendar Component
export const CalendarTab = ({ tutorias }: { tutorias: Tutoria[] }) => {
  return (
    <div className="space-y-6 animate-in zoom-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-orange-500" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Calendário de Tutorias</h3>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase transition-all">
            Sincronizar Google
          </button>
        </div>
        <div className="p-8">
          <div className="bg-slate-50 rounded-xl p-8 text-center">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Calendário integrado com Google Calendar</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorias.slice(0, 4).map((t: Tutoria, i: number) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 text-left hover:shadow-md transition-all">
                  <p className="font-black text-slate-800 text-sm">{t.disciplina}</p>
                  <p className="text-xs text-slate-500 font-bold mt-2">{t.data} • {t.horario}</p>
                  <p className="text-xs text-orange-600 font-black mt-2 uppercase">Prof. {t.professor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
