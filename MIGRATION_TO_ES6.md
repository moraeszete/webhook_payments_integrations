# 🔄 Guia de Migração para ES6 Modules

## ⚡ Se quiser migrar para ES6 Modules:

### 1. **package.json**
```json
{
  "type": "module"
}
```

### 2. **routes/index.js**
```javascript
import Router from '@koa/router';
import asaas from '../controllers/asaas/hook.js';
import stripe from '../controllers/stripe/hook.js';

const router = new Router();

router.post('/asaas', asaas);
router.post('/stripe', stripe);

export default router;
```

### 3. **controllers/asaas/hook.js**
```javascript
export default async (ctx) => {
  // ...código atual...
};
```

### 4. **controllers/stripe/hook.js**
```javascript
export default async (ctx) => {
  // ...código atual...
};
```

### 5. **config/custom-express.js**
```javascript
import Koa from "koa";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import router from "../routes/index.js";
import validateToken from "../functions/validateToken.js";

const app = new Koa();
// ...resto do código...

export default app;
```

## ⚠️ **Considerações:**

### **Vantagens ES6:**
- ✅ Sintaxe moderna
- ✅ Tree shaking
- ✅ Melhor análise estática
- ✅ Padrão futuro

### **Vantagens CommonJS:**
- ✅ Compatibilidade total
- ✅ Sem necessidade de extensões .js
- ✅ Funciona com bibliotecas antigas
- ✅ Mais estável em Node.js

## 🎯 **Recomendação Atual:**
Mantenha **CommonJS** por enquanto, pois:
- Seu projeto já está funcionando
- Melhor compatibilidade com dependências
- Menos refatoração necessária
