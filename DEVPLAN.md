# DEVPLAN — Random Exchange Extended Experiments (batch_003)

## Goal
Extend the simulation for a JASSS journal submission. Three categories:
1. Strengthen existing results (reachability hypothesis, statistical rigor)
2. New rounding modes (floor, continuous) — promote ceiling footnote to a finding
3. New exchange rule: TF-Progressive (TF-P)
4. New intervention mechanism: UBI redistribution

---

## Experimental Design

### Experiment A: Reachability Sweep
**Question:** Does TF+Null condensation depend on how statistically reachable zero is?  
**Hypothesis:** Condensation threshold shifts predictably with initial wealth and epoch length.

Variables:
- `initialWealth`: 10, 25, 50, 200, 500 (baseline 100 already in batch_002)
- `epoch`: 1000, 2500, 5000, 50000 (baseline 10000 already in batch_002)
- `giveRate`: 0.1–0.9 (9 values)
- Rule × Boundary: TF+Null (primary), TF+Preserve (control confirming no condensation)

Runs: 126 total  
Collection: `batch_003`  
Name format: `TF_Null_W{wealth}_{rate}`, `TF_Null_E{epoch}_{rate}`, `TF_Preserve_W{wealth}_{rate}`

---

### Experiment B: Rounding Modes
**Question:** Is the ceiling function central to condensation dynamics, or incidental?  
**Hypothesis:** Floor creates a rate-dependent implicit wealth floor (agents freeze at ~1/rate); continuous never reaches zero and behaves like Preserve regardless of rule.

Variables:
- `roundingMode`: `floor`, `continuous` (ceiling = batch_002 baseline)
- Applied to: TF+Preserve, TF+Null, YS+Preserve
- `giveRate`: 0.1–0.9

Floor implicit floor: agents with wealth < 1/rate give 0, freezing at that level.  
Continuous: zero approached asymptotically, never reached — functional Preserve regardless of rule.

Runs: 54 total  
Collection: `batch_003`  
Name format: `TF_Preserve_Floor_{rate}`, `TF_Null_Cont_{rate}`, etc.

---

### Experiment C: Progressive TF (TF-P)
**Question:** Does progressive scaling of the exchange rate suppress condensation?  
**Rule:** `effectiveRate = min(1.0, giveRate * (wealth / avgWealth)^progressiveAlpha)`  
- Agent at average wealth gives at base rate
- Richer agents give proportionally more; poorer agents give proportionally less
- `progressiveAlpha = 1.0` (linear); generalizable with higher alpha

Variables:
- Rule: TF-P (`yardsale: false, progressiveTF: true, progressiveAlpha: 1.0`)
- Boundary: Preserve, Null, Remove
- `giveRate`: 0.1–0.9

Runs: 27 total  
Collection: `batch_003`  
Name format: `TFP_Preserve_{rate}`, `TFP_Null_{rate}`, `TFP_Remove_{rate}`

---

### Experiment D: UBI Redistribution
**Question:** Can a periodic wealth tax + equal redistribution prevent or reverse condensation?  
**Mechanism:** Every `ubiFrequency` ticks, each agent contributes `floor(wealth * ubiRate)` to a pool; pool distributed equally (floor per agent, remainder to random agent). Total wealth conserved exactly.  
- `ubiRate = 0.01` (1% tax)
- `ubiFrequency = 100` ticks

Applied to most interesting combinations:
- TF+Null (primary: can UBI prevent TF condensation?)
- TF+Remove (does UBI help when agents are eliminated?)
- YS+Null (can UBI counteract the implicit absorbing boundary in YS?)
- YS+Preserve (control: already stable, what does UBI do to distribution shape?)

Variables:
- `ubiEnabled: true`, all other params as batch_002 baseline
- `giveRate`: 0.1–0.9

Runs: 36 total  
Collection: `batch_003`  
Name format: `TF_Null_UBI_{rate}`, `YS_Preserve_UBI_{rate}`, etc.

---

## Implementation Phases

### Phase 1: Core Engine Changes
- [x] `parameters.js` — add `roundingMode`, `progressiveTF`, `progressiveAlpha`, `currentAverageWealth`, `ubiEnabled`, `ubiRate`, `ubiFrequency`
- [x] `agent.js` — `applyRounding()` helper; progressive TF logic in `earnFrom()`/`payTo()`
- [x] `population.js` — `applyUBI()` method + `this.tick` counter for UBI timing
- [x] `datamanager.js` — write `PARAMETERS.currentAverageWealth` each reporting period

### Phase 2: Experiment Definitions
- [x] `runs.js` — Experiment A: reachability (126 runs)
- [x] `runs.js` — Experiment B: rounding modes (54 runs)
- [x] `runs.js` — Experiment C: TF-P (27 runs)
- [x] `runs.js` — Experiment D: UBI (36 runs)

### Phase 3: Verification (manual, in browser)
- [ ] `TF_Preserve_Floor_0.5` — expect no condensation; agents freeze above 0
- [ ] `TF_Null_Cont_0.5` — expect no condensation even with Null boundary
- [ ] `TF_Null_W10_0.5` — expect faster/more certain condensation vs baseline W100
- [ ] `TFP_Null_0.5` — expect shifted condensation threshold vs flat TF
- [ ] `TF_Null_UBI_0.5` — expect UBI to slow or prevent condensation

---

## Collection Structure
All new runs → `batch_003` (single MongoDB collection, distinguished by run name prefix)

## Run Name Convention
`{Rule}_{Boundary}[_{Modifier}]_{giveRate}`
- Rule: `TF` | `YS` | `TFP`
- Boundary: `Preserve` | `Null` | `Remove`
- Modifier (optional): `W{n}` | `E{n}` | `Floor` | `Cont` | `UBI`
- giveRate: `0.1`–`0.9`

## New Run Count
| Experiment | Runs |
|---|---|
| A: Reachability | 126 |
| B: Rounding modes | 54 |
| C: TF-Progressive | 27 |
| D: UBI | 36 |
| **Total** | **243** |
