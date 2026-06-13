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
1. parameters.js — new parameters
2. agent.js — rounding helper + progressive TF
3. datamanager.js — maintain currentAverageWealth
4. population.js — UBI + tick counter
5. runs.js — 243 new batch_003 runs
6. Commit
