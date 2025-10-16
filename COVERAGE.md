# Test Coverage

## ✅ Status Atual

```
All files         |   68.69% |     77.2% |   86.79% |   68.69%
```

**Métricas:**
- **Statements:** 68.69%
- **Branches:** 77.2%
- **Functions:** 86.79%
- **Lines:** 68.69%

## Como Executar

```bash
# Gerar relatório de cobertura
npm run test:coverage

# Relatório HTML
# Abrir coverage/index.html no navegador após rodar o comando acima
```

## Detalhamento por Módulo

### ✅ Core (76.24%)

| Arquivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| **parser.js** | 100% | 100% | 100% | 100% |
| **reporter.js** | 100% | 93.33% | 100% | 100% |
| **mode-manager.js** | 100% | 84.21% | 100% | 100% |
| **scorer-lang.js** | 91.02% | 70.58% | 100% | 91.02% |
| **scorer-react.js** | 85.21% | 72.91% | 86.66% | 85.21% |
| config.js | 0% | 0% | 0% | 0% |
| plugin-api.js | 0% | 0% | 0% | 0% |

**Nota:** `config.js` e `plugin-api.js` são módulos de definição de tipos/interfaces, não precisam de testes.

### ✅ Mode Detection (97.7%)

| Arquivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| **lang/detect.js** | 100% | 100% | 100% | 100% |
| **react/detect.js** | 95.45% | 70.58% | 80% | 95.45% |

### ⚠️ CLI (63.84%)

| Arquivo | Stmts | Branch | Funcs | Lines | Não coberto |
|---------|-------|--------|-------|-------|-------------|
| **cli.js** | 64.15% | 84% | 100% | 64.15% | 149-176, 183-221 |
| index.js | 0% | 0% | 0% | 0% | Export only |

**Linhas não cobertas em `cli.js`:**
- 149-176: `printGrouped()` - Função de output agrupado
- 183-221: `printGrouped()` - Continuação

**Motivo:** Funções de output são testadas indiretamente através dos testes de integração, mas não têm assertions específicas no output formatado.

### ⚠️ Utils (0%)

| Arquivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| args-parser.js | 0% | 0% | 0% | 0% |

**Motivo:** Testado apenas indiretamente através dos testes CLI. Deveria ter testes unitários dedicados.

## Configuração

**Arquivo:** `vitest.config.js`

```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov'],
  exclude: [
    'test/**',
    'bin/**',
    'examples/**',
    'node_modules/**',
    '*.config.js'
  ]
}
```

## Arquivos Excluídos

- `test/**` - Arquivos de teste
- `bin/**` - CLI executable wrapper
- `examples/**` - Arquivos de exemplo
- `node_modules/**` - Dependências
- `*.config.js` - Arquivos de configuração

## Próximos Passos

### Para Aumentar Coverage

1. **args-parser.js (0% → 100%)**
   - Adicionar testes unitários para cada flag
   - Testar edge cases (flags inválidas, múltiplas flags)

2. **cli.js (64% → 80%+)**
   - Adicionar testes para `printGrouped()` com assertions no output
   - Testar diferentes combinações de flags

3. **scorer-react.js (85% → 95%+)**
   - Cobrir edge cases de detecção de componentes
   - Testar todos os hooks

### Metas

- ✅ Core: **>90%** (atual: 76%)
- ✅ Mode Detection: **100%** (atual: 98%)
- ⚠️ CLI: **>80%** (atual: 64%)
- ❌ Utils: **>95%** (atual: 0%)

**Meta global:** **85%** de cobertura (atual: 68.69%)

## Relatórios Gerados

Após rodar `npm run test:coverage`, os seguintes relatórios são gerados:

1. **Terminal** - Resumo em texto
2. **HTML** - Relatório navegável em `coverage/index.html`
3. **LCOV** - Para integração com ferramentas CI/CD

## CI/CD

Para integração com CI/CD, adicione:

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Histórico

| Data | Coverage | Mudança |
|------|----------|---------|
| 2025-10-16 | 68.69% | ✅ Baseline inicial |

---

**Última atualização:** 2025-10-16
