"""
figure1.py — Boundary Asymmetry: TF_Preserve | TF_Null | TF_Remove at a fixed rate.
Usage: python figure1.py <rate_index> [data_dir]
  rate_index: 1-9 (1=0.1, 2=0.2, ... 9=0.9)
  data_dir:   optional path to data folder (default: ./data)
"""

import sys
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as colors
import os

if len(sys.argv) < 2:
    print("Usage: python figure1.py <rate_index> [data_dir]")
    print("  rate_index: 1–9")
    sys.exit(1)

RATE_IDX = int(sys.argv[1])
DATA_DIR = sys.argv[2] if len(sys.argv) > 2 else "./data"

ALL_RATES   = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
RATE        = ALL_RATES[RATE_IDX - 1]
RATE_TAG    = f"0.{int(round(RATE * 10))}"
CONDITIONS  = ["TF_Preserve", "TF_Null", "TF_Remove"]
LABELS      = ["Preserve", "Null", "Remove"]
NUM_BUCKETS = 20
EPOCH       = 1001

METRIC_LABELS = [
    "avgPopulation", "avgUpperClass", "avgLowerClass", "avgNullPopulation",
    "avgGini", "avgAverageWealth", "avgMaxWealth", "avgMinWealth",
    "survivalRate"
]

# ── helpers ──────────────────────────────────────────────────────────────────

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

def zero_pad(arr, length):
    arr = np.array(arr, dtype=float)
    if len(arr) >= length: return arr[:length]
    return np.concatenate([arr, np.zeros(length - len(arr))])

def fix_gini_at_collapse(metrics):
    """Set Gini to 0 wherever population has collapsed to ≤ 1 active agent.
    Gini is undefined / trivially 0 for a single-agent population, and LOCF
    can carry a noisy mid-collapse value forward if the run terminated before
    the final reporting tick.  avgPopulation is LOCF-padded to its last value,
    so this mask covers both the final tick and the padded region correctly.
    TF_Null and TF_Preserve are unaffected (population stays near 100).
    """
    if "avgGini" not in metrics or "avgPopulation" not in metrics:
        return metrics
    gini = metrics["avgGini"].copy()
    pop  = metrics["avgPopulation"]
    gini[pop <= 1.0] = 0.0
    metrics["avgGini"] = gini
    return metrics

def correct_gini_for_zeros(metrics, N=100):
    """Correct Gini for excluded zero-wealth agents.

    The sim computed Gini over survivors only (n_s agents), excluding zero-
    wealth agents from both the rank sum and the population count.  Excluding
    zeros from the wealth sum is fine (they contribute nothing), but their
    absence shifts every survivor's rank downward, biasing Gini low.

    The rank-shift correction resolves analytically to:
        Gini_correct = 1 - (n_s / N) * (1 - Gini_s)

    where n_s = avgPopulation (survivors) and N = initial population (100).
    This can be applied post-hoc because both quantities are saved to disk.

    Note: applied before fix_gini_at_collapse so collapsed ticks are still
    zeroed correctly afterward.
    """
    if "avgGini" not in metrics or "avgPopulation" not in metrics:
        return metrics
    gini_s = metrics["avgGini"].copy()
    n_s    = metrics["avgPopulation"]
    with np.errstate(invalid='ignore'):
        corrected = 1.0 - (n_s / N) * (1.0 - gini_s)
    corrected = np.clip(corrected, 0.0, 1.0)
    metrics["avgGini"] = corrected
    return metrics

def read_main_csv(path):
    rows = []
    with open(path, 'r') as f:
        for line in f:
            parts = line.strip().rstrip(',').split(',')
            rows.append([float(x) if x.strip() != '' else np.nan for x in parts])
    result = {}
    for i, label in enumerate(METRIC_LABELS):
        if i < len(rows):
            arr = np.array(rows[i], dtype=float)
            if label == "avgGini":
                result[label] = locf_nan(arr, EPOCH)
            elif label == "survivalRate":
                result[label] = zero_pad(arr, EPOCH)
            else:
                result[label] = locf(arr, EPOCH)
    return result

def read_wealth_dist(path):
    rows = []
    with open(path, 'r') as f:
        for line in f:
            parts = line.strip().rstrip(',').split(',')
            try:
                vals = [float(x) for x in parts if x.strip() != '']
                if len(vals) == NUM_BUCKETS:
                    rows.append(vals)
            except ValueError:
                pass
    if not rows:
        raise ValueError(f"No valid rows in {path}")
    empty = [0.0] * NUM_BUCKETS
    while len(rows) < EPOCH:
        rows.append(empty)
    return np.array(rows[:EPOCH])

def createColorMap():
    bottom    = plt.get_cmap("gist_rainbow_r")
    top       = plt.get_cmap("bwr_r")
    newcolors = np.vstack((
        top(np.linspace(0.5, 1, 24)),
        bottom(np.linspace(0.24, 1, 232))
    ))
    return colors.ListedColormap(newcolors, "newMap")

c_map = createColorMap()

# ── load data ─────────────────────────────────────────────────────────────────

data = {}
for cond in CONDITIONS:
    main_path = os.path.join(DATA_DIR, f"{cond}_{RATE_TAG}.csv")
    dist_path = os.path.join(DATA_DIR, f"{cond}_{RATE_TAG}_wealth_distribution.csv")
    entry = {}
    if os.path.exists(main_path):
        try:
            entry["metrics"] = read_main_csv(main_path)
            entry["metrics"] = correct_gini_for_zeros(entry["metrics"])
            entry["metrics"] = fix_gini_at_collapse(entry["metrics"])
        except Exception as e:
            print(f"WARNING: {main_path}: {e}")
    else:
        print(f"WARNING: not found: {main_path}")
    if os.path.exists(dist_path):
        try:
            entry["dist"] = read_wealth_dist(dist_path)
        except Exception as e:
            print(f"WARNING: {dist_path}: {e}")
    else:
        print(f"WARNING: not found: {dist_path}")
    data[cond] = entry

# ── layout ────────────────────────────────────────────────────────────────────

plt.rcParams["font.family"] = "Times New Roman"
plt.rcParams["font.size"]   = 10

FIG_W, FIG_H = 7.5, 3.0
LEFT, RIGHT, TOP, BOTTOM = 0.07, 0.87, 0.88, 0.15

fig, axes = plt.subplots(1, 3, figsize=(FIG_W, FIG_H))
fig.subplots_adjust(wspace=0.12, left=LEFT, right=RIGHT, top=TOP, bottom=BOTTOM)

cbar_ax = fig.add_axes([0.89, BOTTOM, 0.018, TOP - BOTTOM])

for col, (cond, label) in enumerate(zip(CONDITIONS, LABELS)):
    ax  = axes[col]
    ax.set_title(label, fontsize=10, pad=4)

    entry = data.get(cond, {})
    if "dist" not in entry:
        ax.text(0.5, 0.5, f"No data\n{cond}", ha='center', va='center',
                transform=ax.transAxes, color='red', fontsize=10)
        continue

    dist = entry["dist"]
    T    = dist.shape[0]

    col_sums = dist.sum(axis=1, keepdims=True)
    col_sums[col_sums == 0] = 1
    img = (dist / col_sums).T[::-1, :]

    ax.imshow(img, aspect='auto', interpolation='nearest', cmap=c_map,
              vmin=0, vmax=1, origin='upper',
              extent=[0, T - 1, NUM_BUCKETS - 0.5, -0.5])

    # Dashed grey line between 5th and 6th buckets
    ax.axhline(y=14.5, color='black', linestyle='--', linewidth=0.8, alpha=0.7)

    ax2 = ax.twinx()
    ax2.set_ylim(0, 1)
    ax2.set_yticks([])

    x = np.arange(T)
    if "metrics" in entry:
        m = entry["metrics"]
        if "avgGini" in m:
            ax2.plot(x, m["avgGini"][:T], color='red', linewidth=1.2, alpha=0.9)
        if "survivalRate" in m:
            ax2.plot(x, m["survivalRate"][:T], color='black', linewidth=1.0,
                     linestyle='--', alpha=0.85)

    # x ticks on all panels for this single-row figure
    tick_pos = [0, T // 5, 2 * T // 5, 3 * T // 5, 4 * T // 5, T - 1]
    ax.set_xticks(tick_pos)
    ax.set_xticklabels(["0", "2000", "4000", "6000", "8000", "10000"], fontsize=10)

    # Y ticks: left column only
    if col == 0:
        ax.set_yticks([0.5, 14.5, NUM_BUCKETS - 0.5])
        ax.set_yticklabels(["\$380", "\$100", "\$0"], fontsize=10)
        ax.set_ylabel("Wealth", fontsize=10, labelpad=-15)
    else:
        ax.set_yticks([])

    for spine in ax.spines.values():
        spine.set_visible(True)
        spine.set_linewidth(0.7)

# colorbar
sm = plt.cm.ScalarMappable(cmap=c_map, norm=plt.Normalize(vmin=0, vmax=1))
sm.set_array([])
cbar = fig.colorbar(sm, cax=cbar_ax)
cbar.set_label("% of agents", fontsize=10, rotation=90, labelpad=4)
cbar.set_ticks(np.linspace(0, 1, 6))
cbar.set_ticklabels([f"{int(v*100)}%" for v in np.linspace(0, 1, 6)],
                    rotation=90, va='center', fontsize=10)

fig.text(0.47, 0.02, "Time (relative)", ha='center', fontsize=10)

out = f"./figure1_rate{RATE_IDX}.png"
plt.savefig(out, dpi=300, bbox_inches='tight')
print(f"Saved to {out}")
plt.show()
