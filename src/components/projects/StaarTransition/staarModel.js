// STAAR transition table growth: rules, made-up class, and results.
//
// Pure data and functions, no React. Every number the walkthrough shows is
// computed here, so StaarTransition.jsx only draws what this file returns.

// ---- The six bands -----------------------------------------------------------
// TEA splits Did Not Meet and Approaches into a low and a high band, so STAAR
// results fall into six bands. Index 0 is the lowest band, 5 the highest.
export const BANDS = [
  { code: "0L", name: "Did Not Meet Low", short: "DNM Low", level: "Did Not Meet" },
  { code: "0H", name: "Did Not Meet High", short: "DNM High", level: "Did Not Meet" },
  { code: "1L", name: "Approaches Low", short: "Appr. Low", level: "Approaches" },
  { code: "1H", name: "Approaches High", short: "Appr. High", level: "Approaches" },
  { code: "2M", name: "Meets", short: "Meets", level: "Meets" },
  { code: "3M", name: "Masters", short: "Masters", level: "Masters" },
]
export const BAND_INDEX = Object.fromEntries(BANDS.map((b, i) => [b.code, i]))

// ---- TEA's transition table ----------------------------------------------------
// Growth points for every pair of bands: rows are last year, columns are this
// year, both in BANDS order (0L, 0H, 1L, 1H, 2M, 3M). Copied from TEA's table
// (2024 Accountability Manual, chapter 3; TIA guidance, September 2023; the
// 2026 enhanced performance level one-pager gives the same values).
export const TABLE = [
  //  0L   0H   1L   1H   2M   3M      this year
  [0,   1,   1,   1,   1,   1],   // last year 0L
  [0,   0.5, 1,   1,   1,   1],   // last year 0H
  [0,   0,   0.5, 1,   1,   1],   // last year 1L
  [0,   0,   0,   0.5, 1,   1],   // last year 1H
  [0,   0,   0,   0,   1,   1],   // last year 2M
  [0,   0,   0,   0,   0,   1],   // last year 3M
]

// The district counts only a full point as met growth. TEA lets each
// district decide whether a half point also counts; this one does not.
export const MET_POINTS = 1

export const pointsFor = (prior, current) => TABLE[BAND_INDEX[prior]][BAND_INDEX[current]]
export const isMet = (points) => points >= MET_POINTS
export const pointText = (p) => (p === 0.5 ? "½" : String(p))

// ---- The made-up class ------------------------------------------------------------
export const TEACHER = "Teacher A"
export const COURSE = "Grade 7 Math"

// prior / current are band codes; null means no valid STAAR result that year.
const RAW = [
  { id: 1, prior: "1L", current: "1H" },
  { id: 2, prior: "2M", current: "2M" },
  { id: 3, prior: "0H", current: "1L" },
  { id: 4, prior: "1H", current: "2M" },
  { id: 5, prior: "1H", current: "1H" },
  { id: 6, prior: "2M", current: "3M" },
  { id: 7, prior: "0L", current: "0L" },
  { id: 8, prior: "1L", current: "2M" },
  { id: 9, prior: "3M", current: "3M" },
  { id: 10, prior: "2M", current: "1H" },
  { id: 11, prior: "1L", current: "1L" },
  { id: 12, prior: "0L", current: "0H" },
  { id: 13, prior: "1H", current: "3M" },
  { id: 14, prior: "0H", current: "0H" },
  { id: 15, prior: "2M", current: "2M" },
  { id: 16, prior: "1L", current: "1H" },
  { id: 17, prior: "3M", current: "2M" },
  { id: 18, prior: "0H", current: "1H" },
  { id: 19, prior: "1H", current: "2M" },
  { id: 20, prior: "2M", current: "3M" },
  { id: 21, prior: "1L", current: "0H" },
  { id: 22, prior: "0L", current: "1L" },
  { id: 23, prior: "1H", current: "2M" },
  { id: 24, prior: "2M", current: "2M" },
  { id: 25, prior: null, current: "2M", reason: "No STAAR result last year" },
  { id: 26, prior: "1H", current: null, reason: "No STAAR result this year" },
]

function move(prior, current) {
  const d = BAND_INDEX[current] - BAND_INDEX[prior]
  if (d > 0) return { dir: "up", text: d === 1 ? "Up 1 band" : `Up ${d} bands` }
  if (d < 0) return { dir: "down", text: d === -1 ? "Down 1 band" : `Down ${-d} bands` }
  return { dir: "same", text: "Same band" }
}

export const STUDENTS = RAW.map((s) => {
  const name = `Student ${s.id}`
  const counted = s.prior != null && s.current != null
  if (!counted) return { ...s, name, counted, points: null, met: false, move: null }
  const points = pointsFor(s.prior, s.current)
  return { ...s, name, counted, points, met: isMet(points), move: move(s.prior, s.current) }
})

export const COUNTED = STUDENTS.filter((s) => s.counted)
export const SET_ASIDE = STUDENTS.filter((s) => !s.counted)
export const N = COUNTED.length
export const MET = COUNTED.filter((s) => s.met).length
export const HALF = COUNTED.filter((s) => s.points === 0.5).length
export const SHARE = MET / N // full value, never rounded in the calculation

// ---- Display ------------------------------------------------------------------------
// Rounded to two decimals for display only: 0.708333… shows as "70.83%".
export const pctShown = (v) => `${(v * 100).toFixed(2)}%`
// The full value as text for the disclaimer: "70.8333…%" when it keeps going.
export function pctFull(v) {
  const x = v * 100
  const exact = Math.abs(x * 100 - Math.round(x * 100)) < 1e-9
  return exact ? `${x.toFixed(2)}%` : `${x.toFixed(4)}…%`
}

export const band = (code) => BANDS[BAND_INDEX[code]]
export const bandLabel = (code) => `${band(code).name} (${code})`
export const byName = (name) => STUDENTS.find((s) => s.name === name)
