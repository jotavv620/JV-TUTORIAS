

## SINCRONIZAÇÃO EM TEMPO REAL - CORREÇÕES IMPLEMENTADAS ✅

### FASE 1: Corrigir WebSocket Broadcasts ✅
- [x] Importar broadcast functions em server/routers.ts
- [x] Chamar broadcastTutoriaUpdate() após criar/atualizar/deletar tutoria
- [x] Chamar broadcastFeedbackUpdate() após criar feedback
- [x] Chamar broadcastCheckinUpdate() após criar check-in
- [x] Chamar broadcastConfigUpdate() após criar/deletar config items

### FASE 2: Corrigir Isolamento de Dados ✅
- [x] Mudar getDisciplinas para retornar dados globais (não por user)
- [x] Mudar getProfessores para retornar dados globais
- [x] Mudar getInstituicoes para retornar dados globais
- [x] Adicionar funções getAllDisciplinas, getAllProfessores, getAllInstituicoes

### FASE 3: Adicionar Invalidação de Cache ✅
- [x] Adicionar onSuccess em todas as mutations com invalidate()
- [x] Testar que cache é invalidado após mutação
- [x] Verificar que UI atualiza automaticamente

### FASE 4: Testes ✅
- [x] Executar todos os testes (40 testes passando)
- [x] Criar testes de WebSocket broadcasting (8 novos testes)
- [x] Validar que broadcasts não lançam erros

### FASE 5: Deploy e Validação
- [ ] Criar checkpoint com todas as correções
- [ ] Validar sincronização em tempo real com múltiplos usuários


## ENVIO AUTOMÁTICO DE EMAILS - CONCLUÍDO

### FASE 1: Configurar Sistema de Emails
- [x] Criar função sendEmail() usando Manus API
- [x] Configurar templates de email para professores
- [x] Configurar templates de email para bolsistas

### FASE 2: Implementar Envio na Criação de Tutoria
- [x] Buscar email do professor ao criar tutoria
- [x] Buscar email do bolsista ao criar tutoria
- [x] Enviar email para professor com detalhes da tutoria
- [x] Enviar email para bolsista com detalhes da tutoria

### FASE 3: Tratamento de Erros
- [x] Adicionar try-catch para falhas de envio
- [x] Registrar erros em logs
- [x] Não bloquear criação de tutoria se email falhar

### FASE 4: Testes
- [x] Criar testes para função sendEmail()
- [x] Testar envio de emails ao criar tutoria
- [x] Validar conteúdo dos emails (13 novos testes)


## EMAIL OBRIGATÓRIO PARA PROFESSORES - CONCLUÍDO

### FASE 1: Atualizar UI
- [x] Tornar campo de email obrigatório na UI
- [x] Validar email antes de enviar
- [x] Mostrar mensagem de erro se email vazio

### FASE 2: Atualizar Backend
- [x] Alterar schema para email NOT NULL em professores
- [x] Atualizar mutation para validar email obrigatório
- [x] Atualizar função createProfessor para exigir email

### FASE 3: Exibição
- [x] Mostrar email do professor na lista
- [x] Permitir editar email do professor
- [x] Validar formato de email

### FASE 4: Testes
- [x] Testar validação de email obrigatório
- [x] Testar exibição de email
- [x] Executar todos os testes (53 testes passando)


## NOTIFICAÇÕES POR EMAIL - LEMBRETES 30 MIN - CONCLUÍDO

### FASE 1: Criar Sistema de Scheduler
- [x] Implementar job scheduler para verificar tutorias a 30 min
- [x] Criar função para enviar lembretes
- [x] Adicionar timestamp de último lembrete enviado

### FASE 2: Templates de Lembrete
- [x] Criar template de email para lembrete de tutoria
- [x] Adicionar link para acessar tutoria diretamente
- [x] Incluir opção de confirmar presença

### FASE 3: Integração
- [x] Integrar scheduler no servidor
- [x] Testar envio de lembretes
- [x] Validar que não envia duplicatas

## CONTROLE DE ACESSO - ROLES - EM PROGRESSO

### FASE 1: Atualizar Schema
- [ ] Adicionar campo role na tabela users
- [ ] Criar migration para adicionar roles existentes
- [ ] Definir roles: admin, bolsista, professor

### FASE 2: Implementar Proteção em Procedures
- [ ] Criar adminProcedure para operações admin
- [ ] Criar bolsistaProcedure para operações de bolsista
- [ ] Criar professorProcedure para operações de professor

### FASE 3: UI com Controle de Acesso
- [ ] Mostrar/ocultar seções baseado no role
- [ ] Restringir acesso a funcionalidades por role
- [ ] Adicionar indicador de role do usuário

### FASE 4: Testes
- [ ] Testar acesso negado para roles não autorizados
- [ ] Testar que admin pode fazer tudo
- [ ] Testar restrições por role

## IMPORTAÇÃO EM LOTE CSV - EM PROGRESSO

### FASE 1: UI para Upload
- [ ] Criar componente de upload de arquivo CSV
- [ ] Validar formato do arquivo
- [ ] Mostrar preview dos dados antes de importar

### FASE 2: Parser CSV
- [ ] Implementar parser para CSV
- [ ] Validar colunas obrigatórias (nome, email)
- [ ] Tratar erros de formato

### FASE 3: Importação em Batch
- [ ] Criar mutation para importar múltiplos registros
- [ ] Validar cada linha antes de inserir
- [ ] Retornar relatório de sucesso/erro

### FASE 4: Testes
- [ ] Testar upload de arquivo válido
- [ ] Testar arquivo com erros
- [ ] Testar duplicatas


## IMPORTAÇÃO EM LOTE CSV - CONCLUÍDO

### FASE 1: Parser e Validação
- [x] Criar função parseCSV() para ler arquivo
- [x] Validar colunas obrigatórias (nome, email)
- [x] Validar formato de email
- [x] Retornar lista de erros por linha

### FASE 2: Mutations tRPC
- [x] Criar mutation importProfessores()
- [x] Criar mutation importBolsistas()
- [x] Validar duplicatas antes de inserir
- [x] Retornar relatório de sucesso/erro

### FASE 3: UI
- [x] Criar componente de upload de arquivo
- [x] Mostrar preview dos dados antes de importar
- [x] Botão para confirmar importação
- [x] Mostrar resultado (sucesso/erro por linha)

### FASE 4: Testes
- [x] Testar upload de arquivo válido
- [x] Testar arquivo com erros
- [x] Testar duplicatas
- [x] Testar validação de email (51 testes passando)


## CORREÇÕES SOLICITADAS - EM PROGRESSO

### FASE 1: Renomear Tutor para Bolsista
- [ ] Alterar campo "tutor" para "bolsista" no schema
- [ ] Atualizar mutation de criar tutoria
- [ ] Atualizar UI para mostrar dropdown de bolsistas
- [ ] Atualizar queries para retornar bolsista correto

### FASE 2: Sincronização Google Calendar
- [ ] Criar função para sincronizar com Google Calendar
- [ ] Adicionar botão de sincronizar funcional
- [ ] Implementar autenticação com Google
- [ ] Testar criação de eventos no Google Calendar


## LOGIN E REGISTRO - CONCLUÍDO

### FASE 1: Corrigir Login/Registro
- [x] Diagnosticar erros de autenticação
- [x] Corrigir fluxo de OAuth
- [x] Validar sessão de usuário

### FASE 2: Página de Seleção
- [x] Criar página inicial com 2 opções (Admin / Bolsista)
- [x] Redirecionar para login apropriado
- [x] Salvar tipo de usuário na sessão

### FASE 3: Login Admin
- [x] Criar página de login para Admin
- [x] Validar credenciais de Admin
- [x] Acesso completo ao sistema

### FASE 4: Login Bolsista
- [x] Criar página de login para Bolsista
- [x] Restringir acesso apenas às suas tutorias
- [x] Ocultar abas de Configurações e Gamificação

### FASE 5: Testes
- [x] Testar login Admin
- [x] Testar login Bolsista
- [x] Validar permissões (51 testes passando)


## REGISTRO PRÓPRIO DO APLICATIVO - CONCLUÍDO

- [x] Remover rota de registro do Manus OAuth
- [x] Criar tabela de usuários com email/senha (campos password e registeredLocally já existem)
- [x] Implementar mutation de registro com lógica real de banco de dados
- [x] Criar UI de registro funcional (RegisterPage.tsx)
- [x] Implementar login com email/senha e validação de credenciais
- [x] Testar fluxo de registro e login (51 testes passando)
- [x] Integrar mutations no router principal com bcrypt para hashing de senhas
- [x] Validação de email duplicado
- [x] Comparação de senha hasheada com bcrypt.compare()
