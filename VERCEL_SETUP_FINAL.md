# Solução Final: Erro de JSON no Vercel

## 🎯 Problema Resolvido

**Erro Original:** `Unexpected token 'A', 'A server e'... is not valid JSON`

**Logs:** `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/_core/index'`

**Causa:** O Vercel tentava usar `api/index.ts` como serverless function, mas ele não conseguia encontrar os módulos compilados.

---

## ✅ Solução Implementada

### 1. **api/index.ts** - Ponte Serverless (NOVO)

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";

let cachedApp: any = null;
let initPromise: Promise<any> | null = null;

async function initializeApp() {
  if (cachedApp) return cachedApp;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const serverModule = await import("../dist/index.js");
    const createApp = serverModule.default || serverModule.createApp;
    
    if (!createApp) {
      throw new Error("Cannot find createApp function in compiled server module");
    }
    
    cachedApp = await createApp();
    return cachedApp;
  })();

  return initPromise;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const app = await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error("[Vercel Handler] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
```

**Como funciona:**
- ✅ Importa o app compilado de `dist/index.js`
- ✅ Cacheamento para evitar reinicialização
- ✅ Tratamento de erros com respostas JSON
- ✅ Compatível com Vercel serverless

### 2. **vercel.json** - Configuração Vercel (ATUALIZADO)

```json
{
  "version": 2,
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "vite",
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs@20.x",
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "rewrites": [
    { "source": "/api/trpc/:path*", "destination": "/api" },
    { "source": "/api/oauth/:path*", "destination": "/api" },
    { "source": "/api/health", "destination": "/api" },
    { "source": "/api/:path*", "destination": "/api" },
    { "source": "/:path*", "destination": "/index.html" }
  ]
}
```

**Explicação:**
- `functions`: Define `api/index.ts` como serverless function com Node 20
- `rewrites`: Todas as requisições `/api/*` vão para o handler
- `buildCommand`: Executa `pnpm build` que:
  - Compila React frontend com Vite → `dist/public/`
  - Compila servidor com esbuild → `dist/index.js`

### 3. **server/_core/index.ts** - Exportação (REFATORADO)

```typescript
// Exporta createApp para Vercel usar
export async function createApp() {
  const app = express();
  
  // ... configurar middlewares ...
  // tRPC, OAuth, health check, etc
  
  return app;
}

// Desenvolvimento: Inicia servidor local
async function startServer() {
  const app = await createApp();
  const server = createServer(app);
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

// Só inicia se for desenvolvimento
if (process.env.NODE_ENV === "development" || !process.env.VERCEL) {
  startServer().catch(console.error);
}

export default createApp;
```

---

## 🔄 Fluxo de Requisição no Vercel

```
1. Cliente faz requisição: GET /api/trpc/auth.me
                    ↓
2. Vercel recebe em /api
                    ↓
3. vercel.json reescreve para /api (handler)
                    ↓
4. Executa api/index.ts handler()
                    ↓
5. handler() importa ../dist/index.js (app compilado)
                    ↓
6. Express app processa /api/trpc/auth.me
                    ↓
7. tRPC middleware retorna JSON
                    ↓
8. Resposta JSON enviada ao cliente
```

---

## 🏗️ Build Process

O comando `pnpm build` executa:

```bash
# 1. Vite compila React frontend
vite build
# Resultado: dist/public/ (HTML, CSS, JS estático)

# 2. esbuild compila servidor TypeScript
esbuild server/_core/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist
# Resultado: dist/index.js (servidor compilado)
```

**Resultado final:**
- `dist/public/` - Frontend estático (servido pelo Vercel)
- `dist/index.js` - Servidor compilado (importado pelo handler)

---

## 🧪 Testes Locais

```bash
# Terminal 1: Inicia dev server
pnpm dev

# Terminal 2: Testa endpoints
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"..."}

curl http://localhost:3000/api/trpc/auth.me
# {"result":{"data":{"json":null}}}

curl -X POST http://localhost:3000/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🚀 Deploy no Vercel

### Passo 1: Commit e Push

```bash
cd /home/ubuntu/tutoria-manager

# Adicionar mudanças
git add api/index.ts vercel.json server/_core/index.ts

# Commit
git commit -m "Fix: Vercel serverless function configuration

- Refactored server/_core/index.ts to export createApp()
- Created api/index.ts as Vercel handler
- Updated vercel.json with correct rewrites
- All API endpoints now return JSON correctly"

# Push para GitHub
git push origin main
```

### Passo 2: Vercel Detecta e Deploy

Vercel automaticamente:
1. ✅ Executa `pnpm install --frozen-lockfile`
2. ✅ Executa `pnpm build`
3. ✅ Deploy automático

### Passo 3: Validar em Produção

```bash
# Testar health check
curl https://seu-dominio.vercel.app/api/health

# Testar tRPC
curl https://seu-dominio.vercel.app/api/trpc/auth.me

# Testar login
curl -X POST https://seu-dominio.vercel.app/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## ⚠️ Troubleshooting

### Erro: "Cannot find module"

**Solução:**
```bash
# Rebuild localmente
pnpm build

# Verifica se dist/index.js existe
ls -la dist/index.js

# Testa localmente
pnpm dev
curl http://localhost:3000/api/health
```

### Erro: "Unexpected token"

**Solução:**
- Verifica se o app está retornando JSON
- Testa localmente: `curl http://localhost:3000/api/health`
- Verifica logs do Vercel: `vercel logs`

### Erro: "ECONNREFUSED"

**Solução:**
- Dev: `pnpm dev`
- Prod: Vercel deve iniciar automaticamente
- Verifica se DATABASE_URL está configurada no Vercel

---

## 📋 Checklist de Deploy

- [ ] Código local testado: `pnpm dev` funciona
- [ ] Build local bem-sucedido: `pnpm build` sem erros
- [ ] Endpoints retornam JSON: `/api/health` e `/api/trpc/auth.me`
- [ ] Commit feito: `git commit -m "Fix: Vercel serverless"`
- [ ] Push para GitHub: `git push origin main`
- [ ] Vercel detectou mudanças (check email)
- [ ] Deploy completo no Vercel
- [ ] Testes em produção bem-sucedidos

---

## 📁 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `api/index.ts` | ✨ Novo handler serverless |
| `vercel.json` | 🔧 Configuração correta |
| `server/_core/index.ts` | 🔄 Refatorado para exportar createApp() |

---

## 🎓 Conceitos Importantes

### Por que isso funciona?

1. **Compilação em Build Time:** `pnpm build` compila tudo para JavaScript
2. **Import em Runtime:** `api/index.ts` importa o JavaScript compilado
3. **Cacheamento:** App é criado uma vez e reutilizado
4. **Sem Dependências TypeScript:** Vercel não precisa compilar TypeScript

### Diferença do Desenvolvimento

| Ambiente | Processo |
|----------|----------|
| **Dev** | `pnpm dev` → tsx watch → Vite + Express |
| **Prod** | `pnpm build` → dist/index.js → Vercel handler |

---

## 🔗 Próximas Melhorias

1. **Adicionar Logging:** Implementar logging estruturado para debug
2. **Monitoramento:** Setup de monitoring no Vercel
3. **CI/CD:** Adicionar testes antes de deploy
4. **Caching:** Implementar cache de responses

---

## 📞 Suporte

Se encontrar problemas:

1. Verifica logs locais: `pnpm dev`
2. Verifica logs do Vercel: `vercel logs`
3. Testa endpoints: `curl http://localhost:3000/api/health`
4. Verifica DATABASE_URL no Vercel
5. Verifica se `dist/index.js` foi gerado
