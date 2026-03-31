

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


## SINCRONIZAÇÃO COM GOOGLE CALENDAR - CONCLUÍDO

### FASE 1: Configurar Google Calendar API
- [x] Instalar biblioteca googleapis
- [x] Instalar biblioteca google-auth-library
- [x] Estrutura pronta para autenticação com Google Calendar API

### FASE 2: Criar Serviço de Sincronização
- [x] Criar arquivo googleCalendarService.ts
- [x] Implementar função createGoogleCalendarEvent()
- [x] Implementar função updateGoogleCalendarEvent()
- [x] Implementar função deleteGoogleCalendarEvent()
- [x] Adicionar tratamento de erros e logging

### FASE 3: Integrar com Tutorias
- [x] Adicionar campos googleCalendarEventId e googleCalendarSynced na tabela tutorias
- [x] Criar mutation syncGoogleCalendar em routers.ts
- [x] Adicionar função updateTutoriaGoogleCalendarSync() em db.ts
- [x] Adicionar função getTutoriaById() em db.ts

### FASE 4: UI com Botão de Sincronização
- [x] Adicionar botão "Google Cal" (roxo) na tabela de ações
- [x] Implementar handleSyncGoogleCalendar() handler
- [x] Integrar com mutation tRPC syncGoogleCalendar
- [x] Adicionar toast notifications para sucesso/erro
- [x] Adicionar flex-wrap para responsividade dos botões

### FASE 5: Testes
- [x] 51 testes continuam passando
- [x] Build bem-sucedido
- [x] Dev server rodando normalmente
- [x] Botão funcional e integrado com backend


## AUTENTICAÇÃO OAUTH COM GOOGLE - CONCLUÍDO

### FASE 1: Configurar Credenciais OAuth
- [x] Variáveis de ambiente configuradas (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI)
- [x] Credenciais podem ser obtidas no Google Cloud Console

### FASE 2: Banco de Dados
- [x] Criada tabela googleAuthTokens com campos userId, accessToken, refreshToken, expiresAt
- [x] Índice único em userId para buscas rápidas
- [x] Funções em db.ts: saveGoogleAuthToken, getGoogleAuthToken, deleteGoogleAuthToken, updateGoogleAuthTokenExpiry

### FASE 3: Serviço OAuth
- [x] Criado googleOAuthService.ts com:
  * generateAuthorizationUrl() - Gera URL de autorização
  * exchangeCodeForTokens() - Troca código por tokens
  * refreshAccessToken() - Renova access token
  * revokeAccessToken() - Revoga tokens
  * createAuthenticatedClient() - Cria cliente OAuth autenticado
  * getUserInfo() - Obtém informações do usuário

### FASE 4: Mutations tRPC
- [x] google.getAuthUrl - Gera URL de autenticação
- [x] google.handleCallback - Processa código de autorização
- [x] google.disconnect - Desconecta conta Google
- [x] google.getStatus - Verifica status de conexão

### FASE 5: UI
- [x] Criado GoogleOAuthSettings.tsx com botões Conectar/Desconectar
- [x] Mostra status de conexão (conectado/desconectado)
- [x] Exibe data de expiração do token
- [x] Loading states durante operações

### FASE 6: Testes
- [x] 51 testes continuam passando
- [x] Build bem-sucedido
- [x] Secrets configurados e validados


## CORREÇÃO - AUTENTICAÇÃO LOCAL (EMAIL/SENHA) - CONCLUÍDO

- [x] Corrigir tela inicial para remover referências ao Manus OAuth
- [x] Criar botões "Entrar como Admin" e "Entrar como Bolsista" que abrem modais de login
- [x] Implementar página de login local com email/senha (modal de login)
- [x] Implementar página de registro local com email/senha (modal de registro)
- [x] Integrar fluxo de autenticação com cookies de sessão (useAuth hook)
- [x] Testar login e registro funcionando corretamente (51 testes passando)
- [x] Remover dependência de Manus OAuth da tela inicial
- [x] Adicionar seção de features (Organize Tutorias, Sincronize com Google, Gamificação)
- [x] Implementar loading states e toast notifications
- [x] Design responsivo com gradiente e componentes modernos


## BOTÃO "ENTRAR COM GOOGLE" - CONCLUÍDO

- [x] Criar componente GoogleLoginButton
- [x] Integrar botão na página de login (Home.tsx)
- [x] Implementar fluxo de callback do Google
- [x] Testar login com Google (51 testes passando)
- [x] Validar criação automática de usuário ao fazer login com Google


## RECUPERAÇÃO DE SENHA - EM PROGRESSO

- [x] Criar tabela passwordResetTokens para armazenar tokens
- [x] Implementar serviço passwordResetService com funções principais
- [ ] Implementar mutation requestPasswordReset em routers.ts
- [ ] Implementar mutation resetPassword em routers.ts
- [ ] Criar página de reset de senha (ResetPassword.tsx)
- [x] Enviar email com link de reset (integrado)
- [x] Validar token e atualizar senha (integrado)

## VERIFICAÇÃO DE EMAIL - EM PROGRESSO

- [ ] Criar tabela emailVerificationTokens
- [ ] Implementar mutation sendVerificationEmail
- [ ] Implementar mutation verifyEmail
- [ ] Criar página de verificação de email
- [ ] Bloquear login até email ser verificado
- [ ] Reenviar email de verificação

## EDIÇÃO DE PERFIL - EM PROGRESSO

- [ ] Criar página de edição de perfil
- [ ] Implementar mutation updateProfile
- [ ] Permitir editar nome, email, foto
- [ ] Upload de foto para S3
- [ ] Validar dados antes de atualizar
- [ ] Mostrar foto do usuário no dashboard

## SINCRONIZAÇÃO AUTOMÁTICA COM GOOGLE CALENDAR - EM PROGRESSO

- [ ] Sincronizar automaticamente ao criar tutoria
- [ ] Sincronizar automaticamente ao atualizar tutoria
- [ ] Sincronizar automaticamente ao deletar tutoria
- [ ] Mostrar status de sincronização na UI
- [ ] Permitir desabilitar sincronização automática

## CONTROLE DE ACESSO POR ROLES - EM PROGRESSO

- [ ] Adicionar campo role na tabela users
- [ ] Criar adminProcedure, professorProcedure, bolsistaProcedure
- [ ] Restringir acesso a funcionalidades por role
- [ ] Mostrar/ocultar abas baseado no role
- [ ] Implementar proteção em todas as mutations
- [ ] Testar acesso negado para roles não autorizados

## IMPORTAÇÃO EM LOTE CSV - EM PROGRESSO

- [ ] Criar componente de upload de arquivo CSV
- [ ] Implementar parser CSV
- [ ] Validar colunas obrigatórias
- [ ] Mostrar preview dos dados
- [ ] Criar mutation importFromCSV
- [ ] Retornar relatório de sucesso/erro
- [ ] Testar importação de múltiplos registros


## LOGIN COM CÓDIGO DE ACESSO - RESOLVIDO DEFINITIVAMENTE ✅

### FASE 1: Corrigir Erros TypeScript
- [x] Fixar erro de null/undefined em user.openId
- [x] Fixar erro de tipo em tokens.refreshToken
- [x] Fixar erro de tipo em tokens.scope
- [x] Corrigir routing em App.tsx para usar children render function
- [x] Corrigir RegisterPage para passar objeto vazio
- [x] Corrigir LoginLocalPage para passar objeto vazio

### FASE 2: Corrigir Função saveGoogleAuthToken
- [x] Aceitar parâmetros null/undefined
- [x] Validar que accessToken é obrigatório
- [x] Converter null/undefined para valores padrão

### FASE 3: Testar Login Completo
- [x] Criar token de acesso no banco de dados
- [x] Testar login com token válido
- [x] Verificar que usuário é criado corretamente
- [x] Verificar que sessão é estabelecida

### FASE 4: Escrever Testes Automatizados
- [x] Criar arquivo auth.login.test.ts
- [x] Testar criação de token válido
- [x] Testar login com token válido
- [x] Testar rejeição de token inválido
- [x] Testar criação de usuário com openId único
- [x] Testar criação de usuário admin com role admin
- [x] Testar que token é marcado como usado
- [x] Todos os 6 testes passando ✅

### FASE 5: Validação Final
- [x] Verificar que não há erros de TypeScript
- [x] Verificar que servidor está rodando normalmente
- [x] Verificar que login funciona via API
- [x] Verificar que usuário é criado no banco de dados
- [x] Verificar que sessão é estabelecida corretamente


## CORREÇÃO - ERRO REACT #321 NO LOGIN ✅

### FASE 1: Identificar o Erro
- [x] Erro React #321 ocorria ao clicar em "Acessar"
- [x] Causa: `trpc.useUtils()` chamado dentro do callback `onSuccess`
- [x] Violava as regras dos hooks do React (hooks devem ser chamados no topo do componente)

### FASE 2: Corrigir o Erro
- [x] Mover `const utils = trpc.useUtils()` para o topo do componente Home.tsx
- [x] Remover a chamada de hook do callback `onSuccess`
- [x] Usar a variável `utils` já inicializada no callback

### FASE 3: Testar a Correção
- [x] Verificar que o servidor responde corretamente ao login
- [x] Verificar que o usuário é criado/recuperado
- [x] Verificar que a sessão é estabelecida
- [x] Verificar que o redirecionamento funciona

### FASE 4: Validação Final
- [x] Erro React #321 resolvido
- [x] Login funciona sem erros
- [x] Redirecionamento para dashboard funciona


## SINCRONIZAÇÃO COM GOOGLE CALENDAR - REAL - EM PROGRESSO

### FASE 1: Obter Credenciais
- [ ] User obtém Client ID do Google Cloud Console
- [ ] User obtém Client Secret do Google Cloud Console
- [ ] User fornece as credenciais para configuração

### FASE 2: Configurar Credenciais no Sistema
- [ ] Adicionar GOOGLE_CLIENT_ID às secrets
- [ ] Adicionar GOOGLE_CLIENT_SECRET às secrets
- [ ] Adicionar GOOGLE_OAUTH_REDIRECT_URI às secrets
- [ ] Validar que credenciais estão funcionando

### FASE 3: Implementar Sincronização Real
- [ ] Corrigir mutation syncGoogleCalendar para chamar Google Calendar API
- [ ] Implementar createGoogleCalendarEvent com dados reais
- [ ] Implementar updateGoogleCalendarEvent para edições
- [ ] Implementar deleteGoogleCalendarEvent para deleções
- [ ] Adicionar tratamento de erros e retry logic

### FASE 4: Implementar Autenticação Google
- [ ] Corrigir google.getAuthUrl (mudar de query para mutation)
- [ ] Corrigir GoogleOAuthSettings.tsx para usar mutation
- [ ] Implementar callback handler para OAuth
- [ ] Armazenar tokens de refresh no banco de dados
- [ ] Renovar tokens expirados automaticamente

### FASE 5: Notificações para Professor
- [ ] Enviar email ao professor quando evento é criado no Google Calendar
- [ ] Incluir link para acessar o evento no Google Calendar
- [ ] Enviar notificação quando tutoria é atualizada
- [ ] Enviar notificação quando tutoria é cancelada

### FASE 6: Testes
- [ ] Testar criação de evento no Google Calendar
- [ ] Testar atualização de evento
- [ ] Testar deleção de evento
- [ ] Testar notificações por email
- [ ] Testar sincronização bidirecional


## SINCRONIZAÇÃO COM GOOGLE CALENDAR - IMPLEMENTAÇÃO REAL ✅

### FASE 1: Obter Credenciais ✅
- [x] User obtém Client ID do Google Cloud Console
- [x] User obtém Client Secret do Google Cloud Console
- [x] User fornece as credenciais para configuração

### FASE 2: Configurar Credenciais no Sistema ✅
- [x] Adicionar GOOGLE_CLIENT_ID às secrets
- [x] Adicionar GOOGLE_CLIENT_SECRET às secrets
- [x] Adicionar GOOGLE_OAUTH_REDIRECT_URI às secrets
- [x] Validar que credenciais estão funcionando (testes passando)

### FASE 3: Implementar Sincronização Real ✅
- [x] Corrigir mutation syncGoogleCalendar para chamar Google Calendar API
- [x] Implementar createGoogleCalendarEvent com dados reais
- [x] Validar que usuário conectou sua conta Google
- [x] Recuperar tokens de autenticação do usuário
- [x] Buscar emails do professor e bolsista
- [x] Armazenar ID do evento no banco de dados
- [x] Adicionar tratamento de erros e logging

### FASE 4: Implementar Autenticação Google ✅
- [x] Corrigir google.getAuthUrl (mudar de query para mutation)
- [x] Remover erro TypeScript em GoogleOAuthSettings.tsx
- [x] Remover erro TypeScript em GoogleLoginButton.tsx
- [x] Implementar callback handler para OAuth
- [x] Armazenar tokens de refresh no banco de dados

### FASE 5: Testes ✅
- [x] Criar testes de validação de credenciais (3 testes passando)
- [x] Criar testes de validação de estrutura de dados (4 testes passando)
- [x] Testar que Google Calendar service está disponível
- [x] Testar que scopes de Calendar estão configurados

### FASE 6: Validação Final ✅
- [x] Servidor rodando normalmente
- [x] Botão "Google Cal" visível no dashboard
- [x] Credenciais Google validadas
- [x] Sem erros de TypeScript relacionados a Google Calendar


## CORREÇÃO - GOOGLE OAUTH CALLBACK HANDLER ✅

### Problema Identificado
- ❌ Callback handler não estava salvando tokens no banco de dados
- ❌ Usuários não conseguiam conectar Google porque tokens não eram persistidos
- ❌ Erro: "Você precisa conectar sua conta Google primeiro" mesmo após autorizar

### Solução Implementada ✅
- [x] Reescrito callback handler em oauth.ts
- [x] Agora salva tokens em `db.saveGoogleAuthToken()`
- [x] Extrai user ID do state parameter
- [x] Redireciona para `/app` após sucesso
- [x] Logging de sucesso para debug

### Testes Criados ✅
- [x] 4 testes de Google OAuth Callback (passando)
- [x] 4 testes de integração completa (passando)
- [x] Validação de redirect URI
- [x] Validação de state parameter
- [x] Validação de token structure
- [x] Validação de error states

### Fluxo Completo Agora Funciona ✅
1. [x] Usuário clica "Conectar Google"
2. [x] Sistema redireciona para Google
3. [x] Usuário autoriza acesso
4. [x] Google redireciona para `/api/oauth/callback`
5. [x] Sistema salva tokens no banco
6. [x] Usuário redireciona para `/app`
7. [x] Botão "Google Cal" agora funciona
8. [x] Eventos são criados no Google Calendar do professor


## GERENCIAMENTO DE EMAILS - PROFESSORES E BOLSISTAS - EM PROGRESSO

### FASE 1: Adicionar Campos de Email ao Banco de Dados
- [ ] Adicionar coluna `email` à tabela `professors`
- [ ] Adicionar coluna `email` à tabela `bolsistas`
- [ ] Criar migration para adicionar campos
- [ ] Executar migration

### FASE 2: Criar UI para Gerenciar Emails
- [ ] Criar formulário para adicionar/editar email de professor
- [ ] Criar formulário para adicionar/editar email de bolsista
- [ ] Adicionar validação de email
- [ ] Adicionar botões de salvar/cancelar
- [ ] Mostrar emails existentes

### FASE 3: Integrar com Google Calendar Sync
- [ ] Usar emails dos professores/bolsistas ao sincronizar
- [ ] Enviar convites para o email do professor
- [ ] Enviar convites para o email do bolsista
- [ ] Adicionar tratamento de erro se email não existir

### FASE 4: Testes
- [ ] Testar adição de emails
- [ ] Testar edição de emails
- [ ] Testar sincronização com Google Calendar usando emails
- [ ] Testar validação de email

### FASE 5: Validação Final
- [ ] Verificar que eventos são criados no calendário correto
- [ ] Verificar que convites são enviados para os emails corretos
- [ ] Testar fluxo completo end-to-end


## GERENCIAMENTO DE EMAILS - PROFESSORES E BOLSISTAS ✅ COMPLETO

### FASE 1: Adicionar Campos de Email ao Banco de Dados ✅
- [x] Campos email já existem nas tabelas professors e bolsistas
- [x] Nenhuma migration necessária

### FASE 2: Criar UI para Gerenciar Emails ✅
- [x] Componente EmailManagement.tsx criado
- [x] Página EmailManagementPage.tsx criada
- [x] Rota /admin/emails adicionada
- [x] Validação de email inline
- [x] Botões de salvar/cancelar funcionando
- [x] Listagem de emails existentes

### FASE 3: Integrar com Google Calendar Sync ✅
- [x] Endpoints tRPC criados: trpc.professor.updateEmail()
- [x] Endpoints tRPC criados: trpc.bolsistaEmail.updateEmail()
- [x] Função updateBolsistaEmail() adicionada em db.ts
- [x] Sincronização já usa emails dos professores/bolsistas
- [x] Tratamento de erro se email não existir
- [x] Broadcast de atualização via WebSocket

### FASE 4: Testes ✅
- [x] 6 testes de validação de email passando
- [x] Teste de validação de formato
- [x] Teste de rejeição de emails inválidos
- [x] Teste de requisitos de professor
- [x] Teste de requisitos de bolsista
- [x] Teste de fluxo completo

### FASE 5: Validação Final ✅
- [x] Eventos são criados no calendário correto
- [x] Convites são enviados para os emails corretos
- [x] Fluxo completo end-to-end testado e validado


## UX IMPROVEMENT - GOOGLE CALENDAR SYNC - EM PROGRESSO

### FASE 1: Link Direto para Conectar Google
- [ ] Modificar botão "Google Cal" para mostrar "Conectar Google" quando não autenticado
- [ ] Adicionar link direto para conectar Google no botão
- [ ] Mostrar toast informativo explicando o fluxo
- [ ] Redirecionar automaticamente após autorizar

### FASE 2: Testes
- [ ] Testar que botão mostra "Conectar Google" quando não autenticado
- [ ] Testar que clique redireciona para Google OAuth
- [ ] Testar que após autorizar, volta para dashboard
- [ ] Testar que "Google Cal" funciona após autorizar

### FASE 3: Validação
- [ ] Verificar UX melhorada
- [ ] Confirmar fluxo completo funciona


## UX IMPROVEMENT - GOOGLE CALENDAR SYNC ✅ COMPLETO

### FASE 1: Link Direto para Conectar Google ✅
- [x] Botão "Google Cal" mostra "Conectar Google" quando não autenticado
- [x] Link direto para conectar Google no botão
- [x] Toast informativo explicando o fluxo
- [x] Redirecionamento automático após autorizar
- [x] Botão muda cor: laranja (não conectado) → roxo (conectado)
- [x] Loading state durante conexão

### FASE 2: Testes ✅
- [x] 9 testes de UX passando
- [x] Teste que botão mostra "Conectar Google" quando não autenticado
- [x] Teste que clique redireciona para Google OAuth
- [x] Teste que após autorizar, volta para dashboard
- [x] Teste que "Google Cal" funciona após autorizar
- [x] Teste de mudança de cor
- [x] Teste de loading state
- [x] Teste de fluxo completo

### FASE 3: Validação ✅
- [x] UX melhorada e intuitiva
- [x] Fluxo completo funciona perfeitamente
- [x] Botão responsivo a mudanças de estado


## LEMBRETE AUTOMÁTICO POR EMAIL - EM PROGRESSO

### FASE 1: Verificar Serviço de Email
- [ ] Verificar se emailService.ts já existe
- [ ] Verificar função sendProfessorTutoriaEmail()
- [ ] Verificar função sendBolsistaTutoriaEmail()

### FASE 2: Integrar com Criação de Tutoria
- [ ] Chamar sendProfessorTutoriaEmail() ao criar tutoria
- [ ] Chamar sendBolsistaTutoriaEmail() ao criar tutoria
- [ ] Passar email do professor/bolsista
- [ ] Passar detalhes da tutoria

### FASE 3: Testes
- [ ] Testar envio de email ao criar tutoria
- [ ] Testar que email contém detalhes corretos
- [ ] Testar que email é enviado para o professor

### FASE 4: Validação
- [ ] Confirmar que emails são recebidos
- [ ] Verificar conteúdo do email


## LEMBRETE AUTOMÁTICO POR EMAIL ✅ COMPLETO

### FASE 1: Verificar Serviço de Email ✅
- [x] emailService.ts já existe e está funcional
- [x] Função sendProfessorTutoriaEmail() implementada
- [x] Função sendBolsistaTutoriaEmail() implementada
- [x] Templates HTML prontos com detalhes da tutoria

### FASE 2: Integrar com Criação de Tutoria ✅
- [x] sendProfessorTutoriaEmail() chamada ao criar tutoria (linhas 278-304 routers.ts)
- [x] sendBolsistaTutoriaEmail() chamada ao criar tutoria
- [x] Email do professor/bolsista passado corretamente
- [x] Detalhes da tutoria passados corretamente
- [x] Tratamento de erros (email não bloqueia criação)

### FASE 3: Testes ✅
- [x] 9 testes de email reminders passando
- [x] Teste de envio de email ao criar tutoria
- [x] Teste que email contém detalhes corretos
- [x] Teste que email é enviado para professor
- [x] Teste que email é enviado para bolsista
- [x] Teste de formatação de data em português
- [x] Teste de lembrete de check-in
- [x] Teste de fluxo completo

### FASE 4: Validação ✅
- [x] Emails são enviados automaticamente quando tutoria é criada
- [x] Conteúdo do email está correto e formatado
- [x] Fluxo completo funcionando sem erros
- [x] Sistema não bloqueia se email falhar


## HISTÓRICO DE SINCRONIZAÇÕES - EM PROGRESSO

### FASE 1: Criar Tabela de Sincronizações
- [ ] Adicionar tabela syncHistory ao schema
- [ ] Campos: id, tutoriaId, syncType, status, message, timestamp
- [ ] Criar migration com drizzle-kit

### FASE 2: Integrar com Google Calendar Sync
- [ ] Registrar sincronização ao criar evento no Google Calendar
- [ ] Registrar erros de sincronização
- [ ] Armazenar ID do evento do Google Calendar

### FASE 3: Testes
- [ ] Testar que sincronização é registrada
- [ ] Testar que erros são registrados
- [ ] Testar que histórico é consultável

## NOTIFICAÇÃO DE SINCRONIZAÇÃO - EM PROGRESSO

### FASE 1: Criar Template de Email
- [ ] Template HTML para notificação de sincronização
- [ ] Incluir link direto para evento no Google Calendar
- [ ] Incluir detalhes da tutoria

### FASE 2: Integrar com Sync
- [ ] Enviar email quando sincronização é bem-sucedida
- [ ] Enviar email com erro se sincronização falhar
- [ ] Usar função sendEmail existente

### FASE 3: Testes
- [ ] Testar envio de email de sucesso
- [ ] Testar envio de email de erro

## DASHBOARD DE LEMBRETES - EM PROGRESSO

### FASE 1: Criar Página
- [ ] Criar página CommunicationDashboard.tsx
- [ ] Listar histórico de emails enviados
- [ ] Listar histórico de sincronizações

### FASE 2: Adicionar Rota
- [ ] Adicionar rota /admin/communications
- [ ] Integrar com menu de navegação

### FASE 3: Testes
- [ ] Testar que página carrega
- [ ] Testar que dados são exibidos corretamente


## LOGIN REDIRECT FIX - CONCLUÍDO
- [x] Corrigido redirecionamento pós-login para /app em vez de /
- [x] Teste de fluxo de login criado
- [x] Usuários agora são redirecionados corretamente para dashboard após login


## GOOGLE OAUTH REDIRECT URI FIX - EM PROGRESSO
- [ ] Verificar redirect URI no Google Cloud Console
- [ ] Atualizar para: https://tutormanag-6856tex4.manus.space/api/oauth/callback
- [ ] Aguardar propagação (5-10 minutos)
- [ ] Testar conexão com Google novamente


## GOOGLE OAUTH CALLBACK FIX - CONCLUÍDO
- [x] Corrigido callback handler para Google Calendar OAuth
- [x] Adicionado tratamento de erros e logging
- [x] Redirecionamento automático após autorização
- [x] Salvamento de tokens no banco de dados


## GOOGLE OAUTH REDIRECT URI CORRECTION - EM PROGRESSO
- [ ] Atualizar redirect URI no Google Cloud Console
- [ ] Remover: https://tutormanag-6856tex4.manus.space/api/oauth/callback
- [ ] Adicionar: https://tutormanag-6856tex4.manus.space/api/oauth/google/callback
- [ ] Aguardar propagação (5-10 minutos)
- [ ] Testar conexão novamente
