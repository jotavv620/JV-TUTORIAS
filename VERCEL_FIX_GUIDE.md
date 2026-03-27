# Guia de Correção: Erro de JSON no Vercel

## Problema Original

Erro no Vercel: `Unexpected token 'A', 'A server e'... is not valid JSON`

Logs do Vercel: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/_core/index'`

### Causa Raiz

1. O `api/index.ts` estava tentando importar módulos TypeScript diretamente
2. O Vercel não conseguia resolver os imports de `server/_core/`
3. O servidor estava retornando HTML (página de erro) em vez de JSON

## Solução Implementada

### 1. Refatoração de `server/_core/index.ts`

**Antes:** O arquivo chamava `startServer()` automaticamente e exportava a função.

**Depois:** Agora exporta uma função `createApp()` que pode ser reutilizada tanto para desenvolvimento quanto para Vercel.

```typescript
// Novo padrão
export async function createApp() {
  const app = express();
  // ... configurar middlewares ...
  return app;
}

// Desenvolvimento: Chama startServer() que cria a app e faz listen
// Vercel: Chama createApp() e usa o app como handler
```

**Benefícios:**
- ✅ Reutilizável em ambos os ambientes
- ✅ Sem duplicação de código
- ✅ Fácil de testar

### 2. Novo `api/index.ts` como Serverless Function

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";

let cachedApp: any = null;

async function getApp() {
  if (cachedApp) return cachedApp;
  
  // Importa o app compilado do dist/index.js
  const { default: createApp } = await import("../dist/index.js");
  cachedApp = await createApp();
  return cachedApp;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const app = await getApp();
  return app(req, res);
}
```

**Como funciona:**
1. Vercel chama `handler()` para cada requisição
2. `handler()` importa o app compilado de `dist/index.js`
3. O app é cacheado após primeira inicialização
4. O Express app processa a requisição normalmente

### 3. Configuração `vercel.json`

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
    {
      "source": "/api/trpc/:path*",
      "destination": "/api"
    },
    {
      "source": "/api/oauth/:path*",
      "destination": "/api"
    },
    {
      "source": "/api/health",
      "destination": "/api"
    },
    {
      "source": "/api/:path*",
      "destination": "/api"
    },
    {
      "source": "/:path*",
      "destination": "/index.html"
    }
  ]
}
```

**Explicação:**
- `functions`: Define `api/index.ts` como serverless function com Node 20
- `rewrites`: Todas as requisições de `/api/*` são reescritas para `/api` (handler)
- Requisições para `/` são reescritas para `/index.html` (SPA)

## Fluxo de Requisição no Vercel

```
Requisição HTTP
    ↓
Vercel recebe em /api/trpc/auth.me
    ↓
vercel.json reescreve para /api
    ↓
Executa api/index.ts handler()
    ↓
handler() importa ../dist/index.js (app compilado)
    ↓
Express app processa /api/trpc/auth.me
    ↓
tRPC middleware retorna JSON
    ↓
Resposta JSON enviada ao cliente
```

## Build Process

O comando `pnpm build` faz:

1. **Vite Build**: Compila React frontend para `dist/public/`
   ```bash
   vite build
   ```

2. **esbuild**: Compila `server/_core/index.ts` para `dist/index.js`
   ```bash
   esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
   ```

Resultado:
- `dist/public/` - Frontend estático (servido pelo Vercel)
- `dist/index.js` - Servidor compilado (importado pelo handler)

## Testes Locais

```bash
# Terminal 1: Inicia dev server
pnpm dev

# Terminal 2: Testa endpoints
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"..."}

curl http://localhost:3000/api/trpc/auth.me
# {"result":{"data":{"json":null}}}
```

## Deploy no Vercel

1. **Fazer push para GitHub:**
   ```bash
   git add .
   git commit -m "Fix: Vercel serverless function configuration"
   git push origin main
   ```

2. **Vercel detecta mudanças e:**
   - Executa `pnpm install --frozen-lockfile`
   - Executa `pnpm build`
   - Deploy automático

3. **Testar em produção:**
   ```bash
   curl https://seu-dominio.vercel.app/api/health
   ```

## Troubleshooting

### Erro: "Cannot find module"
- ✅ Solução: Certifique-se que `dist/index.js` foi gerado
- Execute: `pnpm build`

### Erro: "Unexpected token"
- ✅ Solução: Verifica se o app está retornando JSON
- Teste localmente: `curl http://localhost:3000/api/health`

### Erro: "ECONNREFUSED"
- ✅ Solução: Verifica se o servidor está rodando
- Dev: `pnpm dev`
- Prod: Vercel deve iniciar automaticamente

## Arquivos Modificados

1. **server/_core/index.ts**
   - Refatorado para exportar `createApp()`
   - Mantém `startServer()` para desenvolvimento

2. **api/index.ts**
   - Novo handler serverless
   - Importa app compilado
   - Cacheamento de app

3. **vercel.json**
   - Configuração correta de serverless function
   - Rewrites para tRPC e OAuth
   - Runtime Node 20

## Próximos Passos

1. ✅ Push para GitHub
2. ✅ Validar deploy no Vercel
3. ✅ Testar login com email/senha
4. ✅ Testar geração de códigos de acesso
5. ✅ Testar sincronização com Google Calendar
