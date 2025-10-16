import { analyzePaths, createReporterManager } from '../src/index.js';
import fs from 'node:fs';

console.log('🧪 Testando sistema de reporters...\n');

const results = await analyzePaths([
  './sample-complex.js',
  './sample-classes.js',
  './sample-components.jsx'
], { quiet: true });

const manager = createReporterManager();

console.log('📊 Reporters disponíveis:');
for (const r of manager.listReporters()) {
  console.log(`  - ${r.id}: ${r.name} (${r.extension})`);
}

console.log('\n✅ Gerando JSON...');
const jsonReport = await manager.generate('json', results);
fs.writeFileSync('test-output.json', jsonReport);
console.log('  → Salvo em test-output.json');

console.log('\n✅ Gerando HTML...');
const htmlReport = await manager.generate('html', results, { details: true });
fs.writeFileSync('test-output.html', htmlReport);
console.log('  → Salvo em test-output.html');

const parsed = JSON.parse(jsonReport);
console.log('\n📈 Sumário:');
console.log(`  Total de arquivos: ${parsed.summary.totalFiles}`);
console.log(`  Score total: ${parsed.summary.totalScore.toFixed(1)}`);
console.log(`  Score médio: ${parsed.summary.averageScore.toFixed(1)}`);

console.log('\n🎉 Teste concluído com sucesso!');
