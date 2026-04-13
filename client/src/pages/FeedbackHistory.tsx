import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Star, Filter, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FeedbackHistory() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    professor: "",
    disciplina: "",
    minRating: undefined as number | undefined,
    startDate: "",
    endDate: "",
  });

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">
            Apenas administradores podem visualizar o histórico de feedbacks.
          </p>
        </Card>
      </div>
    );
  }

  // Fetch feedbacks
  const { data: feedbackData, isLoading, error } = trpc.feedback.getAllFeedbacks.useQuery({
    professor: filters.professor || undefined,
    disciplina: filters.disciplina || undefined,
    minRating: filters.minRating,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    page,
    limit: 20,
  });

  // Fetch statistics
  const { data: stats } = trpc.feedback.getStatistics.useQuery();

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleExportCSV = () => {
    if (!feedbackData?.feedbacks) return;

    const csv = [
      ["Professor", "Disciplina", "Bolsista", "Pontualidade", "Áudio", "Conteúdo", "Média", "Data", "Comentários"],
      ...feedbackData.feedbacks.map((f: any) => {
        const avg = ((f.pontualidade + f.audio + f.conteudo) / 3).toFixed(2);
        return [
          f.professor,
          f.disciplina,
          f.bolsista,
          f.pontualidade,
          f.audio,
          f.conteudo,
          avg,
          new Date(f.createdAt).toLocaleDateString("pt-BR"),
          f.comentarios || "",
        ];
      }),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedbacks-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Histórico de Feedbacks</h1>
          <p className="text-gray-600">Visualize e analise todos os feedbacks das tutorias</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-6 bg-white shadow-sm border-0">
              <p className="text-sm text-gray-600 font-semibold">Total de Feedbacks</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalFeedbacks}</p>
            </Card>
            <Card className="p-6 bg-white shadow-sm border-0">
              <p className="text-sm text-gray-600 font-semibold">Pontualidade</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-blue-600">{stats.averagePontualidade}</p>
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
            </Card>
            <Card className="p-6 bg-white shadow-sm border-0">
              <p className="text-sm text-gray-600 font-semibold">Áudio</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-blue-600">{stats.averageAudio}</p>
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
            </Card>
            <Card className="p-6 bg-white shadow-sm border-0">
              <p className="text-sm text-gray-600 font-semibold">Conteúdo</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-blue-600">{stats.averageConteudo}</p>
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
            </Card>
            <Card className="p-6 bg-white shadow-sm border-0">
              <p className="text-sm text-gray-600 font-semibold">Média Geral</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-green-600">{stats.averageOverall}</p>
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 bg-white shadow-sm border-0 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Professor"
              value={filters.professor}
              onChange={(e) => handleFilterChange("professor", e.target.value)}
              className="border-gray-300"
            />
            <Input
              placeholder="Disciplina"
              value={filters.disciplina}
              onChange={(e) => handleFilterChange("disciplina", e.target.value)}
              className="border-gray-300"
            />
            <Select value={filters.minRating?.toString() || ""} onValueChange={(v) => handleFilterChange("minRating", v ? parseFloat(v) : undefined)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Mín. Classificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="1">1+ ⭐</SelectItem>
                <SelectItem value="2">2+ ⭐</SelectItem>
                <SelectItem value="3">3+ ⭐</SelectItem>
                <SelectItem value="4">4+ ⭐</SelectItem>
                <SelectItem value="5">5 ⭐</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="border-gray-300"
            />
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="border-gray-300"
            />
          </div>

          <Button onClick={handleExportCSV} className="mt-4 bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </Card>

        {/* Feedbacks Table */}
        <Card className="bg-white shadow-sm border-0 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Carregando feedbacks...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">Erro ao carregar feedbacks</div>
          ) : feedbackData?.feedbacks && feedbackData.feedbacks.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Professor</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Disciplina</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bolsista</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Pontualidade</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Áudio</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Conteúdo</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Média</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Comentários</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {feedbackData.feedbacks.map((feedback: any) => {
                      const avg = ((feedback.pontualidade + feedback.audio + feedback.conteudo) / 3).toFixed(2);
                      const avgNum = parseFloat(avg);
                      const ratingColor =
                        avgNum >= 4.5
                          ? "text-green-600"
                          : avgNum >= 3.5
                          ? "text-blue-600"
                          : avgNum >= 2.5
                          ? "text-yellow-600"
                          : "text-red-600";

                      return (
                        <tr key={feedback.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm text-gray-800 font-medium">{feedback.professor}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{feedback.disciplina}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{feedback.bolsista}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-semibold text-gray-800">{feedback.pontualidade}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-semibold text-gray-800">{feedback.audio}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-semibold text-gray-800">{feedback.conteudo}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-center font-bold ${ratingColor}`}>{avg}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(feedback.createdAt).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {feedback.comentarios || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-600">
                  Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, feedbackData.total)} de {feedbackData.total} feedbacks
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    variant="outline"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={page * 20 >= feedbackData.total}
                    variant="outline"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">Nenhum feedback encontrado</div>
          )}
        </Card>
      </div>
    </div>
  );
}
