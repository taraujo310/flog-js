import { analyzePaths, createReporterManager } from '../src/index.js';
import fs from 'node:fs';

console.log('🧪 Testing reporter system...\n');

const results = await analyzePaths([
  './sample-complex.js',
  './sample-classes.js',
  './sample-components.jsx'
], { quiet: true });

const manager = createReporterManager();

console.log('📊 Available reporters:');
for (const r of manager.listReporters()) {
  console.log(`  - ${r.id}: ${r.name} (${r.extension})`);
}

console.log('\n✅ Generating JSON...');
const jsonReport = await manager.generate('json', results);
fs.writeFileSync('test-output.json', jsonReport);
console.log('  → Saved to test-output.json');

console.log('\n✅ Generating HTML...');
const htmlReport = await manager.generate('html', results, { details: true });
fs.writeFileSync('test-output.html', htmlReport);
console.log('  → Saved to test-output.html');

const parsed = JSON.parse(jsonReport);
console.log('\n📈 Summary:');
console.log(`  Total files: ${parsed.summary.totalFiles}`);
console.log(`  Total score: ${parsed.summary.totalScore.toFixed(1)}`);
console.log(`  Average score: ${parsed.summary.averageScore.toFixed(1)}`);

console.log('\n🎉 Test completed successfully!');
