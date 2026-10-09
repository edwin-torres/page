// Principal Scorecard: scoring math.
//
// Pure functions, no React: scorePrincipal(inputs) returns each
// component's weight, earned points and explanation, plus the total
// and effectiveness level. PrincipalScorecard.jsx only draws the result.
// Numbers are formatted with Python's rules, so the explanations read
// exactly like the original Python version of this tool.

import {
  SUBCATEGORY_WEIGHTS, GRADE_POINTS, HS_GROWTH_POINTS, THRESHOLDS,
} from "./principalConfig.js"

const EPS = 1e-9 // the cushion: a value exactly ON a target counts as met

// ---- Python-style number formatting --------------------------------
// The explanations must print the same digits Python prints. Two
// differences matter between the languages:
//  1. Python's f"{x:.2f}" breaks exact ties toward the EVEN digit
//     (1.625 → "1.62"); JavaScript's toFixed breaks them upward
//     ("1.63"). School Culture scores land on such ties (k ÷ 8).
//  2. Python prints a float weight like 10.0 as "10.0"; JS prints "10".

// Add 1 to a string of decimal digits ("199" → "200").
function incrementDigits(digits) {
  const arr = digits.split("")
  let i = arr.length - 1
  while (i >= 0) {
    if (arr[i] === "9") { arr[i] = "0"; i -= 1 }
    else { arr[i] = String(Number(arr[i]) + 1); return arr.join("") }
  }
  return "1" + arr.join("")
}

// Python's f"{x:.Nf}": round half to even on the exact binary value.
export function pyFixed(x, d) {
  if (!Number.isFinite(x)) return String(x)
  const sign = x < 0 || Object.is(x, -0) ? "-" : ""
  // toFixed(100) writes out the double's exact decimal expansion (it
  // has at most 100 fractional digits for the magnitudes used here).
  const full = Math.abs(x).toFixed(100)
  const dot = full.indexOf(".")
  const intPart = full.slice(0, dot)
  const frac = full.slice(dot + 1)
  const kept = frac.slice(0, d)
  const dropped = frac.slice(d)
  let roundUp
  if (dropped[0] > "5") roundUp = true
  else if (dropped[0] < "5") roundUp = false
  else if (/[1-9]/.test(dropped.slice(1))) roundUp = true
  else {
    // An exact tie: round toward the even digit.
    const last = d > 0 ? kept[d - 1] : intPart[intPart.length - 1]
    roundUp = Number(last) % 2 === 1
  }
  let digits = intPart + kept
  if (roundUp) digits = incrementDigits(digits)
  const ip = d > 0 ? digits.slice(0, digits.length - d) || "0" : digits
  return sign + (d > 0 ? ip + "." + digits.slice(digits.length - d) : ip)
}

// Python's f"{x:g}": 6 significant digits, trailing zeros removed.
export function pyG(x) {
  if (x === 0) return Object.is(x, -0) ? "-0" : "0"
  if (!Number.isFinite(x)) return String(x)
  const exp = Number(Math.abs(x).toExponential(5).split("e")[1])
  if (exp >= -4 && exp < 6) {
    const s = pyFixed(x, 5 - exp)
    return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s
  }
  const [m, e] = x.toExponential(5).split("e")
  const mant = m.includes(".") ? m.replace(/0+$/, "").replace(/\.$/, "") : m
  const en = Number(e)
  return mant + "e" + (en < 0 ? "-" : "+") + String(Math.abs(en)).padStart(2, "0")
}

// Python's str() of a float weight: 10 → "10.0", 2.5 → "2.5".
export function pyFloat(x) {
  return Number.isInteger(x) ? x.toFixed(1) : String(x)
}

// Python's f"{x:+.2f}": always shows the sign.
export function pySigned(x) {
  const s = pyFixed(x, 2)
  return s.startsWith("-") ? s : "+" + s
}

// The growth explanations' percent voice: 0.2 → "20%", 0.075 → "7.5%".
function fmtPct(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—"
  return pyFixed(v * 100, 1).replace(/0+$/, "").replace(/\.$/, "") + "%"
}
function fmtNum(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—"
  return pyG(v)
}

// ---- Explanations ---------------------------------------------------
// An explanation is a list of blocks the page renders in order; text
// may contain **bold** spans:
//   { p: "text" }     a paragraph
//   { ul: [...] }     a bulleted list
//   { ol: [...] }     a numbered list
const earnedLine = (score) => ({ p: `**Earned points:** **${pyFixed(score, 2)}**` })

// Mirrors make_explanation (the T-PESS and MAP components).
function makeExplanation({ rule, inputs, mathSteps, bucket, weight, score }) {
  return [
    { p: `**Rule:** ${rule}` },
    { p: "**Your inputs:**" },
    { ul: inputs.map(([label, val]) => `**${label}**: ${val}`) },
    { p: `**Scoring group:** ${scoringGroupLabel(bucket)} → weight **${pyFloat(weight)}**` },
    { p: "**The math:**" },
    { ol: mathSteps },
    earnedLine(score),
  ]
}

// Mirrors make_staar_explanation (STAAR domains and CCMR lookups).
function makeLookupExplanation({ category, rawGrade, lookup, scale, score }) {
  const gradeDisplay = rawGrade ?? "F (no grade on file → treated as F)"
  const scaleText = Object.entries(scale).map(([g, pts]) => `${g} = ${pyG(pts)}`).join(", ")
  return [
    { p: "**Your input:**" },
    { ul: [`**${category} Letter Grade**: ${gradeDisplay}`] },
    { ol: [
      `For this campus level and campus rating, these are the points: ${scaleText}`,
      `Your grade maps to the **'${lookup}'** value → **${pyFixed(score, 2)}** points`,
    ] },
    earnedLine(score),
  ]
}

// The short form every growth builder uses for "does not apply" or
// "data missing".
function noteExplanation(rule, note, score) {
  return [{ p: `**Rule:** ${rule}` }, { p: `**Note:** ${note}` }, earnedLine(score)]
}

// Mirrors make_growth_explanation (SAT, AP).
function makeGrowthExplanation({ rule, category, prev, current, threshold, score, met, notMet }) {
  const isMet = score === met
  const target = prev + threshold
  const status = isMet ? "Met" : "Not Met"
  return [
    { p: `**Rule:** ${rule}` },
    { p: "**Your inputs:**" },
    { ul: [
      `**Previous year ${category}**: ${fmtPct(prev)}`,
      `**Current year ${category}**: ${fmtPct(current)}`,
    ] },
    { p: "**The math:**" },
    { ol: [
      `Target to earn Met: ${fmtPct(prev)} + ${fmtPct(threshold)} = **${fmtPct(target)}**`,
      `Your current value ${fmtPct(current)} is ${isMet ? "≥" : "<"} ${fmtPct(target)} → **${status}**`,
      `${status} → **${pyG(score)}** points`,
    ] },
    { p: `**Met / Not Met points:** Met = ${pyG(met)}, Not Met = ${pyG(notMet)}` },
    earnedLine(score),
  ]
}

// Mirrors make_multi_growth_explanation (TSI: every cohort must grow).
function makeMultiGrowthExplanation({ rule, cohorts, threshold, score, met, notMet }) {
  const lines = cohorts.map(([label, prev, current]) => {
    const target = prev + threshold
    const ok = current - prev >= threshold - EPS
    return `**${label}**: ${fmtPct(prev)} → ${fmtPct(current)} (needs ≥ ${fmtPct(target)}) — ${ok ? "✅ Met" : "❌ Not Met"}`
  })
  const allMet = score === met
  return [
    { p: `**Rule:** ${rule}` },
    { p: `**Your cohorts (each must grow by at least ${fmtPct(threshold)}):**` },
    { ul: lines },
    { p: `**Result:** ${allMet ? "All cohorts met the +10 threshold" : "At least one cohort fell short"} → **${pyG(score)}** points` },
    { p: `**Met / Not Met points:** Met = ${pyG(met)}, Not Met = ${pyG(notMet)}` },
    earnedLine(score),
  ]
}

// Mirrors make_tiered_growth_explanation (Core Complete).
function makeTieredExplanation({ rule, prev, current, tiers, score }) {
  const growth = current - prev
  const winner = tiers.find(([lb]) => growth >= lb - EPS)?.[1]
  return [
    { p: `**Rule:** ${rule}` },
    { p: "**Your inputs:**" },
    { ul: [`**Previous year**: ${fmtPct(prev)}`, `**Current year**: ${fmtPct(current)}`] },
    { p: "**The math:**" },
    { ol: [
      `Improvement = ${fmtPct(current)} − ${fmtPct(prev)} = **${fmtPct(growth)}**`,
      "Match the improvement to the point tiers:",
    ] },
    { ul: tiers.map(([, label, pts]) =>
      `${label} → **${pyG(pts)} ${pts === 1 ? "point" : "points"}**${label === winner ? "  ← your tier" : ""}`) },
    earnedLine(score),
  ]
}

// Mirrors make_relative_growth_explanation (Associates counts).
function makeRelativeExplanation({ rule, prev, current, pct, required, target, score, met, notMet }) {
  const isMet = score === met
  const status = isMet ? "Met" : "Not Met"
  return [
    { p: `**Rule:** ${rule}` },
    { p: "**Your inputs:**" },
    { ul: [`**Previous year Associates**: ${fmtNum(prev)}`, `**Current year Associates**: ${fmtNum(current)}`] },
    { p: "**The math:**" },
    { ol: [
      `Required increase: ${pyFixed(pct * 100, 0)}% of ${fmtNum(prev)} = ${fmtNum(pct * prev)}, rounded up = **${fmtNum(required)}**`,
      `Target to earn Met: ${fmtNum(prev)} + ${fmtNum(required)} = **${fmtNum(target)}**`,
      `Your current count ${fmtNum(current)} is ${isMet ? "≥" : "<"} ${fmtNum(target)} → **${status}**`,
      `${status} → **${pyG(score)}** points`,
    ] },
    { p: `**Met / Not Met points:** Met = ${pyG(met)}, Not Met = ${pyG(notMet)}` },
    earnedLine(score),
  ]
}

// ---- The bucket ----------------------------------------------------
// Mirrors assign_performance_bucket: "ES-AC", "MS-DF", ...
export function performanceBucket(level, rating) {
  const group = ["A", "B", "C"].includes(rating) ? "AC" : "DF"
  return `${String(level).trim().toUpperCase()}-${group}`
}

// The readable parts of a scoring group code such as "ES-AC".
const LEVEL_NAMES = { ES: "Elementary", MS: "Middle School", HS: "High School" }
const RATING_GROUPS = { AC: "rated A to C", DF: "rated D or F" }
// D or F campuses score STAAR Domain 1 (achievement) at 0 and move
// those points to Domain 2A (growth).
const WEIGHT_STYLES = { AC: "Standard weights", DF: "Growth weighted" }
export function scoringGroupParts(bucket) {
  const [level, group] = bucket.split("-")
  return {
    level: LEVEL_NAMES[level] ?? level,
    rating: RATING_GROUPS[group] ?? group,
    weights: WEIGHT_STYLES[group] ?? "",
  }
}
// "ES-AC" → "Elementary, rated A to C" (used in the explanations).
export function scoringGroupLabel(bucket) {
  const { level, rating } = scoringGroupParts(bucket)
  return `${level}, ${rating}`
}

// ---- The 14 components ---------------------------------------------
// Each returns { name, weight, score, explanation }.

// The four T-PESS components share one shape: average the indicators,
// divide by 5, multiply by the bucket weight.
export const TPESS_COMPONENTS = [
  { name: "Quality of Instruction", cols: ["2.3", "2.4", "4.1", "4.2", "5.1", "5.2", "5.3", "5.4", "5.5"],
    rule: "Average of 9 T-PESS indicators (Domains 2.3, 2.4, 4.1, 4.2, 5.1–5.5), normalized to a 0–1 scale, then multiplied by the scoring group's weight." },
  { name: "Executive Leadership", cols: ["1.1", "1.2", "1.3", "1.4", "1.5"],
    rule: "Average of 5 T-PESS Domain 1 indicators (1.1–1.5), normalized to a 0–1 scale, then multiplied by the scoring group's weight." },
  { name: "School Culture", cols: ["3.1", "3.2", "3.3", "3.4"],
    rule: "Average of 4 T-PESS Domain 3 indicators (3.1–3.4), normalized to a 0–1 scale, then multiplied by the scoring group's weight." },
  { name: "Human Capital", cols: ["2.1", "2.2"],
    rule: "Average of 2 T-PESS Domain 2 indicators (2.1–2.2), normalized to a 0–1 scale, then multiplied by the scoring group's weight." },
]

function tpessComponent(def, inp, bucket) {
  const weight = SUBCATEGORY_WEIGHTS[def.name][bucket] ?? 0
  const vals = def.cols.map((c) => inp.domains[c])
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  const normalized = avg / 5
  const score = normalized * weight
  const explanation = makeExplanation({
    rule: def.rule,
    inputs: def.cols.map((c) => [`Domain ${c}`, pyG(inp.domains[c])]),
    mathSteps: [
      `Average of ${vals.length} indicators = ${pyFixed(avg, 3)}`,
      `Normalize to 0–1 scale: ${pyFixed(avg, 3)} / 5 = ${pyFixed(normalized, 3)}`,
      `Multiply by weight: ${pyFixed(normalized, 3)} × ${pyFloat(weight)} = **${pyFixed(score, 2)}**`,
    ],
    bucket, weight, score,
  })
  return { name: def.name, weight, score, explanation }
}

// STAAR Domains 1, 2A, 3 and CCMR: points straight from the grade table.
// `onlyLevels` zeroes the component outside those campus levels (CCMR
// is HS only); the explanation is still built.
function gradeLookupComponent({ name, category, sub, rawGrade, bucket, level, onlyLevels }) {
  const grade = rawGrade ?? "F"
  const lookup = grade === "D" || grade === "F" ? "D-F" : grade
  const scale = GRADE_POINTS[bucket][category]
  const score = scale[lookup]
  const weight = SUBCATEGORY_WEIGHTS[sub][bucket] ?? 0
  const explanation = makeLookupExplanation({ category, rawGrade, lookup, scale, score })
  if (onlyLevels && !onlyLevels.includes(level)) {
    return { name, weight: 0, score: 0, explanation }
  }
  return { name, weight, score, explanation }
}

function mapComponent(inp, bucket) {
  const raw = inp.nwea
  const mapScore = raw === null || raw === undefined ? 0 : raw
  const weight = SUBCATEGORY_WEIGHTS["NWEA MAP"][bucket] ?? 0
  const score = mapScore * weight
  const explanation = makeExplanation({
    rule: `The NWEA MAP Growth (students who met growth target / total students with boy and eoy scores) is multiplied directly by the weight = ${pyFloat(weight)} to get the points.`,
    inputs: [["NWEA MAP value", raw === null || raw === undefined ? "0 (no MAP score on file → treated as 0)" : pyG(mapScore)]],
    mathSteps: [`Multiply the MAP value by the weight: ${pyG(mapScore)} × ${pyFloat(weight)} = **${pyFixed(score, 2)}**`],
    bucket, weight, score,
  })
  if (inp.level === "MS" || inp.level === "HS") {
    return { name: "NWEA MAP", weight: 0, score: 0, explanation }
  }
  return { name: "NWEA MAP", weight, score, explanation }
}

const isMissing = (v) => v === null || v === undefined || Number.isNaN(v)
const notHS = (level) => level === "ES" || level === "MS"

// SAT and AP: Met if the percent grew by at least 10 points.
const SAT_RULE = "SAT earns the Met points if the percent of students scoring 1000+ grows by at least 10 percentage points over last year (e.g., 22% last year → at least 32% this year). Otherwise it earns the Not Met points."
const AP_RULE = "AP earns the Met points if the percent of tested students scoring 3+ across all AP exams grows by at least 10 percentage points over last year (e.g., 20% last year → at least 30% this year). Otherwise it earns the Not Met points."

function growthComponent({ name, rule, level, pair }) {
  const { Met: met, NotMet: notMet } = HS_GROWTH_POINTS[name]
  if (notHS(level)) {
    return { name, weight: 0, score: 0, explanation: noteExplanation(rule,
      `${name} only applies to high school campuses. This is a ${level} campus, so it earns 0 points.`, 0) }
  }
  const { prev, current } = pair
  if (isMissing(prev) || isMissing(current)) {
    return { name, weight: 0, score: 0, explanation: noteExplanation(rule,
      `Previous or current ${name} data is missing, so this earns 0 points.`, 0) }
  }
  const score = current - prev >= 0.10 - EPS ? met : notMet
  return { name, weight: met, score, explanation: makeGrowthExplanation({
    rule, category: name, prev, current, threshold: 0.10, score, met, notMet }) }
}

// TSI: Met only if EVERY cohort (grades 9 to 12) grew by 10+ points.
const TSI_RULE = "TSI earns the Met points only if EVERY cohort (grades 9–12) grows its percent of TSI-complete students (Math & English) by at least 10 percentage points over last year (e.g., a cohort at 20% last year needs at least 30% this year). If any cohort falls short, the school earns the Not Met points."
export const TSI_COHORTS = [["tsi09", "9th grade"], ["tsi10", "10th grade"], ["tsi11", "11th grade"], ["tsi12", "12th grade"]]

function tsiComponent(inp) {
  const { Met: met, NotMet: notMet } = HS_GROWTH_POINTS.TSI
  if (notHS(inp.level)) {
    return { name: "TSI", weight: 0, score: 0, explanation: noteExplanation(TSI_RULE,
      `TSI only applies to high school campuses. This is a ${inp.level} campus, so it earns 0 points.`, 0) }
  }
  if (TSI_COHORTS.some(([k]) => isMissing(inp[k].prev) || isMissing(inp[k].current))) {
    return { name: "TSI", weight: 0, score: 0, explanation: noteExplanation(TSI_RULE,
      "One or more TSI cohorts is missing previous or current data, so this earns 0 points.", 0) }
  }
  const allMet = TSI_COHORTS.every(([k]) => inp[k].current - inp[k].prev >= 0.10 - EPS)
  const score = allMet ? met : notMet
  const cohorts = TSI_COHORTS.map(([k, label]) => [label, inp[k].prev, inp[k].current])
  return { name: "TSI", weight: met, score, explanation: makeMultiGrowthExplanation({
    rule: TSI_RULE, cohorts, threshold: 0.10, score, met, notMet }) }
}

// Core Complete: the improvement lands in one of three point tiers.
const CC_RULE = "Core Complete is scored on how much the percent of 12th graders who are core complete improved over last year: an improvement of 20% or more earns 3 points, 10%–19.99% earns 2 points, and less than 10% earns 1 point."
const CC_TIERS = [[0.20, "20% or more", 3], [0.10, "10%–19.99%", 2], [-Infinity, "less than 10%", 1]]

function coreCompleteComponent(inp) {
  const name = "Core Complete"
  if (notHS(inp.level)) {
    return { name, weight: 0, score: 0, explanation: noteExplanation(CC_RULE,
      `Core Complete only applies to high school campuses. This is a ${inp.level} campus, so it earns 0 points.`, 0) }
  }
  const { prev, current } = inp.core
  if (isMissing(prev) || isMissing(current)) {
    return { name, weight: 0, score: 0, explanation: noteExplanation(CC_RULE,
      "Previous or current Core Complete data is missing, so this earns 0 points.", 0) }
  }
  const growth = current - prev
  const score = CC_TIERS.find(([lb]) => growth >= lb - EPS)[2]
  return { name, weight: HS_GROWTH_POINTS[name].Met, score,
           explanation: makeTieredExplanation({ rule: CC_RULE, prev, current, tiers: CC_TIERS, score }) }
}

// Associates: this year's count must beat last year's by 10%, the
// required increase rounded UP to a whole student (at least 1).
const ASSOC_RULE = "Associates earns the Met points if the number of students earning an associate degree grows by at least 10% over last year, with the required increase rounded UP to a whole student (e.g., 200 last year needs at least 220 this year). Otherwise it earns the Not Met points."

function associatesComponent(inp) {
  const name = "Associates"
  const { Met: met, NotMet: notMet } = HS_GROWTH_POINTS.Associates
  if (notHS(inp.level)) {
    return { name, weight: 0, score: 0, explanation: noteExplanation(ASSOC_RULE,
      `Associates only applies to high school campuses. This is a ${inp.level} campus, so it earns 0 points.`, 0) }
  }
  const { prev, current } = inp.associates
  if (isMissing(prev) || isMissing(current)) {
    return { name, weight: 0, score: 0, explanation: noteExplanation(ASSOC_RULE,
      "Previous or current Associates data is missing, so this earns 0 points.", 0) }
  }
  // The -EPS keeps an exact 10% (e.g. 20.0) from drifting up to 21.
  const required = Math.max(Math.ceil(0.10 * prev - EPS), 1)
  const target = prev + required
  const score = current >= target - EPS ? met : notMet
  return { name, weight: met, score, explanation: makeRelativeExplanation({
    rule: ASSOC_RULE, prev, current, pct: 0.10, required, target, score, met, notMet }) }
}

// ---- R value (congruence metric) -----------------------------------
// Mirrors get_r_adjustment.
export function rAdjustment(r) {
  if (r < 0) return [-4, "Negative correlation"]
  if (r < 0.24) return [-3, "0 to 0.23"]
  if (r < 0.50) return [1, "0.24 to 0.49"]
  return [2, "0.50 or higher"]
}

function rExplanation(r, adjustment, tier) {
  return [
    { p: "**Rule:** Additional points are added or deducted based on the R value (correlation) between the evaluator's average teacher evaluation ratings and student growth measures." },
    { p: "**The tiers:**" },
    { ul: ["0.50 or higher → +2 points", "0.24 to 0.49 → +1 point", "0 to 0.23 → -3 points", "Negative correlation → -4 points"] },
    { p: `**Your R value:** ${pyG(r)} falls in the **${tier}** tier` },
    { p: `**Point adjustment:** **${pySigned(adjustment)}**` },
  ]
}

// ---- Effectiveness level -------------------------------------------
// Mirrors calculate_effectiveness_level: walk the levels from the
// highest minimum down; the first minimum the total reaches wins.
export function thresholdsFor(level) {
  return THRESHOLDS.map((t) => ({ level: t.level, min: t[level] }))
    .filter((t) => t.min !== undefined)
    .sort((a, b) => b.min - a.min)
}

export function effectivenessLevel(total, level) {
  const points = Number.isNaN(total) ? 0 : total
  for (const t of thresholdsFor(level)) {
    if (points >= t.min) return t.level
  }
  return "Unsatisfactory"
}

// ---- The one entry point the page calls ----------------------------
// inp = { level, rating, domains: { "1.1": 3, ... }, staar1, staar2a,
//         staar3, ccmr, nwea, sat: {prev, current}, ap, tsi09..tsi12,
//         core, associates, useR, r }
export function scorePrincipal(inp) {
  const bucket = performanceBucket(inp.level, inp.rating)
  const components = [
    ...TPESS_COMPONENTS.map((def) => tpessComponent(def, inp, bucket)),
    gradeLookupComponent({ name: "STAAR Domain 1", category: "STAAR Domain 1", sub: "STAAR DOMAIN 1", rawGrade: inp.staar1, bucket, level: inp.level }),
    gradeLookupComponent({ name: "STAAR Domain 2", category: "STAAR Domain 2A", sub: "STAAR DOMAIN 2", rawGrade: inp.staar2a, bucket, level: inp.level }),
    gradeLookupComponent({ name: "STAAR Domain 3", category: "STAAR Domain 3", sub: "STAAR DOMAIN 3", rawGrade: inp.staar3, bucket, level: inp.level }),
    mapComponent(inp, bucket),
    gradeLookupComponent({ name: "CCMR", category: "CCMR", sub: "CCMR", rawGrade: inp.ccmr, bucket, level: inp.level, onlyLevels: ["HS"] }),
    growthComponent({ name: "SAT", rule: SAT_RULE, level: inp.level, pair: inp.sat }),
    growthComponent({ name: "AP", rule: AP_RULE, level: inp.level, pair: inp.ap }),
    tsiComponent(inp),
    coreCompleteComponent(inp),
    associatesComponent(inp),
  ]
  // Summed left to right, in component order.
  const basePoints = components.reduce((sum, c) => sum + c.score, 0)

  let rAdj = 0, rTier = null, rExpl = null
  if (inp.useR) {
    [rAdj, rTier] = rAdjustment(inp.r)
    rExpl = rExplanation(inp.r, rAdj, rTier)
  }
  const totalPoints = basePoints + rAdj
  return {
    bucket, components, basePoints,
    rAdjustment: rAdj, rTier, rExplanation: rExpl,
    totalPoints, level: effectivenessLevel(totalPoints, inp.level),
  }
}
