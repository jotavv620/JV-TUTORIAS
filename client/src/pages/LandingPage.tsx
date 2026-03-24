import React from 'react';
import { BookOpen, Users, Trophy, Zap, ArrowRight, Star, CheckCircle, BarChart3 } from 'lucide-react';
import { getLoginUrl } from '@/const';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">TUTORIA MANAGER</h1>
          </div>
          <div className="flex gap-4">
            <a href="#features" className="text-slate-600 font-bold text-sm hover:text-orange-500 transition">
              Recursos
            </a>
            <a href="#ranking" className="text-slate-600 font-bold text-sm hover:text-orange-500 transition">
              Ranking
            </a>
            <a href={getLoginUrl()} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition">
              Entrar
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-black text-slate-800 mb-6 leading-tight">
              Gerencie Tutorias com <span className="text-orange-500">Gamificação</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Plataforma completa para gerenciar tutorias, acompanhar desempenho de professores e incentivar excelência através de pontos, medalhas e achievements.
            </p>
            <div className="flex gap-4">
              <a
                href="/register"
                className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-orange-600 transition"
              >
                Começar Agora <ArrowRight size={20} />
              </a>
              <a href="/dashboard" className="border-2 border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-bold hover:border-slate-400 transition">
                Ver Tutorias
              </a>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-12 flex items-center justify-center">
            <div className="text-center">
              <Trophy size={64} className="text-orange-500 mx-auto mb-4" />
              <p className="text-xl font-black text-slate-800">Plataforma de Gestão</p>
              <p className="text-sm text-slate-600 mt-2">Tutorias • Gamificação • Ranking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-4xl font-black text-slate-800 text-center mb-16">Recursos Principais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, title: 'Gestão de Tutorias', desc: 'Crie, agende e acompanhe tutorias em tempo real' },
              { icon: Users, title: 'Múltiplos Perfis', desc: 'Professores, tutores e administradores' },
              { icon: Trophy, title: 'Gamificação', desc: 'Pontos, medalhas e achievements' },
              { icon: BarChart3, title: 'Análises', desc: 'Dashboards com estatísticas detalhadas' },
              { icon: Star, title: 'Feedback', desc: 'Sistema de avaliações com 5 estrelas' },
              { icon: Zap, title: 'Notificações', desc: 'Alertas automáticos por email' },
              { icon: CheckCircle, title: 'Check-in', desc: 'Registro de presença com timestamp' },
              { icon: BarChart3, title: 'Ranking', desc: 'Leaderboard de desempenho docente' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition">
                <feature.icon size={32} className="text-orange-500 mb-4" />
                <h4 className="font-black text-slate-800 mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Tutorias Ativas', value: '500+' },
            { label: 'Professores', value: '150+' },
            { label: 'Usuários', value: '2000+' },
            { label: 'Avaliação Média', value: '4.8⭐' },
          ].map((stat, i) => (
            <div key={i} className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl text-center">
              <p className="text-4xl font-black text-orange-600 mb-2">{stat.value}</p>
              <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ranking Preview Section */}
      <section id="ranking" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-4xl font-black text-slate-800 text-center mb-16">Top Professores</h3>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="divide-y">
              {[
                { rank: 1, name: 'Dr. Silva', points: 850, medal: '🥇', tutorias: 45 },
                { rank: 2, name: 'Dra. Costa', points: 720, medal: '🥈', tutorias: 38 },
                { rank: 3, name: 'Prof. Santos', points: 650, medal: '🥉', tutorias: 35 },
                { rank: 4, name: 'Prof. Oliveira', points: 580, medal: '💎', tutorias: 32 },
              ].map((prof) => (
                <div key={prof.rank} className="p-6 hover:bg-slate-50 transition flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center font-black text-orange-600">
                      #{prof.rank}
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{prof.name}</p>
                      <p className="text-sm text-slate-500">{prof.tutorias} tutorias</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl">{prof.medal}</p>
                    <p className="font-black text-orange-600">{prof.points} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-black text-white mb-6">Pronto para Começar?</h3>
          <p className="text-lg text-orange-100 mb-8">
            Junte-se a centenas de instituições que usam Tutoria Manager para gerenciar tutorias com excelência.
          </p>
          <a
            href="/register"
            className="inline-block bg-white text-orange-600 px-8 py-4 rounded-lg font-black text-lg hover:bg-orange-50 transition"
          >
            Cadastre-se Gratuitamente
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-black text-white mb-4">Tutoria Manager</h4>
              <p className="text-sm">Plataforma de gestão de tutorias com gamificação.</p>
            </div>
            <div>
              <h4 className="font-black text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition">Preços</a></li>
                <li><a href="#" className="hover:text-white transition">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition">Termos</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; 2026 Tutoria Manager. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
