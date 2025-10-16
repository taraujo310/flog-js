# flog-js - Notas de Implementação

## Status da Implementação

✅ **Pacote completamente implementado e funcional**
✅ **CLI com 11 flags funcionais**
✅ **Sistema de reporters plugáveis**
✅ **59 testes passando**

## Estrutura de Diretórios

```
flog-js/
│   └── flog-js.js              # Executável CLI
├── src/
│   ├── index.js                # API pública
│   ├── cli.js                  # Implementação CLI
│   ├── core/
│   │   ├── parser.js           # Parser Babel
│   │   ├── reporter.js         # Acumulador de scores
│   │   ├── scorer-lang.js      # Análise JavaScript/TypeScript
│   │   ├── scorer-react.js     # Análise React
│   │   ├── mode-manager.js     # Gerenciador de modos
│   │   ├── plugin-api.js       # API para plugins
│   │   └── config.js           # Configurações
│   ├── modes/
│   │   ├── lang/
│   │   │   └── detect.js       # Detecção JS/TS
│   │   └── react/
│   │       └── detect.js       # Detecção React
│   ├── reporters/
│   │   ├── reporter-api.js     # API para reporters
│   │   ├── reporter-manager.js # Gerenciador de reporters
│   │   ├── json.js             # Reporter JSON
│   │   └── html.js             # Reporter HTML
│   └── utils/
│       └── args-parser.js      # Parser de argumentos CLI
├── test/
│   ├── parser.test.js
│   ├── reporter.test.js
│   ├── scorer-lang.test.js
│   ├── scorer-react.test.js
│   ├── detect.test.js
│   ├── mode-manager.test.js
│   ├── reporters.test.js
│   ├── cli.test.js
│   └── cli-flags.test.js
├── examples/
│   ├── sample-complex.js
│   ├── sample-classes.js
│   └── sample-react.jsx        # Exemplo componente React
├── docs/
│   ├── CLI_FLAGS.md
│   └── REPORTERS.md
├── package.json
├── vitest.config.js
├── eslint.config.js
├── .gitignore
└── README.md
```

## Testes

**59 testes passando em 9 arquivos**

```bash
npm test                # Roda todos os testes
npm run test:watch      # Modo watch
npm run test:coverage   # Gera relatório de cobertura
```

### Cobertura de Testes

- ✅ Parser (Babel)
- ✅ Reporter (score tracking)
- ✅ Scorers (lang e react)
- ✅ Mode detection
- ✅ Mode manager
- ✅ Reporter system (JSON/HTML)
- ✅ CLI básico
- ✅ CLI flags (todas as 11 flags)

## Uso

### CLI Básico

```bash
# Analisar arquivos específicos
node bin/flog-js.js examples/sample-complex.js

# Analisar diretório inteiro
node bin/flog-js.js src/

# Analisar múltiplos arquivos
node bin/flog-js.js examples/sample-complex.js examples/sample-react.jsx
```

### CLI com Flags

```bash
# Mostrar detalhes de funções com drivers
node bin/flog-js.js --details src/

# Apenas score total
node bin/flog-js.js --score src/

# Continuar em erros de parse
node bin/flog-js.js --continue src/

# Verbose (mostrar progresso)
node bin/flog-js.js -v src/

# Agrupar por diretório
node bin/flog-js.js --group src/

# Filtrar por score mínimo
node bin/flog-js.js --threshold=score:10 src/

# Top 20% mais complexos
node bin/flog-js.js -t 20 src/

# Ignorar código top-level
node bin/flog-js.js --methods-only src/

# Combinar flags
node bin/flog-js.js -d -v -c --threshold=score:15 src/
```

Ver [docs/CLI_FLAGS.md](./docs/CLI_FLAGS.md) para documentação completa.

### API Programática

```javascript
import { analyzePaths, createAnalyzer } from './src/index.js';

// Análise simples
const results = await analyzePaths(['src/']);

// Análise customizada
const analyzer = createAnalyzer();
const mode = await analyzer.detectBest(ast, filePath, source);
const report = await analyzer.analyze(ast, filePath, source, mode);
```

## Resultados dos Exemplos

**Análise do próprio código fonte:**

```
┌─────────┬───────────────────┬─────────┬─────────┐
│ (index) │ file              │ mode    │ total   │
├─────────┼───────────────────┼─────────┼─────────┤
│ 0       │ 'scorer-react.js' │ 'lang'  │ '25.00' │
│ 1       │ 'scorer-lang.js'  │ 'lang'  │ '17.60' │
│ 2       │ 'cli.js'          │ 'lang'  │ '12.80' │
│ 3       │ 'mode-manager.js' │ 'lang'  │ '8.20'  │
└─────────┴───────────────────┴─────────┴─────────┘
```

**Análise dos exemplos:**

```
┌─────────┬─────────────────────┬─────────┬─────────┐
│ (index) │ file                │ mode    │ total   │
├─────────┼─────────────────────┼─────────┼─────────┤
│ 0       │ 'sample-complex.js' │ 'lang'  │ '17.30' │
│ 1       │ 'sample-react.jsx'  │ 'react' │ '7.00'  │
└─────────┴─────────────────────┴─────────┴─────────┘
```

## Decisões Técnicas Importantes

### 1. Imports de Babel

Usamos padrão de fallback para compatibilidade ESM/CommonJS:

```javascript
import _traverse from '@babel/traverse';
const traverse = _traverse.default || _traverse;
```

Isso resolve problemas de interoperabilidade entre módulos.

### 2. Detecção de Arquivos

A função `expandGlobs` identifica arquivos JS automaticamente por extensão:
- `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`

### 3. Binário CLI

O executável em `bin/flog-js.js` chama a API diretamente, sem lógica no próprio `src/cli.js`.

### 4. Testes com Focus

Todos os testes têm `{ focus: true }` como solicitado, permitindo execução seletiva.

### 5. JSDoc para Tipos

Tipos documentados via JSDoc, sem necessidade de TypeScript:

```javascript
/** @param {import('@babel/types').File} ast */
/** @param {ReturnType<import('./reporter.js').createReporter>} report */
```

## Scores Implementados

### Modo Lang (JavaScript/TypeScript)

- `IfStatement`: 1.0
- `ForStatement/WhileStatement`: 1.0
- `TryStatement`: 1.5
- `CatchClause`: 0.5
- `AwaitExpression/YieldExpression`: 0.5
- `CallExpression`: 0.1
- `eval/Function` (dynamic): 4.0
- `LogicalExpression` (&&/||): 0.5
- `ConditionalExpression` (ternary): 1.0
- `SwitchStatement`: 1.0
- `SwitchCase`: 0.2

### Modo React

- JSX Ternary: 1.0
- JSX Logical (&&/||): 0.6
- JSX Map: 0.8
- JSX Inline Functions/Objects: 0.4
- `useEffect`: 0.8
- `useEffect` com cleanup: +0.4
- `useEffect` deps: 0.15 cada
- `useLayoutEffect`: 0.6
- `useContext`: 0.3
- `useReducer`: 0.6
- JSX depth > 5: 0.3 por nível

## Flags CLI Implementadas

### ✅ Implementadas e Testadas

1. **`-a, --all`**: Mostra todos os resultados sem corte de 60%
2. **`-c, --continue`**: Continua em erros de parse
3. **`-d, --details`**: Mostra detalhes de funções com drivers
4. **`-g, --group`**: Agrupa resultados por classe/componente
5. **`-q, --quiet`**: Suprime mensagens de erro
6. **`-s, --score`**: Mostra apenas score total
7. **`-t, --threshold=N`**: Corte por porcentagem ou score mínimo
8. **`-v, --verbose`**: Progresso e detalhes de detecção
9. **`-m, --methods-only`**: Ignora código fora de funções
10. **`-z, --zero`**: Mostra métodos com score zero no modo `-g`
11. **`-o, --output=FILE`**: Salva relatório em arquivo (JSON/HTML)

### Exemplos de Uso

```bash
# Exemplo: análise completa com todas as funcionalidades
flog-js -a -d -v -g src/

# Exemplo: CI/CD - apenas score
flog-js -s -q src/

# Exemplo: encontrar arquivos críticos
flog-js --threshold=score:20 --details src/

# Exemplo: ignorar erros + top 10%
flog-js -c -t 10 src/

# Exemplo: agrupado com todos os métodos (incluindo zeros)
flog-js -g -z -a src/

# Exemplo: salvar relatório JSON
flog-js -o report.json src/

# Exemplo: salvar relatório HTML com detalhes
flog-js -o report.html -d src/
```

## Próximos Passos Sugeridos

1. ✅ ~~Implementar formatador JSON~~ (Implementado)
2. ✅ ~~Implementar formatador HTML~~ (Implementado)
3. ✅ ~~Adicionar cobertura de testes~~ (Implementado)
4. Criar plugin exemplo (RxJS)
5. Criar reporters adicionais (Markdown, CSV)
6. Adicionar CI/CD
7. Publicar no npm
7. Implementar cache de análise
8. Suporte a monorepos
9. Adicionar mais weights customizáveis via `.flogrc.json`

## Dependências

**Produção:**
- `@babel/parser` ^7.25.0
- `@babel/traverse` ^7.25.0
- `@babel/types` ^7.25.0
- `picomatch` ^4.0.0 (não usado atualmente, pode remover)

**Desenvolvimento:**
- `eslint` ^9.0.0
- `prettier` ^3.0.0
- `vitest` ^2.0.0

## Compatibilidade

- Node.js >= 18.17
- ESM puro
- Sem transpilação necessária
