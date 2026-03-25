# TODO - WebSocket e Sistema de Usuários

## Fase 1: WebSocket para Sincronização em Tempo Real
- [ ] Instalar dependências: `socket.io`, `socket.io-client`
- [ ] Criar servidor WebSocket em `server/_core/websocket.ts`
- [ ] Criar hook `useWebSocket.ts` para cliente
- [ ] Sincronizar dashboard em tempo real
- [ ] Sincronizar tabela de tutorias em tempo real
- [ ] Sincronizar configurações em tempo real
- [ ] Sincronizar feedback e check-in em tempo real

## Fase 2: Sistema de 3 Tipos de Usuários
- [ ] Atualizar schema do banco: adicionar campo `role` (admin, professor, bolsista)
- [ ] Criar tabelas: `professors` e `bolsistas` com campos específicos
- [ ] Criar middleware de autorização por role
- [ ] Criar páginas diferentes para cada role:
  - [ ] Admin: Dashboard completo + gerenciamento de usuários
  - [ ] Professor: Apenas recebe emails (sem acesso ao sistema)
  - [ ] Bolsista: Dashboard com tutorias atribuídas
- [ ] Adicionar controle de acesso nas rotas

## Fase 3: Notificações por Email
- [ ] Configurar serviço de email (SendGrid ou similar)
- [ ] Criar template de email para professor (tutoria cadastrada)
- [ ] Criar template de email para professor (30 min antes)
- [ ] Criar template de email para bolsista (tutoria atribuída)
- [ ] Criar template de email para bolsista (30 min antes)
- [ ] Implementar job agendado para enviar emails 30 min antes

## Fase 4: Importação CSV/XLS
- [ ] Instalar `papaparse` para CSV e `xlsx` para Excel
- [ ] Criar página de upload para Admin
- [ ] Validar dados do CSV/XLS
- [ ] Importar professores em lote
- [ ] Importar bolsistas em lote
- [ ] Gerar relatório de importação

## Fase 5: Testes
- [ ] Testar WebSocket com múltiplos clientes
- [ ] Testar permissões por role
- [ ] Testar notificações por email
- [ ] Testar importação CSV/XLS

## Fase 6: Deploy
- [ ] Criar checkpoint final
- [ ] Entregar ao usuário
