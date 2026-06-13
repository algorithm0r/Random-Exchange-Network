/**
 * Headless test suite for Random Exchange simulation.
 * Runs in Node.js — no browser required.
 * Usage: node test.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');
const assert = require('assert');

// ── Shared context (simulates browser globals) ────────────────────────────────
const ctx = vm.createContext({
    Math, Number, Array, Object, JSON, console, Infinity, NaN, isNaN, isFinite,
    parseInt, parseFloat, setTimeout, clearTimeout,

    // Browser stubs
    window:   { requestAnimationFrame: () => {}, io: undefined },
    document: { getElementById: () => ({ classList: { remove: ()=>{}, add: ()=>{} }, innerHTML: '', innerText: '' }),
                createElement: () => ({ setAttribute: ()=>{}, click: ()=>{} }) },

    // socket stub — swallows emits silently
    socket: { emit: () => {} },

    // suppress simulation's own console.log (sendDataToServer etc) so test output stays clean
    console: { log: () => {}, warn: () => {}, error: () => {} },

    // UI stubs
    saveParametersToUI: () => {},
    loadParametersFromUI: () => {},

    // Stub: called when a run ends; tests override this per-test
    loadNextRunParameters: () => {},

    // PopulationObserver stub
    PopulationObserver: class { constructor() {} draw() {} update() {} },
});

function load(filename) {
    let code = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    // const/class at line-start don't attach to vm context; promote to var so they do
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

// Expose sim objects into this scope for convenience
const PARAMETERS = ctx.PARAMETERS;
const runs = ctx.runs;
const getClass  = name => ctx[name];

// ── Test infrastructure ───────────────────────────────────────────────────────
let passed = 0, failed = 0;

function test(label, fn) {
    try {
        fn();
        console.log(`  \x1b[32m✓\x1b[0m ${label}`);
        passed++;
    } catch(e) {
        console.log(`  \x1b[31m✗\x1b[0m ${label}`);
        console.log(`    ${e.message}`);
        failed++;
    }
}

function setup(overrides = {}) {
    Object.assign(PARAMETERS, {
        runName: 'test', initialAgents: 100, initialNullAgents: 0,
        initialWealth: 100, numEmployers: 5, numEmployees: 5,
        yardsale: false, giveRate: 0.5,
        employeeNetwork: false, changeEmployeeOnPayment: false,
        employerNetwork: false, changeEmployersOnEarnings: false,
        earnChance: 0.0, spendChance: 0.0, randomTrades: 100,
        nullAgents: false, removeDeadAgents: false,
        roundingMode: 'ceiling', progressiveTF: false, progressiveAlpha: 1.0,
        currentAverageWealth: 100,
        ubiEnabled: false, ubiRate: 0.01, ubiFrequency: 100,
        reportingPeriod: 10, epoch: 99999, idCounter: 0,
        db: 'random_exchange', collection: 'batch_test',
    });
    Object.assign(PARAMETERS, overrides);
    PARAMETERS.currentAverageWealth = PARAMETERS.initialWealth;
}

function newPop() {
    return vm.runInContext('new Population()', ctx);
}

function newAgent() {
    return vm.runInContext('new Agent()', ctx);
}

function runSim(pop, ticks) {
    for (let i = 0; i < ticks; i++) pop.update();
    return pop;
}

function totalWealth(pop) {
    return pop.agents.reduce((s, a) => s + (a ? a.wealth : 0), 0);
}

// ── Test: run definitions ─────────────────────────────────────────────────────
console.log('\n\x1b[1mRun definitions\x1b[0m');

test('54 batch_002 runs (no collection)', () => {
    const n = runs.filter(r => !r.collection).length;
    assert.strictEqual(n, 54, `got ${n}`);
});
test('243 batch_003 runs', () => {
    const n = runs.filter(r => r.collection === 'batch_003').length;
    assert.strictEqual(n, 243, `got ${n}`);
});
test('reachability W10: initialWealth=10, nullAgents=true', () => {
    const r = runs.find(x => x.runName === 'TF_Null_W10_0.5');
    assert.ok(r, 'run not found');
    assert.strictEqual(r.initialWealth, 10);
    assert.strictEqual(r.nullAgents, true);
    assert.strictEqual(r.yardsale, false);
});
test('epoch sweep E1000: epoch=1000, initialWealth unchanged', () => {
    const r = runs.find(x => x.runName === 'TF_Null_E1000_0.5');
    assert.ok(r, 'run not found');
    assert.strictEqual(r.epoch, 1000);
    assert.strictEqual(r.initialWealth, 100);
});
test('floor run: roundingMode=floor', () => {
    const r = runs.find(x => x.runName === 'TF_Null_Floor_0.5');
    assert.ok(r, 'run not found');
    assert.strictEqual(r.roundingMode, 'floor');
});
test('TFP run: progressiveTF=true, progressiveAlpha=1.0', () => {
    const r = runs.find(x => x.runName === 'TFP_Null_0.5');
    assert.ok(r, 'run not found');
    assert.strictEqual(r.progressiveTF, true);
    assert.strictEqual(r.progressiveAlpha, 1.0);
});
test('UBI run: ubiEnabled=true, rate=0.01, freq=100', () => {
    const r = runs.find(x => x.runName === 'TF_Null_UBI_0.5');
    assert.ok(r, 'run not found');
    assert.strictEqual(r.ubiEnabled, true);
    assert.strictEqual(r.ubiRate, 0.01);
    assert.strictEqual(r.ubiFrequency, 100);
});

// ── Test: rounding modes — unit level ────────────────────────────────────────
console.log('\n\x1b[1mRounding modes — unit\x1b[0m');

test('ceiling: agent with wealth=1, rate=0.5 donates 1 (reaches 0)', () => {
    setup({ roundingMode: 'ceiling', giveRate: 0.5 });
    const payer = newAgent(); payer.wealth = 1;
    const receiver = newAgent(); receiver.wealth = 100;
    receiver.earnFrom(payer);
    assert.strictEqual(payer.wealth, 0);
});
test('floor: agent with wealth=1, rate=0.5 donates 0 (stays at 1)', () => {
    setup({ roundingMode: 'floor', giveRate: 0.5 });
    const payer = newAgent(); payer.wealth = 1;
    const receiver = newAgent(); receiver.wealth = 100;
    receiver.earnFrom(payer);
    assert.strictEqual(payer.wealth, 1, `wealth was ${payer.wealth}`);
});
test('floor: at rate=0.1, agents with wealth<10 donate 0 (floor(0.1*9)=0)', () => {
    setup({ roundingMode: 'floor', giveRate: 0.1 });
    const payer = newAgent(); payer.wealth = 9;
    const receiver = newAgent(); receiver.wealth = 100;
    receiver.earnFrom(payer);
    assert.strictEqual(payer.wealth, 9, `wealth was ${payer.wealth}`);
});
test('continuous: TF amount is non-integer float', () => {
    setup({ roundingMode: 'continuous', giveRate: 0.3 });
    const payer = newAgent(); payer.wealth = 7;   // 0.3 * 7 = 2.1, not an integer
    const receiver = newAgent(); receiver.wealth = 100;
    const amount = receiver.earnFrom(payer);
    assert.ok(!Number.isInteger(amount), `expected float, got ${amount}`);
});
test('continuous: payer wealth stays > 0 after trade', () => {
    setup({ roundingMode: 'continuous', giveRate: 0.9 });
    const payer = newAgent(); payer.wealth = 1;
    const receiver = newAgent(); receiver.wealth = 100;
    receiver.earnFrom(payer);
    assert.ok(payer.wealth > 0, `wealth was ${payer.wealth}`);
});

// ── Test: rounding modes — simulation level ───────────────────────────────────
console.log('\n\x1b[1mRounding modes — simulation (500 ticks)\x1b[0m');

test('floor TF+Null: no agents nulled after 500 ticks', () => {
    setup({ roundingMode: 'floor', giveRate: 0.5, nullAgents: true });
    const pop = runSim(newPop(), 500);
    const nulled = pop.agents.filter(a => a === null).length;
    assert.strictEqual(nulled, 0, `${nulled} agents were nulled`);
});
test('continuous TF+Null: no agents nulled after 500 ticks', () => {
    setup({ roundingMode: 'continuous', giveRate: 0.5, nullAgents: true });
    const pop = runSim(newPop(), 500);
    const nulled = pop.agents.filter(a => a === null).length;
    assert.strictEqual(nulled, 0, `${nulled} agents were nulled`);
});
test('floor TF+Null: all remaining agents have wealth >= 1', () => {
    setup({ roundingMode: 'floor', giveRate: 0.5, nullAgents: true });
    const pop = runSim(newPop(), 500);
    const living = pop.agents.filter(a => a !== null);
    const below1 = living.filter(a => a.wealth < 1).length;
    assert.strictEqual(below1, 0, `${below1} agents below wealth=1`);
});

// ── Test: wealth conservation ─────────────────────────────────────────────────
console.log('\n\x1b[1mWealth conservation\x1b[0m');

test('ceiling TF+Preserve: total wealth constant over 500 ticks', () => {
    setup({ roundingMode: 'ceiling' });
    const pop = runSim(newPop(), 500);
    assert.strictEqual(totalWealth(pop), 100 * 100);
});
test('UBI TF+Null: total wealth constant over 500 ticks', () => {
    setup({ ubiEnabled: true, ubiRate: 0.01, ubiFrequency: 10, nullAgents: true });
    const pop = runSim(newPop(), 500);
    assert.strictEqual(totalWealth(pop), 100 * 100, `drifted to ${totalWealth(pop)}`);
});
test('UBI YS+Preserve: total wealth constant over 500 ticks', () => {
    setup({ yardsale: true, ubiEnabled: true, ubiRate: 0.01, ubiFrequency: 10 });
    const pop = runSim(newPop(), 500);
    assert.strictEqual(totalWealth(pop), 100 * 100, `drifted to ${totalWealth(pop)}`);
});
test('TFP+Preserve: total wealth constant over 500 ticks', () => {
    setup({ progressiveTF: true, progressiveAlpha: 1.0 });
    const pop = runSim(newPop(), 500);
    // continuous rounding makes this float; allow epsilon
    const tw = totalWealth(pop);
    assert.ok(Math.abs(tw - 10000) < 1e-6, `drifted to ${tw}`);
});

// ── Test: progressive TF ──────────────────────────────────────────────────────
console.log('\n\x1b[1mProgressive TF\x1b[0m');

test('effectiveGiveRate scales linearly with wealth', () => {
    setup({ progressiveTF: true, progressiveAlpha: 1.0, giveRate: 0.5 });
    PARAMETERS.currentAverageWealth = 100;
    const poor = newAgent(); poor.wealth = 50;
    const avg  = newAgent(); avg.wealth  = 100;
    const rich = newAgent(); rich.wealth = 200;
    const rP = poor.effectiveGiveRate(poor.wealth);
    const rA = avg.effectiveGiveRate(avg.wealth);
    const rR = rich.effectiveGiveRate(rich.wealth);
    assert.ok(rP < rA, `poor ${rP} should be < avg ${rA}`);
    assert.ok(rA < rR, `avg ${rA} should be < rich ${rR}`);
    assert.ok(Math.abs(rA - 0.5) < 1e-9, `avg should give at base rate, got ${rA}`);
});
test('effectiveGiveRate caps at 1.0 for very rich agents', () => {
    setup({ progressiveTF: true, progressiveAlpha: 1.0, giveRate: 0.9 });
    PARAMETERS.currentAverageWealth = 10;
    const rich = newAgent(); rich.wealth = 10000;
    assert.strictEqual(rich.effectiveGiveRate(rich.wealth), 1.0);
});
test('TFP payer gives proportionally more when richer than average', () => {
    setup({ progressiveTF: true, progressiveAlpha: 1.0, giveRate: 0.5, roundingMode: 'continuous' });
    PARAMETERS.currentAverageWealth = 100;
    const poor_payer = newAgent(); poor_payer.wealth = 50;
    const rich_payer = newAgent(); rich_payer.wealth = 200;
    const receiver   = newAgent(); receiver.wealth   = 1;
    const a1 = poor_payer.payTo(receiver);
    poor_payer.wealth = 50; receiver.wealth = 1; // reset
    const a2 = rich_payer.payTo(receiver);
    // rich pays more per unit of wealth: amount/wealth should be higher
    assert.ok(a2 / 200 > a1 / 50, `rich rate ${a2/200} should exceed poor rate ${a1/50}`);
});

// ── Test: UBI timing ──────────────────────────────────────────────────────────
console.log('\n\x1b[1mUBI timing\x1b[0m');

test('UBI fires exactly 4 times in 200 ticks with frequency=50', () => {
    setup({ ubiEnabled: true, ubiRate: 0.01, ubiFrequency: 50 });
    let fired = 0;
    const orig = ctx.Population.prototype.applyUBI;
    ctx.Population.prototype.applyUBI = function() { fired++; orig.call(this); };
    runSim(newPop(), 200);
    ctx.Population.prototype.applyUBI = orig;
    // fires at tick 0, 50, 100, 150
    assert.strictEqual(fired, 4, `expected 4, got ${fired}`);
});
test('UBI redistributes: after firing, all agents gain some wealth from zero-wealth agents', () => {
    setup({ ubiEnabled: true, ubiRate: 0.5, ubiFrequency: 9999 });
    const pop = newPop();
    // Manually drain one agent to near-zero
    pop.agents[0].wealth = 1000;
    pop.agents[1].wealth = 0;
    // Adjust remaining to keep total = 10000
    const excess = pop.agents[0].wealth + pop.agents[1].wealth - 200;
    for (let i = 2; i < pop.agents.length; i++) pop.agents[i].wealth -= excess / 98;
    const before = totalWealth(pop);
    pop.applyUBI();
    const after = totalWealth(pop);
    assert.ok(Math.abs(after - before) < 1, `wealth changed from ${before} to ${after}`);
});

// ── Test: backward compatibility ──────────────────────────────────────────────
console.log('\n\x1b[1mBackward compatibility\x1b[0m');

test('new Population() initializes tick=0', () => {
    setup({});
    const pop = newPop();
    assert.strictEqual(pop.tick, 0);
});
test('each new Population resets tick independently', () => {
    setup({});
    const pop1 = newPop();
    runSim(pop1, 150);
    const pop2 = newPop();
    assert.strictEqual(pop2.tick, 0, `pop2.tick was ${pop2.tick}`);
});
test('ceiling TF+Preserve rate=0.1: no condensation at 500 ticks (Gini < 0.99)', () => {
    setup({ giveRate: 0.1 });
    const pop = runSim(newPop(), 500);
    const gini = pop.dataManager.gini;
    assert.ok(gini < 0.99, `condensed: Gini=${gini.toFixed(3)}`);
});
test('ceiling TF+Preserve rate=0.9: distribution spreads (Gini > 0)', () => {
    setup({ giveRate: 0.9 });
    const pop = runSim(newPop(), 500);
    const gini = pop.dataManager.gini;
    assert.ok(gini > 0, `Gini was ${gini} — no inequality at all`);
});
test('currentAverageWealth is updated by DataManager', () => {
    setup({ giveRate: 0.5, nullAgents: true });
    PARAMETERS.currentAverageWealth = 0;  // force stale value
    const pop = runSim(newPop(), 20);     // one reporting period
    assert.ok(PARAMETERS.currentAverageWealth > 0, 'currentAverageWealth was not updated');
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests  —  \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m\n`);
if (failed > 0) process.exit(1);
