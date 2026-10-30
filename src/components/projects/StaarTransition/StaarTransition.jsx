// STAAR transition table growth, explained.
// Route: /projects/staar-transition-growth  (the step is in the address: ?step=3)
//
// A step by step walkthrough in the same design as the gap closure and
// quintile explainers. Everything happens on TEA's transition table: a
// student first waits outside the table on last year's row, then slides
// along that row into this year's column, and the cell's points appear.
// staarModel.js holds the rules and the made-up class, staarLayout.js
// decides where every circle sits, and this file draws it and lets
// framer-motion animate each circle from one step to the next.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { GlobalStyles } from "@mui/material"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import "./staar.css"
import {
  BANDS, BAND_INDEX, TABLE, STUDENTS, COUNTED, SET_ASIDE, TEACHER, COURSE,
  N, MET, HALF, SHARE, pctShown, pctFull, pointText, bandLabel, byName,
} from "./staarModel.js"
import { layoutFor, placeCallouts } from "./staarLayout.js"

const EASE = [0.22, 0.8, 0.24, 1] // the other explainers' easing curve
const MOVE = 0.9 // seconds for a circle to slide to a new spot
const ENTER = 1.15 // seconds for one student to appear on the left and slide in
const ROSTER = STUDENTS.length

// The three students the walkthrough follows, one at a time.
const SB = byName("Student 12") // Did Not Meet Low to High: up one band, 1 point
const SA = byName("Student 5") // Approaches High both years: ½ point, not met
const SC = byName("Student 8") // Approaches Low to Meets: up two bands, still 1 point
const FEATURED = new Set([SB.id, SA.id, SC.id])
const ALL = new Set(COUNTED.map((s) => s.id))
const cellKey = (s) => `${BAND_INDEX[s.prior]},${BAND_INDEX[s.current]}`

// The rest of the class arrives row by row, in this order.
const REST = COUNTED.filter((s) => !FEATURED.has(s.id))
  .sort((a, b) => BAND_INDEX[a.prior] - BAND_INDEX[b.prior] || BAND_INDEX[a.current] - BAND_INDEX[b.current] || a.id - b.id)
const REST_DELAY = Object.fromEntries(REST.map((s, k) => [s.id, 0.15 + k * 0.1]))
const REST_DONE = Math.max(...Object.values(REST_DELAY)) + ENTER
// When each cell's points appear in the whole class step: as its first student lands.
const CELL_REVEAL = (() => {
  const out = {}
  for (const s of COUNTED) {
    const k = cellKey(s)
    const t = FEATURED.has(s.id) ? 0 : REST_DELAY[s.id] + ENTER * 0.9
    out[k] = Math.min(out[k] ?? Infinity, t)
  }
  return out
})()

// ---- Small pieces of text and icons ------------------------------------------------
const Code = ({ children }) => <span className="stx-code">{children}</span>
const NoWrap = ({ children }) => <span className="stx-nowrap">{children}</span>
const IconCheck = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IconX = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7m0-7l-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
)
const IconInfo = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 7.2v4M8 4.9v.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
)

// ---- The walkthrough -------------------------------------------------------------------
// Each step's stage says what to draw:
//   kind      roster, counted or table
//   landed    students sitting in their cell; atGutter: students waiting on last year's row
//   focus     the student being followed, and whether we are at last year or this year
//   everyone  the rest of the class appears on the left and slides in
//   result    met growth shown on every circle
const ONE = "One student at a time"
const CLASS = "Whole class"

function lastYearStep(s, title, body, sub) {
  return {
    short: `${s.name}, last year`, group: ONE, title, body,
    stage: { kind: "table", landed: landedBefore(s), atGutter: [s.id], focus: { id: s.id, phase: "last" }, appear: s.id,
             highlight: [s.id], title: `${s.name}, last year`, sub, legend: "row",
             callouts: [{ id: s.id, title: `${s.name}: ${s.prior} last year`, detail: bandLabel(s.prior), short: `${s.name}: ${s.prior}` }],
             desc: `${s.name} waits outside the table on the ${s.prior} row, last year's band.` },
  }
}
function thisYearStep(s, title, body, sub) {
  const pts = pointText(s.points)
  return {
    short: `${s.name}, this year`, group: ONE, title, body,
    stage: { kind: "table", landed: [...landedBefore(s), s.id], focus: { id: s.id, phase: "this" },
             highlight: [s.id], title: `${s.name}, this year`, sub, legend: "rowcol",
             callouts: [{ id: s.id, title: `${s.name}: ${pts} point`, detail: `${s.prior} last year, ${s.current} this year`, short: `${s.name}: ${pts} point` }],
             desc: `${s.name} slides along the ${s.prior} row into the ${s.current} column. The cell is worth ${pts} point.` },
  }
}
function landedBefore(s) {
  const order = [SB.id, SA.id, SC.id]
  return order.slice(0, order.indexOf(s.id))
}

const STEPS = [
  {
    short: "Start", group: "Start",
    title: "How STAAR growth is measured for TIA",
    body: (
      <>
        <p>For some courses, a teacher&apos;s growth score comes from <strong>STAAR</strong>. Each student&apos;s result this year is compared with their result last year, using a chart from TEA called the <strong>transition table</strong>.</p>
        <p>This walkthrough shows how one class&apos;s results become a teacher&apos;s growth score, one step at a time.</p>
        <p className="note">Note: This applies to Grades 6 to 8 RLA and Math, Algebra I, English I and English II.</p>
        <p className="note">Each circle is one student in {TEACHER}&apos;s {COURSE} class. These students and their results are made up.</p>
      </>
    ),
    stage: { kind: "roster", stagger: "intro", title: `${TEACHER}'s ${COURSE} class`, sub: `${ROSTER} students on the roster`, legend: "hint",
             desc: `${ROSTER} circles, one for each student on the roster.` },
  },
  {
    short: "Who counts", group: "Who counts",
    title: "Only students with both results count",
    body: (
      <>
        <p>A student counts only if they have a valid STAAR result from <strong>last year and this year</strong>. Without both, there is nothing to compare.</p>
        <p>Student 25 has no STAAR result from last year, and Student 26 has none from this year. Both are set aside, which leaves <strong>{N} students</strong>.</p>
        <p className="note">Last year&apos;s result comes from the matching test the year before. For Grade 7 Math that is Grade 6 Math. For Algebra I it is Grade 8 Math, for English I it is Grade 8 RLA, and for English II it is English I.</p>
        <p className="note">For Algebra I, English I and English II, only a student&apos;s first attempt counts. Retests are not used for growth.</p>
      </>
    ),
    stage: { kind: "counted", title: "Who counts", sub: `${N} students have results from both years`, legend: "counted",
             desc: `${N} counted students on the left. Two students without both results are set aside.` },
  },
  {
    short: "The table", group: "The table",
    title: "The transition table compares two years",
    body: (
      <>
        <p>TEA&apos;s transition table has a <strong>row for each band last year</strong> and a <strong>column for each band this year</strong>.</p>
        <p>STAAR reports four performance levels. For growth, TEA splits Did Not Meet and Approaches into a <strong>low</strong> and a <strong>high</strong> band. That makes six bands, from <Code>0L</Code> to <NoWrap><Code>3M</Code>.</NoWrap></p>
        <p>Each cell is worth some growth points. They are hidden for now: you will see them as students land.</p>
        <p className="note">The table is laid out the same way as TEA&apos;s: last year down the side, this year across the top.</p>
      </>
    ),
    stage: { kind: "table", title: "TEA's transition table", sub: "Last year down the side, this year across the top",
             desc: "An empty six by six table. Rows are last year's bands, columns are this year's bands." },
  },
  lastYearStep(SB, "Student 12 starts on last year's row", (
    <>
      <p>Last year, {SB.name} scored <strong>Did Not Meet Low</strong> <NoWrap><Code>0L</Code>.</NoWrap></p>
      <p>So they start on the <strong>0L row</strong>, just outside the table on the left. That row is highlighted.</p>
    </>
  ), "Starts on the 0L row"),
  thisYearStep(SB, "Then they move to this year's column", (
    <>
      <p>This year, {SB.name} reached <strong>Did Not Meet High</strong> <NoWrap><Code>0H</Code>,</NoWrap> so they slide along their row into the <strong>0H column</strong>.</p>
      <p>The cell where the row and the column cross is worth <strong>1 point</strong>. They moved up one band, even though they are still in Did Not Meet.</p>
    </>
  ), "Lands in the 0H column"),
  lastYearStep(SA, "Student 5 starts on the 1H row", (
    <>
      <p>Last year, {SA.name} scored <strong>Approaches High</strong> <NoWrap><Code>1H</Code>,</NoWrap> so they start on the <strong>1H row</strong>.</p>
    </>
  ), "Starts on the 1H row"),
  thisYearStep(SA, "Staying in the same band", (
    <>
      <p>This year, {SA.name} scored <strong>Approaches High</strong> again, so they land in the <strong>1H column</strong> of their own row.</p>
      <p>Staying in Approaches High earns only <strong>½ point</strong>. The same is true for staying in Did Not Meet High or Approaches Low.</p>
    </>
  ), "Lands in the 1H column"),
  lastYearStep(SC, "Student 8 starts on the 1L row", (
    <>
      <p>Last year, {SC.name} scored <strong>Approaches Low</strong> <NoWrap><Code>1L</Code>,</NoWrap> so they start on the <strong>1L row</strong>.</p>
    </>
  ), "Starts on the 1L row"),
  thisYearStep(SC, "Jumping more than one band", (
    <>
      <p>This year, {SC.name} reached <strong>Meets</strong> <NoWrap><Code>2M</Code>,</NoWrap> two bands higher, so they land in the <strong>2M column</strong>.</p>
      <p>The cell is worth <strong>1 point</strong>. Moving up one band or several earns the same single point.</p>
    </>
  ), "Lands in the 2M column"),
  {
    short: "Everyone", group: CLASS,
    title: "Everyone else lands the same way",
    body: (
      <>
        <p>The other {REST.length} students follow the same path: they start on last year&apos;s row and slide into this year&apos;s column.</p>
        <p>Now every cell&apos;s points are showing. Moving up any amount earns <strong>1</strong>, and moving down earns <strong>0</strong>. Staying in the same band earns ½ for <NoWrap><Code>0H</Code>,</NoWrap> <Code>1L</Code> and <NoWrap><Code>1H</Code>,</NoWrap> 1 for Meets and Masters, and 0 for <NoWrap><Code>0L</Code>.</NoWrap></p>
      </>
    ),
    stage: { kind: "table", landed: "all", everyone: true, highlight: [SB.id, SA.id, SC.id], title: "The whole class", sub: "Every cell's points are now showing", legend: "points",
             desc: `All ${N} counted students in their cells, and every cell's points showing.` },
  },
  {
    short: "Met or not", group: CLASS,
    title: "Only a full point counts as met growth",
    body: (
      <>
        <p>A student <strong>met growth</strong> only when their cell is worth a full <strong>1 point</strong>. A cell worth ½ counts as not met.</p>
        <p>{SB.name} and {SC.name} earned 1 point, so they met growth. {SA.name} earned ½ point, so they did not.</p>
        <p>In short: a student meets growth by <strong>moving up at least one band</strong>, or by <strong>staying at Meets or Masters</strong>.</p>
        <p className="note">TEA lets each district decide whether ½ point counts. In this example only full points count, so the {HALF} students with ½ point did not meet growth.</p>
      </>
    ),
    stage: { kind: "table", landed: "all", result: true, highlight: [SB.id, SA.id, SC.id], title: "Met growth: the 1 point cells", sub: "The outlined cells count as met growth", legend: "met",
             callouts: [
               { id: SB.id, title: `${SB.name}: met`, short: `${SB.name}: met` },
               { id: SA.id, title: `${SA.name}: not met, ½ point`, short: `${SA.name}: not met` },
               { id: SC.id, title: `${SC.name}: met`, short: `${SC.name}: met` },
             ],
             desc: `Cells worth 1 point are outlined. ${MET} of ${N} students sit in them and met growth.` },
  },
  {
    short: "Teacher score", group: "Teacher score",
    title: "From students to a teacher's growth score",
    body: (
      <>
        <p>Each counted student gives their teacher <strong>one record</strong>. {TEACHER} has {N} counted students, so {N} records.</p>
        <p>The growth score is the number of students who met growth divided by the number of counted students: {MET} ÷ {N} = <strong>{pctShown(SHARE)}</strong>.</p>
        <p className="note">Percentages here are rounded to two decimals so they are easy to read. The real calculation does not round: it uses the full value, {pctFull(SHARE)}.</p>
      </>
    ),
    stage: { kind: "table", landed: "all", result: true, overlay: "teacher", desc: `${TEACHER}'s result: ${MET} of ${N} students met growth.` },
  },
  {
    short: "Summary", group: "Summary",
    title: "The whole model on one page",
    body: (
      <>
        <p>The same steps apply to every course that uses the STAAR transition table.</p>
        <p>Select <strong>View the numbers</strong> to see every student&apos;s bands, points and result.</p>
      </>
    ),
    stage: { kind: "table", landed: "all", result: true, overlay: "summary", desc: "Summary of the STAAR transition table model." },
  },
]

// ---- The transition table, drawn behind the circles -----------------------------------
function TableBackdrop({ T, reveal, focus, met, quick }) {
  const { x0, x1, y0, y1, cw, ch, X, Y, cell, p, narrow } = T
  // Remember the last highlighted row and column, so the highlight slides
  // between rows instead of jumping, and fades out where it was.
  const lastRow = useRef(0)
  const lastCol = useRef(0)
  const row = focus ? BAND_INDEX[focus.s.prior] : null
  const col = focus && focus.phase === "this" ? BAND_INDEX[focus.s.current] : null
  if (row != null) lastRow.current = row
  if (col != null) lastCol.current = col
  const t = (d) => (quick ? { duration: 0 } : d)
  const start = [1, 2, 3, 4, 4, 5] // first 1 point column in each row
  let outline = `M${X(start[0])},${Y(0)} L${X(6)},${Y(0)} L${X(6)},${Y(6)}`
  for (let i = 5; i >= 0; i--) outline += ` L${X(start[i])},${Y(i + 1)} L${X(start[i])},${Y(i)}`
  outline += " Z"

  return (
    <g>
      {/* empty cells, then each cell's color fading in when its points are revealed */}
      <rect className="stx-cell-0" x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
      {TABLE.map((rowVals, i) => rowVals.map((v, j) => {
        const c = cell(i, j)
        const r = reveal[`${i},${j}`]
        return (
          <motion.rect key={`f${i}${j}`} className={v === 1 ? "stx-cell-1" : v === 0.5 ? "stx-cell-half" : "stx-cell-0"}
                       x={c.x} y={c.y} width={c.w} height={c.h} initial={false}
                       animate={{ opacity: r != null ? 1 : 0 }} transition={t({ duration: 0.45, delay: r ?? 0 })} />
        )
      }))}

      {/* the followed student's row (last year) and column (this year) */}
      <motion.rect className="stx-hl-band" x={p.l} width={x1 - p.l} height={ch} initial={false}
                   animate={{ y: Y(lastRow.current), opacity: row != null ? 1 : 0 }} transition={t({ duration: 0.5, ease: EASE })} />
      <motion.rect className="stx-hl-band" y={p.t - 4} width={cw} height={y1 - p.t + 4} initial={false}
                   animate={{ x: X(lastCol.current), opacity: col != null ? 1 : 0 }} transition={t({ duration: 0.5, ease: EASE, delay: col != null ? 0.15 : 0 })} />

      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <g key={`g${k}`}>
          <line className="stx-line-strong" x1={X(k)} x2={X(k)} y1={y0} y2={y1} />
          <line className="stx-line-strong" x1={x0} x2={x1} y1={Y(k)} y2={Y(k)} />
        </g>
      ))}

      {/* where the row and column cross: outlined as the student lands */}
      {focus && col != null && (
        <motion.rect key={`x${focus.s.id}`} className="stx-hl-cell" x={X(col) + 2} y={Y(row) + 2} width={cw - 4} height={ch - 4} rx="4"
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t({ duration: 0.3, delay: MOVE * 0.85 })} />
      )}

      {/* column headings: this year */}
      {BANDS.map((b, j) => (
        <g key={`c${b.code}`}>
          <text className={`stx-chip-text${col === j ? " is-hl" : ""}`} x={X(j) + cw / 2} y={narrow ? y0 - 10 : y0 - 26} textAnchor="middle">{b.code}</text>
          {!narrow && <text className="stx-sub" x={X(j) + cw / 2} y={y0 - 10} textAnchor="middle" fontSize="11.5">{b.short}</text>}
        </g>
      ))}
      {/* row headings: last year */}
      {BANDS.map((b, i) => (
        <g key={`r${b.code}`}>
          <rect className={`stx-chip-rect${row === i ? " is-hl" : ""}`} x={p.l + (narrow ? 0 : 4)} y={Y(i) + ch / 2 - 11} width="34" height="22" rx="6" />
          <text className="stx-chip-text" x={p.l + (narrow ? 17 : 21)} y={Y(i) + ch / 2 + 4} textAnchor="middle">{b.code}</text>
          {!narrow && <text className="stx-sub" x={p.l + 46} y={Y(i) + ch / 2 + 4} fontSize="12.5">{b.name}</text>}
        </g>
      ))}
      {!narrow && (
        <>
          <text className="stx-corner" x={x0 - 10} y={y0 - 26} textAnchor="end">This year →</text>
          <text className="stx-corner" x={p.l + 4} y={y0 - 8}>Last year ↓</text>
        </>
      )}

      {met && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t({ duration: 0.5, delay: 0.15 })}>
          <path className="stx-met-outline" d={outline} />
          {TABLE.map((rowVals, i) => rowVals.map((v, j) => {
            if (v !== 0.5) return null
            const c = cell(i, j)
            return (
              <g key={`h${i}${j}`}>
                <rect className="stx-half-mark" x={c.x + 4} y={c.y + 4} width={c.w - 8} height={c.h - 8} rx="6" />
                {!narrow && c.w > 96 && <text className="stx-half-note" x={c.cx} y={c.y + c.h - 11} textAnchor="middle">Not met here</text>}
              </g>
            )
          }))}
        </motion.g>
      )}
    </g>
  )
}

// Each cell's points, as HTML so they scale from their own center. They pop
// in when revealed; the cell a followed student just landed in pops larger.
function PointsLayer({ T, reveal, focusKey, quick }) {
  const { cell, narrow } = T
  return (
    <div className="stx-pts-layer" aria-hidden="true">
      {TABLE.map((rowVals, i) => rowVals.map((v, j) => {
        const c = cell(i, j)
        const k = `${i},${j}`
        const r = reveal[k]
        const big = k === focusKey && !quick
        return (
          <motion.span key={k} className={`stx-pt${v === 1 ? " is-1" : ""}`}
                       style={{ left: c.x + (narrow ? 4 : 8), top: c.y + (narrow ? 3 : 6), fontSize: narrow ? 10.5 : 13 }}
                       initial={false}
                       animate={{ opacity: r != null ? 1 : 0, scale: r != null ? (big ? [0.3, 1.9, 1] : 1) : 0.4 }}
                       transition={quick ? { duration: 0 } : { duration: big ? 0.7 : 0.4, delay: r ?? 0, ease: EASE, opacity: { duration: 0.2, delay: r ?? 0 } }}>
            {pointText(v)}
          </motion.span>
        )
      }))}
    </div>
  )
}

function TrayBackdrop({ g }) {
  const { tray, items, narrow } = g
  return (
    <g>
      <rect className="stx-tray" x={tray.x} y={tray.y} width={tray.w} height={tray.h} rx="14" />
      <text className="stx-tray-title" x={tray.x + 18} y={tray.y + (narrow ? 26 : 32)}>Set aside, not counted</text>
      {items.map((it) => (
        <g key={it.id}>
          <text className="stx-tray-name" x={it.x} y={it.y - 3}>{it.name}</text>
          <text className="stx-tray-reason" x={it.x} y={it.y + 14}>{it.reason}</text>
        </g>
      ))}
    </g>
  )
}

// ---- Legend in the stage heading ------------------------------------------------------
function Legend({ kind, coarse }) {
  const dot = (fill, stroke) => (
    <svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.5" fill={fill} stroke={stroke || "none"} strokeWidth="1.5" /></svg>
  )
  const swatch = (cls) => (
    <svg viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" rx="3" className={cls} stroke="var(--hair-strong)" /></svg>
  )
  const band = <svg viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" rx="3" className="stx-hl-band stx-hl-swatch" /></svg>
  if (kind === "hint") return <span className="stx-stage-hint">{coarse ? "Tap" : "Point at"} a circle for details</span>
  if (kind === "counted") return <><span>{dot("var(--neutral)")}Counted</span><span>{dot("var(--surface)", "var(--axis)")}Set aside</span></>
  if (kind === "row") return <span>{band}Last year&apos;s row</span>
  if (kind === "rowcol") return <><span>{band}Last year&apos;s row</span><span>{band}This year&apos;s column</span></>
  if (kind === "points") return <><span>{swatch("stx-cell-1")}1 point</span><span>{swatch("stx-cell-half")}½ point</span><span>{swatch("stx-cell-0")}0 points</span></>
  if (kind === "met") return <><span>{dot("var(--met)")}Met growth</span><span>{dot("var(--surface)", "var(--met)")}Not met</span></>
  return null
}

// ---- Overlays: the teacher's score and the summary -------------------------------------
function TeacherOverlay() {
  return (
    <div className="stx-ov">
      <div className="stx-ov-head">
        <div>
          <h2 className="stx-ov-title">{TEACHER}&apos;s class</h2>
          <p className="stx-ov-sub">{N} counted students, one record each</p>
        </div>
        <div className="stx-result">
          <p className="stx-result-figure">{pctShown(SHARE)}</p>
          <p className="stx-result-label">{MET} of {N} students met growth</p>
        </div>
      </div>
      <div className="stx-strip" aria-hidden="true">
        <div className="stx-cells">{COUNTED.map((s) => <span key={s.id} className={`stx-sq${s.met ? " is-met" : ""}`} />)}</div>
        <span className="stx-strip-label">Each square is one counted student. Filled squares met growth.</span>
      </div>
      <p className="stx-equation">{MET} students met ÷ {N} counted students = <strong>{pctShown(SHARE)}</strong></p>
      <div className="stx-rounding">
        <IconInfo />
        <span>Shown rounded to two decimals. The real calculation is not rounded: it uses the full value, <strong>{pctFull(SHARE)}</strong>.</span>
      </div>
      <ul className="stx-rec-list" style={{ "--rows": Math.ceil(N / 2) }} aria-label="Result for each counted student">
        {COUNTED.map((s, i) => (
          <motion.li key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.12 + i * 0.03, ease: EASE }}>
            <span className="stx-rec-name">{s.name}</span>
            <span className={`stx-chip ${s.met ? "is-met" : "is-not"}`}>{s.met ? <IconCheck /> : <IconX />}{s.met ? "Met" : "Not met"}</span>
            <span className="stx-rec-detail">{s.prior} to {s.current}, {pointText(s.points)} {s.points === 0 ? "points" : "point"}</span>
          </motion.li>
        ))}
      </ul>
      <p className="stx-aside-note">Not counted: {SET_ASIDE.map((s) => `${s.name} (${s.reason.toLowerCase()})`).join(" and ")}.</p>
    </div>
  )
}

function SummaryOverlay({ onRestart, onData }) {
  const rules = [
    ["Check who counts", "Only students with a valid STAAR result from last year and this year count. For Algebra I, English I and English II, only the first attempt is used."],
    ["Start on last year's row", "Find the student's band on last year's STAAR, from Did Not Meet Low (0L) to Masters (3M). That band is their row in the transition table."],
    ["Move to this year's column", "Find their band on this year's STAAR. That band is their column."],
    ["Read the cell", "The cell where the row and the column cross is worth 1, ½ or 0 points."],
    ["Count full points only", "A student met growth when the cell is worth 1 point. The teacher's growth score is students who met growth divided by counted students, using the full value without rounding."],
  ]
  return (
    <div className="stx-ov">
      <h2 className="stx-ov-title">The STAAR transition table model in five steps</h2>
      <ol className="stx-rules">
        {rules.map(([head, text], i) => (
          <li key={head}><span className="stx-rule-n">{i + 1}</span><div><p className="stx-rule-head">{head}</p><p className="stx-rule-text">{text}</p></div></li>
        ))}
      </ol>
      <div className="stx-ov-actions">
        <button className="stx-btn stx-btn-primary" type="button" onClick={onRestart}>Start over</button>
        <button className="stx-btn" type="button" onClick={onData}>View the numbers</button>
      </div>
    </div>
  )
}

// ---- Text measuring for callout boxes -----------------------------------------------------
let measureCtx = null
function textWidth(text, font) {
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d")
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

// ---- The page ------------------------------------------------------------------------------
export default function StaarTransitionPage() {
  const [params, setParams] = useSearchParams()
  const stepFromUrl = () => {
    const n = parseInt(params.get("step") || "1", 10)
    return Number.isFinite(n) ? Math.min(Math.max(n - 1, 0), STEPS.length - 1) : 0
  }
  const [step, setStep] = useState(stepFromUrl)
  const firstStep = useRef(step)
  const reduced = useReducedMotion()
  const stageRef = useRef(null)
  const headRef = useRef(null)
  const dialogRef = useRef(null)
  const [size, setSize] = useState({ W: 0, H: 0 })
  const [headH, setHeadH] = useState(40)
  const [instant, setInstant] = useState(false)
  const [tip, setTip] = useState(null)
  const [fullscreen, setFullscreen] = useState(false)
  // Callout boxes are sized by measuring their text, so measure again once Lexend has loaded.
  const [fontsReady, setFontsReady] = useState(false)
  const [coarse] = useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches)

  const st = STEPS[step]
  const S = { highlight: [], callouts: [], legend: null, overlay: null, result: false, ...st.stage }
  const quick = instant || reduced

  // The browser tab title while this page is open.
  useEffect(() => {
    const before = document.title
    document.title = "STAAR Transition Growth"
    return () => { document.title = before }
  }, [])

  useEffect(() => {
    let live = true
    const done = () => { if (live) setFontsReady(true) }
    if (document.fonts?.load) document.fonts.load('600 13px "Lexend"').then(done, done)
    else done()
    return () => { live = false }
  }, [])

  // Keep ?step= in the address in sync, so any step can be shared or reloaded.
  useEffect(() => {
    if (params.get("step") !== String(step + 1)) setParams({ step: String(step + 1) }, { replace: true })
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setStep(stepFromUrl()) }, [params]) // eslint-disable-line react-hooks/exhaustive-deps

  // Measure the stage; on resize, jump to the new positions instead of animating.
  useLayoutEffect(() => {
    const el = stageRef.current
    let frame = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setSize((old) => {
          const W = el.clientWidth, H = el.clientHeight
          if (Math.abs(old.W - W) < 1 && Math.abs(old.H - H) < 1) return old
          if (old.W > 0) setInstant(true)
          return { W, H }
        })
      })
    })
    ro.observe(el)
    return () => { ro.disconnect(); cancelAnimationFrame(frame) }
  }, [])
  useEffect(() => {
    if (!instant) return
    const f = requestAnimationFrame(() => setInstant(false))
    return () => cancelAnimationFrame(f)
  }, [instant])

  // The stage heading's height decides where the drawing can start.
  useLayoutEffect(() => {
    if (headRef.current) setHeadH(S.title || S.legend ? headRef.current.offsetHeight : 0)
  }, [step, size.W]) // eslint-disable-line react-hooks/exhaustive-deps

  const go = useCallback((i) => { setTip(null); setStep(Math.min(Math.max(i, 0), STEPS.length - 1)) }, [])
  const next = useCallback(() => go(step === STEPS.length - 1 ? 0 : step + 1), [go, step])
  const prev = useCallback(() => go(step - 1), [go, step])
  const openData = useCallback(() => { if (dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal() }, [])

  // Arrow keys, Page Up/Down, Home and End move between steps.
  useEffect(() => {
    const onKey = (e) => {
      if (dialogRef.current?.open || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.target.closest?.("input, select, textarea")) return
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); if (step < STEPS.length - 1) go(step + 1) }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(step - 1) }
      else if (e.key === "Home") { e.preventDefault(); go(0) }
      else if (e.key === "End") { e.preventDefault(); go(STEPS.length - 1) }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [step, go])

  // Present: full screen.
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onFs)
    return () => document.removeEventListener("fullscreenchange", onFs)
  }, [])
  const togglePresent = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }

  // ---- Layout for this step ----
  const narrow = size.W > 0 && size.W < 620
  const geo = { W: size.W, H: size.H, headH, narrow }
  const landed = useMemo(() => (S.landed === "all" ? ALL : new Set(S.landed || [])), [step]) // eslint-disable-line react-hooks/exhaustive-deps
  const atGutter = useMemo(() => new Set(S.atGutter || []), [step]) // eslint-disable-line react-hooks/exhaustive-deps
  const L = useMemo(() => (size.W ? layoutFor(S.kind, geo, { landed, atGutter }) : null), [step, size.W, size.H, headH]) // eslint-disable-line react-hooks/exhaustive-deps
  const parked = useMemo(() => (size.W ? layoutFor("counted", geo) : null), [size.W, size.H, headH]) // eslint-disable-line react-hooks/exhaustive-deps
  const hl = new Set(S.highlight)
  const focus = S.focus ? { s: STUDENTS.find((x) => x.id === S.focus.id), phase: S.focus.phase } : null

  // Which cells show their points, and when (seconds after the step starts).
  const reveal = useMemo(() => {
    const out = {}
    if (S.landed === "all") {
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
        const k = `${i},${j}`
        out[k] = S.everyone ? (CELL_REVEAL[k] ?? REST_DONE + 0.1) : 0
      }
      return out
    }
    for (const id of landed) {
      const s = STUDENTS.find((x) => x.id === id)
      const k = cellKey(s)
      out[k] = focus && focus.phase === "this" && focus.s.id === id ? MOVE * 0.85 : 0
    }
    return out
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  const callouts = useMemo(() => {
    if (!L || !S.callouts.length) return []
    const sized = S.callouts.map((c) => {
      const title = narrow ? c.short : c.title
      const detail = narrow ? null : c.detail
      const w = Math.ceil(Math.max(textWidth(title, '600 13px "Lexend"'), detail ? textWidth(detail, '400 12.5px "Lexend"') : 0)) + 30
      return { ...c, title, detail, w, h: detail ? 50 : 32 }
    })
    const g = L.geo
    const obstacles = []
    if (g?.kind === "table") {
      obstacles.push({ x: g.p.l, y: g.y0, w: g.rowHeadW, h: g.y1 - g.y0 }, { x: g.x0, y: g.p.t, w: g.x1 - g.x0, h: g.colHeadH })
      // avoid covering a revealed cell's points, or a "Not met here" note
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
        const c = g.cell(i, j)
        if (reveal[`${i},${j}`] != null) obstacles.push({ x: c.x + 3, y: c.y + 3, w: 18, h: 18 })
        if (S.result && TABLE[i][j] === 0.5) obstacles.push({ x: c.x + 4, y: c.y + c.h - 24, w: c.w - 8, h: 20 })
      }
    }
    return placeCallouts(sized, L.dots, geo, L.p.t - 10, obstacles)
  }, [L, step, narrow, fontsReady]) // eslint-disable-line react-hooks/exhaustive-deps
  // Callouts wait until their student has settled.
  const calloutDelay = quick ? 0 : focus?.phase === "this" ? MOVE + 0.2 : focus?.phase === "last" ? 0.55 : MOVE + 0.25

  // How each circle gets to where this step puts it.
  function motionFor(s, d) {
    const box = { x: d.x - d.r, y: d.y - d.r, width: 2 * d.r, height: 2 * d.r }
    if (d.hidden) {
      // fade out where it is, then move out of sight
      return { animate: { ...box, opacity: 0, scale: 1 }, transition: quick ? { duration: 0 } : { duration: 0, delay: 0.25, opacity: { duration: 0.25 } } }
    }
    if (S.everyone && !FEATURED.has(s.id) && L.gutter) {
      // appear on last year's row, outside the table, then slide into this year's column
      const g = L.gutter[s.id]
      if (quick) return { animate: { ...box, opacity: 1, scale: 1 }, transition: { duration: 0 } }
      return {
        animate: { x: [g.x - g.r, g.x - g.r, box.x], y: [g.y - g.r, g.y - g.r, box.y], width: box.width, height: box.height, opacity: [0, 1, 1], scale: 1 },
        transition: { duration: ENTER, times: [0, 0.3, 1], ease: ["easeOut", EASE], delay: REST_DELAY[s.id], width: { duration: 0 }, height: { duration: 0 } },
      }
    }
    if (S.appear === s.id) {
      // the followed student pops in on last year's row
      return { animate: { ...box, opacity: 1, scale: quick ? 1 : [0.3, 1.18, 1] }, transition: quick ? { duration: 0 } : { duration: MOVE, ease: EASE, scale: { duration: 0.55, times: [0, 0.6, 1] }, opacity: { duration: 0.25 } } }
    }
    const delay = !quick && S.stagger === "intro" ? 0.12 + s.id * 0.045 : 0
    return { animate: { ...box, opacity: 1, scale: 1 }, transition: { duration: quick ? 0 : MOVE, ease: EASE, delay } }
  }

  // ---- Tooltip ----
  const showTip = (s, e) => {
    if (S.overlay) return
    const box = stageRef.current.getBoundingClientRect()
    const rows = []
    if (step >= 1) rows.push(["Counted", s.counted ? "Yes" : "No"])
    if (!s.counted && step >= 1) rows.push(["Reason", s.reason.replace("No STAAR result ", "No result ")])
    const d = L?.dots[s.id]
    if (s.counted && S.kind === "table" && d && !d.hidden) {
      rows.push(["Last year", bandLabel(s.prior)])
      if (d.landed) rows.push(["This year", bandLabel(s.current)], ["Move", s.move.text], ["TEA points", pointText(s.points)])
      if (S.result) rows.push(["Result", s.met ? "Met growth" : "Not met"])
    }
    setTip({ s, rows, x: e.clientX - box.left, y: e.clientY - box.top, bw: box.width, bh: box.height })
  }

  // Step bar groups, like the other explainers.
  const groups = useMemo(() => {
    const out = []
    let start = 0
    for (let i = 1; i <= STEPS.length; i++) {
      if (i === STEPS.length || STEPS[i].group !== STEPS[start].group) { out.push({ name: STEPS[start].group, start, span: i - start }); start = i }
    }
    return out
  }, [])

  const stepCount = st.group === "Start" || st.group === "Summary"
    ? `Step ${step + 1} of ${STEPS.length}`
    : `${st.group}, step ${step + 1} of ${STEPS.length}`

  return (
    <div className="stx stx-page" style={{ margin: -16 }}>
      {/* This page paints its own background, even past the edges when scrolling */}
      <GlobalStyles styles={{
        body: { backgroundColor: "#f2f4f7 !important" },
        "@media (prefers-color-scheme: dark)": { body: { backgroundColor: "#0d131b !important" } },
      }} />
      <div className="stx-app">
        <header className="stx-topbar">
          <p className="stx-brand">
            <svg className="stx-brand-mark" viewBox="0 0 34 22" aria-hidden="true">
              <circle cx="4" cy="17" r="3.4" fill="var(--q1)" />
              <circle cx="10.5" cy="14" r="3.4" fill="var(--q2)" />
              <circle cx="17" cy="11" r="3.4" fill="var(--q3)" />
              <circle cx="23.5" cy="8" r="3.4" fill="var(--q4)" />
              <circle cx="30" cy="5" r="3.4" fill="var(--q5)" />
            </svg>
            <span>STAAR growth, explained <span className="stx-brand-sub">TIA transition table model</span></span>
          </p>
          <div className="stx-top-actions">
            <button className="stx-btn stx-btn-ghost" type="button" onClick={openData}><span>View <span className="stx-wide-only">the </span>numbers</span></button>
            {typeof document !== "undefined" && document.fullscreenEnabled && (
              <button className="stx-btn stx-btn-ghost stx-present" type="button" onClick={togglePresent}>{fullscreen ? "Exit full screen" : "Present"}</button>
            )}
          </div>
        </header>

        <main className="stx-layout">
          <section className="stx-narrative" aria-labelledby="stx-step-title">
            <p className="stx-step-count">{stepCount}</p>
            <h1 className="stx-step-title" id="stx-step-title" tabIndex={-1}>{st.title}</h1>
            <div className="stx-step-body">{st.body}</div>
            <div className="stx-controls">
              <button className="stx-btn" type="button" onClick={prev} disabled={step === 0}>Back</button>
              <button className="stx-btn stx-btn-primary" type="button" onClick={next}>
                {step === 0 ? "Start" : step === STEPS.length - 1 ? "Start over" : "Next"}
              </button>
              <span className="stx-kbd-hint"><kbd>←</kbd> <kbd>→</kbd> to move</span>
            </div>
          </section>

          <section className="stx-stage-wrap" ref={stageRef} aria-label="Animated example" onPointerLeave={(e) => { if (e.pointerType === "mouse") setTip(null) }}
                   onPointerDown={(e) => { if (!e.target.closest(".stx-dot")) setTip(null) }}>
            <div className="stx-stage-head" ref={headRef}>
              {(S.title || S.sub) && (
                <p className="stx-stage-title">{S.title}{S.sub && <span className="stx-stage-sub">{narrow && step === 2 ? "Rows: last year. Columns: this year." : S.sub}</span>}</p>
              )}
              <div className="stx-legend"><Legend kind={S.legend} coarse={coarse} /></div>
            </div>

            <div className={`stx-scene${S.overlay ? " is-faded" : ""}`} role="img" aria-label={S.desc}>
              {L && (
                <>
                  <svg className="stx-svg" viewBox={`0 0 ${size.W} ${size.H}`} aria-hidden="true">
                    <AnimatePresence initial={false}>
                      {L.geo && (
                        <motion.g key={L.geo.kind} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                  transition={{ duration: quick ? 0 : 0.45 }}>
                          {L.geo.kind === "table"
                            ? <TableBackdrop T={L.geo} reveal={reveal} focus={focus} met={S.result} quick={quick} />
                            : <TrayBackdrop g={L.geo} />}
                        </motion.g>
                      )}
                    </AnimatePresence>
                  </svg>

                  {L.geo?.kind === "table" && (
                    <PointsLayer T={L.geo} reveal={reveal} quick={quick}
                                 focusKey={focus && focus.phase === "this" ? cellKey(focus.s) : null} />
                  )}
                  <div className="stx-dots">
                    {STUDENTS.map((s) => {
                      const d = L.dots[s.id] || { ...parked.dots[s.id], hidden: true }
                      const showNum = d.r >= 13
                      const result = S.result && s.counted
                      const cls = ["stx-dot",
                        hl.has(s.id) ? "is-hl" : "",
                        result ? (s.met ? "is-met" : "is-not") : "",
                        S.kind === "counted" && !s.counted ? "is-aside" : ""].join(" ")
                      const m = motionFor(s, d)
                      const start = firstStep.current === 0 && !reduced
                        ? { x: d.x - d.r, y: d.y - d.r + 14, width: 2 * d.r, height: 2 * d.r, opacity: 0 }
                        : false
                      return (
                        <motion.div key={s.id} className={cls} initial={start} animate={m.animate} transition={m.transition}
                                    style={{ pointerEvents: d.hidden ? "none" : "auto" }}
                                    onPointerEnter={(e) => showTip(s, e)} onPointerMove={(e) => showTip(s, e)}
                                    onPointerDown={(e) => showTip(s, e)}>
                          <span className="stx-ring" />
                          {showNum && <span className="stx-dot-num">{s.id}</span>}
                          {result && d.r >= 5.5 && (s.met ? <IconCheck /> : <IconX />)}
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Callouts for the followed students, after they settle */}
                  <AnimatePresence>
                    {callouts.length > 0 && (
                      <motion.div key={`co-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                  transition={{ duration: 0.35, delay: calloutDelay }}>
                        <svg className="stx-svg" viewBox={`0 0 ${size.W} ${size.H}`} aria-hidden="true" style={{ zIndex: 3, pointerEvents: "none" }}>
                          {callouts.map((c) => <line key={c.id} className="stx-lead" {...c.lead} />)}
                        </svg>
                        {callouts.map((c) => (
                          <div key={c.id} className="stx-callout" style={{ left: c.box.x, top: c.box.y, width: c.w, height: c.h }}>
                            <p className="stx-callout-title">{c.title}</p>
                            {c.detail && <p className="stx-callout-detail">{c.detail}</p>}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            <AnimatePresence>
              {S.overlay && (
                <motion.div key={S.overlay} className="stx-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: reduced ? 0 : 0.4 }}>
                  {S.overlay === "teacher" ? <TeacherOverlay /> : <SummaryOverlay onRestart={() => go(0)} onData={openData} />}
                </motion.div>
              )}
            </AnimatePresence>

            {tip && !S.overlay && <TooltipBox tip={tip} />}
          </section>
        </main>

        <footer className="stx-progress">
          <nav aria-label="Steps">
            <ol className="stx-progress-track" style={{ "--steps": STEPS.length }}>
              {STEPS.map((s, i) => (
                <li key={s.short}>
                  <button className={`stx-seg${i === step ? " is-current" : ""}${i < step ? " is-done" : ""}`} type="button"
                          aria-label={`Step ${i + 1}: ${s.short}`} aria-current={i === step ? "step" : undefined} onClick={() => go(i)} />
                </li>
              ))}
            </ol>
          </nav>
          <div className="stx-progress-groups" aria-hidden="true" style={{ "--steps": STEPS.length }}>
            {groups.map((g) => (
              <div key={g.name} className={`stx-pg${g.name === st.group ? " is-current" : ""}`} style={{ gridColumn: `${g.start + 1} / span ${g.span}` }}>{g.name}</div>
            ))}
          </div>
          <p className="stx-disclaimer">Every student, teacher and score on this page is made up for illustration.</p>
        </footer>
      </div>

      <dialog className="stx-data" ref={dialogRef} aria-labelledby="stx-dlg-title" onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current.close() }}>
        <div className="stx-dlg-head">
          <div>
            <h2 id="stx-dlg-title">The numbers behind this page</h2>
            <p>Made-up data for one class, calculated live with the same rules shown in the walkthrough.</p>
          </div>
          <button className="stx-btn stx-btn-small" type="button" onClick={() => dialogRef.current.close()}>Close</button>
        </div>
        <div className="stx-dlg-body">
          <table className="stx-table">
            <caption className="sr-only">Results for every student in {TEACHER}&apos;s class</caption>
            <thead>
              <tr><th scope="col">Student</th><th scope="col">Last year</th><th scope="col">This year</th><th scope="col">Move</th><th scope="col">TEA points</th><th scope="col">Result</th></tr>
            </thead>
            <tbody>
              {COUNTED.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td><td>{bandLabel(s.prior)}</td><td>{bandLabel(s.current)}</td><td>{s.move.text}</td>
                  <td>{pointText(s.points)}</td><td>{s.met ? "Met growth" : "Not met"}</td>
                </tr>
              ))}
              {SET_ASIDE.map((s) => (
                <tr key={s.id} className="is-aside">
                  <td>{s.name}</td><td>{s.prior ? bandLabel(s.prior) : "No result"}</td><td>{s.current ? bandLabel(s.current) : "No result"}</td>
                  <td>Not counted</td><td></td><td>Set aside</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={6}>{TEACHER}: {MET} of {N} counted students met growth = {pctShown(SHARE)} (full value {pctFull(SHARE)})</td></tr>
            </tfoot>
          </table>
        </div>
      </dialog>

      <div className="sr-only" aria-live="polite">{`Step ${step + 1} of ${STEPS.length}: ${st.title}`}</div>
    </div>
  )
}

function TooltipBox({ tip }) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ left: tip.x + 14, top: tip.y + 14 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const tw = el.offsetWidth, th = el.offsetHeight
    let x = tip.x + 14, y = tip.y + 14
    if (x + tw > tip.bw - 8) x = tip.x - tw - 14
    if (y + th > tip.bh - 8) y = tip.y - th - 14
    setPos({ left: Math.min(Math.max(x, 8), tip.bw - tw - 8), top: Math.min(Math.max(y, 8), tip.bh - th - 8) })
  }, [tip])
  return (
    <div className="stx-tooltip" role="tooltip" ref={ref} style={pos}>
      <strong>{tip.s.name}</strong>
      <div className="tip-teacher">{TEACHER}&apos;s class</div>
      {tip.rows.length > 0 && (
        <dl>{tip.rows.map(([k, v]) => <FragmentRow key={k} k={k} v={v} />)}</dl>
      )}
    </div>
  )
}
const FragmentRow = ({ k, v }) => <><dt>{k}</dt><dd>{v}</dd></>
