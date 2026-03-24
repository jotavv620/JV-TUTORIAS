import React, { useState } from 'react';
import { Trophy, BookOpen, Users, Star, Search, Filter, Calendar, Clock, MapPin } from 'lucide-react';
import { getLoginUrl } from '@/const';

export default function PublicDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState('all');

  // Mock data for tutorias
  const tutorias = [
    {
      id: 1,
      discipline: 'Matemática',
      professor: 'Dr. Silva',
      institution: 'Campus A',
      date: '25/03/2026',
      time: '14:00 - 15:30',
      rating: 5,
      students: 12,
      status: 'Disponível'
    },
    {
      id: 2,
      discipline: 'Física',
      professor: 'Dra. Costa',
      institution: 'Campus B',
      date: '26/03/2026',
      time: '10:00 - 11:30',
      rating: 4.8,
      students: 8,
      status: 'Disponível'
    },
    {
      id: 3,
      discipline: 'Química',
      professor: 'Prof. Santos',
      institution: 'Campus A',
      date: '27/03/2026',
      time: '16:00 - 17:30',
      rating: 4.5,
      students: 15,
      status: 'Disponível'
    },
    {
      id: 4,
      discipline: 'Biologia',
      professor: 'Prof. Oliveira',
      institution: 'Campus C',
      date: '28/03/2026',
      time: '13:00 - 14:30',
      rating: 4.7,
      students: 10,
      status: 'Disponível'
    },
  ];

  // Mock ranking data
  const ranking = [
    { rank: 1, name: 'Dr. Silva', points: 850, medal: '🥇', tutorias: 45, rating: 4.9 },
    { rank: 2, name: 'Dra. Costa', points: 720, medal: '🥈', tutorias: 38, rating: 4.8 },
    { rank: 3, name: 'Prof. Santos', points: 650, medal: '🥉', tutorias: 35, rating: 4.6 },
    { rank: 4, name: 'Prof. Oliveira', points: 580, medal: '💎', tutorias: 32, rating: 4.7 },
    { rank: 5, name: 'Prof. Martins', points: 520, medal: '⭐', tutorias: 28, rating: 4.5 },
  ];

  const filteredTutorias = tutorias.filter(t => {
    const matchesSearch = t.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.professor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterDiscipline === 'all' || t.discipline === filterDiscipline;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 rounded-xl">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase italic">Tutoria Manager</h1>
              <p className="text-[10px] text-slate-500 font-bold">Plataforma Pública</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href={getLoginUrl()} className="px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition">
              Entrar
            </a>
            <a href="/register" className="bg-orange-500 text-white px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition">
              Cadastrar
            </a>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white">
            <div className="text-center">
              <p className="text-4xl font-black mb-2">500+</p>
              <p className="text-sm font-bold opacity-90">Tutorias Ativas</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black mb-2">150+</p>
              <p className="text-sm font-bold opacity-90">Professores</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black mb-2">2000+</p>
              <p className="text-sm font-bold opacity-90">Usuários</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black mb-2">4.8⭐</p>
              <p className="text-sm font-bold opacity-90">Avaliação Média</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search and Filter */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar disciplina ou professor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-slate-600" />
                  <select
                    value={filterDiscipline}
                    onChange={(e) => setFilterDiscipline(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    <option value="all">Todas as Disciplinas</option>
                    <option value="Matemática">Matemática</option>
                    <option value="Física">Física</option>
                    <option value="Química">Química</option>
                    <option value="Biologia">Biologia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tutorias List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-800 mb-6">Tutorias Disponíveis</h2>
              {filteredTutorias.map((tutoria) => (
                <div key={tutoria.id} className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">{tutoria.discipline}</h3>
                      <p className="text-sm text-slate-600 font-bold">{tutoria.professor}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.floor(tutoria.rating) ? 'fill-orange-400 text-orange-400' : 'text-slate-200'}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-slate-600">{tutoria.rating} / 5.0</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={16} className="text-orange-500" />
                      <span className="font-bold">{tutoria.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={16} className="text-orange-500" />
                      <span className="font-bold">{tutoria.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin size={16} className="text-orange-500" />
                      <span className="font-bold">{tutoria.institution}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users size={16} className="text-orange-500" />
                      <span className="font-bold">{tutoria.students} inscritos</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black">
                      {tutoria.status}
                    </span>
                    <a
                      href={getLoginUrl()}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition"
                    >
                      Inscrever-se
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Ranking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Trophy size={24} className="text-orange-500" />
                <h3 className="text-xl font-black text-slate-800">Top Professores</h3>
              </div>

              <div className="space-y-4">
                {ranking.map((prof) => (
                  <div key={prof.rank} className="pb-4 border-b border-slate-100 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center font-black text-orange-600 text-xs">
                          #{prof.rank}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{prof.name}</p>
                          <p className="text-xs text-slate-500">{prof.tutorias} tutorias</p>
                        </div>
                      </div>
                      <p className="text-lg">{prof.medal}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < Math.floor(prof.rating) ? 'fill-orange-400 text-orange-400' : 'text-slate-200'}
                          />
                        ))}
                      </div>
                      <p className="font-black text-orange-600 text-sm">{prof.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={getLoginUrl()}
                className="w-full mt-6 px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition text-center"
              >
                Ver Ranking Completo
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
