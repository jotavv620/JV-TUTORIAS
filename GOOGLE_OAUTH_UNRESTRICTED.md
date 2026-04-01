# Liberar Google OAuth para Qualquer Email

## 🎯 Objetivo
Remover as restrições de "Test Users" do Google Cloud Console para permitir que **qualquer email** possa usar o Google Calendar com a aplicação.

## 📋 Pré-requisitos
- Acesso ao Google Cloud Console
- Projeto Google Cloud já configurado
- OAuth 2.0 Client ID criado

## ✅ Passos para Liberar

### Passo 1: Acessar Google Cloud Console
1. Abra: https://console.cloud.google.com
2. Selecione seu projeto
3. Vá para: **APIs & Services** → **OAuth consent screen**

### Passo 2: Mudar de "Testing" para "Production"
1. Na seção **"User Type"**, clique em **"EDIT APP"**
2. Selecione **"External"** (em vez de "Internal")
3. Clique em **"CREATE"** ou **"UPDATE"**

### Passo 3: Remover Restrições de Test Users
1. Na aba **"OAuth consent screen"**, procure a seção **"Test users"**
2. **Remova todos os usuários de teste** (clique no ícone de lixeira)
3. Deixe a lista de test users **vazia**

### Passo 4: Adicionar Scopes Necessários
1. Na seção **"Scopes"**, certifique-se que os seguintes escopos estão adicionados:
   - `https://www.googleapis.com/auth/calendar` (Google Calendar)
   - `https://www.googleapis.com/auth/userinfo.email` (Email do usuário)
   - `https://www.googleapis.com/auth/userinfo.profile` (Perfil do usuário)

### Passo 5: Verificar Informações da Aplicação
1. Preencha os campos obrigatórios:
   - **App name**: "Tutoria Manager"
   - **User support email**: seu email
   - **Developer contact information**: seu email
2. Clique em **"SAVE AND CONTINUE"**

### Passo 6: Aguardar Verificação (Opcional)
- Se o Google solicitar verificação adicional, siga as instruções
- Geralmente, aplicações de teste podem usar sem verificação completa
- Para produção, você pode precisar fazer a verificação de segurança do Google

## 🔄 Fluxo Esperado Após Liberar

1. **Qualquer usuário** pode clicar em "Conectar Google"
2. **Será redirecionado** para login do Google
3. **Após autorizar**, será redirecionado de volta para o app
4. **Calendário será sincronizado** automaticamente

## 🚨 Importante

- **Não é necessário adicionar cada email manualmente** como Test User
- Uma vez liberado para "External", qualquer email pode acessar
- A aplicação ainda está em "Testing" (não precisa de verificação completa do Google)
- Se quiser produção, será necessário fazer a verificação de segurança do Google

## ❓ Troubleshooting

### Erro: "Access blocked - app not verified"
- Significa que ainda está em "Testing" e você não é Test User
- **Solução**: Remova a restrição de Test Users ou adicione seu email como Test User

### Erro: "Invalid redirect URI"
- Certifique-se que o redirect URI está correto:
  - `https://tutormanag-6856tex4.manus.space/api/oauth/google/callback`
- Deve estar exatamente como configurado no Google Cloud Console

### Erro: "Rate exceeded"
- Aguarde 5-10 minutos e tente novamente
- Limpe os cookies do navegador
- Tente em uma aba anônima/privada

## 📞 Suporte

Se tiver dúvidas, acesse:
- https://support.google.com/cloud/answer/6158849 (OAuth consent screen)
- https://developers.google.com/identity/protocols/oauth2 (OAuth 2.0 Documentation)
