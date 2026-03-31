import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, Mail, ArrowRightLeft } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CommunicationDashboard() {
  const { data: syncHistory, isLoading: syncLoading } = trpc.syncHistory.getAll.useQuery({
    limit: 50,
    offset: 0,
  });

  const { data: emailLogs, isLoading: emailLoading } = trpc.emailLog.getAll.useQuery({
    limit: 50,
    offset: 0,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle2 size={14} />
            Sucesso
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <AlertCircle size={14} />
            Erro
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock size={14} />
            Pendente
          </Badge>
        );
      case "sent":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle2 size={14} />
            Enviado
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <AlertCircle size={14} />
            Falha
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Comunicações</h1>
        <p className="text-gray-600 mt-2">
          Acompanhe todas as sincronizações com Google Calendar e emails enviados
        </p>
      </div>

      <Tabs defaultValue="sync" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <ArrowRightLeft size={16} />
            Sincronizações Google Calendar
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail size={16} />
            Emails Enviados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="space-y-4">
          {syncLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500">Carregando sincronizações...</p>
              </CardContent>
            </Card>
          ) : !syncHistory || syncHistory.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500">Nenhuma sincronização registrada ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {syncHistory.map((sync: any) => (
                <Card key={sync.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">Tutoria #{sync.tutoriaId}</h3>
                          {getStatusBadge(sync.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {sync.syncType === "google_calendar" && "Google Calendar"}
                        </p>
                        {sync.message && (
                          <p className="text-sm text-red-600 mt-1">{sync.message}</p>
                        )}
                        {sync.googleEventId && (
                          <p className="text-sm text-blue-600 mt-1">
                            ID do Evento: {sync.googleEventId}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(sync.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          {emailLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500">Carregando emails...</p>
              </CardContent>
            </Card>
          ) : !emailLogs || emailLogs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500">Nenhum email registrado ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {emailLogs.map((email: any) => (
                <Card key={email.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {email.emailType === "tutoria_reminder" && "Lembrete de Tutoria"}
                            {email.emailType === "sync_notification" && "Notificação de Sincronização"}
                            {email.emailType === "error_notification" && "Notificação de Erro"}
                          </h3>
                          {getStatusBadge(email.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          Para: {email.recipientEmail} ({email.recipientType})
                        </p>
                        <p className="text-sm text-gray-600">
                          Assunto: {email.subject}
                        </p>
                        {email.errorMessage && (
                          <p className="text-sm text-red-600 mt-1">{email.errorMessage}</p>
                        )}
                        {email.sentAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Enviado em: {format(new Date(email.sentAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(email.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
