import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'professores' | 'bolsistas';
  onSuccess?: () => void;
}

export function CSVImportDialog({ open, onOpenChange, type, onSuccess }: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [parseResult, setParseResult] = useState<any>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [importResult, setImportResult] = useState<any>(null);

  const parseCSVMutation = trpc.import[
    type === 'professores' ? 'parseProfessoresCSV' : 'parseBolsistasCSV'
  ].useMutation();

  const importMutation = trpc.import[
    type === 'professores' ? 'importProfessores' : 'importBolsistas'
  ].useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Read file content
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);

      // Parse CSV
      try {
        const result = await parseCSVMutation.mutateAsync({ csvContent: content });
        setParseResult(result);
        if (result.success && result.data.length > 0) {
          setStep('preview');
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!parseResult?.data || parseResult.data.length === 0) return;

    setStep('importing');
    try {
      const payload = type === 'professores' 
        ? { professores: parseResult.data }
        : { bolsistas: parseResult.data };
      const result = await importMutation.mutateAsync(payload as any);
      setImportResult(result);
      
      if (result.success > 0) {
        setTimeout(() => {
          onOpenChange(false);
          onSuccess?.();
          // Reset state
          setFile(null);
          setCsvContent('');
          setParseResult(null);
          setStep('upload');
          setImportResult(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error importing:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state
    setFile(null);
    setCsvContent('');
    setParseResult(null);
    setStep('upload');
    setImportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar {type === 'professores' ? 'Professores' : 'Bolsistas'}</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV com as colunas: nome, email
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-4">
                Arraste um arquivo CSV aqui ou clique para selecionar
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-file"
              />
              <label htmlFor="csv-file">
                <Button variant="outline" asChild>
                  <span>Selecionar Arquivo</span>
                </Button>
              </label>
              {file && <p className="text-sm text-green-600 mt-4">✓ {file.name}</p>}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Formato esperado:</strong> CSV com cabeçalho (nome, email)
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Exemplo:<br />
                nome,email<br />
                Prof. Silva,silva@example.com<br />
                Prof. Santos,santos@example.com
              </p>
            </div>
          </div>
        )}

        {step === 'preview' && parseResult && (
          <div className="space-y-4">
            {parseResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {parseResult.errors.length} erro(s) encontrado(s)
                </AlertDescription>
              </Alert>
            )}

            {parseResult.success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {parseResult.data.length} registro(s) pronto(s) para importar
                </AlertDescription>
              </Alert>
            )}

            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Nome</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.data.map((item: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{item.nome}</td>
                      <td className="p-2">{item.email}</td>
                      <td className="p-2">
                        <span className="text-green-600 text-xs">✓ Válido</span>
                      </td>
                    </tr>
                  ))}
                  {parseResult.errors.map((error: any, idx: number) => (
                    <tr key={`error-${idx}`} className="border-t bg-red-50">
                      <td colSpan={3} className="p-2 text-red-600 text-xs">
                        Linha {error.row}: {error.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Voltar
              </Button>
              <Button
                onClick={handleImport}
                disabled={parseResult.data.length === 0 || importMutation.isPending}
              >
                {importMutation.isPending ? 'Importando...' : 'Importar'}
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && importResult && (
          <div className="space-y-4">
            {importResult.success > 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {importResult.success} registro(s) importado(s) com sucesso!
                </AlertDescription>
              </Alert>
            )}

            {importResult.failed > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {importResult.failed} erro(s) durante importação
                </AlertDescription>
              </Alert>
            )}

            {importResult.errors.length > 0 && (
              <div className="max-h-48 overflow-y-auto bg-red-50 border border-red-200 rounded p-3">
                {importResult.errors.map((error: any, idx: number) => (
                  <p key={idx} className="text-xs text-red-700 mb-1">
                    Linha {error.row}: {error.message}
                  </p>
                ))}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
