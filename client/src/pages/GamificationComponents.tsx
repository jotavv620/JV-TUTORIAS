import React from 'react';
import { Trophy, Medal, Star, Award, Zap, Target, Crown, Flame } from 'lucide-react';

interface ProfessorStats {
  name: string;
  totalPoints: number;
  tutoriasCompleted: number;
  averageRating: string;
  currentMedal: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  rank?: number;
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  pointsReward: number;
  unlockedAt?: Date;
}

// Leaderboard Component
export const Leaderboard = ({ professors }: { professors: ProfessorStats[] }) => {
  const getMedalColor = (medal: string) => {
    switch (medal) {
      case 'platinum':
        return 'from-cyan-400 to-blue-500';
      case 'gold':
        return 'from-yellow-400 to-orange-500';
      case 'silver':
        return 'from-gray-300 to-gray-400';
      case 'bronze':
        return 'from-orange-600 to-amber-700';
      default:
        return 'from-slate-300 to-slate-400';
    }
  };

  const getMedalIcon = (medal: string) => {
    switch (medal) {
      case 'platinum':
        return '💎';
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '⭐';
    }
  };

  const sortedProfessors = [...professors].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b bg-gradient-to-r from-orange-50 to-orange-100 flex items-center gap-3">
          <Trophy size={20} className="text-orange-600" />
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Ranking de Professores</h3>
        </div>
        <div className="divide-y">
          {sortedProfessors.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
              Nenhum professor registrado
            </div>
          ) : (
            sortedProfessors.map((prof, index) => (
              <div key={prof.name} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
                      <span className="text-xl font-black text-orange-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-800 text-sm">{prof.name}</p>
                        <span className="text-2xl">{getMedalIcon(prof.currentMedal)}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold mt-1">
                        {prof.tutoriasCompleted} tutorias • Média: {prof.averageRating}⭐
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-orange-600">{prof.totalPoints}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Pontos</p>
                  </div>
                </div>
                <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-full transition-all"
                    style={{ width: `${Math.min((prof.totalPoints / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Medals Component
export const MedalsShowcase = ({ professors }: { professors: ProfessorStats[] }) => {
  const getMedalDetails = (medal: string) => {
    switch (medal) {
      case 'platinum':
        return { title: 'Platina', color: 'from-cyan-400 to-blue-500', minPoints: 500, description: 'Mestre Supremo' };
      case 'gold':
        return { title: 'Ouro', color: 'from-yellow-400 to-orange-500', minPoints: 300, description: 'Excelência' };
      case 'silver':
        return { title: 'Prata', color: 'from-gray-300 to-gray-400', minPoints: 150, description: 'Muito Bom' };
      case 'bronze':
        return { title: 'Bronze', color: 'from-orange-600 to-amber-700', minPoints: 50, description: 'Iniciante' };
      default:
        return { title: 'Sem Medalha', color: 'from-slate-300 to-slate-400', minPoints: 0, description: 'Comece a ganhar pontos' };
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b bg-gradient-to-r from-purple-50 to-purple-100 flex items-center gap-3">
          <Medal size={20} className="text-purple-600" />
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Medalhas Conquistadas</h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['platinum', 'gold', 'silver', 'bronze'].map((medalType) => {
              const details = getMedalDetails(medalType);
              const hasIt = professors.some(p => p.currentMedal === medalType);
              
              return (
                <div
                  key={medalType}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    hasIt
                      ? `bg-gradient-to-br ${details.color} border-transparent text-white`
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {medalType === 'platinum' ? '💎' : medalType === 'gold' ? '🥇' : medalType === 'silver' ? '🥈' : '🥉'}
                    </div>
                    <p className="font-black text-sm uppercase tracking-widest">{details.title}</p>
                    <p className="text-xs mt-2 opacity-90">{details.description}</p>
                    <p className="text-xs font-bold mt-3">{details.minPoints}+ pontos</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Achievements Component
export const AchievementsShowcase = ({ achievements }: { achievements: Achievement[] }) => {
  const achievementDefinitions = [
    { id: 'first_tutoria', title: 'Primeiro Passo', icon: '🎯', description: 'Complete sua primeira tutoria', points: 10 },
    { id: 'ten_tutorias', title: 'Dez Tutorias', icon: '🚀', description: 'Complete 10 tutorias', points: 50 },
    { id: 'fifty_tutorias', title: 'Cinquenta Tutorias', icon: '⚡', description: 'Complete 50 tutorias', points: 150 },
    { id: 'perfect_rating', title: 'Avaliação Perfeita', icon: '⭐', description: 'Receba 5 estrelas em feedback', points: 100 },
    { id: 'consistency', title: 'Consistência', icon: '📈', description: 'Mantenha média alta por 10 tutorias', points: 75 },
    { id: 'rising_star', title: 'Estrela em Ascensão', icon: '✨', description: 'Ganhe 100 pontos em um mês', points: 80 },
    { id: 'master_teacher', title: 'Mestre Professor', icon: '👑', description: 'Atinja 300 pontos totais', points: 120 },
    { id: 'legendary', title: 'Lendário', icon: '🏆', description: 'Atinja 500 pontos totais', points: 200 },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b bg-gradient-to-r from-blue-50 to-blue-100 flex items-center gap-3">
          <Award size={20} className="text-blue-600" />
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Conquistas Desbloqueáveis</h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievementDefinitions.map((ach) => {
              const unlocked = achievements.some(a => a.id === ach.id);
              
              return (
                <div
                  key={ach.id}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="text-3xl mb-2">{ach.icon}</div>
                  <p className="font-black text-sm text-slate-800 uppercase tracking-widest">{ach.title}</p>
                  <p className="text-xs text-slate-600 mt-2">{ach.description}</p>
                  <div className="mt-3 flex items-center justify-center gap-1">
                    <Zap size={14} className="text-yellow-600" />
                    <span className="text-xs font-black text-yellow-600">+{ach.points} pts</span>
                  </div>
                  {unlocked && (
                    <div className="mt-3 text-[9px] font-black text-green-600 uppercase tracking-widest">
                      ✓ Desbloqueado
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Points Summary Component
export const PointsSummary = ({ professors }: { professors: ProfessorStats[] }) => {
  const totalPoints = professors.reduce((sum, p) => sum + p.totalPoints, 0);
  const avgRating = professors.length > 0
    ? (professors.reduce((sum, p) => sum + parseFloat(p.averageRating), 0) / professors.length).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-600 font-black uppercase tracking-widest">Total de Pontos</p>
            <p className="text-3xl font-black text-orange-700 mt-2">{totalPoints}</p>
          </div>
          <Zap size={32} className="text-orange-500 opacity-50" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 font-black uppercase tracking-widest">Professores Ativos</p>
            <p className="text-3xl font-black text-blue-700 mt-2">{professors.length}</p>
          </div>
          <Crown size={32} className="text-blue-500 opacity-50" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-600 font-black uppercase tracking-widest">Média de Avaliações</p>
            <p className="text-3xl font-black text-purple-700 mt-2">{avgRating}⭐</p>
          </div>
          <Star size={32} className="text-purple-500 opacity-50" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-red-600 font-black uppercase tracking-widest">Tutorias Totais</p>
            <p className="text-3xl font-black text-red-700 mt-2">{professors.reduce((sum, p) => sum + p.tutoriasCompleted, 0)}</p>
          </div>
          <Flame size={32} className="text-red-500 opacity-50" />
        </div>
      </div>
    </div>
  );
};
