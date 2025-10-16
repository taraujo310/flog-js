export function parseArgs(argv) {
  const options = {
    all: false,
    continue: false,
    details: false,
    group: false,
    quiet: false,
    score: false,
    threshold: 60,
    verbose: false,
    methodsOnly: false,
    zero: false,
    format: 'table'
  };
  
  const files = [];
  
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    
    if (arg === '-a' || arg === '--all') {
      options.all = true;
    } else if (arg === '-c' || arg === '--continue') {
      options.continue = true;
    } else if (arg === '-d' || arg === '--details') {
      options.details = true;
    } else if (arg === '-g' || arg === '--group') {
      options.group = true;
    } else if (arg === '-q' || arg === '--quiet') {
      options.quiet = true;
    } else if (arg === '-s' || arg === '--score') {
      options.score = true;
    } else if (arg === '-v' || arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '-m' || arg === '--methods-only') {
      options.methodsOnly = true;
    } else if (arg === '-z' || arg === '--zero') {
      options.zero = true;
    } else if (arg.startsWith('-t=') || arg.startsWith('--threshold=')) {
      const value = arg.split('=')[1];
      options.threshold = value;
    } else if (arg === '-t' || arg === '--threshold') {
      options.threshold = argv[++i];
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1];
    } else if (!arg.startsWith('-')) {
      files.push(arg);
    }
  }
  
  return { options, files };
}
