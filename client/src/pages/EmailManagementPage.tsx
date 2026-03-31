import { trpc } from '@/lib/trpc';
import { EmailManagement } from '@/components/EmailManagement';
import { Loader2 } from 'lucide-react';

export default function EmailManagementPage() {
  const { data: professores, isLoading: loadingProfessores } = trpc.professores.list.useQuery();
  const { data: bolsistas, isLoading: loadingBolsistas } = trpc.bolsista.list.useQuery();

  if (loadingProfessores || loadingBolsistas) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Professores Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Emails dos Professores</h2>
        <div className="space-y-3">
          {professores && professores.length > 0 ? (
            professores.map((professor) => (
              <EmailManagement
                key={professor.id}
                type="professor"
                id={professor.id}
                name={professor.nome}
                currentEmail={professor.email || ''}
              />
            ))
          ) : (
            <p className="text-slate-500">Nenhum professor cadastrado</p>
          )}
        </div>
      </div>

      {/* Bolsistas Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Emails dos Bolsistas</h2>
        <div className="space-y-3">
          {bolsistas && bolsistas.length > 0 ? (
            bolsistas.map((bolsista) => (
              <EmailManagement
                key={bolsista.id}
                type="bolsista"
                id={bolsista.id}
                name={bolsista.nome}
                currentEmail={bolsista.email || ''}
              />
            ))
          ) : (
            <p className="text-slate-500">Nenhum bolsista cadastrado</p>
          )}
        </div>
      </div>
    </div>
  );
}
