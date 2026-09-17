(function () {
  const DATA_PATHS = {
    dimensions: "../framework/dimensions.json",
    countries: "../framework/countries.json",
    assessments: "../data/assessments.json",
  };

  const state = {
    dimensions: null,
    maturityScale: null,
    countries: null,
    meta: null,
    scores: null, // { countryCode: { dimId: score } }
    editMode: false,
    selectedCountry: null,
    sortBy: "overall",
    sortDir: "desc",
  };

  function scaleFor(score) {
    return state.maturityScale.find((m) => m.level === score) || state.maturityScale[0];
  }

  function overallForCountry(code) {
    const scores = state.scores[code];
    const vals = state.dimensions.map((d) => scores[d.id] ?? 0);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  function regionalAverageForDim(dimId) {
    const vals = state.countries.map((c) => state.scores[c.code][dimId] ?? 0);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  function regionalIndexPct() {
    const totals = state.countries.map((c) => overallForCountry(c.code));
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    return Math.round((avg / 4) * 100);
  }

  async function loadData() {
    const [dimensionsRes, countriesRes, assessmentsRes] = await Promise.all([
      fetch(DATA_PATHS.dimensions),
      fetch(DATA_PATHS.countries),
      fetch(DATA_PATHS.assessments),
    ]);
    const dimensionsJson = await dimensionsRes.json();
    state.dimensions = dimensionsJson.dimensions;
    state.maturityScale = dimensionsJson.maturityScale;
    state.countries = await countriesRes.json();
    const assessmentsJson = await assessmentsRes.json();
    state.meta = assessmentsJson._meta;
    state.scores = assessmentsJson.scores;
  }

  function renderStats() {
    const statRow = document.getElementById("stat-row");
    const pct = regionalIndexPct();
    const dimCount = state.dimensions.length;
    const countryCount = state.countries.length;
    statRow.innerHTML = `
      <div class="stat"><div class="value">${pct}%</div><div class="label">Regional STEM standardisation index</div></div>
      <div class="stat"><div class="value">${countryCount}</div><div class="label">Member states tracked</div></div>
      <div class="stat"><div class="value">${dimCount}</div><div class="label">Standardisation dimensions</div></div>
    `;
    document.getElementById("meta-note").textContent = state.meta
      ? `Data last updated: ${state.meta.lastUpdated} (${state.meta.updatedBy}). ${state.meta.description}`
      : "";
  }

  function renderLegend() {
    const legend = document.getElementById("legend");
    legend.innerHTML = state.maturityScale
      .map((m) => `<span><span class="swatch" style="background:${m.color}"></span>${m.level} &ndash; ${m.label}</span>`)
      .join("");
  }

  function renderRegionalChart() {
    const el = document.getElementById("regional-chart");
    el.innerHTML = state.dimensions
      .map((d) => {
        const avg = regionalAverageForDim(d.id);
        const pct = (avg / 4) * 100;
        const color = scaleFor(Math.round(avg)).color;
        return `
          <div class="bar-row">
            <span>${d.name}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
            <span>${avg.toFixed(1)}</span>
          </div>
        `;
      })
      .join("");
  }

  function sortedCountries() {
    const list = [...state.countries];
    list.sort((a, b) => {
      let av, bv;
      if (state.sortBy === "overall") {
        av = overallForCountry(a.code);
        bv = overallForCountry(b.code);
      } else if (state.sortBy === "name") {
        av = a.name;
        bv = b.name;
      } else {
        av = state.scores[a.code][state.sortBy] ?? 0;
        bv = state.scores[b.code][state.sortBy] ?? 0;
      }
      if (av < bv) return state.sortDir === "asc" ? -1 : 1;
      if (av > bv) return state.sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }

  function renderMatrix() {
    const head = document.getElementById("matrix-head");
    head.innerHTML =
      `<th data-sort="name">Country</th>` +
      state.dimensions.map((d) => `<th data-sort="${d.id}" title="${d.name}">${abbrev(d.name)}</th>`).join("") +
      `<th data-sort="overall">Overall</th>`;

    head.querySelectorAll("th").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.getAttribute("data-sort");
        if (state.sortBy === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortBy = key;
          state.sortDir = "desc";
        }
        renderMatrix();
      });
    });

    const body = document.getElementById("matrix-body");
    body.innerHTML = "";
    sortedCountries().forEach((c) => {
      const tr = document.createElement("tr");
      const nameTd = document.createElement("td");
      nameTd.textContent = c.name;
      nameTd.addEventListener("click", () => selectCountry(c.code));
      tr.appendChild(nameTd);

      state.dimensions.forEach((d) => {
        const td = document.createElement("td");
        const score = state.scores[c.code][d.id] ?? 0;
        if (state.editMode) {
          const input = document.createElement("input");
          input.type = "number";
          input.min = 0;
          input.max = 4;
          input.value = score;
          input.style.background = scaleFor(score).color;
          input.addEventListener("change", (e) => {
            let v = parseInt(e.target.value, 10);
            if (isNaN(v)) v = 0;
            v = Math.max(0, Math.min(4, v));
            state.scores[c.code][d.id] = v;
            renderAll();
          });
          td.appendChild(input);
        } else {
          const span = document.createElement("span");
          span.className = "cell";
          span.style.background = scaleFor(score).color;
          span.textContent = score;
          td.appendChild(span);
        }
        tr.appendChild(td);
      });

      const overallTd = document.createElement("td");
      overallTd.innerHTML = `<strong>${overallForCountry(c.code).toFixed(1)}</strong>`;
      tr.appendChild(overallTd);

      body.appendChild(tr);
    });
  }

  function abbrev(name) {
    return name
      .split(/[\s&]+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  function selectCountry(code) {
    state.selectedCountry = code;
    renderDetail();
  }

  function renderDetail() {
    const panel = document.getElementById("detail-panel");
    if (!state.selectedCountry) {
      panel.classList.remove("active");
      return;
    }
    panel.classList.add("active");
    const country = state.countries.find((c) => c.code === state.selectedCountry);
    document.getElementById("detail-title").textContent = `${country.name} — STEM standardisation detail`;

    const grid = document.getElementById("detail-grid");
    const scores = state.scores[country.code];
    grid.innerHTML = state.dimensions
      .map((d) => {
        const score = scores[d.id] ?? 0;
        const level = scaleFor(score);
        return `
          <div class="detail-card">
            <div class="dim-name">${d.name}</div>
            <div class="dim-score" style="color:${level.color}">${score} &ndash; ${level.label}</div>
          </div>
        `;
      })
      .join("");

    const ranked = [...state.dimensions].sort((a, b) => (scores[a.id] ?? 0) - (scores[b.id] ?? 0));
    const weakest = ranked.slice(0, 3);
    const actionsEl = document.getElementById("detail-actions");
    actionsEl.innerHTML = weakest
      .flatMap((d) => d.actions.slice(0, 2).map((a) => `<li><span class="dim-tag">${d.name}</span>${a}</li>`))
      .join("");
  }

  function renderAll() {
    renderStats();
    renderLegend();
    renderRegionalChart();
    renderMatrix();
    renderDetail();
  }

  function download(filename, content) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function init() {
    await loadData();
    renderAll();

    document.getElementById("edit-toggle").addEventListener("click", (e) => {
      state.editMode = !state.editMode;
      e.target.textContent = state.editMode ? "Disable editing" : "Enable editing";
      renderMatrix();
    });

    document.getElementById("download-btn").addEventListener("click", () => {
      const payload = {
        _meta: {
          description: state.meta.description,
          lastUpdated: new Date().toISOString().slice(0, 10),
          updatedBy: "dashboard-edit",
        },
        scores: state.scores,
      };
      download("assessments.json", JSON.stringify(payload, null, 2));
    });

    document.getElementById("reset-btn").addEventListener("click", async () => {
      await loadData();
      renderAll();
    });
  }

  init();
})();
