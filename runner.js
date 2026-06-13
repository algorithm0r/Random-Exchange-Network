/**
 * Headless simulation runner for Random Exchange.
 * Runs batches of simulations in Node.js and saves results directly to MongoDB.
 * No browser, no socket.io, no 60fps cap.
 *
 * Usage:
 *   node runner.js                    # run batch_003 only (default)
 *   node runner.js --all              # run every run in runs.js
 *   node runner.js --batch batch_002  # run a specific collection
 *   node runner.js --skip-existing    # skip runs already in MongoDB
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

// Use server's mongodb install; fall back to local if present
let MongoClient;
try {
    ({ MongoClient } = require('mongodb'));
} catch {
    ({ MongoClient } = require('../Server/node_modules/mongodb'));
}

const MONGO_URL = 'mongodb://127.0.0.1:27017';
const DIR = __dirname;

// ── vm context (mirrors test.js) ──────────────────────────────────────────────
const ctx = vm.createContext({
    Math, Number, Array, Object, JSON, Infinity, NaN, isNaN, isFinite,
    parseInt, parseFloat, setTimeout, clearTimeout,

    window:   { requestAnimationFrame: () => {}, io: undefined },
    document: { getElementById: () => ({ classList: { remove: () => {}, add: () => {} }, innerHTML: '', innerText: '' }),
                createElement: () => ({ setAttribute: () => {}, click: () => {} }) },

    socket: { emit: () => {} },
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

const PARAMETERS = ctx.PARAMETERS;
const runs = ctx.runs;

// Default PARAMETERS baseline for resetting between runs
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

// ── Run a single simulation and return the captured data packet ───────────────
function runSim(run) {
    Object.assign(PARAMETERS, BASE, run);
    PARAMETERS.currentAverageWealth = PARAMETERS.initialWealth;
    PARAMETERS.idCounter = 0;

    let capturedData = null;
    ctx.socket.emit = (event, packet) => {
        if (event === 'insert') {
            // Deep copy so subsequent PARAMETERS mutations don't affect captured data.
            // (sendDataToServer already snapshots PARAMETERS, but copy the full packet too.)
            capturedData = JSON.parse(JSON.stringify(packet));
        }
    };

    let runComplete = false;
    ctx.loadNextRunParameters = () => { runComplete = true; };

    const pop = vm.runInContext('new Population()', ctx);
    while (!runComplete) {
        pop.update();
    }

    return capturedData;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);

    const skipExisting = args.includes('--skip-existing');
    const allRuns      = args.includes('--all');
    const batchIdx     = args.indexOf('--batch');
    const batchName    = batchIdx >= 0 ? args[batchIdx + 1] : null;

    let toRun;
    if (allRuns) {
        toRun = runs;
    } else if (batchName) {
        toRun = runs.filter(r => (r.collection || 'batch_002') === batchName);
        if (!toRun.length) { console.error(`No runs found for collection "${batchName}"`); process.exit(1); }
    } else {
        // Default: batch_003
        toRun = runs.filter(r => r.collection === 'batch_003');
    }

    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log(`Connected to MongoDB  |  ${toRun.length} runs queued\n`);

    // Optionally filter out runs already in the DB
    if (skipExisting) {
        const byCollection = {};
        toRun.forEach(r => {
            const col = r.collection || 'batch_002';
            (byCollection[col] = byCollection[col] || []).push(r.runName);
        });
        const existing = new Set();
        for (const [col, names] of Object.entries(byCollection)) {
            const collection = client.db('random_exchange').collection(col);
            const found = await collection.distinct('run', { run: { $in: names } });
            found.forEach(n => existing.add(`${col}::${n}`));
        }
        const before = toRun.length;
        toRun = toRun.filter(r => !existing.has(`${r.collection || 'batch_002'}::${r.runName}`));
        console.log(`Skipping ${before - toRun.length} existing runs  |  ${toRun.length} remaining\n`);
    }

    let done = 0;
    const startTime = Date.now();

    for (const run of toRun) {
        const runStart = Date.now();
        const data = runSim(run);

        if (data) {
            const col = client.db(data.db).collection(data.collection);
            await col.insertOne(data.data);
        }

        done++;
        const elapsed  = ((Date.now() - startTime) / 1000).toFixed(1);
        const perRun   = (Date.now() - startTime) / done;
        const eta      = ((perRun * (toRun.length - done)) / 1000).toFixed(0);
        const runMs    = Date.now() - runStart;
        const name     = (run.runName || '?').padEnd(44);
        process.stdout.write(`\r[${String(done).padStart(3)}/${toRun.length}] ${name} ${runMs}ms | ${elapsed}s elapsed | ~${eta}s left  `);
    }

    const total = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n\nDone — ${done} runs in ${total}s  (avg ${(Date.now() - startTime) / done | 0}ms/run)\n`);

    await client.close();
}

main().catch(err => { console.error(err); process.exit(1); });
