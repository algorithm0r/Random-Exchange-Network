"""
figure2.py — Rate Threshold: survival fan for TF_Null, all 9 rates.
Usage: python figure2.py [data_dir]
  data_dir: optional path to data folder (default: ./data)
"""

import sys
import numpy as np
import matplotlib.pyplot as plt
import os

DATA_DIR = sys.argv[1] if len(sys.argv) > 1 else "./data"

ALL_RATES   = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
RATE_TAGS   = [f"0.{int(round(r * 10))}" for r in ALL_RATES]
RUN_SET     = "TF_Null"
EPOCH       = 1001

METRIC_LABELS = [
    "avgPopulation", "avgUpperClass", "avgLowerClass", "avgNullPopulation",
    "avgGini", "avgAverageWealth", "avgMaxWealth", "avgMinWealth",
    "survivalRate"
]

STABLE_RATES    = [r for r in ALL_RATES if r <= 0.5]
COLLAPSE_RATES  = [0.6, 0.7, 0.8, 0.9]
COLLAPSE_COLORS = ["#e9c46a", "#f4a261", "#e76f51", "#9b2226"]  # warm yellow → dark red

# ── helpers ───────────────────────────────────────────────────────────────────

def zero_pad(arr, length):
    arr = np.array(arr, dtype=float)
    if len(arr) >= length: return arr[:length]
    return np.concatenate([arr, np.zeros(length - len(arr))])

def locf(arr, length):
    arr = np.array(arr, dtype=float)
    if len(arr) >= length: return arr[:length]
    pad = np.full(length - len(arr), arr[-1] if len(arr) > 0 else 0.0)
    return np.concatenate([arr, pad])

def locf_nan(arr, length):
    arr = np.array(arr, dtype=float)
    if len(arr) >= length: return arr[:length]
    non_nan = arr[~np.isnan(arr)]
    last_val = non_nan[-1] if len(non_nan) > 0 else np.nan
    return np.concatenate([arr, np.full(length - len(arr), last_val)])

def read_survival(path):
    rows = []
    with open(path, 'r') as f:
        for line in f:
            parts = line.strip().rstrip(',').split(',')
            rows.append([float(x) if x.strip() != '' else np.nan for x in parts])
    for i, label in enumerate(METRIC_LABELS):
        if label == "survivalRate" and i < len(rows):
            return zero_pad(np.array(rows[i], dtype=float), EPOCH)
    return None

# ── load ──────────────────────────────────────────────────────────────────────

survival_data = {}
for rate, tag in zip(ALL_RATES, RATE_TAGS):
    path = os.path.join(DATA_DIR, f"{RUN_SET}_{tag}.csv")
    if os.path.exists(path):
        try:
            s = read_survival(path)
            if s is not None:
                survival_data[rate] = s
        except Exception as e:
            print(f"WARNING: {path}: {e}")
    else:
        print(f"WARNING: not found: {path}")

# ── plot ──────────────────────────────────────────────────────────────────────

plt.rcParams["font.family"] = "Times New Roman"
plt.rcParams["font.size"]   = 10

fig, ax = plt.subplots(figsize=(5.5, 3.5))
fig.subplots_adjust(left=0.11, right=0.78, top=0.95, bottom=0.13)

x = np.arange(EPOCH)

# Stable rates — all plotted in light gray, only first gets a legend entry
stable_labeled = False
for rate in STABLE_RATES:
    if rate not in survival_data:
        continue
    label = "r ≤ 0.5" if not stable_labeled else "_nolegend_"
    stable_labeled = True
    ax.plot(x, survival_data[rate], color="#cccccc", linewidth=1.0,
            alpha=0.9, label=label)

# Collapsing rates — distinct warm colors, individual legend entries
for rate, color in zip(COLLAPSE_RATES, COLLAPSE_COLORS):
    if rate not in survival_data:
        continue
    ax.plot(x, survival_data[rate], color=color, linewidth=1.5,
            alpha=0.95, label=f"r = {rate:.1f}")

ax.set_ylim(-0.05, 1.05)
ax.set_ylabel("Non-condensed rate", fontsize=10)
ax.set_yticks(np.arange(0, 1.1, 0.2))
ax.yaxis.set_tick_params(labelsize=10)
ax.axhline(0.0, color='gray', linewidth=0.5, linestyle=':')
ax.axhline(1.0, color='gray', linewidth=0.5, linestyle=':')

tick_pos = [0, EPOCH // 5, 2 * EPOCH // 5, 3 * EPOCH // 5, 4 * EPOCH // 5, EPOCH - 1]
ax.set_xticks(tick_pos)
ax.set_xticklabels(["0", "2000", "4000", "6000", "8000", "10000"], fontsize=10)
ax.set_xlabel("Time Steps", fontsize=10)

ax.legend(loc='center right', bbox_to_anchor=(1.28, 0.5),
          fontsize=10, frameon=True, title="Rate", title_fontsize=10)
for spine in ax.spines.values():
    spine.set_linewidth(0.7)
ax.grid(axis='y', linewidth=0.4, alpha=0.4)

out = f"./figure2_{RUN_SET}_survival.png"
plt.savefig(out, dpi=300, bbox_inches='tight')
print(f"Saved to {out}")
plt.show()