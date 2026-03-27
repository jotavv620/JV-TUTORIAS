import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [, navigate] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Login mutation
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Login realizado com sucesso!");
      setEmail("");
      setPassword("");
      setTimeout(() => navigate("/dashboard"), 500);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao fazer login");
      setIsLoading(false);
    },
  });

  // Register mutation
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Conta criada com sucesso! Faça login para continuar.");
      setEmail("");
      setPassword("");
      setName("");
      setIsLogin(true);
    },
    onError: (error: any) => {
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
      userType: "bolsista",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">TM</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Tutoria Manager</h1>
          <p className="text-slate-600 mt-2">Gerencie suas tutorias com facilidade</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          {isLogin ? (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Fazer Login</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-semibold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-semibold">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg mt-6"
                  disabled={isLoading || loginMutation.isPending}
                >
                  {isLoading || loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={18} />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2" size={18} />
                      Entrar
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-600">
                  Não tem conta?{" "}
                  <button
                    onClick={() => {
                      setIsLogin(false);
                      setEmail("");
                      setPassword("");
                      setName("");
                    }}
                    className="text-orange-600 hover:text-orange-700 font-bold underline"
                  >
                    Criar agora
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Criar Conta</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-semibold">
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-slate-700 font-semibold">
                    Email
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-slate-700 font-semibold">
                    Senha (mínimo 6 caracteres)
                  </Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg mt-6"
                  disabled={isLoading || registerMutation.isPending}
                >
                  {isLoading || registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={18} />
                      Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2" size={18} />
                      Criar Conta
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-600">
                  Já tem conta?{" "}
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      setEmail("");
                      setPassword("");
                      setName("");
                    }}
                    className="text-blue-600 hover:text-blue-700 font-bold underline"
                  >
                    Entrar
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-600 text-sm">
          <p>© 2026 Tutoria Manager. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
