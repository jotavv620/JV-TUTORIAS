import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminAccessTokens() {
  const { user } = useAuth();
  const [showToken, setShowToken] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    userType: "bolsista" as const,
    expiresInDays: "",
  });

  // Queries
  const { data: tokens, isLoading, refetch } = trpc.accessTokens.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  // Mutations
  const createMutation = trpc.accessTokens.generate.useMutation({
    onSuccess: (data) => {
      toast.success("Token criado com sucesso!");
      setFormData({ name: "", userType: "bolsista", expiresInDays: "" });
      refetch();
      
      // Show the token in a modal or toast
      setTimeout(() => {
        toast.success(`Token: ${data.token}`, {
          duration: 10000,
          description: "Copie este token agora. Ele não será exibido novamente!",
        });
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar token");
    },
  });

  const revokeMutation = trpc.accessTokens.revoke.useMutation({
    onSuccess: () => {
      toast.success("Token revogado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao revogar token");
    },
  });

  const deleteMutation = trpc.accessTokens.delete.useMutation({
    onSuccess: () => {
      toast.success("Token deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar token");
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Você não tem permissão para acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nome do token é obrigatório");
      return;
    }

    await createMutation.mutateAsync({
      name: formData.name,
      userType: formData.userType,
      expiresInDays: formData.expiresInDays ? parseInt(formData.expiresInDays) : undefined,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Sem expiração";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const isExpired = (expiresAt: Date | null | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Códigos de Acesso</h1>
        <p className="text-gray-600 mt-2">
          Crie e gerencie códigos de acesso para usuários fazerem login sem email/senha.
        </p>
      </div>

      {/* Create Token Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Criar Novo Token
          </CardTitle>
          <CardDescription>
            Gere um novo código de acesso para um usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateToken} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome/Descrição</label>
                <Input
                  placeholder="Ex: João Silva - Bolsista"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Usuário</label>
                <Select value={formData.userType} onValueChange={(value: any) => setFormData({ ...formData, userType: value })}>
                  <SelectTrigger disabled={createMutation.isPending}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bolsista">Bolsista</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expira em (dias)</label>
                <Input
                  type="number"
                  placeholder="Deixe em branco para sem expiração"
                  value={formData.expiresInDays}
                  onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value })}
                  disabled={createMutation.isPending}
                  min="1"
                />
              </div>
            </div>

            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? "Criando..." : "Criar Token"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tokens List */}
      <Card>
        <CardHeader>
          <CardTitle>Tokens Gerados</CardTitle>
          <CardDescription>
            {tokens?.length || 0} token(s) criado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : tokens && tokens.length > 0 ? (
            <div className="space-y-3">
              {tokens.map((token) => (
                <div key={token.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{token.name}</h3>
                        <Badge variant={token.isActive ? "default" : "secondary"}>
                          {token.isActive ? "Ativo" : "Revogado"}
                        </Badge>
                        {isExpired(token.expiresAt) && (
                          <Badge variant="destructive">Expirado</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Tipo: <span className="font-medium">{token.userType}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Criado em: {new Date(token.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      {token.expiresAt && (
                        <p className="text-sm text-gray-600">
                          Expira em: {formatDate(token.expiresAt)}
                        </p>
                      )}
                      {token.usedAt && (
                        <p className="text-sm text-green-600">
                          Usado em: {new Date(token.usedAt).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Token Display */}
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 flex items-center justify-between">
                    <code className="text-xs font-mono">
                      {showToken === token.id ? token.token : "•".repeat(32)}
                    </code>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowToken(showToken === token.id ? null : token.id)}
                      >
                        {showToken === token.id ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(token.token)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    {token.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeMutation.mutate({ tokenId: token.id })}
                        disabled={revokeMutation.isPending}
                      >
                        Revogar
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja deletar este token?")) {
                          deleteMutation.mutate({ tokenId: token.id });
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum token criado ainda. Crie um novo token acima.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
