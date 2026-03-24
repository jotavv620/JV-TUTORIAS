# Tutoria Manager - Funcionalidades Implementadas

## 📊 Visão Geral

O **Tutoria Manager** é um aplicativo completo de gestão de tutorias com funcionalidades avançadas de persistência de dados, autenticação segura e análises detalhadas.

---

## ✅ Funcionalidades Principais

### 1. **Dashboard** 📋
- Visualização em tempo real de todas as tutorias
- Estatísticas gerais (Total, Pendentes, Em Curso, Concluídas)
- Tabela interativa com gerenciamento de status
- Ações rápidas: check-in, feedback, avaliação

### 2. **Ranking de Desempenho Docente** 🏆
- Classificação automática de professores por desempenho
- Cálculo de média de avaliações
- Status: Excelente, Bom, Regular
- Exportação de relatórios em CSV

### 3. **Analítica Avançada** 📈
- **Gráficos de Desempenho**: Tutorias concluídas vs pendentes por mês
- **Média de Avaliações**: Visualização de feedback por professor
- **Estatísticas Gerais**:
  - Total de tutorias concluídas
  - Taxa de conclusão (%)
  - Média geral de avaliações
  - Número de professores ativos

### 4. **Sistema de Notificações** 🔔
- **Próximas Tutorias**: Lista de sessões agendadas
- **Configurações de Alertas**:
  - Email 30 minutos antes da tutoria
  - Notificação quando feedback é recebido
  - SMS para tutorias críticas
- Gerenciamento centralizado de preferências

### 5. **Calendário Integrado** 📅
- Visualização de tutorias em formato de calendário
- **Sincronização com Google Calendar**: Um clique para sincronizar
- Exibição de data, hora e professor
- Integração automática de novos eventos

### 6. **Configurações** ⚙️
- **Disciplinas**: Gerenciar disciplinas oferecidas
- **Professores**: Cadastro de professores
- **Instituições**: Gerenciar filiais/campus
- Adicionar/remover itens facilmente

### 7. **Autenticação OAuth** 🔐
- Login seguro via Manus OAuth
- Isolamento de dados por usuário
- Sessão persistente
- Logout seguro

### 8. **Persistência de Dados** 💾
- Banco de dados MySQL com tabelas relacionadas:
  - `tutorias`: Sessões de tutoria
  - `feedbacks`: Avaliações e comentários
  - `checkins`: Registros de presença
  - `disciplinas`: Disciplinas cadastradas
  - `professores`: Professores cadastrados
  - `instituicoes`: Filiais/campus
- Todos os dados salvos permanentemente

---

## 🔌 Integração com APIs

### Google Calendar
- Sincronização automática de tutorias
- Botão "Sincronizar Google" na aba Calendário
- Suporte para criação de eventos automáticos

### Sistema de Notificações
- Email automático 30 minutos antes
- Notificações em tempo real
- SMS para alertas críticos

---

## 🧪 Testes

O projeto inclui **13 testes vitest** que validam:
- ✅ Operações de tutorias (criar, listar, atualizar, deletar)
- ✅ Sistema de feedback
- ✅ Check-in de presença
- ✅ Configurações (disciplinas, professores, instituições)
- ✅ Relatórios e exportação
- ✅ Autenticação

**Executar testes:**
```bash
pnpm test
```

---

## 🚀 Como Usar

### Acessar o Sistema
1. Clique em "Entrar com Manus"
2. Faça login com suas credenciais
3. Você será redirecionado ao dashboard

### Agendar uma Tutoria
1. Clique em "+ Novo Agendamento"
2. Preencha os dados (disciplina, professor, data, hora)
3. Clique em "Agendar"

### Fazer Check-in
1. Na tabela de atividades, clique em "FAZER CHECK-IN"
2. Confirme a presença
3. O timestamp será registrado automaticamente

### Avaliar Tutoria
1. Clique em "AVALIAR" na tutoria concluída
2. Preencha as avaliações (Pontualidade, Áudio, Conteúdo)
3. Adicione comentários (opcional)
4. Clique em "Enviar Feedback"

### Visualizar Analítica
1. Clique na aba "ANALÍTICA"
2. Veja gráficos de desempenho
3. Analise estatísticas gerais

### Configurar Notificações
1. Clique na aba "NOTIFICAÇÕES"
2. Selecione as preferências de alerta
3. As notificações serão enviadas automaticamente

### Sincronizar Calendário
1. Clique na aba "CALENDÁRIO"
2. Clique em "Sincronizar Google"
3. Suas tutorias aparecerão no Google Calendar

### Exportar Relatório
1. Clique na aba "RANKING"
2. Clique em "EXPORTAR RELATÓRIO"
3. Um arquivo CSV será baixado com os dados

---

## 📱 Responsividade

O aplicativo é totalmente responsivo e funciona em:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

---

## 🔒 Segurança

- Autenticação OAuth integrada
- Isolamento de dados por usuário
- Cookies seguros (HttpOnly, Secure, SameSite)
- Validação de entrada em todos os formulários

---

## 📊 Estrutura de Dados

### Tabela: tutorias
```
- id: Identificador único
- userId: ID do usuário (FK)
- disciplina: Nome da disciplina
- professor: Nome do professor
- instituicao: Campus/Filial
- tutor: Nome do tutor
- data: Data da tutoria
- horario: Hora de início
- horarioTermino: Hora de término
- status: scheduled | in_progress | completed
- createdAt: Data de criação
- updatedAt: Data de atualização
```

### Tabela: feedbacks
```
- id: Identificador único
- tutoriaId: ID da tutoria (FK)
- pontualidade: Avaliação (1-5)
- audio: Avaliação (1-5)
- conteudo: Avaliação (1-5)
- comentarios: Texto livre
- createdAt: Data de criação
- updatedAt: Data de atualização
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Express 4 + tRPC 11
- **Banco de Dados**: MySQL
- **Autenticação**: Manus OAuth
- **Testes**: Vitest
- **UI Components**: shadcn/ui + Lucide Icons

---

## 📝 Notas

- Todos os dados são salvos automaticamente no banco de dados
- As notificações são configuráveis por usuário
- O calendário sincroniza em tempo real com Google Calendar
- Os relatórios podem ser exportados em CSV para análise posterior

---

## 🤝 Suporte

Para reportar bugs ou sugerir melhorias, entre em contato com o time de desenvolvimento.

**Versão**: 1.0.0  
**Última atualização**: Março 2026
