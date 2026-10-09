// Teacher TIA What-If: scoring rules and math.
//
// Pure functions, no React: scoreTeacher(inputs) returns everything the
// page shows (averages, weighted points, TIA score, every requirement
// check, and the projected designation). TeacherWhatIf.jsx only draws it.

// ---- The rules --------------------------------------------------------

// The 16 T-TESS dimensions, in the order the rating chips appear.
export const DIMS_1_4 = ["1.1", "1.2", "1.3", "1.4", "4.1", "4.2", "4.3", "4.4"]
export const DIMS_2_3 = ["2.1", "2.2", "2.3", "2.4", "2.5", "3.1", "3.2", "3.3"]

// The T-TESS rubric's name for each dimension.
export const DIMENSION_NAMES = {
  "1.1": "Standards and Alignment", "1.2": "Data and Assessment",
  "1.3": "Knowledge of Students", "1.4": "Activities",
  "2.1": "Achieving Expectations", "2.2": "Content Knowledge and Expertise",
  "2.3": "Communication", "2.4": "Differentiation", "2.5": "Monitor and Adjust",
  "3.1": "Classroom Environment, Routines and Procedures",
  "3.2": "Managing Student Behavior", "3.3": "Classroom Culture",
  "4.1": "Professional Demeanor and Ethics", "4.2": "Goal Setting",
  "4.3": "Professional Development", "4.4": "School Community Involvement",
}

export const RATING_NAMES = {
  1: "Improvement Needed", 2: "Developing", 3: "Proficient",
  4: "Accomplished", 5: "Distinguished",
}

// Share of the 100-point TIA score each component is worth.
export const WEIGHTS = { d14: 10, d23: 35, growth: 55 }

// Designation minimums, highest first. A level is earned only when
// every minimum is met AND all 16 ratings are 3 or better; the first
// level (from the top) that passes is the designation.
export const LEVELS = [
  { name: "Master",       score: 79.0, growth: 0.70, avg: 4.5 },
  { name: "Exemplary",    score: 68.1, growth: 0.60, avg: 3.9 },
  { name: "Recognized",   score: 63.3, growth: 0.55, avg: 3.7 },
  { name: "Acknowledged", score: 59.0, growth: 0.50, avg: 3.5 },
]
export const NONE = "No designation"
export const DESIGNATIONS = [NONE, ...LEVELS.map((l) => l.name).reverse()]
const RANK = Object.fromEntries(DESIGNATIONS.map((d, i) => [d, i]))

const GATE_MIN = 3     // every rating must be at least Proficient
const EPS = 1e-9       // a value exactly on a minimum counts as met

// ---- Display helpers ----------------------------------------------------

// Truncate (never round) to p decimals, as text. toFixed(p + 4) first
// irons out binary float noise (31.487499999999997 → "31.48750000"),
// then the string is cut at p decimals.
export function trunc(x, p) {
  const s = Number(x).toFixed(p + 4)
  return s.slice(0, s.indexOf(".") + 1 + p)
}

// A cut point as the card prints it: 79 → "79.0", 0.7 → "70%", 4.5 → "4.5".
const cutText = (n) => (Number.isInteger(n) ? n.toFixed(1) : String(n))
const pctText = (fraction) => `${Math.round(fraction * 100)}%`

// ---- The calculation --------------------------------------------------

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length

// inputs = { ratings: { "1.1": 4, ... all 16 }, growthPct: 58.25,
//            current: "Recognized" }
export function scoreTeacher({ ratings, growthPct, current }) {
  const values14 = DIMS_1_4.map((c) => ratings[c])
  const values23 = DIMS_2_3.map((c) => ratings[c])
  const avg14 = mean(values14)
  const avg23 = mean(values23)
  const growth = growthPct / 100

  const points14 = (avg14 / 5) * WEIGHTS.d14
  const points23 = (avg23 / 5) * WEIGHTS.d23
  const pointsGrowth = growth * WEIGHTS.growth
  const score = points14 + points23 + pointsGrowth   // unrounded total

  // The 3-or-better rule across all 16 dimensions.
  const all = [...DIMS_1_4, ...DIMS_2_3].map((code) => ({ code, value: ratings[code] }))
  const lowest = Math.min(...all.map((d) => d.value))
  const lowCodes = all.filter((d) => d.value < GATE_MIN).map((d) => d.code)
  const gateOk = lowCodes.length === 0

  // Check every level, highest first; the first one fully met is earned.
  let designation = NONE
  const levels = LEVELS.map((L) => {
    const checks = {
      score:  { ok: score >= L.score - EPS,   cut: cutText(L.score),
                gap: trunc(L.score - score, 4) },
      growth: { ok: growth >= L.growth - EPS, cut: pctText(L.growth),
                gap: `${trunc((L.growth - growth) * 100, 2)}%` },
      d14:    { ok: avg14 >= L.avg - EPS,     cut: cutText(L.avg),
                gap: trunc(L.avg - avg14, 4) },
      d23:    { ok: avg23 >= L.avg - EPS,     cut: cutText(L.avg),
                gap: trunc(L.avg - avg23, 4) },
      gate:   { ok: gateOk, cut: String(GATE_MIN), gap: null },
    }
    const allOk = Object.values(checks).every((c) => c.ok)
    const earned = allOk && designation === NONE
    if (earned) designation = L.name
    return { name: L.name, checks, allOk, earned }
  })

  // A new designation is submitted only when it is higher than the
  // teacher's current active designation.
  const higher = RANK[designation] > RANK[current ?? NONE]

  return {
    avg14, avg23, growth, points14, points23, pointsGrowth, score,
    lowest, lowCodes, gateOk, levels, designation, higher,
    text: {
      avg14: trunc(avg14, 4), avg23: trunc(avg23, 4),
      growthPct: `${trunc(growth * 100, 2)}%`, growthDecimal: trunc(growth, 4),
      points14: trunc(points14, 4), points23: trunc(points23, 4),
      pointsGrowth: trunc(pointsGrowth, 4), score: trunc(score, 4),
    },
  }
}
