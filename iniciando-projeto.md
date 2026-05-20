# Como levar este conteúdo para o Notion

O Notion **não formata bem** Markdown colado direto do editor. Use um destes métodos:

## Método 1 — Copiar do navegador (mais confiável)

1. Abra **`iniciando-projeto-notion.html`** (duplo clique).
2. No navegador: **Ctrl+A** → **Ctrl+C**.
3. No Notion, em uma página vazia: **Ctrl+V** (colagem normal — não use “sem formatação”).

## Método 2 — Importar Markdown

No Notion: menu **⋯ → Import → Markdown** e selecione este arquivo.

> Se quiser que eu regere o HTML com este conteúdo atualizado, é só pedir.

---

# Pedidos Casa de Bolos — Setup inicial do projeto

**Backend em TypeScript moderno · Node.js 24 LTS · qualidade, testes e DX em 2026**

---

## Visão geral

Setup do repositório **01-pedidos-casa-de-bolos** seguindo o que está consolidado em **maio/2026**: ESM por padrão, Node 24, ESLint 10 flat config, Vitest 4, tsx + tsup, Pino para logs, Husky 9 + lint-staged + commitlint.

| Ferramenta            | Versão alvo (2026)   | Função                               |
| --------------------- | -------------------- | ------------------------------------ |
| **Node.js**           | 24.x LTS (mín. 22.x) | Runtime                              |
| **npm / pnpm**        | npm 11+ ou pnpm 10+  | Gerenciador de pacotes               |
| **TypeScript**        | 6.x                  | Tipagem e checagem                   |
| **tsx**               | 4.x                  | Executar `.ts` em dev (watch)        |
| **tsup**              | 8.x                  | Bundle de produção                   |
| **ESLint**            | 10.x (flat config)   | Lint                                 |
| **typescript-eslint** | 8.x                  | Regras TS para ESLint 10             |
| **Prettier**          | 3.x                  | Formatação                           |
| **EditorConfig**      | —                    | Estilo entre editores                |
| **Vitest**            | 4.x                  | Testes + coverage v8                 |
| **Pino**              | 10.x                 | Logger estruturado                   |
| **Husky**             | 9.x                  | Git hooks                            |
| **lint-staged**       | 17.x                 | Rodar lint só nos arquivos alterados |
| **commitlint**        | 21.x                 | Validar mensagens de commit          |

---

## 1. npm init

Inicializa o `package.json` e a estrutura do projeto.

```bash
mkdir 01-pedidos-casa-de-bolos && cd 01-pedidos-casa-de-bolos
git init -b main
npm init -y
```

> ⚠️ **Importante:** o `npm init -y` cria `"type": "commonjs"` no `package.json`.
> **Troque para `"type": "module"`** logo de cara — senão, com o `tsconfig` desta doc (`module: "NodeNext"` + `verbatimModuleSyntax: true`) você verá o erro:
>
> > \*A top-level 'export' modifier cannot be used on value declarations in a CommonJS module when 'verbatimModuleSyntax' is enabled. **ts(1287)\***

**`package.json` — base recomendada (ESM):**

```json
{
  "name": "01-pedidos-casa-de-bolos",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/main.js",
  "scripts": {
    "dev": "tsx watch --env-file=.env src/main.ts",
    "build": "tsup",
    "start": "node --env-file=.env dist/main.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:run": "vitest run --passWithNoTests",
    "test:coverage": "vitest run --coverage --passWithNoTests",
    "prepare": "husky"
  }
}
```

> **Novo em Node 20+:** `--env-file=.env` carrega variáveis sem precisar de `dotenv`.
> **Novo em Node 22+:** `--watch` nativo (alternativa ao `tsx watch`).

**Estrutura de pastas (feature-based):**

```
src/
  main.ts                       # bootstrap
  @shared/                      # código compartilhado (entities, value-objects, etc.)
    entities/
      entity.ts
  infrastructure/               # implementações de I/O (logger, db, http, etc.)
    logger/
      logger.ts
  modules/                      # casos de uso por domínio
    pedidos/
      pedidos.service.ts
      pedidos.controller.ts
      pedidos.test.ts
tests/                          # testes e2e ou integração
dist/                           # gerado pelo build
.env
.env.example
```

**`.gitignore`:**

```
node_modules
dist
coverage
.env
.env.local
*.log
.DS_Store
.vscode
.idea
```

---

## 2. TypeScript

Adicione TypeScript e use o **preset oficial por versão do Node** (`@tsconfig/node24`) para não errar `target`/`lib`.

```bash
npm install -D typescript @types/node @tsconfig/node24
```

**`tsconfig.json`:**

```json
{
  "extends": "@tsconfig/node24/tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "paths": {
      "@/*": ["./src/*"],
      "@modules/*": ["./src/modules/*"],
      "@lib/*": ["./src/lib/*"],
      "@infrastructure/*": ["./src/infrastructure/*"],
      "@shared/*": ["./src/@shared/*"]
    },
    "moduleResolution": "NodeNext",
    "module": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

> **Boa prática extra:** o arquivo `.vscode/settings.json` aponta o TSDK do workspace para o editor usar a mesma versão do TypeScript do projeto (evita divergência entre o que o Cursor mostra e o que o `tsc` reporta):
>
> ```json
> {
>   "typescript.tsdk": "node_modules/typescript/lib",
>   "typescript.enablePromptUseWorkspaceTsdk": true
> }
> ```
>
> Depois rode no Command Palette: **TypeScript: Select TypeScript Version → Use Workspace Version**.

**Path aliases (`paths`):** evitam imports relativos longos (`../../../lib/logger`). Com a config acima você importa assim:

```ts
import { logger } from "@/infrastructure/logger/logger.js";
import { PedidosService } from "@modules/pedidos/pedidos.service.js";
```

> **Atenção:** `paths` no `tsconfig` só resolve em **tempo de checagem**. Em runtime:
>
> - **tsx** e **tsup** leem `tsconfig.json` automaticamente — funciona out of the box.
> - **Vitest** precisa de `resolve.tsconfigPaths: true` no `vitest.config.ts` (ver seção 9).
> - Para `node dist/...` puro, o **tsup** já reescreve os imports no build — nada extra.

**Opções modernas e por quê:**

| Opção                        | Por quê                                                         |
| ---------------------------- | --------------------------------------------------------------- |
| `paths`                      | Aliases de import (`@/...` em vez de `../../...`)               |
| `noUncheckedIndexedAccess`   | Acessar `arr[i]` retorna `T \| undefined` — mais seguro         |
| `exactOptionalPropertyTypes` | `?: string` ≠ `string \| undefined`                             |
| `verbatimModuleSyntax`       | Imports `type` explícitos (necessário com bundlers ESM)         |
| `isolatedModules`            | Garante compatibilidade com transpiladores (tsx, tsup, esbuild) |

> ⚠️ **Pré-requisito do `verbatimModuleSyntax`:** o `package.json` precisa ter `"type": "module"`.
> Se estiver como `"commonjs"`, o TS lança **ts(1287)** em todo `export` de cima.
> Solução: trocar para `"type": "module"` (ver seção 1).

| Comando             | Quando usar                                                  |
| ------------------- | ------------------------------------------------------------ |
| `npm run typecheck` | CI e pre-commit — só valida tipos                            |
| `tsc`               | Só se quiser emitir JS pelo tsc; normalmente o tsup faz isso |

---

## 3. tsup (build de produção)

Bundler em cima do esbuild. Output ESM enxuto, com types e source maps.

```bash
npm install -D tsup
```

**`tsup.config.ts`:**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["esm"],
  target: "node24",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  dts: false,
  minify: false,
  treeshake: true,
  splitting: false,
});
```

> **Por que `dts: false`?** Em uma **aplicação** (não biblioteca) os `.d.ts` no `dist/` são inúteis — ninguém vai consumir tipos do app. Desligar evita problemas como o `baseUrl` deprecated injetado pelo `tsup` ao rodar o passo de DTS. Se um dia este pacote virar lib publicada no npm, mude para `dts: true`.

**Uso:** `npm run build && npm start`

---

## 4. tsx (executar TS em dev)

Executa `.ts` direto no Node, com watch e source maps. Mais rápido e estável que ts-node em 2026.

```bash
npm install -D tsx
```

```bash
npm run dev
# equivalente: npx tsx watch --env-file=.env src/main.ts
```

> **Importante:** tsx **transpila e ignora erros de tipo** (é o esperado — usa esbuild). Por isso o `npm run typecheck` roda separado no CI/pre-commit.
>
> **Alternativa nativa (Node 22+):** `node --watch --experimental-strip-types src/main.ts` — funciona, mas tsx ainda dá melhor DX.

---

## 5. ESLint 10 (flat config)

Em 2026 o `.eslintrc` não é mais aceito. Use `eslint.config.mjs` com **typescript-eslint v8+**.

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-config-prettier globals
```

**`eslint.config.mjs`:**

```js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist/**", "coverage/**", "node_modules/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // arquivos de config na raiz não estão no tsconfig — desliga regras type-checked
    files: ["*.config.{ts,mjs,js}", "*.{js,mjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ["**/*.test.ts", "tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  eslintConfigPrettier,
);
```

**Pontos importantes:**

- `projectService: true` (typescript-eslint v8) — mais rápido que `project: "./tsconfig.json"`.
- `eslintConfigPrettier` **sempre por último** — desliga regras que conflitam com o Prettier.
- **Não use** `eslint-plugin-prettier` (causa lentidão e confusão).

**Uso:** `npm run lint` · `npm run lint:fix`

---

## 6. Prettier

```bash
npm install -D prettier
```

**`.prettierrc.json`:**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

**`.prettierignore`:**

```
dist
node_modules
coverage
package-lock.json
pnpm-lock.yaml
```

**Uso:** `npm run format` · `npm run format:check`

---

## 7. EditorConfig

Garante indentação igual em VS Code, Cursor, Vim, JetBrains, etc.

**`.editorconfig`:**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

Sem pacote npm — os editores leem direto.

---

## 8. Husky + lint-staged + commitlint

A combinação moderna (2026) é: **Husky** dispara os hooks, **lint-staged** roda ferramentas só nos arquivos modificados, **commitlint** valida a mensagem.

### 8.1 Husky 9

```bash
npm install -D husky
npx husky init
```

Isso cria a pasta `.husky/` e adiciona `"prepare": "husky"` ao `package.json`.

### 8.2 lint-staged

```bash
npm install -D lint-staged
```

**`package.json`:**

```json
{
  "lint-staged": {
    "*.{ts,js,mjs,cjs}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

**`.husky/pre-commit`:**

```sh
npx lint-staged
npm run typecheck
npm run test:run
```

> Em Husky 9 **não** precisa mais do shebang nem do `. "$(dirname -- "$0")/_/husky.sh"`. Basta o comando.

### 8.3 commitlint (Conventional Commits)

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

**`commitlint.config.js`:**

```js
export default { extends: ["@commitlint/config-conventional"] };
```

**`.husky/commit-msg`:**

```sh
npx --no -- commitlint --edit "$1"
```

Agora commits precisam seguir o padrão `feat:`, `fix:`, `chore:`, etc.

---

## 9. Vitest 4

Test runner rápido, API compatível com Jest, e coverage nativo via V8.

```bash
npm install -D vitest @vitest/coverage-v8
```

> Em **Vite/Vitest atuais**, os `paths` do `tsconfig.json` são resolvidos nativamente com `resolve.tsconfigPaths: true` — não precisa mais do plugin `vite-tsconfig-paths`.

**`vitest.config.ts`:**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/main.ts", "**/*.config.*", "**/index.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

**Exemplo `src/modules/pedidos/pedidos.test.ts`:**

```ts
import { describe, it, expect } from "vitest";
import { PedidosService } from "@modules/pedidos/pedidos.service.js";
import { logger } from "@/infrastructure/logger/logger.js";

describe("pedidos", () => {
  it("soma valores corretamente", () => {
    expect(2 + 2).toBe(4);
  });
});
```

| Script                  | Comportamento              |
| ----------------------- | -------------------------- |
| `npm test`              | Watch (desenvolvimento)    |
| `npm run test:run`      | Execução única (CI / hook) |
| `npm run test:coverage` | Gera `coverage/index.html` |

> **Alternativa nativa:** Node 22+ tem `node --test` embutido. Vitest ainda ganha em DX, mocks e coverage.

---

## 10. Coverage

Já incluso na seção 9 via `@vitest/coverage-v8`. Pontos chave:

- Adicione `coverage/` ao `.gitignore`.
- Defina `thresholds` para falhar o CI se a cobertura cair.
- Abra `coverage/index.html` no navegador para o relatório visual.
- No CI, use `reporter: ["text", "lcov"]` e envie o `lcov` para Codecov/SonarQube.

---

## 11. Logger — Pino 9

Logs estruturados em JSON: rápidos em produção, bonitos em dev com `pino-pretty`.

```bash
npm install pino
npm install -D pino-pretty
```

**`src/infrastructure/logger/logger.ts`:**

```ts
import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  base: { service: "pedidos-casa-de-bolos" },
  redact: {
    paths: ["req.headers.authorization", "*.password", "*.token"],
    censor: "[REDACTED]",
  },
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:HH:MM:ss" },
    },
  }),
});
```

**Uso em `src/main.ts` (com alias `@/`):**

```ts
import { logger } from "@/infrastructure/logger/logger.js";

logger.info({ port: 3000 }, "servidor iniciando");
logger.error({ err: new Error("boom") }, "falhou");
```

**Variáveis de ambiente:**

| Variável    | Valores                                            | Padrão                        |
| ----------- | -------------------------------------------------- | ----------------------------- |
| `LOG_LEVEL` | `trace`, `debug`, `info`, `warn`, `error`, `fatal` | `info` (prod) / `debug` (dev) |
| `NODE_ENV`  | `development`, `production`, `test`                | —                             |

> Em produção, deixe o JSON puro — agregadores (CloudWatch, Loki, Datadog) leem direto.

---

## Ordem sugerida de instalação

1. `npm init`
2. **TypeScript** + `@tsconfig/node24`
3. **tsx** (dev) e **tsup** (build)
4. **ESLint 9** + **Prettier** + **EditorConfig**
5. **Vitest 4** + **@vitest/coverage-v8**
6. **Pino** (logger)
7. **Husky** + **lint-staged** + **commitlint**

---

## Checklist final

- [ ] `package.json` com `"type": "module"` (não `"commonjs"`) e scripts padronizados
- [ ] `tsconfig.json` estendendo `@tsconfig/node24` com `strict`, opções extras e `paths` (aliases `@/*`)
- [ ] `tsup.config.ts` com `target: "node24"` e `format: ["esm"]`
- [ ] `eslint.config.mjs` flat com `projectService: true`
- [ ] `.prettierrc.json` + `.prettierignore`
- [ ] `.editorconfig`
- [ ] `vitest.config.ts` com `resolve.tsconfigPaths: true`, coverage v8 e `thresholds`
- [ ] `src/infrastructure/logger/logger.ts` integrado ao `main.ts` via alias `@/`
- [ ] `.husky/pre-commit` rodando `lint-staged` + `typecheck` + `test:run`
- [ ] `.husky/commit-msg` com `commitlint`
- [ ] `.gitignore` cobrindo `dist`, `coverage`, `.env`, `node_modules`

---

## Comandos do dia a dia

```bash
npm run dev                          # desenvolvimento com hot reload
npm run build && npm start           # simular produção
npm run typecheck                    # só tipos
npm run lint:fix && npm run format   # corrigir tudo
npm run test                         # testes em watch
npm run test:coverage                # cobertura
```

---

_Documento atualizado em maio/2026 para o projeto **01-pedidos-casa-de-bolos**._
