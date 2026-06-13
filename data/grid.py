import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.colors as colors
import os

# ─────────────────────────────────────────────
# Command line argument: run set name
# e.g. TF_Null, TF_Preserve, TF_Remove, YS_Null, YS_Preserve, YS_Remove
# ─────────────────────────────────────────────
if len(sys.argv) < 2:
    print("Usage: python grid.py <run_set> [data_dir]")
    print("  run_set: e.g. TF_Null, TF_Preserve, TF_Remove, YS_Null, YS_Preserve, YS_Remove")
    print("  data_dir: optional path to data folder (default: ./data)")
    sys.exit(1)

RUN_SET  = sys.argv[1]
DATA_DIR = sys.argv[2] if len(sys.argv) > 2 else "./data"

RATES        = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
NUM_BUCKETS  = 20
EPOCH        = 1001   # full epoch length — all series padded to this
MIN_SURVIVAL = 0.3    # stop drawing Gini line below this fraction of runs alive

METRIC_LABELS = [
    "avgPopulation", "avgUpperClass", "avgLowerClass", "avgNullPopulation",
    "avgGini", "avgAverageWealth", "avgMaxWealth", "avgMinWealth",
    "survivalRate"
]
GINI_ROW     = 4  # index of avgGini
SURVIVAL_ROW = 8  # index of survivalRate

def locf(arr, length):
    """Extend arr to `length` by repeating its last value."""
    arr = np.array(arr, dtype=float)
    if len(arr) >= length:
        return arr[:length]
    pad = np.full(length - len(arr), arr[-1] if len(arr) > 0 else 0.0)
    return np.concatenate([arr, pad])

def locf_nan(arr, length):
    """LOCF that preserves NaN — NaN entries indicate no surviving runs
    and are not carried forward into the padded region."""
    arr = np.array(arr, dtype=float)
    if len(arr) >= length:
        return arr[:length]
    non_nan = arr[~np.isnan(arr)]
    last_val = non_nan[-1] if len(non_nan) > 0 else np.nan
    pad = np.full(length - len(arr), last_val)
    return np.concatenate([arr, pad])

def zero_pad(arr, length):
    """Pad arr to `length` with zeros. For survival rate: once all runs
    have collapsed, the correct value is 0, not the last observed fraction."""
    arr = np.array(arr, dtype=float)
    if len(arr) >= length:
        return arr[:length]
    pad = np.zeros(length - len(arr))
    return np.concatenate([arr, pad])

def make_paths(run_set, rate):
    tag   = rate
    base  = os.path.join(DATA_DIR, f"{run_set}_{tag}")
    return f"{base}.csv", f"{base}_wealth_distribution.csv"

def read_main_csv(path):
    """Returns dict of metric_name → np.array of time-series values,
    padded to EPOCH via LOCF. Gini uses NaN-aware LOCF since collapsed
    ticks are written as empty CSV fields (survivor-conditional mean)."""
    rows = []
    with open(path, 'r') as f:
        for line in f:
            parts = line.strip().rstrip(',').split(',')
            vals = [float(x) if x.strip() != '' else np.nan for x in parts]
            rows.append(vals)
    result = {}
    for i, label in enumerate(METRIC_LABELS):
        if i < len(rows):
            arr = np.array(rows[i], dtype=float)
            # Gini: NaN-aware LOCF (NaN = no surviving runs)
            # survivalRate: zero-pad (after collapse, rate is 0 not last value)
            # everything else: regular LOCF
            if label == "avgGini":
                result[label] = locf_nan(arr, EPOCH)
            elif label == "survivalRate":
                result[label] = zero_pad(arr, EPOCH)
            else:
                result[label] = locf(arr, EPOCH)
    return result

def read_wealth_dist(path):
    """Returns array of shape (EPOCH, 20). Short runs padded to EPOCH
    by repeating the last row (LOCF)."""
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
    # Pad with empty rows (all zeros) after run ends — not LOCF.
    # Carrying the last row forward would show phantom agents frozen
    # in their final bucket. Zeros render as white = correct empty state.
    empty_row = [0.0] * NUM_BUCKETS
    while len(rows) < EPOCH:
        rows.append(empty_row)
    return np.array(rows[:EPOCH])  # (EPOCH, 20)

# ─────────────────────────────────────────────
# Colormap matching existing scripts
# ─────────────────────────────────────────────
def createColorMap():
    bottom    = plt.get_cmap("gist_rainbow_r")
    top       = plt.get_cmap("bwr_r")
    newcolors = np.vstack((
        top(np.linspace(0.5, 1, 24)),
        bottom(np.linspace(0.24, 1, 232))
    ))
    return colors.ListedColormap(newcolors, "newMap")

c_map = createColorMap()

# ─────────────────────────────────────────────
# Load all data
# ─────────────────────────────────────────────
dist_data     = {}
gini_data     = {}
survival_data = {}
missing       = []

for rate in RATES:
    main_path, dist_path = make_paths(RUN_SET, rate)
    tag = rate

    # Wealth distribution
    if os.path.exists(dist_path):
        try:
            dist_data[rate] = read_wealth_dist(dist_path)
        except Exception as e:
            print(f"WARNING: could not read {dist_path}: {e}")
            missing.append(rate)
    else:
        print(f"WARNING: not found: {dist_path}")
        missing.append(rate)

    # Gini + survival rate from main CSV
    if os.path.exists(main_path):
        try:
            metrics = read_main_csv(main_path)
            if "avgGini" in metrics:
                gini_data[rate] = metrics["avgGini"]
            if "survivalRate" in metrics:
                survival_data[rate] = metrics["survivalRate"]
        except Exception as e:
            print(f"WARNING: could not read {main_path}: {e}")
    else:
        print(f"WARNING: not found: {main_path}")

# ─────────────────────────────────────────────
# Layout: 3×3 grid
# ─────────────────────────────────────────────
plt.rcParams["font.family"] = "Times New Roman"
plt.rcParams["font.size"]   = 9

FIG_W = 7.5
FIG_H = 7.0

LEFT   = 0.07
RIGHT  = 0.88
TOP    = 0.95
BOTTOM = 0.07

fig, axes = plt.subplots(3, 3, figsize=(FIG_W, FIG_H))
fig.subplots_adjust(wspace=0.13, hspace=0.12,
                    left=LEFT, right=RIGHT,
                    top=TOP, bottom=BOTTOM)

# Colorbar
cbar_ax = fig.add_axes([0.90, BOTTOM, 0.018, TOP - BOTTOM])

vmin, vmax = 0, 1

for idx, rate in enumerate(RATES):
    row = idx // 3
    col = idx  % 3
    ax  = axes[row][col]
    tag = rate

    if rate in missing or rate not in dist_data:
        ax.text(0.5, 0.5, f"No data\n{RUN_SET}_{tag}",
                ha='center', va='center', transform=ax.transAxes,
                color='red', fontsize=10)
        ax.set_title(f"Rate = {rate:.1f}", fontsize=10, pad=3)
        continue

    dist = dist_data[rate]   # (T, 20)
    T    = dist.shape[0]

    # Normalize each time slice so columns sum to 1
    col_sums = dist.sum(axis=1, keepdims=True)
    col_sums[col_sums == 0] = 1
    dist_norm = dist / col_sums  # (T, 20)

    # Transpose to (20, T) for imshow, flip so bucket 0 is at bottom
    img = dist_norm.T[::-1, :]  # (20, T)

    ax.imshow(
        img,
        aspect='auto',
        interpolation='nearest',
        cmap=c_map,
        vmin=vmin, vmax=vmax,
        origin='upper',
        extent=[0, T - 1, NUM_BUCKETS - 0.5, -0.5]
    )

    # Dashed grey line between 5th and 6th buckets
    ax.axhline(y=14.5, color='black', linestyle='--', linewidth=0.8, alpha=0.7)

    # Twin axis: Gini (red) and survival rate (black dashed) — only if data present
    ax2 = ax.twinx()
    ax2.set_ylim(0, 1)
    ax2.set_yticks([])

    x = np.arange(T)

    if rate in gini_data:
        gini = gini_data[rate][:T]
        # Plot until data naturally ends; NaN (no surviving runs) breaks the line
        ax2.plot(x, gini, color='red', linewidth=1.2, alpha=0.9)

    if rate in survival_data:
        surv = survival_data[rate][:T]
        ax2.plot(x, surv, color='black', linewidth=1.0,
                 linestyle='--', alpha=0.85)

    # Title
    ax.set_title(f"Rate = {rate:.1f}", fontsize=10, pad=3)

    # X ticks: bottom row only
    if row == 2:
        tick_pos = [0, T // 5, 2 * T // 5, 3 * T // 5, 4 * T // 5, T - 1]
        tick_lbl = ["0", "2000", "4000", "6000", "8000", "10000"]
        ax.set_xticks(tick_pos)
        ax.set_xticklabels(tick_lbl, fontsize=10)
    else:
        ax.set_xticks([])

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

# ─────────────────────────────────────────────
# Colorbar
# ─────────────────────────────────────────────
sm = plt.cm.ScalarMappable(cmap=c_map, norm=plt.Normalize(vmin=0, vmax=1))
sm.set_array([])
cbar = fig.colorbar(sm, cax=cbar_ax)
cbar.set_label("% of agents", fontsize=10, rotation=90, labelpad=4)
cbar.set_ticks(np.linspace(0, 1, 6))
cbar.set_ticklabels(
    [f"{int(v * 100)}%" for v in np.linspace(0, 1, 6)],
    rotation=90, va='center', fontsize=10
)

# ─────────────────────────────────────────────
# Labels + title
# ─────────────────────────────────────────────
fig.text(0.47, 0.01, "Time Steps", ha='center', fontsize=10)


# ─────────────────────────────────────────────
# Save
# ─────────────────────────────────────────────
out_path = f"./{RUN_SET}_wealth_dist_grid.png"
plt.savefig(out_path, dpi=300, bbox_inches='tight')
print(f"Saved to {out_path}")
plt.show()