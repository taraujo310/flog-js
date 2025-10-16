import { createReporter } from './reporter-api.js';

/**
 * JSON Reporter
 * Outputs analysis results as JSON
 */
export const jsonReporter = createReporter({
  id: 'json',
  name: 'JSON Reporter',
  extension: '.json',
  
  generate(results, options = {}) {
    const output = {
      summary: {
        totalFiles: results.length,
        totalScore: results.reduce((sum, r) => sum + r.total, 0),
        averageScore: results.length > 0 
          ? results.reduce((sum, r) => sum + r.total, 0) / results.length 
          : 0
      },
      files: results.map(result => ({
        file: result.file,
        mode: result.mode,
        total: result.total,
        functions: options.details 
          ? result.functions?.map(f => ({
              name: f.name,
              score: f.score,
              loc: f.loc,
              className: f.className,
              drivers: f.topDrivers?.map(d => ({
                kind: d.kind,
                weight: d.weight
              }))
            }))
          : undefined
      }))
    };
    
    return JSON.stringify(output, null, 2);
  }
});
