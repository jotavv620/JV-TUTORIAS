# 📦 Guia Completo: Deploy do Tutoria Manager na Vercel

## ⚠️ Importante: Alternativa Recomendada

**O Manus já fornece hosting gratuito e integrado!** Sua plataforma está online em:
- **URL:** `https://tutormanag-6856tex4.manus.space`
- **Publicar:** Clique no botão "Publish" na interface
- **Vantagens:** Sem configurações, banco de dados incluído, SSL automático, domínios personalizados

Se você ainda preferir usar Vercel, siga este guia.

---

## 📁 Estrutura de Pastas para Vercel

```
tutoria-manager/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/                    # Backend (Express + tRPC)
│   ├── _core/
│   ├── routers.ts
│   ├── db.ts
│   └── package.json
├── drizzle/                   # Banco de dados
│   ├── schema.ts
│   └── migrations/
├── shared/                    # Código compartilhado
├── package.json               # Root package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
└── vercel.json                # ⭐ NOVO: Configuração Vercel
```

---

## 🚀 Passo 1: Preparar o Projeto

### 1.1 Criar arquivo `vercel.json` na raiz:

```json
{
  "version": 2,
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "vite",
  "functions": {
    "server/_core/index.ts": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "routes": [
    {
      "src": "/api/trpc/(.*)",
      "dest": "server/_core/index.ts",
      "methods": ["GET", "POST"]
    },
    {
      "src": "/api/oauth/callback",
      "dest": "server/_core/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "VITE_APP_ID": "@vite_app_id",
    "OAUTH_SERVER_URL": "@oauth_server_url",
    "VITE_OAUTH_PORTAL_URL": "@vite_oauth_portal_url"
  }
}
```

### 1.2 Atualizar `package.json` na raiz:

```json
{
  "name": "tutoria-manager",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx watch server/_core/index.ts",
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit generate && drizzle-kit migrate"
  },
  "engines": {
    "node": "18.x"
  }
}
```

---

## 🔐 Passo 2: Configurar Variáveis de Ambiente

### 2.1 Criar `.env.local` (NÃO COMMITAR):

```bash
# Banco de dados
DATABASE_URL=mysql://user:password@host:3306/tutoria_manager

# OAuth Manus
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura

# Owner
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome

# APIs Manus
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_api
VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

### 2.2 Adicionar ao `.gitignore`:

```
.env.local
.env.*.local
dist/
node_modules/
.pnpm-store/
```

---

## 📊 Passo 3: Configurar Banco de Dados

### Opção A: TiDB Cloud (Recomendado para Vercel)

1. Acesse [tidb.cloud](https://tidb.cloud)
2. Crie um cluster gratuito
3. Copie a connection string
4. Atualize `DATABASE_URL` no `.env.local`

### Opção B: PlanetScale (MySQL compatível)

1. Acesse [planetscale.com](https://planetscale.com)
2. Crie um banco de dados gratuito
3. Copie a connection string
4. Atualize `DATABASE_URL`

---

## 🔧 Passo 4: Deploy na Vercel

### 4.1 Preparar repositório Git:

```bash
cd /home/ubuntu/tutoria-manager
git init
git add .
git commit -m "Initial commit: Tutoria Manager com banco de dados"
git branch -M main
git remote add origin https://github.com/seu-usuario/tutoria-manager.git
git push -u origin main
```

### 4.2 Conectar à Vercel:

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Configure as variáveis de ambiente:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `VITE_APP_ID`
   - `OAUTH_SERVER_URL`
   - `VITE_OAUTH_PORTAL_URL`
   - Todas as outras do `.env.local`

5. Clique em "Deploy"

---

## 📝 Passo 5: Configurações Adicionais

### 5.1 Atualizar URLs de Callback OAuth

Se seu domínio Vercel for `tutoria-manager.vercel.app`:

1. Acesse painel Manus OAuth
2. Atualize "Redirect URLs" para:
   - `https://tutoria-manager.vercel.app/api/oauth/callback`

### 5.2 Configurar Domínio Personalizado

1. Na Vercel, vá para "Settings" → "Domains"
2. Adicione seu domínio (ex: `tutoria.seu-dominio.com`)
3. Atualize DNS conforme instruções

---

## 🐛 Troubleshooting

### Erro: "DATABASE_URL not found"
- Verifique se a variável está configurada na Vercel
- Reinicie o deployment após adicionar variáveis

### Erro: "Cannot find module 'drizzle-orm'"
- Execute `pnpm install` localmente
- Commit o `pnpm-lock.yaml`

### Erro: "OAuth callback failed"
- Verifique se a URL de callback está correta na Manus
- Confirme que `VITE_APP_ID` está correto

### Erro: "Build failed"
- Verifique logs na Vercel
- Execute `pnpm build` localmente para testar

---

## ✅ Checklist Final

- [ ] `vercel.json` criado na raiz
- [ ] `.env.local` com todas as variáveis
- [ ] `.gitignore` atualizado
- [ ] Repositório Git criado e commitado
- [ ] Banco de dados configurado (TiDB ou PlanetScale)
- [ ] Variáveis de ambiente adicionadas na Vercel
- [ ] OAuth URLs atualizadas
- [ ] Deploy realizado com sucesso
- [ ] Teste login e criação de tutoria
- [ ] Domínio personalizado configurado (opcional)

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs na Vercel (Deployments → Logs)
2. Teste localmente: `pnpm dev`
3. Verifique variáveis de ambiente
4. Consulte documentação Vercel: [vercel.com/docs](https://vercel.com/docs)

---

## ⭐ Por que usar Manus em vez de Vercel?

| Aspecto | Manus | Vercel |
|--------|-------|--------|
| **Banco de Dados** | ✅ Incluído | ❌ Pago extra |
| **Setup** | ✅ Automático | ❌ Manual |
| **Domínio** | ✅ Grátis | ✅ Grátis |
| **SSL** | ✅ Automático | ✅ Automático |
| **Suporte** | ✅ Integrado | ⚠️ Comunidade |
| **Custo** | 💰 Gratuito | 💰 Começa grátis |

**Recomendação:** Use Manus para produção, Vercel para experimentar.
