# 🪶 flog-js — Guia Técnico (JavaScript puro)

> **Objetivo:** Implementar o `flog-js` **sem TypeScript**, usando **JavaScript ESM** com **JSDoc** para tipos opcionais, um único **AST Babel** compartilhado, e arquitetura de **modos plugáveis** (ex.: `lang`, `react`, e plugins externos).

---

## 🔧 Decisões de projeto (sem TS)

- **Módulos:** ESM ("type": "module").
- **Tipos:** via **JSDoc** (`@typedef`, `@param`, `@returns`) e comentários. Sem `.d.ts`.
- **Build:** zero-compile. Publicar fonte JS diretamente.
- **Compatibilidade:** Node >= 18.17.
- **Lint/Qualidade:** ESLint + Prettier (opcional). Tests com Vitest/Jest (opcional).

---

## 📂 Estrutura de diretórios

```
flog-js/
├─ bin/
│  └─ flog-js.js           # wrapper executável da CLI (shebang)
├─ src/
│  ├─ cli.js               # entrypoint da CLI
│  ├─ index.js             # API pública do pacote
│  ├─ core/
│  │  ├─ parser.js         # Babel parser configurado (ES/TS/JSX)
│  │  ├─ config.js         # carregamento/merge de config (.flogrc + CLI)
│  │  ├─ detect-mode.js    # heurística de autodetecção (react/lang)
│  │  ├─ mode-manager.js   # registro/seleção/composição de modos
│  │  ├─ scorer-lang.js    # visitor de JS/TS genérico
│  │  ├─ scorer-react.js   # visitor React (JSX, hooks)
│  │  ├─ plugin-api.js     # contratos JSDoc para plugins
│  │  ├─ reporter.js       # acumulação de score/funcões/drivers
│  │  └─ traverse-utils.js # helpers (resolução de nomes, etc.)
│  ├─ modes/
│  │  ├─ lang/
│  │  │  ├─ detect.js
│  │  │  └─ analyze.js
│  │  └─ react/
│  │     ├─ detect.js
│  │     └─ analyze.js
│  └─ utils/
│     ├─ fs.js             # leitura de arquivos, globs
│     └─ log.js            # logger simples
├─ package.json
└─ README.md / TECHNICAL_GUIDE.md
```

---

## 🧾 `package.json` (ESM + bin)

```json
{
  "name": "flog-js",
  "version": "0.1.0",
  "type": "module",
  "bin": { "flog-js": "./bin/flog-js.js" },
  "exports": {
    ".": "./src/index.js",
    "./plugin-api": "./src/core/plugin-api.js"
  },
  "engines": { "node": ">=18.17" },
  "dependencies": {
    "@babel/parser": "^7.25.0",
    "@babel/traverse": "^7.25.0",
    "@babel/types": "^7.25.0",
    "picomatch": "^4.0.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 🖥️ `bin/flog-js.js`

```js
#!/usr/bin/env node
import '../src/cli.js';
```

> Shebang + reexport do entrypoint de CLI.

---

## 🧠 API Pública — `src/index.js`

```js
import { analyzePaths } from './cli.js';
import { createAnalyzer, builtinLangMode, builtinReactMode } from './core/mode-manager.js';

export { analyzePaths, createAnalyzer, builtinLangMode, builtinReactMode };
```

---

## ⚙️ Parser — `src/core/parser.js`

```js
import { parse } from '@babel/parser';

/**
 * @param {string} source
 * @param {string} filePath
 * @returns {import('@babel/types').File}
 */
export function parseSource(source, filePath) {
  return parse(source, {
    sourceType: 'unambiguous',
    plugins: [
      'jsx',
      'typescript',
      'topLevelAwait',
      'importMeta',
      'importAssertions',
      'optionalChaining',
      'nullishCoalescingOperator',
      'objectRestSpread',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      ['decorators', { decoratorsBeforeExport: true }]
    ]
  });
}
```

> Observação: mesmo sem TS, habilitamos `typescript` só para **parse** de arquivos `.ts/.tsx`; os nós de tipo **não** entram nos scorers.

---

## 🧩 Plugin API — `src/core/plugin-api.js`

```js
/** @typedef {{ line: number, col: number }} Loc */
/** @typedef {{ kind: string, weight: number, message?: string, loc?: Loc }} Driver */

/**
 * @callback ReportAdd
 * @param {number} weight
 * @param {Partial<Driver>=} meta
 */

/** @typedef {{ name: string, score: number, loc: {start:number,end:number}, topDrivers?: Driver[] }} FunctionScore */

/** @typedef {{
 *   add: ReportAdd,
 *   enterFunction: (name: string, loc: {start:number,end:number}) => void,
 *   exitFunction: () => void,
 *   finalize: () => { total: number, functions: FunctionScore[] }
 * }} ReportApi */

/** @typedef {{
 *   filePath: string,
 *   source: string,
 *   ast: import('@babel/types').File,
 *   ext: string,
 *   config: any,
 *   env: Record<string, any>,
 *   utils: { traverse: import('@babel/traverse').default, t: typeof import('@babel/types') }
 * }} DetectContext */

/** @typedef {{ id: string, confidence: number, reasons: string[], composableWith?: string[], force?: boolean }} DetectResult */

/** @typedef {{
 *   filePath: string,
 *   source: string,
 *   ast: import('@babel/types').File,
 *   config: any,
 *   report: ReportApi,
 *   utils: { traverse: import('@babel/traverse').default, t: typeof import('@babel/types') }
 * }} AnalyzeContext */

/** @typedef {{ id: string, total: number, functions: FunctionScore[], diagnostics?: string[] }} AnalyzeResult */

/** @typedef {{
 *   id: string,
 *   meta?: { name?: string, version?: string, description?: string },
 *   validateConfig?: (raw:any)=>any,
 *   detect: (ctx: DetectContext)=>DetectResult|Promise<DetectResult>,
 *   analyze: (ctx: AnalyzeContext)=>AnalyzeResult|Promise<AnalyzeResult>
 * }} FlogMode */

export {}; // apenas tipos via JSDoc
```

---

## 🧮 Reporter — `src/core/reporter.js`

```js
/** @type {import('./plugin-api.js')} */

export function createReporter() {
  /** @type {{ name: string, score: number, start: number, end: number, drivers: any[] }[]} */
  const stack = [];
  /** @type {import('./plugin-api.js').FunctionScore[]} */
  const functions = [];
  let total = 0;

  return {
    /** @param {number} weight @param {Partial<import('./plugin-api.js').Driver>=} meta */
    add(weight, meta) {
      total += weight;
      if (stack.length) {
        const top = stack[stack.length - 1];
        top.score += weight;
        if (meta) top.drivers.push({ ...meta, weight });
      }
    },
    /** @param {string} name @param {{start:number,end:number}} loc */
    enterFunction(name, loc) {
      stack.push({ name, score: 0, start: loc.start, end: loc.end, drivers: [] });
    },
    exitFunction() {
      const f = stack.pop();
      if (!f) return;
      functions.push({ name: f.name, score: f.score, loc: { start: f.start, end: f.end }, topDrivers: f.drivers.slice(0, 5) });
    },
    finalize() {
      return { total, functions };
    }
  };
}
```

---

## 🧠 Detectores internos — `src/modes/lang/detect.js` & `src/modes/react/detect.js`

**Lang** (quase sempre aplicável; confiança baixa por padrão):
```js
export function detectLang({ ext }) {
  const isLikely = /\.(js|mjs|cjs|ts)$/.test(ext);
  return { id: 'lang', confidence: isLikely ? 0.4 : 0.2, reasons: isLikely ? ['ext'] : [] };
}
```

**React** (JSX, imports, hooks, diretivas):
```js
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export function detectReact({ ast, ext, source }) {
  let strong = 0; let medium = 0; const reasons = [];

  if (/\.(jsx|tsx|mdx)$/.test(ext)) { strong++; reasons.push('ext'); }
  if (/flog:mode=react/.test(source.slice(0, 512))) { return { id: 'react', confidence: 1, reasons: ['pragma'], force: true }; }

  traverse(ast, {
    JSXElement() { strong++; reasons.push('JSX'); },
    JSXFragment() { strong++; reasons.push('JSX'); },
    ImportDeclaration(p){
      const v = p.node.source.value;
      if (v === 'react' || v === 'react/jsx-runtime' || v === 'react/jsx-dev-runtime' || v === 'preact/compat') { medium++; reasons.push(`import:${v}`); }
    },
    DirectiveLiteral(p){
      const v = p.node.value;
      if (v === 'use client' || v === 'use server') { medium++; reasons.push(`directive:${v}`); }
    }
  });

  const confidence = strong > 0 ? 0.95 : (medium >= 2 ? 0.75 : 0.0);
  return { id: 'react', confidence, reasons };
}
```

---

## 🧮 Scorers internos — `src/core/scorer-lang.js`

```js
import traverse from '@babel/traverse';
import * as t from '@babel/types';

const W = {
  IfStatement: 1.0,
  ConditionalExpression: 1.0,
  LogicalExpression: 0.5,
  ForStatement: 1.0,
  WhileStatement: 1.0,
  DoWhileStatement: 1.0,
  ForOfStatement: 1.0,
  ForInStatement: 1.0,
  SwitchStatement: 1.0,
  SwitchCase: 0.2,
  TryStatement: 1.5,
  CatchClause: 0.5,
  ThrowStatement: 0.5,
  AwaitExpression: 0.5,
  YieldExpression: 0.5,
  CallExpression: 0.1
};

function isDynamicCall(node){
  const c = node.callee;
  if (t.isIdentifier(c) && (c.name === 'eval' || c.name === 'Function')) return true;
  if (t.isImport(c)) return true;
  return false;
}

function fnName(node){
  // melhor esforço
  return (node.id && node.id.name) || '<anonymous>';
}

/** @param {import('@babel/types').File} ast @param {import('./reporter.js').createReporter} report */
export function analyzeLang(ast, report){
  traverse(ast, {
    enter(p){
      const n = p.node;

      if (t.isFunction(n) || t.isArrowFunctionExpression(n)) {
        report.enterFunction(fnName(n), { start: n.loc?.start.line || 0, end: n.loc?.end.line || 0 });
      }

      const kind = n.type;
      if (W[kind]) report.add(W[kind]);

      if (t.isCallExpression(n) && isDynamicCall(n)) report.add(4.0, { kind: 'DynamicCall' });

      if (t.isMemberExpression(n)) {
        let depth = 1; let cur = n;
        while (t.isMemberExpression(cur)) { depth++; cur = cur.object; }
        if (depth > 3) report.add(0.2, { kind: 'DeepMember' });
      }

      if (t.isAssignmentExpression(n) && ['&&=', '||=', '??='].includes(n.operator)) {
        report.add(0.4, { kind: 'LogicalAssign' });
      }

      if (t.isCallExpression(n) && t.isIdentifier(n.callee) && report._currentName){
        const current = report._currentName; // opcional: se expuser
        if (n.callee.name === current) report.add(2.0, { kind: 'Recursion' });
      }
    },
    exit(p){
      const n = p.node;
      if (t.isFunction(n) || t.isArrowFunctionExpression(n)) report.exitFunction();
    }
  });

  return report.finalize();
}
```

> Nota: se não quiser expor `_currentName`, remova o bloco de recursão ou calcule via escopo externo.

---

## 🧮 Scorer React — `src/core/scorer-react.js`

```js
import traverse from '@babel/traverse';
import * as t from '@babel/types';

const W = {
  JSX_Ternary: 1.0,
  JSX_Logical: 0.6,
  JSX_Map: 0.8,
  JSX_InlineFnOrLiteral: 0.4,
  JSX_DepthStep: 0.3,
  useEffect: 0.8,
  useEffectCleanup: 0.4,
  useLayoutEffect: 0.6,
  useReducer: 0.6,
  useReducerCase: 0.2,
  useContext: 0.3
};

function isMapCall(n){
  return t.isCallExpression(n) && t.isMemberExpression(n.callee) && t.isIdentifier(n.callee.property, { name: 'map' });
}

export function analyzeReact(ast, report){
  // JSX metrics
  let depth = 0, maxDepth = 0;

  traverse(ast, {
    JSXElement: {
      enter(){ depth++; if (depth > maxDepth) maxDepth = depth; },
      exit(){ depth--; }
    },
    JSXExpressionContainer(p){
      const n = p.node.expression;
      if (t.isConditionalExpression(n)) report.add(W.JSX_TernARY, { kind: 'JSX.Ternary' });
      if (t.isLogicalExpression(n) && (n.operator === '&&' || n.operator === '||')) report.add(W.JSX_Logical, { kind: 'JSX.Logical' });
      if (isMapCall(n)) report.add(W.JSX_Map, { kind: 'JSX.Map' });
      if (t.isArrowFunctionExpression(n) || t.isFunctionExpression(n) || t.isObjectExpression(n) || t.isArrayExpression(n)) {
        report.add(W.JSX_InlineFnOrLiteral, { kind: 'JSX.Inline' });
      }
    },
    CallExpression(p){
      const c = p.node.callee;
      const name = t.isIdentifier(c) ? c.name : (t.isMemberExpression(c) && t.isIdentifier(c.property) ? c.property.name : '');
      if (name === 'useEffect') {
        report.add(W.useEffect, { kind: 'Hook.useEffect' });
        const deps = p.node.arguments[1];
        if (t.isArrayExpression(deps)) {
          for (const el of deps.elements) if (el) report.add(0.15, { kind: 'Hook.useEffect.dep' });
        }
        const firstArg = p.node.arguments[0];
        if (t.isFunction(firstArg) || t.isArrowFunctionExpression(firstArg)) {
          // heurística: cleanup presente se corpo tem return fn
          let hasCleanup = false;
          traverse(firstArg.body, {
            ReturnStatement(){ hasCleanup = true; }
          });
          if (hasCleanup) report.add(W.useEffectCleanup, { kind: 'Hook.useEffect.cleanup' });
        }
      }
      if (name === 'useLayoutEffect') report.add(W.useLayoutEffect, { kind: 'Hook.useLayoutEffect' });
      if (name === 'useContext') report.add(W.useContext, { kind: 'Hook.useContext' });
      if (name === 'useReducer') report.add(W.useReducer, { kind: 'Hook.useReducer' });
    }
  });

  if (maxDepth > 5) report.add((maxDepth - 5) * W.JSX_DepthStep, { kind: 'JSX.Depth', message: `depth=${maxDepth}` });

  return report.finalize();
}
```

> Nota: Ajuste pesos e heurísticas conforme calibração.

---

## 🧭 Mode Manager — `src/core/mode-manager.js`

```js
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { detectLang } from '../modes/lang/detect.js';
import { detectReact } from '../modes/react/detect.js';
import { analyzeLang } from './scorer-lang.js';
import { analyzeReact } from './scorer-react.js';
import { createReporter } from './reporter.js';

/** Carrega modos internos; plugins externos são adicionados depois */
export function builtinLangMode(){
  return { id: 'lang', detect: detectLang, analyze: ({ ast, report }) => analyzeLang(ast, report) };
}
export function builtinReactMode(){
  return { id: 'react', detect: detectReact, analyze: ({ ast, report }) => analyzeReact(ast, report) };
}

/** @param {{ modes?: any[] }} opts */
export function createAnalyzer(opts = {}){
  const modes = [builtinLangMode(), builtinReactMode(), ...(opts.modes || [])];

  /**
   * @param {import('@babel/types').File} ast
   * @param {string} filePath
   * @param {string} source
   */
  function detectBest(ast, filePath, source){
    const ext = filePath.split('.').pop() ? `.${filePath.split('.').pop()}` : '';
    const ctxBase = { filePath, source, ast, ext, env: {}, config: {}, utils: { traverse, t } };
    /** @type {{mode:any, result:any}[]} */
    const candidates = modes.map(m => ({ mode: m, result: m.detect(ctxBase) }));

    // resolve Promises (detect pode ser assíncrono)
    return Promise.all(candidates.map(async c => ({ mode: c.mode, result: await c.result }))).then(res => {
      const forced = res.find(r => r.result && r.result.force);
      if (forced) return forced.mode;
      res.sort((a,b) => (b.result?.confidence || 0) - (a.result?.confidence || 0));
      return (res[0] && res[0].mode) || modes[0];
    });
  }

  async function analyze(ast, filePath, source, mode){
    const report = createReporter();
    const ctx = { filePath, source, ast, config: {}, report, utils: { traverse, t } };
    const out = await mode.analyze(ctx);
    return out;
  }

  return { detectBest, analyze, modes };
}
```

---

## 🧭 Autodetector de modo (pipeline) — `src/core/detect-mode.js`

> Opcional se centralizar a lógica em `modes/*/detect.js`. Mantém-se como utilitário compartilhado.

---

## 🗂️ Configuração — `src/core/config.js`

```js
import fs from 'node:fs';
import path from 'node:path';

const defaults = {
  maxPerFunction: 20,
  maxPerComponent: 30,
  weights: {},
  exclude: ['**/*.test.*', '**/*.spec.*'],
  include: [],
  plugins: [],
  pluginConfig: {},
  detect: true,
  format: 'table'
};

export function loadConfig(cwd){
  const rcJson = path.join(cwd, '.flogrc.json');
  if (fs.existsSync(rcJson)) return JSON.parse(fs.readFileSync(rcJson, 'utf8'));
  return {};
}

export function mergeConfig(overrides){
  return { ...defaults, ...(overrides || {}) };
}
```

---

## 🧰 CLI — `src/cli.js`

```js
import fs from 'node:fs';
import path from 'node:path';
import picomatch from 'picomatch';
import { parseSource } from './core/parser.js';
import { createAnalyzer } from './core/mode-manager.js';
import { loadConfig, mergeConfig } from './core/config.js';

function expandGlobs(inputs){
  const files = new Set();
  const matchers = inputs.map(p => picomatch(p));
  function walk(dir){
    for (const e of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (matchers.some(m => m(full))) files.add(full);
    }
  }
  for (const i of inputs){
    const p = path.resolve(i);
    if (fs.existsSync(p)){
      const stat = fs.statSync(p);
      if (stat.isDirectory()) walk(p); else files.add(p);
    }
  }
  return [...files];
}

export async function analyzePaths(inputs){
  const files = expandGlobs(inputs);
  const analyzer = createAnalyzer();
  /** @type {{file:string, mode:string, total:number, functions:any[]}[]} */
  const results = [];

  for (const file of files){
    const source = fs.readFileSync(file, 'utf8');
    const ast = parseSource(source, file);
    const mode = await analyzer.detectBest(ast, file, source);
    const report = await analyzer.analyze(ast, file, source, mode);
    results.push({ file, mode: mode.id, total: report.total, functions: report.functions });
  }

  // saída básica em tabela
  results.sort((a,b) => b.total - a.total);
  console.table(results.map(r => ({ file: path.basename(r.file), mode: r.mode, total: r.total.toFixed(2) })));
  return results;
}

// Executado via bin
if (import.meta.url === `file://${process.argv[1]}`){
  const args = process.argv.slice(2);
  if (!args.length){
    console.error('Usage: flog-js <files|globs...>');
    process.exit(1);
  }
  analyzePaths(args).catch(err => { console.error(err); process.exit(1); });
}
```

---

## 🔌 Exemplo de plugin externo (ESM) — `flog-js-mode-rxjs`

```js
// index.js
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export default function rxjsMode(){
  return {
    id: 'rxjs',
    detect({ ast }){
      let n = 0; traverse(ast, { ImportDeclaration(p){ if (p.node.source.value.startsWith('rxjs')) n++; } });
      const confidence = Math.min(1, n * 0.5);
      return { id: 'rxjs', confidence, reasons: n ? [`import:rxjs* x${n}`] : [], composableWith: ['lang','react'] };
    },
    analyze({ ast, report }){
      traverse(ast, {
        CallExpression(p){
          const callee = p.node.callee;
          if (t.isMemberExpression(callee) && t.isIdentifier(callee.property, { name: 'pipe' })){
            for (const a of p.node.arguments){
              if (t.isIdentifier(a, { name: 'map' })) report.add(0.6, { kind: 'rxjs.map' });
              if (t.isIdentifier(a, { name: 'switchMap' })) report.add(0.9, { kind: 'rxjs.switchMap' });
              if (t.isIdentifier(a, { name: 'mergeMap' })) report.add(1.0, { kind: 'rxjs.mergeMap' });
            }
          }
        }
      });
      return report.finalize();
    }
  };
}
```

---

## ✅ Convenções e notas de implementação

- **Sem TypeScript:** mantenha JSDoc sucinto e útil; evite pseudo-tipagem excessiva.
- **Uma única passagem de parse:** nunca reparseie em plugins.
- **Performance:** prefira poucos traversals curtos; `traverse` local (em subárvores) quando possível.
- **Ergonomia:** mensagens de driver curtas ajudam na leitura do relatório.
- **Portabilidade:** evite APIs Node muito novas; alvo 18 LTS.

---

## 🧪 Testes (sugestão)

- Use Vitest/Jest. Estruture *fixtures* simples para `lang` e `react`.
- Snapshot de `total` e `topDrivers` por arquivo.
- Teste autodetecção com/extensão/pragma.

---

## 📈 Roadmap (JS-only)

- Relatório HTML (buildless, só ESM + CSS inline)
- Modo Next.js e plugin RxJS de exemplo publicados
- Composição de modos (react+next) com soma de scores
- Regra ESLint opcional (JS-only)

---

**FIM** — Este guia deve servir como referência para implementar cada parte do pacote em **JavaScript puro**. Ajustes finos nos pesos e heurísticas podem ser feitos durante a calibração em projetos reais.

