const intensityFactors = {
  low: 0.75,
  medium: 1.0,
  high: 1.3,
  extreme: 1.6,
};

const hazardModifiers = {
  flood: { exposure: 1.2, vulnerability: 1.0 },
  wildfire: { exposure: 1.0, vulnerability: 1.25 },
  earthquake: { exposure: 1.1, vulnerability: 1.35 },
  storm: { exposure: 1.15, vulnerability: 1.1 },
};

const assets = [
  {
    name: "River Intake Pump Station",
    type: "Pump Station",
    exposure: 78,
    vulnerability: 56,
    criticality: 92,
  },
  {
    name: "North Treatment Plant",
    type: "Treatment Plant",
    exposure: 62,
    vulnerability: 61,
    criticality: 95,
  },
  {
    name: "Elevated Storage Tank 3",
    type: "Storage",
    exposure: 48,
    vulnerability: 41,
    criticality: 74,
  },
  {
    name: "Interceptor Main Segment A",
    type: "Sewer Main",
    exposure: 70,
    vulnerability: 68,
    criticality: 84,
  },
  {
    name: "Backup Generator - South Zone",
    type: "Power Support",
    exposure: 40,
    vulnerability: 37,
    criticality: 81,
  },
];

const hazardTypeEl = document.getElementById("hazardType");
const intensityEls = [...document.querySelectorAll(".intensity")];
const runBtn = document.getElementById("runAnalysis");

const exposureWeightEl = document.getElementById("exposureWeight");
const vulnerabilityWeightEl = document.getElementById("vulnerabilityWeight");
const criticalityWeightEl = document.getElementById("criticalityWeight");

const exposureValueEl = document.getElementById("exposureValue");
const vulnerabilityValueEl = document.getElementById("vulnerabilityValue");
const criticalityValueEl = document.getElementById("criticalityValue");

const tableHeadRow = document.querySelector("#resultsTable thead tr");
const tableBody = document.querySelector("#resultsTable tbody");

function toNumber(value) {
  return Number.parseFloat(value);
}

function selectedIntensities() {
  return intensityEls.filter((el) => el.checked).map((el) => el.value);
}

function riskBand(score) {
  if (score < 30) return "low";
  if (score < 60) return "moderate";
  if (score < 80) return "high";
  return "severe";
}

function normalizeWeights(weights) {
  const total = weights.exposure + weights.vulnerability + weights.criticality;
  if (total === 0) {
    return { exposure: 0.34, vulnerability: 0.33, criticality: 0.33 };
  }
  return {
    exposure: weights.exposure / total,
    vulnerability: weights.vulnerability / total,
    criticality: weights.criticality / total,
  };
}

function scoreAsset(asset, hazardType, intensity, weights) {
  const hazard = hazardModifiers[hazardType];
  const baseScore =
    asset.exposure * hazard.exposure * weights.exposure +
    asset.vulnerability * hazard.vulnerability * weights.vulnerability +
    asset.criticality * weights.criticality;

  return Math.min(100, baseScore * intensityFactors[intensity]);
}

function renderTable() {
  const hazardType = hazardTypeEl.value;
  const intensities = selectedIntensities();

  const normalizedWeights = normalizeWeights({
    exposure: toNumber(exposureWeightEl.value),
    vulnerability: toNumber(vulnerabilityWeightEl.value),
    criticality: toNumber(criticalityWeightEl.value),
  });

  exposureValueEl.textContent = normalizedWeights.exposure.toFixed(2);
  vulnerabilityValueEl.textContent = normalizedWeights.vulnerability.toFixed(2);
  criticalityValueEl.textContent = normalizedWeights.criticality.toFixed(2);

  const fixedColumns = `
    <th>Asset</th>
    <th>Type</th>
    <th>Criticality</th>
  `;

  const intensityColumns = intensities
    .map((level) => `<th>${level[0].toUpperCase()}${level.slice(1)} Risk</th>`)
    .join("");

  tableHeadRow.innerHTML = fixedColumns + intensityColumns;

  if (!intensities.length) {
    tableBody.innerHTML =
      '<tr><td colspan="7">Select at least one intensity level to compare risk.</td></tr>';
    return;
  }

  tableBody.innerHTML = assets
    .map((asset) => {
      const riskCells = intensities
        .map((intensity) => {
          const score = scoreAsset(asset, hazardType, intensity, normalizedWeights);
          const band = riskBand(score);
          return `<td class="numeric"><span class="risk-pill ${band}">${score.toFixed(1)}</span></td>`;
        })
        .join("");

      return `
        <tr>
          <td>${asset.name}</td>
          <td>${asset.type}</td>
          <td class="numeric">${asset.criticality}</td>
          ${riskCells}
        </tr>
      `;
    })
    .join("");
}

[exposureWeightEl, vulnerabilityWeightEl, criticalityWeightEl].forEach((el) => {
  el.addEventListener("input", renderTable);
});

hazardTypeEl.addEventListener("change", renderTable);
intensityEls.forEach((el) => el.addEventListener("change", renderTable));
runBtn.addEventListener("click", renderTable);

renderTable();
