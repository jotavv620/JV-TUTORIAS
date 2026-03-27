import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, UserPlus, Key } from 'lucide-react';

export default function Home() {
  const [loginMode, setLoginMode] = useState<'email' | 'token'>('token'); // Default to token
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login with email mutation
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success('Login realizado com sucesso!');
      setEmail('');
      setPassword('');
      setIsLoading(false);
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao fazer login');
      setIsLoading(false);
    },
  });

  // Login with access token mutation
  const loginWithTokenMutation = trpc.auth.loginWithToken.useMutation({
    onSuccess: () => {
      toast.success('Acesso concedido! Bem-vindo!');
      setAccessToken('');
      setIsLoading(false);
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Código de acesso inválido');
      setIsLoading(false);
    },
  });

  // Register mutation
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      setEmail('');
      setPassword('');
      setName('');
      setLoginMode('email');
      setIsLoading(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao criar conta');
      setIsLoading(false);
    },
  });

  const handleLoginWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha email e senha');
      return;
    }
    setIsLoading(true);
    await loginMutation.mutateAsync({
      email,
      password,
    });
  };

  const handleLoginWithToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error('Insira o código de acesso');
      return;
    }
    setIsLoading(true);
    await loginWithTokenMutation.mutateAsync({
      token: accessToken,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    setIsLoading(true);
    await registerMutation.mutateAsync({
      name,
      email,
      password,
      userType: 'bolsista',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">TM</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Tutoria Manager</h1>
          <p className="text-slate-500 mt-2">Gerencie suas tutorias com facilidade</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          {/* Mode Selector */}
          <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setLoginMode('token')}
              className={`flex-1 py-2 px-3 rounded-md font-medium transition-all text-sm ${
                loginMode === 'token'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="w-4 h-4 inline mr-1" />
              Código
            </button>
            <button
              onClick={() => setLoginMode('email')}
              className={`flex-1 py-2 px-3 rounded-md font-medium transition-all text-sm ${
                loginMode === 'email'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-1" />
              Email
            </button>
          </div>

          {/* Token Login Form */}
          {loginMode === 'token' && (
            <form onSubmit={handleLoginWithToken} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Código de Acesso
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value.toUpperCase())}
                    placeholder="Cole seu código aqui"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Código fornecido pelo administrador</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Acessar com Código
                  </>
                )}
              </button>
            </form>
          )}

          {/* Email Login/Register Form */}
          {loginMode === 'email' && (
            <>
              {/* Tabs for Login/Register */}
              <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => {}}
                  className="flex-1 py-2 px-4 rounded-md font-medium transition-all bg-white text-orange-600 shadow-sm text-sm"
                >
                  <LogIn className="w-4 h-4 inline mr-1" />
                  Entrar
                </button>
                <button
                  onClick={() => {}}
                  className="flex-1 py-2 px-4 rounded-md font-medium transition-all text-slate-600 hover:text-slate-900 text-sm"
                >
                  <UserPlus className="w-4 h-4 inline mr-1" />
                  Registrar
                </button>
              </div>

              <form onSubmit={handleLoginWithEmail} className="space-y-4">
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Entrar
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">ou</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            className="w-full border border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          {loginMode === 'token' ? (
            <>
              Não tem código?{' '}
              <button
                onClick={() => setLoginMode('email')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Use email/senha
              </button>
            </>
          ) : (
            <>
              Tem um código de acesso?{' '}
              <button
                onClick={() => setLoginMode('token')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Use o código
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
