# ✅ Checklist: Liberar Google OAuth para Todos os Emails

## 📋 Resumo
Este checklist guia você através do processo de remover as restrições de "Test Users" do Google Cloud Console para permitir que **qualquer email** possa usar o Google Calendar com a aplicação Tutoria Manager.

## 🔧 Configuração Necessária

### 1️⃣ Acessar Google Cloud Console
- [ ] Abra: https://console.cloud.google.com
- [ ] Faça login com sua conta Google
- [ ] Selecione o projeto "tutoria-manager" (ou seu projeto)

### 2️⃣ Navegar para OAuth Consent Screen
- [ ] Clique em: **APIs & Services** (no menu esquerdo)
- [ ] Clique em: **OAuth consent screen**
- [ ] Você deve estar na aba **"CONSENT SCREEN"**

### 3️⃣ Verificar Tipo de Usuário
- [ ] Procure a seção **"User Type"**
- [ ] Verifique se está como **"External"** (não "Internal")
- [ ] Se estiver como "Internal", clique em **"EDIT APP"** e mude para **"External"**

### 4️⃣ Remover Restrições de Test Users
- [ ] Procure a seção **"Test users"**
- [ ] **Remova TODOS os usuários de teste** (clique no ícone de lixeira ao lado de cada um)
- [ ] Deixe a lista **completamente vazia**
- [ ] Clique em **"SAVE AND CONTINUE"** ou **"UPDATE"**

### 5️⃣ Verificar Scopes Autorizados
- [ ] Na aba **"Scopes"**, verifique se os seguintes escopos estão presentes:
  - [ ] `https://www.googleapis.com/auth/calendar` (Google Calendar)
  - [ ] `https://www.googleapis.com/auth/userinfo.email` (Email)
  - [ ] `https://www.googleapis.com/auth/userinfo.profile` (Perfil)
- [ ] Se algum estiver faltando, clique em **"ADD SCOPES"** e adicione

### 6️⃣ Verificar Informações da Aplicação
- [ ] **App name**: Deve estar preenchido (ex: "Tutoria Manager")
- [ ] **User support email**: Deve estar preenchido com seu email
- [ ] **Developer contact information**: Deve estar preenchido
- [ ] Clique em **"SAVE AND CONTINUE"**

### 7️⃣ Verificar Credenciais OAuth
- [ ] Vá para: **APIs & Services** → **Credentials**
- [ ] Procure pelo seu **OAuth 2.0 Client ID** (tipo: "Web application")
- [ ] Clique nele para editar
- [ ] Verifique se o **Redirect URI** está correto:
  ```
  https://tutormanag-6856tex4.manus.space/api/oauth/google/callback
  ```
- [ ] Se estiver diferente, atualize para o URL acima
- [ ] Clique em **"SAVE"**

## 🚀 Após Completar o Checklist

Depois de completar todos os passos acima:

1. ✅ **Qualquer email** pode agora usar "Conectar Google"
2. ✅ **Não há mais restrição** de Test Users
3. ✅ **Google Calendar** será sincronizado automaticamente
4. ✅ **Agendamentos** aparecerão no Google Calendar

## 🧪 Testando a Configuração

### Teste 1: Com seu email (já autorizado)
1. Acesse: https://tutormanag-6856tex4.manus.space/app
2. Clique em "Conectar Google"
3. Autorize o acesso
4. Verifique se o agendamento aparece no Google Calendar

### Teste 2: Com outro email (novo usuário)
1. Abra em uma **aba anônima/privada** (Ctrl+Shift+N)
2. Acesse: https://tutormanag-6856tex4.manus.space/app
3. Faça login com **outro email**
4. Clique em "Conectar Google"
5. Autorize o acesso
6. Verifique se funciona normalmente

## ⚠️ Importante

- **Não é necessário adicionar cada email manualmente** como Test User
- Uma vez liberado para "External", qualquer email pode acessar
- A aplicação ainda está em "Testing" (não precisa de verificação completa do Google)
- Se quiser usar em produção, será necessário fazer a verificação de segurança do Google

## 🐛 Troubleshooting

| Erro | Solução |
|------|---------|
| "Access blocked - app not verified" | Remova a restrição de Test Users ou adicione seu email como Test User |
| "Invalid redirect URI" | Verifique se o URI está exatamente como: `https://tutormanag-6856tex4.manus.space/api/oauth/google/callback` |
| "Rate exceeded" | Aguarde 5-10 minutos e tente novamente |
| "Redirect URI mismatch" | Certifique-se que o URI está salvo nas credenciais do Google |

## 📞 Referências

- [Google OAuth Consent Screen](https://support.google.com/cloud/answer/6158849)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Calendar API](https://developers.google.com/calendar/api)

---

**Status**: ⏳ Aguardando você completar o checklist no Google Cloud Console

Após completar, seu sistema estará totalmente funcional para qualquer email! 🎉
