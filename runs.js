/*
    Parameter options  
    giveRate: 0.1 to 0.9
    yardsale: true/false
    employeeNetwork: true/false
    changeEmployeeOnPayment: true/false
    employerNetwork: true/false
    changeEmployersOnEarnings: true/false
    earnChance: 0.0/0.0
    spendChance: 0.0/0.0
    randomTrades: 0/1/100
    nullAgents: true/false
    removeDeadAgents: true/false

    Main runs
    Yard Sale/Random Pairs/100 trades/Preserve Dead
    Proportional/Random Pairs/100 trades/Preserve Dead
    Yard Sale/Random Pairs/100 trades/Remove Dead
    Proportional/Random Pairs/100 trades/Remove Dead
    Yard Sale/Random Pairs/100 trades/Null Agents
    Proportional/Random Pairs/100 trades/Null Agents 
    */
let runIndex = 0;

const runs = [
  // Yard Sale + Preserve Dead
  { runName: "YS_Preserve_0.1", giveRate: 0.1, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.2", giveRate: 0.2, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.3", giveRate: 0.3, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.4", giveRate: 0.4, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.5", giveRate: 0.5, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.6", giveRate: 0.6, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.7", giveRate: 0.7, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.8", giveRate: 0.8, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.9", giveRate: 0.9, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },

  // TF + Preserve Dead  
  { runName: "TF_Preserve_0.1", giveRate: 0.1, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.2", giveRate: 0.2, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.3", giveRate: 0.3, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.4", giveRate: 0.4, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.5", giveRate: 0.5, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.6", giveRate: 0.6, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.7", giveRate: 0.7, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.8", giveRate: 0.8, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.9", giveRate: 0.9, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },

  // Yard Sale + Remove Dead
  { runName: "YS_Remove_0.1", giveRate: 0.1, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.2", giveRate: 0.2, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.3", giveRate: 0.3, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.4", giveRate: 0.4, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.5", giveRate: 0.5, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.6", giveRate: 0.6, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.7", giveRate: 0.7, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.8", giveRate: 0.8, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.9", giveRate: 0.9, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },

  // TF + Remove Dead
  { runName: "TF_Remove_0.1", giveRate: 0.1, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.2", giveRate: 0.2, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.3", giveRate: 0.3, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.4", giveRate: 0.4, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.5", giveRate: 0.5, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.6", giveRate: 0.6, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.7", giveRate: 0.7, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.8", giveRate: 0.8, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.9", giveRate: 0.9, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },

  // Yard Sale + Null Agents
  { runName: "YS_Null_0.1", giveRate: 0.1, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.2", giveRate: 0.2, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.3", giveRate: 0.3, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.4", giveRate: 0.4, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.5", giveRate: 0.5, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.6", giveRate: 0.6, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.7", giveRate: 0.7, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.8", giveRate: 0.8, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.9", giveRate: 0.9, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },

  // TF + Null Agents
  { runName: "TF_Null_0.1", giveRate: 0.1, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.2", giveRate: 0.2, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.3", giveRate: 0.3, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.4", giveRate: 0.4, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.5", giveRate: 0.5, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.6", giveRate: 0.6, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.7", giveRate: 0.7, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.8", giveRate: 0.8, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.9", giveRate: 0.9, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false }
];

// ─── batch_003 run generators ────────────────────────────────────────────────

const B3_BASE = {
    employeeNetwork: false, changeEmployeeOnPayment: false,
    employerNetwork: false, changeEmployersOnEarnings: false,
    earnChance: 0.0, spendChance: 0.0, randomTrades: 100,
    nullAgents: false, removeDeadAgents: false,
    roundingMode: 'ceiling', progressiveTF: false, progressiveAlpha: 1.0,
    ubiEnabled: false, ubiRate: 0.01, ubiFrequency: 100,
    initialAgents: 100, initialWealth: 100, epoch: 10000,
    collection: 'batch_003',
};

const RATES = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

function r(n) { return n.toFixed(1); }

// ── Experiment A: Reachability sweep ─────────────────────────────────────────
// TF+Null varying initialWealth — tests whether condensation threshold shifts
const WEALTH_LEVELS = [10, 25, 50, 200, 500];
for (const w of WEALTH_LEVELS) {
    for (const rate of RATES) {
        runs.push({ ...B3_BASE,
            runName: `TF_Null_W${w}_${r(rate)}`,
            giveRate: rate, yardsale: false,
            nullAgents: true, initialWealth: w,
        });
    }
}

// TF+Null varying epoch — tests whether condensation threshold shifts with time
const EPOCH_LEVELS = [1000, 2500, 5000, 50000];
for (const ep of EPOCH_LEVELS) {
    for (const rate of RATES) {
        runs.push({ ...B3_BASE,
            runName: `TF_Null_E${ep}_${r(rate)}`,
            giveRate: rate, yardsale: false,
            nullAgents: true, epoch: ep,
        });
    }
}

// TF+Preserve varying initialWealth — control: should never condense regardless of wealth
for (const w of WEALTH_LEVELS) {
    for (const rate of RATES) {
        runs.push({ ...B3_BASE,
            runName: `TF_Preserve_W${w}_${r(rate)}`,
            giveRate: rate, yardsale: false,
            initialWealth: w,
        });
    }
}

// ── Experiment B: Rounding modes ─────────────────────────────────────────────
// Floor: effective absorbing boundary at ceil(1/rate), agents freeze above 0
// Continuous: wealth decays asymptotically to 0; sub-1 agents negligible (no boundary trigger)
const ROUNDING_CONDITIONS = [
    { label: 'Floor', roundingMode: 'floor', yardsale: false, nullAgents: false, removeDeadAgents: false },
    { label: 'Cont',  roundingMode: 'continuous', yardsale: false, nullAgents: false, removeDeadAgents: false },
];
const ROUNDING_BOUNDARIES = [
    { suffix: 'Preserve', nullAgents: false, removeDeadAgents: false },
    { suffix: 'Null',     nullAgents: true,  removeDeadAgents: false },
];
for (const rm of ROUNDING_CONDITIONS) {
    for (const bc of ROUNDING_BOUNDARIES) {
        for (const rate of RATES) {
            runs.push({ ...B3_BASE,
                runName: `TF_${bc.suffix}_${rm.label}_${r(rate)}`,
                giveRate: rate, yardsale: false,
                roundingMode: rm.roundingMode,
                nullAgents: bc.nullAgents, removeDeadAgents: bc.removeDeadAgents,
            });
        }
    }
}
// YS+Preserve with floor and continuous (interesting comparison for YS implicit boundary)
for (const rm of ROUNDING_CONDITIONS) {
    for (const rate of RATES) {
        runs.push({ ...B3_BASE,
            runName: `YS_Preserve_${rm.label}_${r(rate)}`,
            giveRate: rate, yardsale: true,
            roundingMode: rm.roundingMode,
        });
    }
}

// ── Experiment C: Progressive TF (TF-P) ──────────────────────────────────────
// effectiveRate = min(1, giveRate * (wealth/avgWealth)^1); richer agents give more
const TFP_BOUNDARIES = [
    { suffix: 'Preserve', nullAgents: false, removeDeadAgents: false },
    { suffix: 'Null',     nullAgents: true,  removeDeadAgents: false },
    { suffix: 'Remove',   nullAgents: false,  removeDeadAgents: true  },
];
for (const bc of TFP_BOUNDARIES) {
    for (const rate of RATES) {
        runs.push({ ...B3_BASE,
            runName: `TFP_${bc.suffix}_${r(rate)}`,
            giveRate: rate, yardsale: false,
            progressiveTF: true, progressiveAlpha: 1.0,
            nullAgents: bc.nullAgents, removeDeadAgents: bc.removeDeadAgents,
        });
    }
}

// ── Experiment D: UBI redistribution ─────────────────────────────────────────
// Every 100 ticks: floor(wealth*0.01) pooled, redistributed equally; total wealth conserved
const UBI_CONDITIONS = [
    { suffix: 'TF_Null_UBI',      yardsale: false, nullAgents: true,  removeDeadAgents: false },
    { suffix: 'TF_Remove_UBI',    yardsale: false, nullAgents: false, removeDeadAgents: true  },
    { suffix: 'YS_Null_UBI',      yardsale: true,  nullAgents: true,  removeDeadAgents: false },
    { suffix: 'YS_Preserve_UBI',  yardsale: true,  nullAgents: false, removeDeadAgents: false },
];
for (const cond of UBI_CONDITIONS) {
    for (const rate of RATES) {
        runs.push({ ...B3_BASE,
            runName: `${cond.suffix}_${r(rate)}`,
            giveRate: rate, yardsale: cond.yardsale,
            nullAgents: cond.nullAgents, removeDeadAgents: cond.removeDeadAgents,
            ubiEnabled: true, ubiRate: 0.01, ubiFrequency: 100,
        });
    }
}
