# CLI Flags Reference

## Overview

O `flog-js` aceita várias flags para customizar a análise e formatação dos resultados.

## Flags Disponíveis

### `-a, --all`

**Descrição:** Mostra todos os resultados sem aplicar o corte de 60%.

**Comportamento padrão:** Por padrão, apenas os top 60% dos arquivos (por score) são exibidos.

**Exemplo:**
```bash
flog-js --all src/
```

---

### `-c, --continue`

**Descrição:** Continua a análise mesmo quando encontra erros de parse.

**Comportamento:** Arquivos com erro de sintaxe são reportados no stderr, mas não interrompem a análise dos demais arquivos.

**Exemplo:**
```bash
flog-js --continue src/
```

**Output com erro:**
```
Error parsing /path/to/broken.js: Unexpected token...
┌─────────┬──────────┬────────┬─────────┐
│ (index) │ file     │ mode   │ total   │
├─────────┼──────────┼────────┼─────────┤
│ 0       │ 'ok.js'  │ 'lang' │ '10.00' │
└─────────┴──────────┴────────┴─────────┘

Errors: 1 file(s) failed to parse
```

---

### `-d, --details`

**Descrição:** Mostra detalhes das funções com maior complexidade e seus drivers.

**Comportamento:** 
- **Sem `-g`**: Adiciona colunas `topFunction`, `topScore` e `drivers` na tabela
- **Com `-g`**: Mostra breakdown completo de penalizações por método (similar ao flog original)

**Exemplo sem `-g`:**
```bash
flog-js --details examples/
```

**Output:**
```
┌─────────┬─────────────────────┬────────┬─────────┬───────────────────┬──────────┬────────────────────────────┐
│ (index) │ file                │ mode   │ total   │ topFunction       │ topScore │ drivers                    │
├─────────┼─────────────────────┼────────┼─────────┼───────────────────┼──────────┼────────────────────────────┤
│ 0       │ 'sample-complex.js' │ 'lang' │ '17.30' │ 'complexFunction' │ '9.80'   │ 'IfStatement, TryStatement'│
└─────────┴─────────────────────┴────────┴─────────┴───────────────────┴──────────┴────────────────────────────┘
```

**Exemplo com `-g` (breakdown completo):**
```bash
flog-js -g -d examples/sample-classes.js
```

**Output:**
```
18.3: flog total
  2.3: flog/method average

10.7: Watch total
   5.2: Watch#returnMemoOrCancelSale   sample-classes.js:2-14
   1.5:   TryStatement
   1.0:   IfStatement
   1.0:   ForStatement
   1.0:   IfStatement
   0.5:   CatchClause
   0.1:   CallExpression
   0.1:   CallExpression
   2.5: Watch#name                     sample-classes.js:16-24
   1.0:   IfStatement
   1.0:   IfStatement
   0.5:   LogicalExpression
```

**Formato das penalizações:**
- `{weight}:   {penaltyType}` - Cada linha mostra o peso e o tipo de construção
- Ordenadas por peso (maior → menor)
- Todas as penalizações são mostradas (não apenas top 5)

---

### `-g, --group`

**Descrição:** Agrupa resultados por classe/componente, similar ao flog original.

**Comportamento:** 
- **Modo lang**: Agrupa métodos por classe (ClassDeclaration)
- **Modo react**: Agrupa métodos/hooks por componente React
- Mostra score total por classe e lista os métodos ordenados por complexidade
- Aplica corte de 60% dentro de cada classe (use `-a` para mostrar todos)

**Exemplo:**
```bash
flog-js --group examples/sample-classes.js
```

**Output:**
```
18.3: flog total
  2.3: flog/method average

10.7: Watch total
   5.2: Watch#returnMemoOrCancelSale   sample-classes.js:2-14
   2.5: Watch#name                     sample-classes.js:16-24
   2.0: Watch#unlinkMemoOrSale         sample-classes.js:26-33

6.5: Sale total
   3.0: Sale#setSaleItemsCountAndCalculateTotal sample-classes.js:44-56
   2.5: Sale#calculatedPaymentTerm     sample-classes.js:65-73

1.1: sample-classes total
   1.1: helperFunction                 sample-classes.js:76-80
```

**Com React:**
```bash
flog-js --group examples/components.jsx
```

**Output:**
```
6.0: flog total
  0.9: flog/method average

3.2: DashboardWidget total
   1.6: DashboardWidget#<anonymous>    components.jsx:35-40
   1.6: DashboardWidget#<anonymous>    components.jsx:25-43

2.4: components total
   1.6: UserCard                       components.jsx:1-9
   0.8: ProductList                    components.jsx:11-23
```

---

### `-q, --quiet`

**Descrição:** Suprime mensagens de erro e avisos.

**Comportamento:** Apenas exibe tabelas de resultado (ou nada, se combinado com `--score`).

**Útil para:** Scripts de CI/CD, onde você quer apenas o exit code ou JSON.

**Exemplo:**
```bash
flog-js --quiet --score src/ > score.txt
```

---

### `-s, --score`

**Descrição:** Mostra apenas o score total agregado.

**Comportamento:** Soma os scores de todos os arquivos válidos e imprime uma única linha.

**Exemplo:**
```bash
flog-js --score src/
```

**Output:**
```
Total flog score: 245.60
```

**Retorno programático:**
```javascript
{
  totalScore: 245.60,
  fileCount: 25,
  errorCount: 0
}
```

---

### `-t, --threshold=N`

**Descrição:** Define o corte de resultados.

**Formatos aceitos:**

1. **Porcentagem** (padrão: 60)
   ```bash
   flog-js --threshold=20 src/  # Top 20%
   ```

2. **Score mínimo**
   ```bash
   flog-js --threshold=score:10 src/  # Apenas arquivos com score >= 10
   ```

**Exemplo:**
```bash
# Mostrar apenas top 10% mais complexos
flog-js -t 10 src/

# Mostrar apenas arquivos com score >= 15
flog-js --threshold=score:15 src/
```

---

### `-v, --verbose`

**Descrição:** Mostra progresso da análise e detalhes da detecção de modo.

**Comportamento:** Imprime mensagens durante a análise de cada arquivo.

**Exemplo:**
```bash
flog-js --verbose examples/
```

**Output:**
```
Analyzing /path/to/examples/sample-complex.js...
  Mode: lang
Analyzing /path/to/examples/sample-react.jsx...
  Mode: react
┌─────────┬─────────────────────┬─────────┬─────────┐
│ (index) │ file                │ mode    │ total   │
├─────────┼─────────────────────┼─────────┼─────────┤
│ 0       │ 'sample-complex.js' │ 'lang'  │ '17.30' │
│ 1       │ 'sample-react.jsx'  │ 'react' │ '7.00'  │
└─────────┴─────────────────────┴─────────┴─────────┘
```

---

### `-m, --methods-only`

**Descrição:** Ignora código fora de funções (top-level).

**Comportamento:** Apenas contabiliza complexidade dentro de funções/métodos/componentes.

**Útil para:** Focar em complexidade de lógica encapsulada, ignorando scripts de inicialização.

**Exemplo:**
```bash
# Arquivo com código top-level
flog-js examples/sample-toplevel.js
# Output: total: 6.30

# Ignorando código top-level
flog-js --methods-only examples/sample-toplevel.js
# Output: total: 1.10
```

---

### `-z, --zero`

**Descrição:** Mostra métodos com score zero no output agrupado (`-g`).

**Comportamento:** 
- **Por padrão** (sem `-z`): Métodos com score 0.0 são **ocultados** no modo `-g`
- **Com `-z`**: Métodos com score 0.0 são **mostrados**

**Útil para:** Ver todos os métodos de uma classe, incluindo os simples.

**Exemplo sem `-z` (padrão):**
```bash
flog-js -g examples/sample-with-zeros.js
```

**Output:**
```
4.5: flog total
  0.6: flog/method average

4.5: ProductModel total
   3.5: ProductModel#validateComplex   sample-with-zeros.js:2-10
   1.0: ProductModel#getName           sample-with-zeros.js:12-17

0.0: SimpleModel total
```

**Exemplo com `-z`:**
```bash
flog-js -g -z examples/sample-with-zeros.js
```

**Output:**
```
4.5: flog total
  0.6: flog/method average

4.5: ProductModel total
   3.5: ProductModel#validateComplex   sample-with-zeros.js:2-10
   1.0: ProductModel#getName           sample-with-zeros.js:12-17
   0.0: ProductModel#getPrice          sample-with-zeros.js:19-21

0.0: SimpleModel total
   0.0: SimpleModel#getValue           sample-with-zeros.js:33-35
   0.0: SimpleModel#setValue           sample-with-zeros.js:37-39
```

**Nota:** Esta flag só tem efeito quando usada em conjunto com `-g` (group).

---

## Combinando Flags

As flags podem ser combinadas para análises mais específicas:

```bash
# Análise detalhada + verbose + continuar em erros
flog-js -d -v -c src/ test/

# Score total + quiet (para scripts)
flog-js -s -q src/ && echo "Analysis complete"

# Top 10% mais complexos + detalhes + agrupado
flog-js -t 10 -d -g src/

# Apenas funções com score >= 20
flog-js -m --threshold=score:20 src/

# Agrupado + todos os métodos (incluindo zeros)
flog-js -g -z -a src/

# Agrupado + verbose + zeros
flog-js -g -v -z examples/
```

---

## Flags de Ajuda

### `-h, --help`

Mostra a mensagem de ajuda:

```bash
flog-js --help
```

---

## Exemplos Práticos

### CI/CD - Falhar se score > 500

```bash
#!/bin/bash
SCORE=$(flog-js -s -q src/ | grep -oP '\d+\.\d+')
if (( $(echo "$SCORE > 500" | bc -l) )); then
  echo "Complexity too high: $SCORE"
  exit 1
fi
```

### Encontrar as 5 funções mais complexas

```bash
flog-js -d -t 5 --threshold=score:0 src/
```

### Análise completa com todas as informações

```bash
flog-js -a -d -v -g src/ > complexity-report.txt
```

### Ignorar erros em arquivos gerados

```bash
flog-js -c -q src/ dist/ | grep -v "Error parsing"
```

---

## Exit Codes

- `0`: Sucesso
- `1`: Erro (arquivos não encontrados, parse error sem `--continue`, etc.)

---

## Notas

1. **Performance:** A flag `-v` adiciona overhead mínimo (apenas prints)
2. **Threshold padrão:** 60% é o padrão do flog original
3. **Methods-only:** Em React, ignora JSX/hooks fora de componentes
4. **Quiet + Score:** Combinação ideal para automação
