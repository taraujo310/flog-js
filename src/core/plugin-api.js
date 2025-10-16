/** @typedef {{ line: number, col: number }} Loc */
/** @typedef {{ kind: string, weight: number, message?: string, loc?: Loc }} Driver */

/**
 * @callback ReportAdd
 * @param {number} weight
 * @param {Partial<Driver>=} meta
 */

/** @typedef {{ name: string, score: number, loc: {start:number,end:number}, topDrivers?: Driver[] }} FunctionScore */

/** @typedef {{
 *   add: ReportAdd,
 *   enterFunction: (name: string, loc: {start:number,end:number}) => void,
 *   exitFunction: () => void,
 *   finalize: () => { total: number, functions: FunctionScore[] }
 * }} ReportApi */

/** @typedef {{
 *   filePath: string,
 *   source: string,
 *   ast: import('@babel/types').File,
 *   ext: string,
 *   config: any,
 *   env: Record<string, any>,
 *   utils: { traverse: import('@babel/traverse').default, t: typeof import('@babel/types') }
 * }} DetectContext */

/** @typedef {{ id: string, confidence: number, reasons: string[], composableWith?: string[], force?: boolean }} DetectResult */

/** @typedef {{
 *   filePath: string,
 *   source: string,
 *   ast: import('@babel/types').File,
 *   config: any,
 *   report: ReportApi,
 *   utils: { traverse: import('@babel/traverse').default, t: typeof import('@babel/types') }
 * }} AnalyzeContext */

/** @typedef {{ id: string, total: number, functions: FunctionScore[], diagnostics?: string[] }} AnalyzeResult */

/** @typedef {{
 *   id: string,
 *   meta?: { name?: string, version?: string, description?: string },
 *   validateConfig?: (raw:any)=>any,
 *   detect: (ctx: DetectContext)=>DetectResult|Promise<DetectResult>,
 *   analyze: (ctx: AnalyzeContext)=>AnalyzeResult|Promise<AnalyzeResult>
 * }} FlogMode */

export {};
