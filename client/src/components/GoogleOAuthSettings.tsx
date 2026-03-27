import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, LogOut, LogIn } from 'lucide-react';

export function GoogleOAuthSettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Query status
  const { data: statusData, refetch: refetchStatus } = trpc.google.getStatus.useQuery();

  // Get auth URL
  const getAuthUrlMutation = trpc.google.getAuthUrl.useMutation({
    onSuccess: (data: any) => {
      window.location.href = data.authUrl;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao conectar com Google');
      setIsLoading(false);
    },
  });

  // Disconnect
  const disconnectMutation = trpc.google.disconnect.useMutation({
    onSuccess: () => {
      setIsConnected(false);
      refetchStatus();
      toast.success('Desconectado do Google com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao desconectar do Google');
    },
  });

  useEffect(() => {
    if (statusData) {
      setIsConnected(statusData.connected);
    }
  }, [statusData]);

  const handleConnect = async () => {
    setIsLoading(true);
    await getAuthUrlMutation.mutateAsync();
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await disconnectMutation.mutateAsync();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Google Calendar</h3>
          <p className="text-sm text-slate-500 mt-1">
            {isConnected
              ? 'Sua conta Google está conectada'
              : 'Conecte sua conta Google para sincronizar tutorias automaticamente'}
          </p>
        </div>

        {isConnected ? (
          <button
            onClick={handleDisconnect}
            disabled={isLoading || disconnectMutation.isPending}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading || disconnectMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogOut size={16} />
            )}
            Desconectar
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isLoading || getAuthUrlMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading || getAuthUrlMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            Conectar Google
          </button>
        )}
      </div>

      {isConnected && statusData?.expiresAt && (
        <div className="mt-4 text-xs text-slate-500">
          Token expira em: {new Date(statusData.expiresAt).toLocaleDateString('pt-BR')}
        </div>
      )}
    </div>
  );
}
