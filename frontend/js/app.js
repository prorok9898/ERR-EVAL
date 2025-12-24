/**
 * MIRAGE REFERENCE IMPLEMENTATION
 * High-fidelity interaction logic & Chart.js configuration
 */

// STATE
let state = {
    data: null,
    filtered: [],
    radarChart: null,
    barChart: null
};

// AESTHETIC CONFIG (Matches CSS)
const THEME = {
    void: '#050505',
    text: '#e0e0e0',
    muted: '#666666',
    signal: '#70FF8B',
    signalDim: 'rgba(112, 255, 139, 0.2)',
    error: '#FF5C5C',
    grid: '#1f1f1f',
    font: 'Chivo Mono'
};

// INIT
document.addEventListener('DOMContentLoaded', async () => {
    Chart.defaults.font.family = THEME.font;
    Chart.defaults.color = THEME.muted;

    await loadData();
    setupInteractions();
    renderAll();
});

async function loadData() {
    try {
        const res = await fetch('data/results.json');
        if (!res.ok) throw new Error('Data Access Failure');
        const json = await res.json();

        state.data = json;
        state.filtered = [...(json.entries || [])];

        // Update hero metrics
        document.getElementById('total-models').textContent =
            state.filtered.length.toString().padStart(2, '0');

    } catch (e) {
        console.warn('[MIRAGE] System Status: Awaiting Data', e);
        // Fallback for visual testing if file is empty/missing
        state.data = { entries: [] };
        state.filtered = [];
    }
}

function setupInteractions() {
    const search = document.getElementById('search-input');
    const sort = document.getElementById('sort-select');

    search.addEventListener('input', (e) => {
        applyFilters(e.target.value, sort.value);
    });

    sort.addEventListener('change', (e) => {
        applyFilters(search.value, e.target.value);
    });
}

function applyFilters(term, method) {
    let result = [...state.data.entries];

    // Search
    if (term) {
        const t = term.toLowerCase();
        result = result.filter(entry =>
            entry.model_name.toLowerCase().includes(t) ||
            entry.model_id.toLowerCase().includes(t)
        );
    }

    // Sort
    if (method === 'overall') {
        result.sort((a, b) => b.overall_score - a.overall_score);
    } else {
        result.sort((a, b) =>
            (b.axis_scores[method] || 0) - (a.axis_scores[method] || 0)
        );
    }

    // Re-rank
    result.forEach((item, index) => item.rank = index + 1);

    state.filtered = result;
    renderAll();
}

function renderAll() {
    renderLeaderboard();
    renderCharts();
}

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    const stub = document.getElementById('no-data-message');

    if (!state.filtered.length) {
        tbody.innerHTML = '';
        stub.style.display = 'block';
        return;
    }

    stub.style.display = 'none';
    tbody.innerHTML = state.filtered.map(entry => `
        <tr>
            <td class="col-rank">${String(entry.rank).padStart(2, '0')}</td>
            <td class="col-model">
                ${entry.model_name}
                <span class="model-sub">${entry.model_id}</span>
            </td>
            <td class="col-score">${entry.overall_score.toFixed(2)}</td>
            ${['A', 'B', 'C', 'D', 'E'].map(t => `
                <td class="col-track" style="color: ${getScoreColor(entry.track_scores[t])}">
                    ${(entry.track_scores[t] || 0).toFixed(1)}
                </td>
            `).join('')}
        </tr>
    `).join('');
}

function getScoreColor(val) {
    if (val >= 7) return THEME.signal;
    if (val >= 4) return '#ffffff';
    return THEME.muted; // Low scores fade into noise
}

function renderCharts() {
    const topModels = state.filtered.slice(0, 5);
    if (!topModels.length) return;

    // AXIS RADAR
    const radarCtx = document.getElementById('radar-chart');
    if (state.radarChart) state.radarChart.destroy();

    state.radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['Ambiguity', 'Hallucination', 'Localization', 'Strategy', 'Tone'],
            datasets: topModels.map((m, i) => ({
                label: m.model_name,
                data: [
                    m.axis_scores.ambiguity_detection,
                    m.axis_scores.hallucination_avoidance,
                    m.axis_scores.localization_of_uncertainty,
                    m.axis_scores.response_strategy,
                    m.axis_scores.epistemic_tone
                ],
                borderColor: i === 0 ? THEME.signal : '#444', // Top model gets signal color
                backgroundColor: i === 0 ? THEME.signalDim : 'transparent',
                borderWidth: i === 0 ? 2 : 1,
                pointRadius: 0
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    grid: { color: THEME.grid },
                    angleLines: { color: THEME.grid },
                    pointLabels: { color: THEME.text, font: { size: 10 } },
                    ticks: { display: false, max: 2, min: 0 }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: THEME.muted, boxWidth: 10 }
                }
            }
        }
    });

    // TRACK BAR
    const barCtx = document.getElementById('bar-chart');
    if (state.barChart) state.barChart.destroy();

    state.barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Perception', 'Semantics', 'False Premise', 'Underspecified', 'Conflicts'],
            datasets: topModels.map((m, i) => ({
                label: m.model_name,
                data: ['A', 'B', 'C', 'D', 'E'].map(t => m.track_scores[t]),
                backgroundColor: i === 0 ? THEME.signal : '#333',
                stack: 'group' + i // Separate stacks
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: THEME.text }
                },
                y: {
                    grid: { color: THEME.grid },
                    max: 10,
                    ticks: { color: THEME.muted }
                }
            },
            plugins: {
                legend: { display: false } // Minimalist - rely on hover or context
            }
        }
    });
}
