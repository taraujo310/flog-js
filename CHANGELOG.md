# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [0.1.0] - 2025-10-16

### ✨ Features Implementadas

#### Sistema de Reporters Plugáveis
- **JSON Reporter** - Relatórios estruturados para CI/CD
- **HTML Reporter** - Relatórios visuais modernos e responsivos
  - Mostra linhas de código para cada função (`:start-end`)
  - Identifica funções anônimas como `<anonymous>`
  - Cores neutras para nomes de arquivo (sem aparência de link)
- **Reporter Manager** - Gerenciamento de reporters customizados
- **CLI Flag `--output`** - Salvar relatórios em arquivos
- **API Programática** - `createReporterManager()`, `jsonReporter`, `htmlReporter`

#### CLI Flags
- `-a, --all` - Mostra todos os resultados (sem corte de 60%)
- `-c, --continue` - Continua em erros de parse
- `-d, --details` - Mostra detalhes de funções com drivers (breakdown completo com `-g`)
- `-g, --group` - Agrupa resultados por classe/componente
- `-q, --quiet` - Suprime mensagens de erro
- `-s, --score` - Mostra apenas score total
- `-t, --threshold=N` - Corte por porcentagem ou score mínimo
- `-v, --verbose` - Progresso e detalhes de detecção
- `-m, --methods-only` - Ignora código fora de funções
- `-z, --zero` - Mostra métodos com score zero no modo `-g`
- `-o, --output=FILE` - Salva relatório em arquivo (JSON/HTML)

#### Sistema de Modes
- **Lang Mode** - Análise JavaScript/TypeScript vanilla
- **React Mode** - Análise React com penalizações específicas JSX
- **Mode Detection** - Detecção automática de tipo de código
- **Pluggable Architecture** - Suporte a modes customizados

#### Análise de Complexidade
- **Parser Babel** - Suporte completo a sintaxe moderna
- **AST Traversal** - Análise profunda do código
- **Penalty System** - 15+ tipos de penalizações
- **Function-level Scoring** - Score por função com drivers
- **Class/Component Grouping** - Agrupamento por classe ou componente

#### Testes
- **59 testes** passando em 9 arquivos
- **Cobertura** - 68.69% (core >75%)
- **Vitest** - Framework de testes moderno
- **Test Coverage** - `npm run test:coverage`

#### Documentação
- `README.md` - Overview e quick start
- `docs/CLI_FLAGS.md` - Documentação completa de flags
- `docs/REPORTERS.md` - Guia de reporters
- `IMPLEMENTATION_NOTES.md` - Notas técnicas
- `COVERAGE.md` - Análise de cobertura
- Diversos documentos de implementação específicos

### 🎯 Funcionalidades Principais

#### Análise de Código
```bash
# Análise básica
flog-js src/

# Com detalhes e agrupamento
flog-js -g -d src/

# Filtrar por complexidade
flog-js --threshold=score:20 src/

# Apenas métodos (ignorar top-level)
flog-js -m src/
```

#### Geração de Relatórios
```bash
# JSON para CI/CD
flog-js --output=report.json src/

# HTML visual
flog-js --output=report.html -d src/

# Combinado com outras flags
flog-js -o report.json -d -a src/
```

#### API Programática
```javascript
import { 
  analyzePaths, 
  createAnalyzer,
  createReporterManager,
  jsonReporter,
  htmlReporter
} from 'flog-js';

// Análise
const results = await analyzePaths(['src/']);

// Relatórios
const manager = createReporterManager();
const json = await manager.generate('json', results);
const html = await manager.generate('html', results, { details: true });
```

### 📊 Penalizações

#### JavaScript/TypeScript
- `IfStatement`: 1.0
- `TryStatement`: 1.5
- `ForStatement`: 1.0
- `WhileStatement`: 1.0
- `SwitchStatement`: 1.0
- `ConditionalExpression`: 1.0
- `CatchClause`: 0.5
- `LogicalExpression`: 0.5
- `AwaitExpression`: 0.5
- `CallExpression`: 0.1
- `DynamicCall` (eval): 4.0

#### React/JSX
- `JSX.Ternary`: 1.0
- `JSX.Map`: 0.8
- `JSX.Logical`: 0.6
- `JSX.Inline`: 0.4
- `JSX.Depth`: 0.3
- `Hook.useEffect`: 0.8
- `Hook.useReducer`: 0.6
- `Hook.useContext`: 0.3

### 🏗️ Arquitetura

```
src/
├── core/               # Core engine
│   ├── parser.js
│   ├── reporter.js
│   ├── scorer-lang.js
│   ├── scorer-react.js
│   ├── mode-manager.js
│   └── plugin-api.js
├── modes/              # Mode detection
│   ├── lang/
│   └── react/
├── reporters/          # Reporters system
│   ├── reporter-api.js
│   ├── reporter-manager.js
│   ├── json.js
│   └── html.js
└── utils/
    └── args-parser.js
```

### 🔧 Dependências

**Produção:**
- `@babel/parser` ^7.25.0
- `@babel/traverse` ^7.25.0
- `@babel/types` ^7.25.0
- `picomatch` ^4.0.0

**Desenvolvimento:**
- `vitest` ^2.0.0
- `@vitest/coverage-v8` ^2.0.0
- `eslint` ^9.0.0
- `prettier` ^3.0.0

### 📝 Exports

```json
{
  "exports": {
    ".": "./src/index.js",
    "./plugin-api": "./src/core/plugin-api.js",
    "./reporter-api": "./src/reporters/reporter-api.js"
  }
}
```

### 🚀 Performance

- **Parser** - Babel otimizado
- **Zero-compile** - Pure ESM, sem build
- **Incremental** - Análise arquivo por arquivo
- **Streaming** - Output progressivo

### 🎨 Qualidade

- ✅ **ESLint** - Linting configurado
- ✅ **Prettier** - Formatação consistente
- ✅ **Vitest** - Testes rápidos
- ✅ **TypeScript JSDoc** - Type hints
- ✅ **Code Coverage** - Métricas de cobertura

### 📚 Exemplos

**Arquivos de exemplo incluídos:**
- `examples/sample-complex.js` - Funções complexas
- `examples/sample-classes.js` - Classes JavaScript
- `examples/sample-components.jsx` - Componentes React
- `examples/sample-with-zeros.js` - Métodos simples

### 🐛 Bug Fixes

Nenhum (versão inicial)

### ⚠️ Breaking Changes

Nenhum (versão inicial)

### 🔜 Próximos Passos

1. Criar reporters adicionais (Markdown, CSV)
2. Adicionar CI/CD
3. Publicar no npm
4. Criar plugin exemplo (RxJS)
5. Suporte a monorepos
6. Cache de análise
7. Configuração via `.flogrc.json` completa

---

## Formato

Este changelog segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

### Tipos de Mudanças

- **Added** - Para novas funcionalidades
- **Changed** - Para mudanças em funcionalidades existentes
- **Deprecated** - Para funcionalidades que serão removidas
- **Removed** - Para funcionalidades removidas
- **Fixed** - Para correção de bugs
- **Security** - Para vulnerabilidades de segurança
