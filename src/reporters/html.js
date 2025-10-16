import { createReporter } from './reporter-api.js';
import path from 'node:path';

/**
 * HTML Reporter
 * Outputs analysis results as an HTML page
 */
export const htmlReporter = createReporter({
  id: 'html',
  name: 'HTML Reporter',
  extension: '.html',

  generate(results, options = {}) {
    const totalScore = results.reduce((sum, r) => sum + r.total, 0);
    const avgScore = results.length > 0 ? totalScore / results.length : 0;

    const sortedResults = [...results].sort((a, b) => b.total - a.total);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>flog-js Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    h1 { color: #333; margin-bottom: 1rem; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .summary-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }
    .summary-card h3 { font-size: 0.875rem; color: #666; margin-bottom: 0.5rem; }
    .summary-card .value { font-size: 1.5rem; font-weight: bold; color: #333; }
    .files {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f8f9fa; }
    th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e9ecef; }
    th { font-weight: 600; color: #495057; font-size: 0.875rem; text-transform: uppercase; }
    tr:hover { background: #f8f9fa; }
    .file-name { font-family: 'Monaco', 'Courier New', monospace; color: #495057; font-weight: 500; }
    .score { font-weight: bold; }
    .score.high { color: #dc3545; }
    .score.medium { color: #ffc107; }
    .score.low { color: #28a745; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge.lang { background: #e3f2fd; color: #1976d2; }
    .badge.react { background: #e8f5e9; color: #388e3c; }
    .functions {
      margin-top: 0.5rem;
      padding-left: 1rem;
      font-size: 0.875rem;
      color: #666;
    }
    .function-item {
      margin: 0.25rem 0;
      font-family: 'Monaco', 'Courier New', monospace;
    }
    .drivers {
      margin-top: 0.25rem;
      padding-left: 1rem;
      font-size: 0.75rem;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🪶 flog-js Report</h1>
      <div class="summary">
        <div class="summary-card">
          <h3>Total Files</h3>
          <div class="value">${results.length}</div>
        </div>
        <div class="summary-card">
          <h3>Total Score</h3>
          <div class="value">${totalScore.toFixed(1)}</div>
        </div>
        <div class="summary-card">
          <h3>Average Score</h3>
          <div class="value">${avgScore.toFixed(1)}</div>
        </div>
      </div>
    </header>

    <div class="files">
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Mode</th>
            <th>Score</th>
            ${options.details ? '<th>Functions</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${sortedResults.map(result => {
            const scoreClass = result.total > 20 ? 'high' : result.total > 10 ? 'medium' : 'low';
            return `
              <tr>
                <td class="file-name">${path.basename(result.file)}</td>
                <td><span class="badge ${result.mode}">${result.mode}</span></td>
                <td><span class="score ${scoreClass}">${result.total.toFixed(2)}</span></td>
                ${options.details ? `
                  <td>
                    <div class="functions">
                      ${result.functions?.slice(0, 5).map(f => {
                        const funcName = (f.name && f.name.trim()) ? f.name : '(anonymous)';
                        const loc = f.loc ? `:${f.loc.start}-${f.loc.end}` : '';
                        return `
                        <div class="function-item">
                          ${f.score.toFixed(1)} - ${funcName}${loc}
                          ${f.topDrivers && f.topDrivers.length > 0 ? `
                            <div class="drivers">
                              ${f.topDrivers.slice(0, 3).map(d => d.kind).join(', ')}
                            </div>
                          ` : ''}
                        </div>
                      `;}).join('') || '-'}
                    </div>
                  </td>
                ` : ''}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
  }
});
