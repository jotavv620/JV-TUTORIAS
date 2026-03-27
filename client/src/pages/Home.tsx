import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, UserPlus, BookOpen, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "bolsista" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Login mutation
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Login realizado com sucesso!");
      setShowLoginDialog(false);
      setEmail("");
      setPassword("");
      setTimeout(() => navigate("/dashboard"), 500);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
      setIsLoading(false);
    },
  });

  // Register mutation
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Conta criada com sucesso! Faça login para continuar.");
      setShowRegisterDialog(false);
      setEmail("");
      setPassword("");
      setName("");
      setShowLoginDialog(true);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar conta");
      setIsLoading(false);
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha email e senha");
      return;
    }
    setIsLoading(true);
    await loginMutation.mutateAsync({
      email,
      password,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres");
      return;
    }
    setIsLoading(true);
    await registerMutation.mutateAsync({
      email,
      password,
      name,
      userType: selectedRole === "admin" ? "admin" : "bolsista",
    });
  };

  // If already authenticated, show dashboard redirect
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-orange-600" size={32} />
          <p className="text-slate-600">Redirecionando para o dashboard...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50">
        <Loader2 className="animate-spin text-orange-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Tutoria Manager</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-slate-900 mb-4">
            Gerencie suas Tutorias com Facilidade
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Organize agendamentos, acompanhe progresso e sincronize com Google Calendar
          </p>

          {/* Role Selection Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setSelectedRole("admin");
                  setShowLoginDialog(true);
                }}
                className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <LogIn className="mr-2" size={20} />
                Entrar como Admin
              </Button>
              <p className="text-sm text-slate-500">Gerenciar tutorias e professores</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setSelectedRole("bolsista");
                  setShowLoginDialog(true);
                }}
                className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Users className="mr-2" size={20} />
                Entrar como Bolsista
              </Button>
              <p className="text-sm text-slate-500">Acompanhar suas tutorias</p>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-8">
            <p className="text-slate-600 mb-4">Não tem conta?</p>
            <Button
              onClick={() => {
                setShowRegisterDialog(true);
                setShowLoginDialog(false);
              }}
              variant="outline"
              className="px-8 py-6 text-lg font-bold border-2 border-slate-300 hover:border-slate-400"
            >
              <UserPlus className="mr-2" size={20} />
              Criar Conta
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="text-orange-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Organize Tutorias</h3>
            <p className="text-slate-600">
              Crie, edite e acompanhe todas as suas tutorias em um único lugar
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sincronize com Google</h3>
            <p className="text-slate-600">
              Sincronize automaticamente suas tutorias com Google Calendar
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Gamificação</h3>
            <p className="text-slate-600">
              Ganhe pontos, medalhas e suba no ranking de professores
            </p>
          </div>
        </div>
      </main>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRole === "admin" ? "Login - Admin" : "Login - Bolsista"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full font-bold"
              disabled={isLoading || loginMutation.isPending}
            >
              {isLoading || loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2" size={16} />
                  Entrar
                </>
              )}
            </Button>

            <div className="text-center text-sm text-slate-600">
              Não tem conta?{" "}
              <button
                type="button"
                onClick={() => {
                  setShowLoginDialog(false);
                  setShowRegisterDialog(true);
                }}
                className="text-blue-600 hover:underline font-bold"
              >
                Criar agora
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Conta</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Senha</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <div className="text-sm text-slate-600">
                {selectedRole === "admin" ? "Admin" : "Bolsista"}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-bold"
              disabled={isLoading || registerMutation.isPending}
            >
              {isLoading || registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2" size={16} />
                  Criar Conta
                </>
              )}
            </Button>

            <div className="text-center text-sm text-slate-600">
              Já tem conta?{" "}
              <button
                type="button"
                onClick={() => {
                  setShowRegisterDialog(false);
                  setShowLoginDialog(true);
                }}
                className="text-blue-600 hover:underline font-bold"
              >
                Entrar
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
