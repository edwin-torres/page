// STAAR transition table growth: where everything sits on the stage.
//
// Pure geometry, no React. layoutFor() returns a position and radius for
// every student's circle, plus the shapes drawn behind them (the transition
// table or the set-aside tray). The page animates each circle from one
// step's layout to the next.
import { STUDENTS, COUNTED, SET_ASIDE, BAND_INDEX } from "./staarModel.js"

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export function padding({ headH, narrow }) {
  return narrow
    ? { l: 14, r: 12, t: Math.max(58, headH + 14), b: 20 }
    : { l: 28, r: 24, t: Math.max(76, headH + 16), b: 30 }
}

// n circles in a centered grid inside a box.
function grid(ids, box, cols, rMax, gap) {
  const rows = Math.ceil(ids.length / cols)
  const r = Math.min(rMax, (box.x1 - box.x0) / cols / 2 - gap / 2, (box.y1 - box.y0) / rows / 2 - gap / 2)
  const step = 2 * r + gap
  const w = cols * step - gap
  const h = rows * step - gap
  const x0 = (box.x0 + box.x1) / 2 - w / 2
  const y0 = (box.y0 + box.y1) / 2 - h / 2
  const out = {}
  ids.forEach((id, k) => {
    out[id] = { x: x0 + (k % cols) * step + r, y: y0 + Math.floor(k / cols) * step + r, r }
  })
  return out
}

// The transition table, laid out like TEA's: last year down the side (0L at
// the top), this year across the top. Between the row labels and the first
// column is a narrow gutter: the spot "outside the table" where a student
// waits on last year's row before sliding into this year's column.
export function tableGeometry(size, p) {
  const { W, H, narrow } = size
  const rowHeadW = narrow ? 40 : 168
  const gutterW = narrow ? 20 : 46
  const colHeadH = narrow ? 30 : 48
  const x0 = p.l + rowHeadW + gutterW
  const x1 = W - p.r
  const y0 = p.t + colHeadH
  const y1 = H - p.b
  const cw = (x1 - x0) / 6
  const ch = (y1 - y0) / 6
  const r = clamp(Math.min(cw, ch) * 0.13, 4.5, 9.5)
  const X = (j) => x0 + j * cw
  const Y = (i) => y0 + i * ch
  const cell = (i, j) => ({ x: X(j), y: Y(i), w: cw, h: ch, cx: X(j) + cw / 2, cy: Y(i) + ch / 2 })
  const gutterX = p.l + rowHeadW + gutterW / 2
  return { kind: "table", rowHeadW, gutterW, colHeadH, x0, x1, y0, y1, cw, ch, r, X, Y, cell, gutterX, p, narrow }
}

// Each student's final slot inside their cell. Slots are worked out for the
// whole class at once, so a student who lands early never shifts when the
// rest of the class arrives.
function cellSlots(T) {
  const groups = new Map()
  for (const s of COUNTED) {
    const key = `${BAND_INDEX[s.prior]},${BAND_INDEX[s.current]}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(s.id)
  }
  const out = {}
  const step = 2 * T.r + 5
  for (const [key, ids] of groups) {
    const [i, j] = key.split(",").map(Number)
    const c = T.cell(i, j)
    const perRow = Math.max(1, Math.floor((c.w - 14 + 5) / step))
    const rows = Math.ceil(ids.length / perRow)
    ids.forEach((id, k) => {
      const row = Math.floor(k / perRow)
      const inRow = Math.min(perRow, ids.length - row * perRow)
      out[id] = {
        x: c.cx + ((k % perRow) - (inRow - 1) / 2) * step,
        y: c.cy + (T.narrow ? 4 : 6) + (row - (rows - 1) / 2) * step,
        r: T.r,
      }
    })
  }
  return out
}

// kind: "roster", "counted" or "table".
// For "table", plan says who is visible and where:
//   plan.landed:   ids sitting in their cell (this year's column)
//   plan.atGutter: ids waiting outside the table on last year's row
// Everyone else is hidden (opacity 0) at their spot on last year's row,
// ready to appear there.
export function layoutFor(kind, size, plan = {}) {
  const { W, H, narrow } = size
  const p = padding(size)
  const dots = {}
  const box = { x0: p.l, x1: W - p.r, y0: p.t, y1: H - p.b }

  if (kind === "roster") {
    Object.assign(dots, grid(STUDENTS.map((s) => s.id), box, narrow ? 6 : 9, narrow ? 15 : 22, narrow ? 10 : 18))
    return { kind, p, dots, geo: null }
  }

  if (kind === "counted") {
    const trayW = narrow ? W - p.l - p.r : 264
    const trayH = narrow ? 104 : 196
    const gridBox = narrow ? { ...box, y1: H - p.b - trayH - 14 } : { ...box, x1: W - p.r - trayW - 28 }
    Object.assign(dots, grid(COUNTED.map((s) => s.id), gridBox, narrow ? 6 : 8, narrow ? 15 : 20, narrow ? 10 : 16))
    const tray = narrow
      ? { x: p.l, y: H - p.b - trayH, w: trayW, h: trayH }
      : { x: W - p.r - trayW, y: (p.t + H - p.b) / 2 - trayH / 2, w: trayW, h: trayH }
    const items = SET_ASIDE.map((s, k) => {
      const ix = narrow ? tray.x + 18 + k * (tray.w / 2) : tray.x + 34
      const iy = narrow ? tray.y + 66 : tray.y + 82 + k * 66
      dots[s.id] = { x: ix + 10, y: iy, r: narrow ? 11 : 14 }
      return { id: s.id, name: s.name, reason: narrow ? s.reason.replace("No STAAR result", "No result") : s.reason, x: ix + (narrow ? 28 : 34), y: iy }
    })
    return { kind, p, dots, geo: { kind: "counted", tray, items, narrow } }
  }

  const T = tableGeometry(size, p)
  const slots = cellSlots(T)
  const landed = plan.landed || new Set()
  const atGutter = plan.atGutter || new Set()
  const gutter = {}
  for (const s of COUNTED) {
    const g = { x: T.gutterX, y: T.cell(BAND_INDEX[s.prior], 0).cy, r: T.r }
    gutter[s.id] = g
    if (landed.has(s.id)) dots[s.id] = { ...slots[s.id], landed: true }
    else if (atGutter.has(s.id)) dots[s.id] = { ...g, waiting: true }
    else dots[s.id] = { ...g, hidden: true }
  }
  return { kind, p, dots, gutter, slots, geo: T }
}

// Where to put the small yellow-bordered callouts: try several spots around
// each followed student and keep the one that covers the fewest circles and
// labels and stays inside the stage.
export function placeCallouts(callouts, dots, size, minTop, obstacles = []) {
  const { W, H } = size
  const overlaps = (a, b, m = 3) => a.x < b.x + b.w + m && a.x + a.w + m > b.x && a.y < b.y + b.h + m && a.y + a.h + m > b.y
  const placed = []
  return callouts.map((c) => {
    const d = dots[c.id]
    const { w, h } = c
    const gy = d.r + 12
    const gx = d.r + 14
    const cands = [
      [d.x - w / 2, d.y - gy - h], [d.x - w + 26, d.y - gy - h], [d.x - 26, d.y - gy - h],
      [d.x - w / 2, d.y + gy], [d.x - w + 26, d.y + gy], [d.x - 26, d.y + gy],
      [d.x + gx, d.y - h / 2], [d.x - gx - w, d.y - h / 2],
    ]
    let best = null
    cands.forEach(([cx, cy], idx) => {
      const cand = { x: clamp(cx, 8, W - w - 8), y: cy, w, h }
      if (cand.y < minTop || cand.y + h > H - 6) return
      let score = idx
      for (const o of obstacles) if (overlaps(cand, o, 1)) score += 40
      for (const pl of placed) if (overlaps(cand, pl, 4)) score += 5000
      for (const id in dots) {
        const o = dots[id]
        if (o.hidden) continue
        if (overlaps(cand, { x: o.x - o.r, y: o.y - o.r, w: 2 * o.r, h: 2 * o.r }, 2)) score += Number(id) === c.id ? 9000 : 25
      }
      if (!best || score < best.score) best = { ...cand, score }
    })
    if (!best) best = { x: clamp(d.x - w / 2, 8, W - w - 8), y: clamp(d.y + gy, minTop, H - h - 6), w, h }
    placed.push(best)
    // The leader line runs from the circle's edge to the nearest point of the box.
    const nx = clamp(d.x, best.x, best.x + w)
    const ny = clamp(d.y, best.y, best.y + h)
    const len = Math.hypot(nx - d.x, ny - d.y) || 1
    const off = d.r + 5
    return { ...c, box: best, lead: { x1: d.x + ((nx - d.x) / len) * off, y1: d.y + ((ny - d.y) / len) * off, x2: nx, y2: ny } }
  })
}
