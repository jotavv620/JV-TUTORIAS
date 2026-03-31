import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Mail, Edit2, Check, X } from 'lucide-react';

interface EmailManagementProps {
  type: 'professor' | 'bolsista';
  id: number;
  name: string;
  currentEmail?: string;
}

export function EmailManagement({ type, id, name, currentEmail }: EmailManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(currentEmail || '');
  const [tempEmail, setTempEmail] = useState(currentEmail || '');

  const updateProfessorEmail = trpc.professor.updateEmail.useMutation({
    onSuccess: () => {
      toast.success(`Email do professor atualizado com sucesso!`);
      setEmail(tempEmail);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar email');
    },
  });

  const updateBolsistaEmail = trpc.bolsistaEmail.updateEmail.useMutation({
    onSuccess: () => {
      toast.success(`Email do bolsista atualizado com sucesso!`);
      setEmail(tempEmail);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar email');
    },
  });

  const handleSave = async () => {
    if (!tempEmail.trim()) {
      toast.error('Email não pode estar vazio');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempEmail)) {
      toast.error('Email inválido');
      return;
    }

    if (type === 'professor') {
      await updateProfessorEmail.mutateAsync({
        professorId: id,
        email: tempEmail,
      });
    } else {
      await updateBolsistaEmail.mutateAsync({
        bolsistaId: id,
        email: tempEmail,
      });
    }
  };

  const handleCancel = () => {
    setTempEmail(email);
    setIsEditing(false);
  };

  const isLoading = updateProfessorEmail.isPending || updateBolsistaEmail.isPending;

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <Mail size={16} className="text-slate-400" />
      
      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <input
            type="email"
            value={tempEmail}
            onChange={(e) => setTempEmail(e.target.value)}
            placeholder="Digite o email..."
            className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
            title="Salvar"
          >
            <Check size={16} />
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
            title="Cancelar"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">{name}</p>
            <p className="text-xs text-slate-500">{email || 'Sem email'}</p>
          </div>
          <button
            onClick={() => {
              setTempEmail(email);
              setIsEditing(true);
            }}
            className="p-1 text-slate-600 hover:bg-slate-200 rounded"
            title="Editar email"
          >
            <Edit2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
