import React from 'react';
import { Shield, Users, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { getLoginUrl } from '@/const';

export default function LoginTypeSelector() {
  const [, setLocation] = useLocation();

  const handleAdminLogin = () => {
    // Store the user type in sessionStorage before redirecting
    sessionStorage.setItem('userType', 'admin');
    // Redirect to Manus OAuth login
    window.location.href = getLoginUrl();
  };

  const handleBolsistaLogin = () => {
    // Store the user type in sessionStorage before redirecting
    sessionStorage.setItem('userType', 'bolsista');
    // Redirect to Manus OAuth login
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-800 mb-2">Tutoria Manager</h1>
          <p className="text-slate-600 text-lg">Selecione seu tipo de acesso</p>
        </div>

        {/* Login Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Card */}
          <div
            onClick={handleAdminLogin}
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-orange-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-orange-600" size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Administrador</h2>
              <p className="text-slate-600 mb-6">
                Acesso completo ao sistema. Gerencie tutorias, professores, bolsistas e configurações.
              </p>
              <ul className="text-left text-sm text-slate-600 mb-6 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-orange-500">✓</span>
                  Gerenciar todas as tutorias
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-500">✓</span>
                  Cadastrar professores e bolsistas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-500">✓</span>
                  Visualizar relatórios e analytics
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-500">✓</span>
                  Configurar disciplinas e instituições
                </li>
              </ul>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                Entrar como Admin
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Bolsista Card */}
          <div
            onClick={handleBolsistaLogin}
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="text-blue-600" size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Bolsista</h2>
              <p className="text-slate-600 mb-6">
                Acesso restrito. Visualize e gerencie apenas suas tutorias.
              </p>
              <ul className="text-left text-sm text-slate-600 mb-6 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  Ver minhas tutorias
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  Registrar check-in
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  Enviar feedback
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  Ver meu desempenho
                </li>
              </ul>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                Entrar como Bolsista
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-slate-600 text-sm">
          <p>Você será redirecionado para fazer login com sua conta Manus</p>
        </div>
      </div>
    </div>
  );
}
