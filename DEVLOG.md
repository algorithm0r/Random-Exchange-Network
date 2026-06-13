# DEVLOG — Random Exchange Extended Experiments

Most recent entries at top.

---

## 2026-06-13

### Session start
Beginning implementation of batch_003 experiments for JASSS journal submission.
Repo initialized. Existing batch_002 code committed as baseline.

**Rounding mode hypothesis clarification (from discussion):**
- Continuous mode: wealth approaches zero asymptotically, `wealth <= 0` boundary never triggers.
  Null/Remove boundaries are therefore inert in continuous mode.
  Hypothesis: condensation dynamics are qualitatively identical to ceiling because sub-1 wealth
  agents contribute negligible amounts to trades — the discretization assumption is irrelevant.
- Floor mode: effective minimum wealth = ceil(1/rate), agents genuinely freeze above zero.
  This is where rounding mode *changes* the qualitative dynamics.
- Ceiling (batch_002 baseline): zero reachable even from wealth=1, sharp condensation.

**Implementation order:**
1. parameters.js — new parameters ✓
2. agent.js — rounding helper + progressive TF ✓
3. datamanager.js — maintain currentAverageWealth ✓
4. population.js — UBI + tick counter ✓
5. runs.js — 243 new batch_003 runs ✓
6. Commit ✓ (7b59c6d)

**Run counts verified:** 54 batch_002 + 243 batch_003 = 297 total
- Experiment A (reachability): 126 runs
- Experiment B (rounding): 54 runs
- Experiment C (TF-P): 27 runs
- Experiment D (UBI): 36 runs

**Status:** Phases 1, 2, & 3 complete.

### Automated test suite (test.js)
Built headless Node.js test suite using `vm.createContext` to run simulation files outside the browser.
29 tests, all passing. Covers:
- Run definitions: batch_003 count (243), total count (297), run naming conventions
- Rounding modes: unit tests for ceiling/floor/continuous + full simulation behavior
- Wealth conservation: UBI conserves total wealth exactly across all cases
- Progressive TF: rate scales correctly with wealth relative to average
- UBI timing: fires every N ticks as configured, not on tick 0
- Backward compatibility: batch_002 baseline parameters unchanged

Implementation notes:
- `const`/`let`/`class` declarations in `vm.runInContext` don't attach to context — patched via regex to `var` before eval
- Console stubbed in vm context to suppress DataManager output noise
- Continuous rounding test uses wealth=7, rate=0.3 (→ 2.1) to avoid coincidentally-integer result

Phase 3 verification is now automated. Run `node test.js` to confirm before adding new runs.

**Next:** Open sim in browser with MongoDB running, trigger "Start Experiment" to collect batch_003 data.
