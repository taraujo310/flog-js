import fs from 'node:fs';
import path from 'node:path';
import { parseSource } from './core/parser.js';
import { createAnalyzer } from './core/mode-manager.js';
import { createReporterManager } from './reporters/reporter-manager.js';

function expandGlobs(inputs) {
  const files = new Set();
  const jsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];
  
  function isJSFile(filePath) {
    return jsExtensions.some(ext => filePath.endsWith(ext));
  }
  
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (isJSFile(full)) {
        files.add(full);
      }
    }
  }
  
  for (const i of inputs) {
    const p = path.resolve(i);
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        walk(p);
      } else if (isJSFile(p)) {
        files.add(p);
      }
    }
  }
  
  return [...files];
}

export async function analyzePaths(inputs, options = {}) {
  const files = expandGlobs(inputs);
  
  if (files.length === 0) {
    if (!options.quiet) {
      console.log('No files found to analyze');
    }
    return [];
  }
  
  const analyzer = createAnalyzer();
  /** @type {{file:string, mode:string, total:number, functions:any[], error?:string}[]} */
  const results = [];
  let errorCount = 0;

  for (const file of files) {
    try {
      if (options.verbose) {
        console.log(`Analyzing ${file}...`);
      }
      
      const source = fs.readFileSync(file, 'utf8');
      const ast = parseSource(source, file);
      const mode = await analyzer.detectBest(ast, file, source);
      
      if (options.verbose) {
        console.log(`  Mode: ${mode.id}`);
      }
      
      const report = await analyzer.analyze(ast, file, source, mode, options);
      results.push({ file, mode: mode.id, total: report.total, functions: report.functions });
    } catch (error) {
      errorCount++;
      if (options.continue) {
        if (!options.quiet) {
          console.error(`Error parsing ${file}: ${error.message}`);
        }
        results.push({ file, mode: 'error', total: 0, functions: [], error: error.message });
      } else {
        throw error;
      }
    }
  }

  const validResults = results.filter(r => !r.error);
  validResults.sort((a, b) => b.total - a.total);
  
  if (options.score) {
    const totalScore = validResults.reduce((sum, r) => sum + r.total, 0);
    if (!options.quiet) {
      console.log(`Total flog score: ${totalScore.toFixed(2)}`);
    }
    return { totalScore, fileCount: validResults.length, errorCount };
  }
  
  let filtered = validResults;
  
  if (!options.all && options.threshold) {
    if (typeof options.threshold === 'string' && options.threshold.startsWith('score:')) {
      const minScore = parseFloat(options.threshold.split(':')[1]);
      filtered = validResults.filter(r => r.total >= minScore);
    } else {
      const percentage = typeof options.threshold === 'number' ? options.threshold : parseFloat(options.threshold);
      const cutoff = Math.ceil(validResults.length * (percentage / 100));
      filtered = validResults.slice(0, cutoff);
    }
  }
  
  if (options.output) {
    const reporterManager = createReporterManager();
    const format = path.extname(options.output).slice(1) || 'json';
    
    try {
      const content = await reporterManager.generate(format, filtered, options);
      fs.writeFileSync(options.output, content, 'utf-8');
      
      if (!options.quiet) {
        console.log(`Report saved to: ${options.output}`);
      }
    } catch (error) {
      if (!options.quiet) {
        console.error(`Error generating report: ${error.message}`);
      }
    }
  } else {
    if (options.group) {
      printGrouped(filtered, options);
    } else {
      printTable(filtered, options);
    }
  }
  
  if (errorCount > 0 && !options.quiet) {
    console.error(`\nErrors: ${errorCount} file(s) failed to parse`);
  }
  
  return filtered;
}

function printTable(results, options) {
  if (options.quiet) return;
  
  const rows = results.map(r => {
    const row = { 
      file: path.basename(r.file), 
      mode: r.mode, 
      total: r.total.toFixed(2) 
    };
    
    if (options.details && r.functions && r.functions.length > 0) {
      const sorted = [...r.functions].sort((a, b) => b.score - a.score);
      const topFunc = sorted[0];
      row.topFunction = topFunc.name;
      row.topScore = topFunc.score.toFixed(2);
      if (topFunc.topDrivers && topFunc.topDrivers.length > 0) {
        row.drivers = topFunc.topDrivers.map(d => d.kind).join(', ');
      }
    }
    
    return row;
  });
  
  console.table(rows);
}

function printGrouped(results, options) {
  if (options.quiet) return;
  
  const fileGroups = new Map();
  
  for (const result of results) {
    const file = path.basename(result.file);
    
    const byClass = new Map();
    byClass.set('none', []);
    
    for (const func of result.functions || []) {
      const className = func.className || 'none';
      if (!byClass.has(className)) {
        byClass.set(className, []);
      }
      byClass.get(className).push(func);
    }
    
    fileGroups.set(file, {
      file: result.file,
      total: result.total,
      mode: result.mode,
      classes: byClass
    });
  }
  
  const sortedFiles = Array.from(fileGroups.values()).sort((a, b) => b.total - a.total);
  const totalScore = sortedFiles.reduce((sum, f) => sum + f.total, 0);
  const allFunctions = sortedFiles.flatMap(f => Array.from(f.classes.values()).flat());
  const avgScore = allFunctions.length > 0 ? totalScore / allFunctions.length : 0;
  
  console.log(`${totalScore.toFixed(1)}: flog total`);
  console.log(`  ${avgScore.toFixed(1)}: flog/method average\n`);
  
  for (const fileData of sortedFiles) {
    const sortedClasses = Array.from(fileData.classes.entries())
      .map(([className, funcs]) => ({
        className,
        funcs,
        total: funcs.reduce((sum, f) => sum + f.score, 0)
      }))
      .sort((a, b) => b.total - a.total);
    
    for (const classData of sortedClasses) {
      const { className, funcs, total } = classData;
      const displayName = className === 'none' ? path.basename(fileData.file, path.extname(fileData.file)) : className;
      
      console.log(`${total.toFixed(1)}: ${displayName} total`);
      
      const sortedFuncs = [...funcs].sort((a, b) => b.score - a.score);
      const cutoff = options.all ? sortedFuncs.length : Math.ceil(sortedFuncs.length * 0.6);
      const topFuncs = sortedFuncs.slice(0, cutoff);
      
      for (const func of topFuncs) {
        if (!options.zero && func.score === 0) {
          continue;
        }
        
        const loc = `${path.basename(fileData.file)}:${func.loc.start}-${func.loc.end}`;
        const funcName = className !== 'none' ? `${className}#${func.name}` : func.name;
        console.log(`${func.score.toFixed(1).padStart(6)}: ${funcName.padEnd(30)} ${loc}`);
        
        if (options.details && func.allDrivers && func.allDrivers.length > 0) {
          const drivers = func.allDrivers;
          for (const driver of drivers) {
            console.log(`${driver.weight.toFixed(1).padStart(6)}:   ${driver.kind}`);
          }
        }
      }
      
      console.log('');
    }
  }
}
