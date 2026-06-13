/**
 * Headless simulation runner for Random Exchange.
 * Runs batches of simulations in parallel Node.js worker threads,
 * saving results directly to MongoDB.
 *
 * Usage:
 *   node runner.js                         # batch_003, 4 workers
 *   node runner.js --workers 8             # batch_003, 8 workers
 *   node runner.js --all                   # every run in runs.js
 *   node runner.js --batch batch_002       # specific collection
 *   node runner.js --reps 100              # repeat run list N times (replications)
 *   node runner.js --skip-existing         # skip runs already in MongoDB
 */

'use strict';

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

let MongoClient;
try {
    ({ MongoClient } = require('mongodb'));
} catch {
    ({ MongoClient } = require('../Server/node_modules/mongodb'));
}

const MONGO_URL = 'mongodb://127.0.0.1:27017';
const DIR = __dirname;

// ── Simulation context (each worker gets its own) ─────────────────────────────
function createSimContext() {
    const ctx = vm.createContext({
        Math, Number, Array, Object, JSON, Infinity, NaN, isNaN, isFinite,
        parseInt, parseFloat, setTimeout, clearTimeout,

        window:   { requestAnimationFrame: () => {}, io: undefined },
        document: { getElementById: () => ({ classList: { remove: () => {}, add: () => {} }, innerHTML: '', innerText: '' }),
                    createElement: () => ({ setAttribute: () => {}, click: () => {} }) },

        socket:  { emit: () => {} },
        console: { log: () => {}, warn: () => {}, error: () => {} },

        saveParametersToUI:    () => {},
        loadParametersFromUI:  () => {},
        loadNextRunParameters: () => {},

        PopulationObserver: class { constructor() {} draw() {} update() {} },
    });

    function load(filename) {
        let code = fs.readFileSync(path.join(DIR, filename), 'utf8');
        code = code.replace(/^const\s+/gm, 'var ');
        code = code.replace(/^let\s+/gm, 'var ');
        code = code.replace(/^class\s+(\w+)/gm, 'var $1 = class $1');
        vm.runInContext(code, ctx);
    }

    load('util.js');
    load('parameters.js');
    load('agent.js');
    load('datamanager.js');
    load('population.js');
    load('runs.js');

    return ctx;
}

const BASE = {
    runName: 'Run From Controls',
    initialAgents: 100, initialNullAgents: 0, initialWealth: 100,
    numEmployers: 5, numEmployees: 5,
    yardsale: false,
    employeeNetwork: false, changeEmployeeOnPayment: false,
    employerNetwork: false, changeEmployersOnEarnings: false,
    earnChance: 0.0, spendChance: 0.0, randomTrades: 100,
    nullAgents: false, removeDeadAgents: false,
    giveRate: 0.5,
    roundingMode: 'ceiling', progressiveTF: false, progressiveAlpha: 1.0,
    currentAverageWealth: 100,
    ubiEnabled: false, ubiRate: 0.01, ubiFrequency: 100,
    reportingPeriod: 10, epoch: 10000, idCounter: 0,
    db: 'random_exchange', collection: 'batch_002',
};

// ── Worker ────────────────────────────────────────────────────────────────────
if (!isMainThread) {
    (async () => {
        const { runs } = workerData;
        const ctx = createSimContext();
        const PARAMETERS = ctx.PARAMETERS;

        const client = new MongoClient(MONGO_URL);
        await client.connect();

        for (const run of runs) {
            const t0 = Date.now();

            Object.assign(PARAMETERS, BASE, run);
            PARAMETERS.currentAverageWealth = PARAMETERS.initialWealth;
            PARAMETERS.idCounter = 0;

            let capturedData = null;
            ctx.socket.emit = (event, packet) => {
                if (event === 'insert') capturedData = JSON.parse(JSON.stringify(packet));
            };

            let runComplete = false;
            ctx.loadNextRunParameters = () => { runComplete = true; };

            const pop = vm.runInContext('new Population()', ctx);
            while (!runComplete) pop.update();

            if (capturedData) {
                const col = client.db(capturedData.db).collection(capturedData.collection);
                await col.insertOne(capturedData.data);
            }

            parentPort.postMessage({ runName: run.runName, ms: Date.now() - t0 });
        }

        await client.close();
    })();
}

// ── Main ──────────────────────────────────────────────────────────────────────
if (isMainThread) {
    function parseArgs() {
        const args = process.argv.slice(2);
        const get  = flag => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
        return {
            workers:      parseInt(get('--workers') ?? '4'),
            reps:         parseInt(get('--reps')    ?? '1'),
            batch:        get('--batch'),
            all:          args.includes('--all'),
            skipExisting: args.includes('--skip-existing'),
        };
    }

    async function main() {
        const { workers: numWorkers, reps, batch: batchName, all: allRuns, skipExisting } = parseArgs();

        const ctx  = createSimContext();
        const runs = ctx.runs;

        let baseRuns;
        if (allRuns)      baseRuns = runs;
        else if (batchName) baseRuns = runs.filter(r => (r.collection || 'batch_002') === batchName);
        else              baseRuns = runs.filter(r => r.collection === 'batch_003');

        if (!baseRuns.length) { console.error('No matching runs found.'); process.exit(1); }

        // Expand replications
        let toRun = [];
        for (let r = 0; r < reps; r++) toRun = toRun.concat(baseRuns);

        if (skipExisting) {
            const client = new MongoClient(MONGO_URL);
            await client.connect();
            const byCol = {};
            baseRuns.forEach(r => {
                const col = r.collection || 'batch_002';
                (byCol[col] = byCol[col] || []).push(r.runName);
            });
            const existing = new Set();
            for (const [col, names] of Object.entries(byCol)) {
                const counts = await client.db('random_exchange').collection(col)
                    .aggregate([{ $match: { run: { $in: names } } }, { $group: { _id: '$run', n: { $sum: 1 } } }])
                    .toArray();
                counts.forEach(({ _id, n }) => {
                    for (let i = 0; i < n; i++) existing.add(`${col}::${_id}::${i}`);
                });
            }
            const before = toRun.length;
            let skipped = 0;
            const seen = {};
            toRun = toRun.filter(r => {
                const key = `${r.collection || 'batch_002'}::${r.runName}`;
                seen[key] = (seen[key] || 0);
                const skip = existing.has(`${key}::${seen[key]}`);
                seen[key]++;
                if (skip) skipped++;
                return !skip;
            });
            console.log(`Skipping ${skipped} existing | ${toRun.length} remaining`);
            await client.close();
            if (!toRun.length) { console.log('Nothing to do.'); return; }
        }

        const n = Math.min(numWorkers, toRun.length);
        const repStr = reps > 1 ? ` × ${reps} reps` : '';
        console.log(`\n${baseRuns.length} runs${repStr} = ${toRun.length} total | ${n} workers\n`);

        // Distribute runs round-robin across workers
        const chunks = Array.from({ length: n }, () => []);
        toRun.forEach((run, i) => chunks[i % n].push(run));

        let done = 0;
        const total     = toRun.length;
        const startTime = Date.now();

        await Promise.all(chunks.map(chunk => new Promise((resolve, reject) => {
            const worker = new Worker(__filename, { workerData: { runs: chunk } });

            worker.on('message', msg => {
                done++;
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                const perRun  = (Date.now() - startTime) / done;
                const eta     = ((perRun * (total - done)) / 1000).toFixed(0);
                process.stdout.write(
                    `\r[${String(done).padStart(4)}/${total}] ${msg.runName.padEnd(44)} ${String(msg.ms).padStart(5)}ms | ${elapsed}s | ~${eta}s left  `
                );
            });

            worker.on('error', reject);
            worker.on('exit', resolve);
        })));

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const avg = ((Date.now() - startTime) / done) | 0;
        console.log(`\n\nDone — ${done} runs in ${totalTime}s  (avg ${avg}ms/run)\n`);
    }

    main().catch(err => { console.error(err); process.exit(1); });
}
