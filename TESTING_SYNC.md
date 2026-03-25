# Guia de Testes - Sincronização em Tempo Real

## O que foi corrigido

### 1. WebSocket Broadcasts ✅
- Todas as mutações (criar/atualizar/deletar) agora emitem eventos WebSocket
- Eventos são recebidos por todos os clientes conectados
- Logs do WebSocket mostram conexões e eventos

### 2. Dados Globais ✅
- Disciplinas, Professores e Instituições agora são compartilhados entre todos os usuários
- Cada usuário vê a mesma lista de configurações
- Mudanças em um usuário aparecem para todos

### 3. Cache Invalidation ✅
- Após criar/atualizar/deletar dados, o cache do tRPC é invalidado
- A UI atualiza automaticamente sem precisar recarregar
- Polling a cada 3 segundos garante sincronização mesmo sem WebSocket

## Como Testar

### Teste 1: Sincronização em Tempo Real (2 Abas)

1. **Abra 2 abas do navegador** com o Tutoria Manager
2. **Aba 1**: Clique em "+ NOVO AGENDAMENTO"
3. **Aba 1**: Preencha os dados:
   - Disciplina: Matemática
   - Professor: Dr. Silva
   - Instituição: Campus A
   - Bolsista: João
   - Data: 2026-03-26
   - Horário: 14:00
   - Término: 15:00
4. **Aba 1**: Clique em "Criar"
5. **Aba 2**: Observe se a nova tutoria aparece na tabela em até 3 segundos
6. **Resultado**: ✅ Se aparecer em ambas as abas, a sincronização está funcionando!

### Teste 2: Sincronização com 2 Usuários

1. **Usuário A**: Faça login com sua conta
2. **Usuário B**: Faça login com outra conta (em outro navegador/computador)
3. **Usuário A**: Crie uma nova tutoria (seguindo Teste 1)
4. **Usuário B**: Observe se a tutoria aparece em sua tela
5. **Resultado**: ✅ Se aparecer, a sincronização multi-usuário está funcionando!

### Teste 3: Sincronização de Configurações

1. **Abra 2 abas do navegador**
2. **Aba 1**: Vá para "CONFIGURAÇÕES"
3. **Aba 1**: Adicione uma nova Disciplina (ex: "Biologia")
4. **Aba 2**: Vá para "CONFIGURAÇÕES"
5. **Aba 2**: Observe se "Biologia" aparece na lista de Disciplinas
6. **Resultado**: ✅ Se aparecer, a sincronização de configurações está funcionando!

### Teste 4: Atualização de Status

1. **Abra 2 abas do navegador**
2. **Aba 1**: Clique em "Check-in" em uma tutoria
3. **Aba 1**: Preencha e confirme
4. **Aba 2**: Observe se o status muda de "AGENDADA" para "EM CURSO"
5. **Resultado**: ✅ Se mudar, a sincronização de status está funcionando!

## Checklist de Validação

| Funcionalidade | Status | Notas |
|---|---|---|
| WebSocket conecta | ✅ | Logs mostram conexões |
| Criar tutoria sincroniza | ? | Teste 1 |
| Atualizar status sincroniza | ? | Teste 4 |
| Deletar tutoria sincroniza | ? | Teste 1 (clique Deletar) |
| Criar disciplina sincroniza | ? | Teste 3 |
| Multi-usuário funciona | ? | Teste 2 |
| Cache invalida automaticamente | ✅ | Implementado |
| Polling a cada 3s funciona | ✅ | Implementado |

## Logs para Verificar

### Ver logs do WebSocket
```bash
tail -f .manus-logs/devserver.log | grep WebSocket
```

### Ver logs do navegador (Console)
1. Abra DevTools (F12)
2. Vá para "Console"
3. Procure por logs com "[WebSocket]"
4. Procure por "[API Query Error]" ou "[API Mutation Error]"

## Se algo não funcionar

1. **Recarregue a página** (Ctrl+R ou Cmd+R)
2. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
3. **Verifique se o WebSocket está conectado** (Console → "[WebSocket] Connected")
4. **Verifique se há erros** (Console → procure por "Error")
5. **Reinicie o servidor** (o projeto fará isso automaticamente)

## Tecnologias Usadas

- **WebSocket**: Socket.io para comunicação em tempo real
- **Cache**: React Query + tRPC com invalidação automática
- **Polling**: Refetch a cada 3 segundos como fallback
- **Broadcasting**: Todos os eventos são emitidos para todos os clientes

## Próximos Passos

Após validar a sincronização:
1. Implementar Email Notifications (30 min antes de tutoria)
2. Implementar CSV/XLS Import para bulk upload
3. Implementar Role-Based Access Control (Admin, Professor, Bolsista)
