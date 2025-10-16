# Reporters - Sistema de Relatórios Plugável

## Visão Geral

O `flog-js` possui um sistema de **reporters plugáveis** que permite gerar relatórios em diferentes formatos. Similar ao sistema de modes, você pode usar os reporters built-in ou criar seus próprios.

## Reporters Built-in

### 1. JSON Reporter

Gera relatórios em formato JSON estruturado.

**Extensão:** `.json`

**Uso via CLI:**
```bash
flog-js --output=report.json src/
flog-js -o report.json src/
```

**Output:**
```json
{
  "summary": {
    "totalFiles": 3,
    "totalScore": 45.3,
    "averageScore": 15.1
  },
  "files": [
    {
      "file": "/path/to/app.js",
      "mode": "lang",
      "total": 25.5,
      "functions": [...]
    }
  ]
}
```

**Com detalhes (`-d`):**
```bash
flog-js --output=report.json -d src/
```

Inclui informações de funções e drivers:
```json
{
  "files": [
    {
      "file": "/path/to/app.js",
      "mode": "lang",
      "total": 25.5,
      "functions": [
        {
          "name": "complexFunction",
          "score": 10.5,
          "loc": { "start": 1, "end": 20 },
          "className": "MyClass",
          "drivers": [
            { "kind": "IfStatement", "weight": 1.0 },
            { "kind": "TryStatement", "weight": 1.5 }
          ]
        }
      ]
    }
  ]
}
```

---

### 2. HTML Reporter

Gera relatório visual em HTML com estilos modernos.

**Extensão:** `.html`

**Uso via CLI:**
```bash
flog-js --output=report.html src/
flog-js -o report.html -d src/
```

**Features:**
- ✅ Design responsivo e moderno
- ✅ Tabela sortável
- ✅ Códigos de cor por nível de complexidade
- ✅ Badges para tipos de modo (lang/react)
- ✅ Sumário com métricas principais
- ✅ Lista de funções e drivers (com `-d`)
- ✅ Mostra linhas de código para cada função
- ✅ Identifica funções anônimas como `<anonymous>`

**Preview:**

```html
┌─────────────────────────────────┐
│  🪶 flog-js Report             │
├─────────────────────────────────┤
│  Total Files: 3                │
│  Total Score: 45.3             │
│  Average Score: 15.1           │
└─────────────────────────────────┘

┌──────────────┬──────┬────────┐
│ File         │ Mode │ Score  │
├──────────────┼──────┼────────┤
│ app.js       │ lang │ 25.50  │
│ utils.js     │ lang │ 12.80  │
│ component.js │ react│  7.00  │
└──────────────┴──────┴────────┘
```

---

## Uso Programático

### Importar Reporters

```javascript
import { 
  createReporterManager, 
  jsonReporter, 
  htmlReporter 
} from 'flog-js';
```

### Gerar Relatório

```javascript
import { analyzePaths, createReporterManager } from 'flog-js';

const results = await analyzePaths(['src/']);

const manager = createReporterManager();

const jsonReport = await manager.generate('json', results);
console.log(jsonReport);

const htmlReport = await manager.generate('html', results, { details: true });
fs.writeFileSync('report.html', htmlReport);
```

---

## Criar Reporter Customizado

### Estrutura Básica

```javascript
import { createReporter } from 'flog-js/reporter-api';

export const myReporter = createReporter({
  id: 'markdown',
  name: 'Markdown Reporter',
  extension: '.md',
  
  generate(results, options = {}) {
    let output = '# Complexity Report\n\n';
    
    for (const result of results) {
      output += `## ${result.file}\n`;
      output += `- **Mode:** ${result.mode}\n`;
      output += `- **Score:** ${result.total}\n\n`;
    }
    
    return output;
  }
});
```

### Usar Reporter Customizado

```javascript
import { createReporterManager } from 'flog-js';
import { myReporter } from './my-reporter.js';

const manager = createReporterManager({
  reporters: [myReporter]
});

const report = await manager.generate('markdown', results);
```

### API do Reporter

```typescript
interface ReporterAPI {
  id: string;              // ID único (ex: 'json', 'html')
  name?: string;           // Nome legível (opcional)
  extension?: string;      // Extensão do arquivo (ex: '.json')
  generate: (
    results: AnalysisResult[], 
    options: Options
  ) => string | Promise<string>;
}
```

**Parâmetros de `generate()`:**

- `results`: Array de resultados da análise
- `options`: Opções do CLI (details, all, etc.)

**Retorno:**
- String com o conteúdo do relatório

---

## Exemplos de Reporters Customizados

### Exemplo 1: CSV Reporter

```javascript
export const csvReporter = createReporter({
  id: 'csv',
  extension: '.csv',
  
  generate(results) {
    let csv = 'File,Mode,Score\n';
    
    for (const r of results) {
      csv += `${r.file},${r.mode},${r.total}\n`;
    }
    
    return csv;
  }
});
```

**Uso:**
```bash
flog-js --output=report.csv src/
```

---

### Exemplo 2: Markdown Reporter

```javascript
export const markdownReporter = createReporter({
  id: 'markdown',
  extension: '.md',
  
  generate(results, options) {
    const totalScore = results.reduce((sum, r) => sum + r.total, 0);
    
    let md = '# Code Complexity Report\n\n';
    md += `**Total Score:** ${totalScore.toFixed(1)}\n\n`;
    md += '## Files\n\n';
    md += '| File | Mode | Score |\n';
    md += '|------|------|-------|\n';
    
    for (const r of results) {
      const file = r.file.split('/').pop();
      md += `| ${file} | ${r.mode} | ${r.total.toFixed(2)} |\n`;
    }
    
    if (options.details) {
      md += '\n## Top Functions\n\n';
      
      for (const r of results) {
        const topFuncs = r.functions
          ?.sort((a, b) => b.score - a.score)
          .slice(0, 3) || [];
          
        if (topFuncs.length > 0) {
          md += `### ${r.file.split('/').pop()}\n\n`;
          
          for (const f of topFuncs) {
            md += `- **${f.name}**: ${f.score.toFixed(1)}\n`;
          }
          md += '\n';
        }
      }
    }
    
    return md;
  }
});
```

**Output:**
```markdown
# Code Complexity Report

**Total Score:** 45.3

## Files

| File | Mode | Score |
|------|------|-------|
| app.js | lang | 25.50 |
| utils.js | lang | 12.80 |

## Top Functions

### app.js

- **complexFunction**: 10.5
- **processData**: 8.2
- **validate**: 6.8
```

---

### Exemplo 3: Slack/Discord Reporter

```javascript
export const slackReporter = createReporter({
  id: 'slack',
  extension: '.json',
  
  generate(results) {
    const totalScore = results.reduce((sum, r) => sum + r.total, 0);
    const highComplexity = results.filter(r => r.total > 20);
    
    const emoji = totalScore > 100 ? '🔴' : totalScore > 50 ? '🟡' : '🟢';
    
    return JSON.stringify({
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} Code Complexity Report`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total Files:*\n${results.length}`
            },
            {
              type: 'mrkdwn',
              text: `*Total Score:*\n${totalScore.toFixed(1)}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: highComplexity.length > 0
              ? `⚠️ *${highComplexity.length} file(s) with high complexity (>20)*`
              : '✅ All files have acceptable complexity'
          }
        }
      ]
    }, null, 2);
  }
});
```

---

## CLI - Flag `--output`

### Sintaxe

```bash
flog-js --output=FILE [options] <files>
flog-js -o FILE [options] <files>
```

### Detecção Automática de Formato

O formato é detectado pela extensão do arquivo:

```bash
flog-js -o report.json src/    # JSON
flog-js -o report.html src/    # HTML
flog-js -o report.md src/      # Markdown (se registrado)
```

### Combinações Úteis

```bash
# JSON básico
flog-js --output=report.json src/

# JSON com detalhes
flog-js -o report.json -d src/

# HTML com detalhes e todos os arquivos
flog-js -o report.html -d -a src/

# JSON apenas com score > 10
flog-js -o report.json --threshold=score:10 src/

# HTML silencioso (sem output no console)
flog-js -o report.html -q src/
```

---

## Integração CI/CD

### GitHub Actions

```yaml
name: Code Complexity

on: [push]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install flog-js
        run: npm install -g flog-js
      
      - name: Analyze complexity
        run: flog-js --output=complexity.json src/
      
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: complexity-report
          path: complexity.json
```

### GitLab CI

```yaml
complexity:
  script:
    - npm install -g flog-js
    - flog-js --output=complexity.html -d src/
  artifacts:
    paths:
      - complexity.html
    expire_in: 1 week
```

---

## API Completa

### ReporterManager

```javascript
import { createReporterManager } from 'flog-js';

const manager = createReporterManager({
  reporters: [customReporter1, customReporter2]
});

manager.getReporter('json');
manager.listReporters();
await manager.generate('json', results, options);
```

### Métodos

#### `getReporter(id: string)`

Retorna um reporter pelo ID.

```javascript
const reporter = manager.getReporter('json');
console.log(reporter.name); // "JSON Reporter"
```

#### `listReporters()`

Lista todos os reporters disponíveis.

```javascript
const all = manager.listReporters();
for (const r of all) {
  console.log(`${r.id}: ${r.name}`);
}
// json: JSON Reporter
// html: HTML Reporter
```

#### `generate(id, results, options)`

Gera um relatório.

```javascript
const content = await manager.generate('json', results, { 
  details: true 
});

fs.writeFileSync('report.json', content);
```

---

## Comparação de Formatos

| Formato | Tamanho | Legível | Estruturado | Visual | CI/CD |
|---------|---------|---------|-------------|--------|-------|
| **JSON** | Pequeno | ⚠️ | ✅ | ❌ | ✅ |
| **HTML** | Médio | ✅ | ⚠️ | ✅ | ⚠️ |
| **CSV** | Pequeno | ⚠️ | ⚠️ | ❌ | ✅ |
| **Markdown** | Pequeno | ✅ | ⚠️ | ⚠️ | ✅ |

**Recomendações:**
- **JSON**: CI/CD, APIs, processamento automático
- **HTML**: Code reviews, apresentações, documentação
- **CSV**: Excel, análise de dados, gráficos
- **Markdown**: GitHub, documentação, PRs

---

## Boas Práticas

### 1. Nomeie Reporters de Forma Clara

```javascript
// ✅ Bom
{ id: 'junit-xml', name: 'JUnit XML Reporter' }

// ❌ Ruim
{ id: 'x', name: 'Report' }
```

### 2. Use Extensões Apropriadas

```javascript
// ✅ Bom
{ id: 'json', extension: '.json' }

// ❌ Ruim
{ id: 'json', extension: '.txt' }
```

### 3. Suporte Opções do CLI

```javascript
generate(results, options) {
  if (options.details) {
    // Incluir detalhes de funções
  }
  
  if (options.threshold) {
    // Filtrar por threshold
  }
}
```

### 4. Retorne Strings ou Promises

```javascript
// Síncrono
generate(results) {
  return JSON.stringify(results);
}

// Assíncrono
async generate(results) {
  const processed = await processResults(results);
  return JSON.stringify(processed);
}
```

---

## Troubleshooting

### Reporter não encontrado

```bash
Error: Reporter 'xyz' not found
```

**Solução:** Verifique se o reporter está registrado:

```javascript
const manager = createReporterManager({
  reporters: [myReporter]
});
```

### Extensão não detectada

```bash
flog-js -o report.xyz src/
# Usa 'json' como fallback
```

**Solução:** Use a extensão correta ou especifique o formato:

```javascript
// Via código
await manager.generate('json', results);
```

---

## Roadmap

Futuros reporters planejados:

- ❌ **XML Reporter** - Formato XML genérico
- ❌ **JUnit Reporter** - Integração com ferramentas Java
- ❌ **TAP Reporter** - Test Anything Protocol
- ❌ **TeamCity Reporter** - Mensagens TeamCity
- ❌ **Checkstyle Reporter** - Formato Checkstyle XML

**Contribuições são bem-vindas!** 🚀

---

## Resumo

| Feature | Status |
|---------|--------|
| **JSON Reporter** | ✅ Built-in |
| **HTML Reporter** | ✅ Built-in |
| **CLI `--output`** | ✅ Implementado |
| **API Programática** | ✅ Completa |
| **Reporters Customizados** | ✅ Suportado |
| **Detecção Automática** | ✅ Por extensão |

**Sistema 100% funcional e pronto para produção!** 🎉
