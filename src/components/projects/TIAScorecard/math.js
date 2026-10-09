// TIA scorecard math (SY 2023-24 weights and cut tables).
//
// Pure functions used by TIAScorecard.jsx. Results match the
// district's sample scorecards for Teacher Types 11 and 2.
//
// Two district rules shape the code:
//  - a type may have NO SURVEY (Types 1-4): the component vanishes
//    and the designation walk WAIVES that floor (a missing component
//    never fails a band);
//  - a growth measure may be CONTINUOUS ("score" mode — Amplify,
//    iReady): no rating label exists; the fractional 1-5 score is
//    ENTERED directly (the per-student average is computed upstream,
//    exactly like the district's own calculator, which has no
//    formula for these cells).

// ---- the district's display convention: TRUNCATE, never round ----
function trunc(x, p) {
  const s = Number(x).toFixed(p + 4)
  return s.slice(0, s.indexOf(".") + 1 + p)
}
export const trunc4 = (x) => trunc(x, 4)
export const trunc6 = (x) => trunc(x, 6)

// Author-voice numbers (4, 55, 83.19 — no forced decimals).
const g = (n) => String(Math.round(n * 1e9) / 1e9)

// A percentage weight in the district's fraction voice: 50 → ".50",
// 5 → ".05", 12.5 → ".125" (÷100; four decimals kept, trailing
// zeros trimmed down to two — so .50 stays ".50" but 12.5% never
// rounds to ".13").
function frac(w) {
  let s = (w / 100).toFixed(4)
  while (s.endsWith("0") && s.length - s.indexOf(".") - 1 > 2) {
    s = s.slice(0, -1)
  }
  return s.startsWith("0.") ? s.slice(1) : s
}

const EPS = 1e-9  // the cushion: exactly ON a cut counts as met

// ---- the embedded configs (SY23-24, handbook Appendix B) ----
export const TTESS_LEVELS = [
  { label: "Improvement needed (1)", value: 1 },
  { label: "Developing (2)", value: 2 },
  { label: "Proficient (3)", value: 3 },
  { label: "Accomplished (4)", value: 4 },
  { label: "Distinguished (5)", value: 5 },
]
export const DIMENSIONS = ["2.1","2.2","2.3","2.4","2.5","3.1","3.2","3.3"]
const DOMAIN_3 = ["3.1", "3.2", "3.3"]
export const OBSERVATIONS = [
  { label: "Observation 1", weight: 20, covers: DOMAIN_3 },
  { label: "Observation 2", weight: 50, covers: null },
  { label: "Observation 3", weight: 30, covers: null },
]
const GROWTH_LEVELS = { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5 }
const MAX_LEVEL = 5

// Measures carry a MODE: "level" (pick a rating, score looked up)
// or "score" (continuous — the fractional score entered directly).
const TYPES = {
  2: { ttessWeight: 50, surveyWeight: 0,
       measures: [
         { name: "Amplify", weight: 12.5, mode: "score" },
         { name: "iReady - Math", weight: 12.5, mode: "score" },
         { name: "Student Learning Objective", weight: 20,
           mode: "level" },
         { name: "Schoolwide STAAR", weight: 5, mode: "level" }] },
  10: { ttessWeight: 40, surveyWeight: 10,
        measures: [
          { name: "iStation", weight: 10, mode: "level" },
          { name: "STAAR VAM", weight: 25, mode: "level" },
          { name: "Student Learning Objective", weight: 10,
            mode: "level" },
          { name: "Schoolwide STAAR", weight: 5, mode: "level" }] },
  11: { ttessWeight: 45, surveyWeight: 10,
        measures: [
          { name: "Student Learning Objective", weight: 15,
            mode: "level" },
          { name: "STAAR VAM", weight: 25, mode: "level" },
          { name: "Schoolwide STAAR", weight: 5, mode: "level" }] },
}
export const TEACHER_TYPES = Object.keys(TYPES).map(Number)

// Everything the page needs to draw one teacher type's card.
export function configFor(teacherType) {
  const cfg = TYPES[teacherType]
  return {
    teacher_type: teacherType,
    dimensions: DIMENSIONS,
    observations: OBSERVATIONS,
    ttess_levels: TTESS_LEVELS,
    measures: cfg.measures.map((m) => ({ ...m })),
    growth_levels: Object.keys(GROWTH_LEVELS),
    survey_weight: cfg.surveyWeight,
  }
}

// Per-type starting inputs. Types 11 and 2 use the district sample
// scorecards' inputs; other types get generic 4s / 55-"3".
export function defaultsFor(type) {
  if (type === 11) return {
    ttess: [[null,4,4],[null,4,5],[null,4,4],[null,4,4],[null,4,4],
            [4,4,4],[4,4,4],[5,4,4]],
    growth: [[55, "3"], [83.19, "5"], [57.19, "5"]],
    survey: 4.094597,
  }
  if (type === 2) return {
    ttess: [[null,4,4],[null,4,4],[null,4,4],[null,4,4],[null,4,4],
            [4,5,4],[4,5,4],[5,5,4]],
    growth: [[76, 3.85], [73.0769, 4.1153], [70, "5"], [52.2, "4"]],
    survey: null,   // Type 2 has no survey component
  }
  const cfg = TYPES[type]
  return {
    ttess: DIMENSIONS.map((dim) => OBSERVATIONS.map((o) =>
      o.covers && !o.covers.includes(dim) ? null : 4)),
    growth: cfg.measures.map((m) =>
      m.mode === "score" ? [55, 3.5] : [55, "3"]),
    survey: cfg.surveyWeight > 0 ? 4.0 : null,
  }
}

// The cut tables as data: the same scores judged by different tables,
// so every difference in outcome comes from cut policy.
// Values are in the printed 5-scale voice; bandsFor converts to
// card points. Sources cited per table.
export const CUT_TABLES = {
  reference: {
    label: "24-25 reference cuts",
    source: "printed on the SY23-24 scorecards",
    bands: [
      { label: "Masters", overall: 4.5, ttess: 4.5, survey: 3, pct: 70 },
      { label: "Exemplary", overall: 4.1, ttess: 4.0, survey: 3, pct: 65 },
      { label: "Recognized", overall: 3.9, ttess: 3.8, survey: 3, pct: 60 },
    ],
  },
  actual2425: {
    label: "24-25 actual cuts",
    source: "the district's 24-25 scorecard tutorial video "
      + "transcript (the cuts actually applied)",
    bands: [
      { label: "Masters", overall: 4.3, ttess: 4.35, survey: 3, pct: 67.5 },
      { label: "Exemplary", overall: 3.8, ttess: 3.9, survey: 3, pct: 58.5 },
      { label: "Recognized", overall: 3.6, ttess: 3.7, survey: 3, pct: 53.5 },
    ],
  },
}

// Scale a cut table into card points for a type; survey floor
// WAIVED (null) when the type has no survey. maxPoints is 100 for
// every embedded type, but it is derived anyway in case that changes.
// `cuts` may be a CUT_TABLES key OR a table OBJECT of the same
// shape (the live cut editor passes objects).
function bandsFor(cfg, cuts) {
  const table = typeof cuts === "string" ? CUT_TABLES[cuts] : cuts
  const maxPoints = cfg.ttessWeight + cfg.surveyWeight
    + cfg.measures.reduce((a, m) => a + m.weight, 0)
  const graded = table.bands.map((b) => ({
    label: b.label,
    minTotal: b.overall * maxPoints / 5,
    ttessFloor: b.ttess * cfg.ttessWeight / 5,
    surveyFloor: cfg.surveyWeight === 0 ? null
      : b.survey * cfg.surveyWeight / 5,
    pctFloor: b.pct,
  }))
  return [...graded, { label: "Not Designated", minTotal: null,
                       ttessFloor: null, surveyFloor: null,
                       pctFloor: null }]
}

// ---- the computation ----
function compute(state, cutsId = "reference") {
  const cfg = TYPES[state.type]
  const hasSurvey = cfg.surveyWeight > 0

  // T-TESS: per-part weighted average, RENORMALIZED over the
  // observed cells (an unobserved cell never counts as a zero).
  const partScores = state.ttess.map((row) => {
    let num = 0, den = 0
    row.forEach((v, i) => {
      if (v !== null) { num += OBSERVATIONS[i].weight * v
                        den += OBSERVATIONS[i].weight }
    })
    return num / den
  })
  const mean = partScores.reduce((a, b) => a + b, 0) / partScores.length
  const ttessPoints = mean / 5 * cfg.ttessWeight

  // Eligibility: any single observed rating below Proficient (3)
  // makes the teacher ineligible, not the computed dimension average
  // (stricter, since a dimension can average 3 or more while
  // containing a 2). The scores still show; only the designation is
  // withheld.
  let ineligibleReason = null
  state.ttess.forEach((row, d) => {
    row.forEach((v, i) => {
      if (ineligibleReason === null && v !== null && v < 3 - EPS) {
        ineligibleReason = "dimension " + DIMENSIONS[d] + ", "
          + OBSERVATIONS[i].label + " rated " + g(v)
          + " — below the required Proficient (3)"
      }
    })
  })

  // Growth: score-mode measures use the ENTERED fractional score;
  // level-mode measures look their label up. The overall percent
  // aggregates the entered PERCENTS either way — two streams.
  let growthPoints = 0, pctNum = 0, pctDen = 0
  const growthRows = state.growth.map(([pct, val], i) => {
    const m = cfg.measures[i]
    const earned = m.mode === "score" ? Number(val)
                                      : GROWTH_LEVELS[val]
    growthPoints += earned / MAX_LEVEL * m.weight
    pctNum += m.weight * pct; pctDen += m.weight
    return { measure: m.name, percent: pct, mode: m.mode,
             label: m.mode === "score" ? null : val, earned }
  })
  const overallPercent = pctNum / pctDen

  const surveyPoints = hasSurvey
    ? state.survey / 5 * cfg.surveyWeight : 0
  const maxPoints = cfg.ttessWeight + pctDen + cfg.surveyWeight
  const total = ttessPoints + growthPoints + surveyPoints
  const overall5 = total / maxPoints * 5

  // The designation walk: top-down, first band whose EVERY minimum
  // is met; a null floor is WAIVED (no survey on this type);
  // ineligibility SKIPS the walk.
  const bands = bandsFor(cfg, cutsId)
  let designation
  const refusals = []
  if (ineligibleReason !== null) {
    designation = "Ineligible"
  } else {
    for (const b of bands) {
      if (b.minTotal === null) { designation = b.label; break }
      const totalOk = total >= b.minTotal - EPS
      const ttessOk = ttessPoints >= b.ttessFloor - EPS
      const surveyOk = b.surveyFloor === null
        || surveyPoints >= b.surveyFloor - EPS
      const pctOk = overallPercent >= b.pctFloor - EPS
      if (totalOk && ttessOk && surveyOk && pctOk) {
        designation = b.label; break
      }
      if (totalOk) {
        const parts = []
        if (!ttessOk) parts.push("T-TESS")
        if (!surveyOk) parts.push("Student Survey")
        if (!pctOk) parts.push("Overall %MEE")
        refusals.push({ band: b.label, minTotal: b.minTotal, parts })
      }
    }
  }

  return { cfg, hasSurvey, partScores, mean, ttessPoints,
           ineligibleReason, growthRows, overallPercent,
           growthPoints, surveyPoints, maxPoints, total, overall5,
           bands, designation, refusals }
}

// The note — in the page's own 5-SCALE voice.
function composeNote(r) {
  if (r.ineligibleReason !== null) {
    return "Ineligible for a designation: T-TESS ("
      + r.ineligibleReason + "). The scores above are still the true "
      + "math; the verdict is withheld."
  }
  if (!r.refusals.length) return null
  return r.refusals.map((ref) =>
    "The overall score (" + trunc6(r.overall5) + ") reached "
    + ref.band + "'s cutoff (" + g(ref.minTotal / r.maxPoints * 5)
    + "), but " + ref.parts.join(" and ")
    + " fell short of that level's minimum, so " + ref.band
    + " was not awarded.").join(" ")
}

// ---- the cut table (met flags + gaps; waived cells show "—") ----
function cutTable(r) {
  const scaledTotal = r.overall5
  const scaledTtess = r.mean
  const scaledSurvey = r.hasSurvey
    ? 5 * r.surveyPoints / r.cfg.surveyWeight : null
  const actuals = [trunc6(scaledTotal), trunc6(scaledTtess),
                   scaledSurvey === null ? "—" : trunc6(scaledSurvey),
                   trunc4(r.overallPercent) + "%"]
  const rows = r.bands.filter((b) => b.minTotal !== null).map((b) => {
    const cells = []
    const push = (cutScaled, have, haveRaw, floorRaw, isPct) => {
      if (floorRaw === null) {           // waived — no requirement
        cells.push({ text: "—", met: true, waived: true, gap: null })
        return
      }
      const met = haveRaw >= floorRaw - EPS
      cells.push({
        text: "≥ " + g(cutScaled) + (isPct ? "%" : ""),
        met, waived: false,
        gap: met ? null : "short by "
          + (isPct ? trunc4(cutScaled - have) + "%"
                   : trunc6(cutScaled - have)),
      })
    }
    push(b.minTotal / r.maxPoints * 5, scaledTotal,
         r.total, b.minTotal, false)
    push(b.ttessFloor / r.cfg.ttessWeight * 5, scaledTtess,
         r.ttessPoints, b.ttessFloor, false)
    push(b.surveyFloor === null ? null
           : b.surveyFloor / r.cfg.surveyWeight * 5,
         scaledSurvey, r.surveyPoints, b.surveyFloor, false)
    push(b.pctFloor, r.overallPercent, r.overallPercent,
         b.pctFloor, true)
    return { label: b.label, cells,
             fully_met: cells.every((c) => c.met) }
  })
  return { actuals, rows }
}

// ---- the click-for-the-math explanations (fraction voice) ----
function explanations(state, r) {
  const dims = state.ttess.map((row, d) => {
    const terms = [], weights = [], absent = []
    row.forEach((v, i) => {
      const o = OBSERVATIONS[i]
      if (v === null) absent.push(o.label)
      else { terms.push(frac(o.weight) + "×" + g(v))
             weights.push(frac(o.weight)) }
    })
    let note = "Weighted average over the observations that scored "
      + "this dimension, weights renormalized."
    if (absent.length) {
      note += " " + absent.join(" and ")
        + (absent.length === 1 ? " does" : " do")
        + " not score this dimension, so the weight drops out."
    }
    return { formula: "(" + terms.join(" + ") + ") ÷ ("
             + weights.join(" + ") + ") = " + trunc4(r.partScores[d]),
             note }
  })

  const ttess = {
    formula: "(" + r.partScores.map(trunc4).join(" + ") + ") ÷ "
      + r.partScores.length + " = " + trunc6(r.mean),
    note: "Plain average of the dimension scores. Truncated, never "
      + "rounded.",
  }

  const earned = r.growthRows.map((row) => row.mode === "score"
    ? { formula: "Entered directly → " + trunc4(row.earned),
        note: "A continuous measure: the fractional score is the "
          + "average of per-student growth ratings, computed "
          + "upstream (the district's calculator has no formula "
          + "for these cells either)." }
    : { formula: "Growth Rating “" + row.label + "” → level score "
          + g(row.earned),
        note: "A lookup in the level table, not a calculation." })

  const pctTerms = state.growth.map(([pct], i) =>
    frac(r.cfg.measures[i].weight) + "×" + trunc4(pct))
  const wsum = r.cfg.measures.reduce((a, m) => a + m.weight, 0)
  const pct = {
    formula: "(" + pctTerms.join(" + ") + ") ÷ " + frac(wsum)
      + " = " + trunc4(r.overallPercent) + "%",
    note: "Weighted average of the raw percentages; the weights are "
      + "the growth measures' TIA weights.",
  }

  const survey = r.hasSurvey ? {
    formula: "Entered directly (already on the 1 to 5 scale) → "
      + trunc6(state.survey),
    note: null,
  } : null

  const terms = [frac(r.cfg.ttessWeight) + "×" + trunc6(r.mean)]
  r.growthRows.forEach((row, i) =>
    terms.push(frac(r.cfg.measures[i].weight) + "×"
               + (row.mode === "score" ? trunc4(row.earned)
                                       : g(row.earned))))
  if (r.hasSurvey) {
    terms.push(frac(r.cfg.surveyWeight) + "×" + trunc6(state.survey))
  }
  const overall = {
    formula: terms.join(" + ") + " = " + trunc6(r.overall5),
    note: "Each factor is a measure's share of the overall TIA "
      + "score × its earned score. Truncated at six decimals, never "
      + "rounded.",
  }

  return { dims, ttess, earned, pct, survey, overall }
}

// ---- the page's one entry point ----
// cutsId picks the cut table to judge by: scores never change, only
// the designation does.
export function buildResult(state, cutsId = "reference") {
  const r = compute(state, cutsId)
  const ex = explanations(state, r)
  return {
    has_survey: r.hasSurvey,
    ttess: {
      dimension_scores: r.partScores.map(trunc4),
      dimension_explanations: ex.dims,
      score: trunc6(r.mean),
      score_explanation: ex.ttess,
      ineligible_reason: r.ineligibleReason,
    },
    growth: {
      rows: r.growthRows.map((row, i) => ({
        measure: row.measure,
        percent: trunc4(row.percent) + "%",
        mode: row.mode,
        rating: row.mode === "score" ? null : row.label,
        earned: trunc4(row.earned),
        earned_explanation: ex.earned[i],
      })),
      overall_percent: trunc4(r.overallPercent) + "%",
      overall_percent_explanation: ex.pct,
    },
    survey: r.hasSurvey ? trunc6(state.survey) : null,
    survey_explanation: ex.survey,
    overall: trunc6(r.overall5),
    overall_explanation: ex.overall,
    designation: r.designation,
    note: composeNote(r),
    cut_table: cutTable(r),
  }
}

// ---- the roster analysis -------------------------------------------
// Scores every teacher under the BASELINE (reference) table and a
// second table `cuts` (a CUT_TABLES key or a LIVE table object from
// the cut editor), then classifies each teacher: "mover" with a
// DIRECTION ("up": releasedBy names the baseline constraints that
// blocked the newly awarded band; "down": blockedBy names the
// adjusted constraints now refusing the old band), "unchanged", or
// the categories cut policy cannot touch: "ineligible" and
// "survey-blocked". All met flags come from buildResult's own cut
// tables — no second walk implementation.

const LEVEL_RANK = { "Not Designated": 0, "Recognized": 1,
                     "Exemplary": 2, "Masters": 3 }
const CONSTRAINT_NAMES = ["overall cut", "T-TESS floor",
                          "survey floor", "%MEE floor"]

function unmetCells(run, bandLabel) {
  const row = run.cut_table.rows.find((r) => r.label === bandLabel)
  return row
    ? row.cells.map((c, i) => (!c.waived && !c.met)
        ? CONSTRAINT_NAMES[i] : null).filter(Boolean)
    : []
}

export function analyzeRoster(roster, cuts = "actual2425") {
  const rows = roster.map((t) => {
    const state = { type: 11, ttess: t.ttess, growth: t.growth,
                    survey: t.survey }
    const ref = buildResult(state, "reference")
    const act = buildResult(state, cuts)

    let status, direction = null, releasedBy = null
    if (ref.designation === "Ineligible") {
      status = "ineligible"
    } else if (ref.designation === act.designation) {
      const surveyBlocked = state.survey !== null && state.survey < 3
      status = ref.designation === "Not Designated"
        ? (surveyBlocked ? "survey-blocked" : "unchanged")
        : "unchanged"
    } else {
      status = "mover"
      direction = LEVEL_RANK[act.designation]
        > LEVEL_RANK[ref.designation] ? "up" : "down"
      releasedBy = direction === "up"
        ? unmetCells(ref, act.designation)   // what baseline blocked
        : unmetCells(act, ref.designation)   // what now blocks
    }
    return { id: t.id, name: t.name, campus: t.campus,
             ttess: ref.ttess.score,
             pct: ref.growth.overall_percent,
             survey: state.survey,
             overall: ref.overall,
             reference: ref.designation, actual: act.designation,
             status, direction, releasedBy, ref, act }
  })

  const countFor = (key) => {
    const c = { "Masters": 0, "Exemplary": 0, "Recognized": 0,
                "Not Designated": 0, "Ineligible": 0 }
    rows.forEach((r) => { c[r[key]] += 1 })
    c.designated = c.Masters + c.Exemplary + c.Recognized
    return c
  }
  const movers = rows.filter((r) => r.status === "mover")
    .sort((a, b) => (LEVEL_RANK[b.actual] - LEVEL_RANK[a.actual])
      || (LEVEL_RANK[b.reference] - LEVEL_RANK[a.reference]))
  return {
    rows,
    counts: { reference: countFor("reference"),
              actual: countFor("actual") },
    movers,
    untouchable: rows.filter((r) => r.status === "ineligible"
                                 || r.status === "survey-blocked"),
  }
}
