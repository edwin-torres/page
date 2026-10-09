// Teacher TIA What-If
// Route: /projects/teacher-what-if
//
// A teacher sets each of the 16 T-TESS ratings with one click and moves
// the student growth slider; the TIA score and projected designation
// update right away. All scoring lives in ./whatIfMath.js; this file
// draws the page.
//
// Layout (wide screens):   How it works | Designation
//                          Domains 1, 4 | Domains 2, 3
//                          Student growth (full width)
//                          How your numbers compare (full width)
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Box, Button, Slider, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, ThemeProvider, ToggleButton, ToggleButtonGroup, Typography, createTheme, useMediaQuery,
} from "@mui/material"
import {
  scoreTeacher, DIMS_1_4, DIMS_2_3, DIMENSION_NAMES, LEVELS, NONE, RATING_NAMES, WEIGHTS,
} from "./whatIfMath.js"
import { BackToTools } from "../TiaTools/tiaKit.jsx"

// ---- Design tokens ----------------------------------------------------------
// Two typefaces: Bricolage Grotesque for the headline and the designation
// word, IBM Plex Sans for everything else (its tabular numbers keep scores
// from shifting width as they change). Both fall back to system fonts.
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
const SANS = '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif'
const DISPLAY = '"Bricolage Grotesque", "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif'

const T = {
  page: "#EDF1F5", surface: "#FFFFFF", ink: "#142233", muted: "#5A6B7D",
  line: "#DCE3EB", hover: "#F2F5F9", navy: "#13294A",
  // one hue per score component, a light-surface and a dark-surface shade
  a: "#2F55D4", aDark: "#7F9CFF",   // Domains 1 and 4
  b: "#7446C9", bDark: "#BC9DF6",   // Domains 2 and 3
  c: "#C4600C", cDark: "#F6A64A",   // Student growth
  ok: "#17804D", okSoft: "#E4F4EB",
  bad: "#C2362B", badSoft: "#FCE9E7",
  gap: "#9A4A06",
}

const theme = createTheme({
  // lg moves to 1100px so the two-column layout starts on smaller laptops
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1100, xl: 1536 } },
  palette: { primary: { main: T.a }, text: { primary: T.ink, secondary: T.muted } },
  typography: { fontFamily: SANS, button: { textTransform: "none", fontWeight: 600 } },
  shape: { borderRadius: 10 },
})

const NUM = { fontVariantNumeric: "tabular-nums" }
// The white boxes. Radii are written in px: a bare number in sx is
// multiplied by the theme's 10px base radius.
const CARD = { bgcolor: T.surface, border: `1px solid ${T.line}`, borderRadius: "20px", p: { xs: 2, md: 3.5 }, height: "100%" }

// Points one step adds: one rating step moves its domain average by 1/8.
const STEP = {
  d14: WEIGHTS.d14 / 5 / DIMS_1_4.length,   // 0.25
  d23: WEIGHTS.d23 / 5 / DIMS_2_3.length,   // 0.875
  growth: WEIGHTS.growth / 100,             // 0.55 per percentage point
}

// Starting values: a sample teacher, not anyone's real evaluation.
const SAMPLE = {
  ratings: Object.fromEntries([
    ...DIMS_1_4.map((c, i) => [c, i === 3 ? 3 : 4]),
    ...DIMS_2_3.map((c, i) => [c, i === 4 ? 3 : 4]),
  ]),
  growthPct: 58,
}

// Load the two web fonts once (the page still works with the fallbacks).
function useWebFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = FONT_HREF
    document.head.appendChild(link)
  }, [])
}

// A small color square: the same color as this part of the score.
function Swatch({ color }) {
  return <Box component="span" aria-hidden sx={{ display: "inline-block", width: 10, height: 10,
                                                 borderRadius: "3px", bgcolor: color, mr: 1, flex: "none" }} />
}

// ---- Top left: how the score works ---------------------------------------------
function HowItWorks({ r }) {
  const parts = [
    { color: T.a, label: "Domains 1 and 4", weight: WEIGHTS.d14, expr: `${r.text.avg14} ÷ 5 × ${WEIGHTS.d14}`, pts: r.text.points14 },
    { color: T.b, label: "Domains 2 and 3", weight: WEIGHTS.d23, expr: `${r.text.avg23} ÷ 5 × ${WEIGHTS.d23}`, pts: r.text.points23 },
    { color: T.c, label: "Student growth", weight: WEIGHTS.growth, expr: `${r.text.growthDecimal} × ${WEIGHTS.growth}`, pts: r.text.pointsGrowth },
  ]
  return (
    <Box component="section" aria-labelledby="how-title" sx={CARD}>
      <Typography id="how-title" component="h2" sx={{ fontSize: 19, fontWeight: 600 }}>How your TIA score works</Typography>
      <Typography sx={{ fontSize: 14, color: T.muted, mt: 0.5 }}>
        The score is out of 100 points, split across three parts.
      </Typography>

      {/* the 100 points, drawn to scale */}
      <Box aria-hidden sx={{ display: "flex", gap: "3px", mt: 2, height: 30 }}>
        {parts.map((p) => (
          <Box key={p.label} sx={{ width: `${p.weight}%`, bgcolor: p.color, color: "#fff", borderRadius: "6px",
                                   fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center",
                                   justifyContent: "center", ...NUM }}>
            {p.weight}
          </Box>
        ))}
      </Box>

      {/* the formula with this teacher's own numbers */}
      <Box sx={{ mt: 2.5, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", columnGap: 2, rowGap: 1,
                 alignItems: "baseline", fontSize: 14.5 }}>
        {parts.map((p) => (
          <Box key={p.label} sx={{ display: "contents" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}><Swatch color={p.color} />{p.label}</Box>
            <Box sx={{ color: T.muted, ...NUM }}>{p.expr}</Box>
            <Box sx={{ fontWeight: 600, textAlign: "right", ...NUM }}>{p.pts}</Box>
          </Box>
        ))}
        <Box sx={{ gridColumn: "1 / -1", borderTop: `1px solid ${T.line}` }} />
        <Box sx={{ fontWeight: 600 }}>TIA score</Box>
        <Box />
        <Box sx={{ fontWeight: 700, fontSize: 16, textAlign: "right", ...NUM }}>{r.text.score}</Box>
      </Box>

      <Box component="ul" sx={{ m: 0, mt: 2.5, pl: 2.25, color: T.muted, "& li": { fontSize: 13.5, lineHeight: 1.55, mb: 0.75 },
                                "& b": { color: T.ink, fontWeight: 600 } }}>
        <li><b>Why divide by 5?</b> Ratings top out at 5, so an average divided by 5 is the share of that part&apos;s
          points you earn. An average of 4 earns 4 ÷ 5 = 80%.</li>
        <li><b>The averages</b> are the mean of each domain&apos;s 8 ratings, so moving one rating by one step moves
          its average by 0.125.</li>
        <li><b>No rounding.</b> Numbers are cut at 4 decimals, so 63.29999 never counts as 63.3.</li>
      </Box>

      <Box component="ul" aria-label="Rating scale" sx={{ listStyle: "none", p: 0, m: 0, mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Box component="li" key={n} sx={{ fontSize: 13, color: T.muted }}>
            <Box component="span" sx={{ fontWeight: 700, color: T.ink, mr: 0.6, ...NUM }}>{n}</Box>{RATING_NAMES[n]}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// ---- Top right: the designation -------------------------------------------------

// The score bar: the three parts stack up to the TIA score, and a marker
// shows each designation's minimum score.
function ScoreBar({ r }) {
  const parts = [
    { key: "d14", value: r.points14, color: T.aDark },
    { key: "d23", value: r.points23, color: T.bDark },
    { key: "growth", value: r.pointsGrowth, color: T.cDark },
  ]
  return (
    <Box sx={{ position: "relative", mt: 3.5, mb: 3.5 }}>
      <Box role="img" aria-label={`TIA score ${r.text.score} out of 100`}
           sx={{ display: "flex", height: 16, borderRadius: "999px", overflow: "hidden", bgcolor: "rgba(255,255,255,.1)" }}>
        {parts.map((p) => (
          <Box key={p.key} sx={{
            width: `${p.value}%`, bgcolor: p.color,
            transition: "width .25s ease", "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          }} />
        ))}
      </Box>
      {LEVELS.map((L, i) => {
        const reached = r.score >= L.score - 1e-9
        const above = i % 2 === 0   // alternate labels above and below so close cutoffs never collide
        return (
          <Box key={L.name} aria-hidden sx={{ position: "absolute", left: `${L.score}%`, top: -5, height: 26 }}>
            <Box sx={{ width: 2, height: "100%", ml: "-1px", borderRadius: "1px",
                       bgcolor: reached ? "#fff" : "rgba(255,255,255,.4)" }} />
            <Typography sx={{
              position: "absolute", left: 0, transform: "translateX(-50%)", fontSize: { xs: 10.5, sm: 11.5 }, fontWeight: 600,
              whiteSpace: "nowrap", color: reached ? "#fff" : "rgba(255,255,255,.6)", ...NUM,
              ...(above ? { bottom: "100%", mb: 0.25 } : { top: "100%", mt: 0.25 }),
            }}>
              {Number.isInteger(L.score) ? L.score.toFixed(1) : L.score}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

// The four designations from lowest to highest, under the bar: each one's
// minimum score and how many of its five requirements are met.
function Ladder({ r }) {
  return (
    // Two by two on phones, so names like "Acknowledged" never break mid-word.
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))" }, gap: 0.75 }}>
      {[...r.levels].reverse().map((L) => {
        const met = Object.values(L.checks).filter((c) => c.ok).length
        const cut = LEVELS.find((x) => x.name === L.name).score
        return (
          <Box key={L.name} sx={{
            borderRadius: "10px", px: 1.1, py: 0.9,
            bgcolor: L.earned ? "#fff" : "rgba(255,255,255,.07)",
            color: L.earned ? T.navy : "#fff",
          }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{L.name}</Typography>
            <Typography sx={{ fontSize: 12, mt: 0.25, opacity: L.earned ? 0.8 : 0.7, ...NUM }}>
              {Number.isInteger(cut) ? cut.toFixed(1) : cut}, {L.allOk ? "all met" : `${met} of 5 met`}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

function ResultPanel({ r }) {
  const isNone = r.designation === NONE
  return (
    <Box component="section" aria-label="Projected designation" sx={{
      bgcolor: T.navy, color: "#fff", borderRadius: "20px", p: { xs: 2.5, md: 3.5 }, height: "100%",
      display: "flex", flexDirection: "column", boxShadow: "0 18px 40px -18px rgba(19, 41, 74, .55)",
    }}>
      <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,.7)" }}>Projected designation</Typography>
      <Typography component="p" aria-live="polite" sx={{
        fontFamily: DISPLAY, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.02, mt: 0.5,
        fontSize: isNone ? { xs: 36, md: 50 } : { xs: 44, md: 68 },
        color: isNone ? "rgba(255,255,255,.75)" : "#fff",
      }}>
        {r.designation}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 2.5 }}>
        <Typography sx={{ fontSize: 15, color: "rgba(255,255,255,.7)" }}>TIA score</Typography>
        <Typography sx={{ fontSize: 30, fontWeight: 600, ...NUM }}>{r.text.score}</Typography>
        <Typography sx={{ fontSize: 15, color: "rgba(255,255,255,.6)" }}>of 100</Typography>
      </Box>

      {/* everything below sits at the bottom of the box */}
      <Box sx={{ mt: "auto", pt: 2 }}>
        <ScoreBar r={r} />
        <Ladder r={r} />
      </Box>

      <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,.55)", pt: 2.5 }}>
        An estimate only. Designations are subject to eligibility review, data validation, and TEA approval.
      </Typography>
    </Box>
  )
}

// ---- Bottom row: the 16 ratings --------------------------------------------------

// One dimension: its code and name, then five boxes. Clicking a box sets
// the rating. A rating below 3 turns the row red.
function RatingRow({ code, value, color, onChange }) {
  const low = value < 3
  const fill = low ? T.bad : color
  return (
    <Box sx={{
      display: "grid", alignItems: "center", columnGap: 1.5, rowGap: 0.75, py: 0.75, px: 1, mx: -1,
      borderRadius: "8px", bgcolor: low ? T.badSoft : "transparent",
      gridTemplateColumns: { xs: "30px minmax(0, 1fr)", sm: "30px minmax(0, 1fr) auto" },
    }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: low ? T.bad : T.muted, ...NUM }}>{code}</Typography>
      <Typography sx={{ fontSize: 14.5, lineHeight: 1.3 }}>{DIMENSION_NAMES[code]}</Typography>
      <ToggleButtonGroup
        exclusive size="small" value={value}
        onChange={(e, v) => v !== null && onChange(v)}
        aria-label={`${code} ${DIMENSION_NAMES[code]} rating`}
        sx={{
          gridColumn: { xs: "1 / -1", sm: "auto" }, display: "flex",
          "& .MuiToggleButtonGroup-grouped:first-of-type": { borderRadius: "8px 0 0 8px" },
          "& .MuiToggleButtonGroup-grouped:last-of-type": { borderRadius: "0 8px 8px 0" },
          "& .MuiToggleButton-root": {
            flex: { xs: 1, sm: "none" }, width: { sm: 36 }, height: 32, p: 0,
            fontFamily: SANS, fontSize: 14, fontWeight: 600, color: T.muted, borderColor: T.line, bgcolor: T.surface,
            "&:hover": { bgcolor: T.hover },
          },
          "& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover": {
            bgcolor: fill, color: "#fff", borderColor: fill,
          },
          "& .MuiToggleButton-root.Mui-focusVisible": { outline: `2px solid ${T.ink}`, outlineOffset: 1, zIndex: 1 },
        }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <ToggleButton key={n} value={n} aria-label={`${n}, ${RATING_NAMES[n]}`} title={`${n}: ${RATING_NAMES[n]}`}>
            {n}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  )
}

function RatingCard({ id, title, note, codes, ratings, avgText, color, onRate }) {
  return (
    <Box component="section" aria-labelledby={id} sx={CARD}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 1.5 }}>
        <Box>
          <Typography id={id} component="h2" sx={{ fontSize: 17.5, fontWeight: 600, display: "flex", alignItems: "center" }}>
            <Swatch color={color} />{title}
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: T.muted, mt: 0.25 }}>{note}</Typography>
        </Box>
        <Box sx={{ textAlign: "right", flex: "none" }}>
          <Typography sx={{ fontSize: 26, fontWeight: 600, color, lineHeight: 1.1, ...NUM }}>{avgText}</Typography>
          <Typography sx={{ fontSize: 12.5, color: T.muted }}>average</Typography>
        </Box>
      </Box>
      {codes.map((code) => (
        <RatingRow key={code} code={code} value={ratings[code]} color={color} onChange={(v) => onRate(code, v)} />
      ))}
    </Box>
  )
}

// ---- Full width: student growth -------------------------------------------------
function GrowthCard({ r, value, onChange }) {
  const clamp = (v) => (Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 0)
  return (
    <Box component="section" aria-labelledby="growth-title" sx={{
      ...CARD, display: "grid", alignItems: "center", columnGap: 4, rowGap: 2,
      gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 5fr) minmax(0, 7fr)" },
    }}>
      <Box>
        <Typography id="growth-title" component="h2" sx={{ fontSize: 17.5, fontWeight: 600, display: "flex", alignItems: "center" }}>
          <Swatch color={T.c} />Student growth
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: T.muted, mt: 0.25 }}>
          Percent of your student records meeting or exceeding the growth target, worth {WEIGHTS.growth}% of
          your TIA score. Each percentage point adds {STEP.growth} points.
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 3 }, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
        <Typography sx={{ fontSize: 34, fontWeight: 600, color: T.c, minWidth: 132, ...NUM }}>{r.text.growthPct}</Typography>
        <Slider value={value} min={0} max={100} step={0.01} aria-label="Student growth percent"
                onChange={(e, v) => onChange(v)}
                sx={{ color: T.c, flex: 1, minWidth: 160, height: 6, "& .MuiSlider-thumb": { width: 20, height: 20 } }} />
        {/* wide enough for "100.00" plus the % sign and the browser's number arrows */}
        <TextField size="small" type="number" value={value} sx={{ width: 140, flex: "none" }}
                   onChange={(e) => onChange(Number(e.target.value))}
                   onBlur={() => onChange(clamp(value))}
                   onWheel={(e) => e.target.blur()}
                   inputProps={{ min: 0, max: 100, step: 0.01, "aria-label": "Student growth percent value", style: { ...NUM, fontSize: 15 } }}
                   InputProps={{ endAdornment: <Typography sx={{ color: T.muted, ml: 0.5 }}>%</Typography> }} />
      </Box>
    </Box>
  )
}

// ---- Full width: the comparison table -------------------------------------------

// ✓ for a met requirement; otherwise how far short it is.
function Requirement({ check }) {
  return (
    <>
      <Box component="span" sx={NUM}>≥ {check.cut}</Box>
      {check.ok
        ? <Box component="span" aria-label="met" sx={{ color: T.ok, fontWeight: 700, ml: 0.75 }}>✓</Box>
        : <Box component="span" sx={{ display: "block", fontSize: 12, color: T.gap, ...NUM }}>
            {check.gap ? `${check.gap} short` : "not met"}
          </Box>}
    </>
  )
}

function Requirements({ r }) {
  const head = ["Designation", "TIA score", "Student growth", "Domains 1 and 4 average",
                "Domains 2 and 3 average", "Every rating 3 or higher", "Result"]
  return (
    <Box component="section" aria-labelledby="req-title" sx={CARD}>
      <Typography id="req-title" component="h2" sx={{ fontSize: 19, fontWeight: 600 }}>How your numbers compare</Typography>
      <Typography sx={{ fontSize: 14, color: T.muted, mt: 0.5 }}>
        A designation needs every requirement in its row. The highest row you fully meet is your projected designation.
      </Typography>
      <Box sx={{ overflowX: "auto", mt: 2 }}>
        <Table size="small" sx={{
          minWidth: 760,
          "& td, & th": { borderColor: T.line, fontSize: 14, py: 1.1, textAlign: "center", fontFamily: SANS },
          "& td:first-of-type, & th:first-of-type": { textAlign: "left", whiteSpace: "nowrap" },
          "& th": { color: T.muted, fontWeight: 600, fontSize: 12.5, lineHeight: 1.3 },
        }}>
          <TableHead><TableRow>{head.map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>
            <TableRow sx={{ "& td": { bgcolor: "#F4F7FA", fontWeight: 600, ...NUM } }}>
              <TableCell>Your numbers</TableCell>
              <TableCell>{r.text.score}</TableCell><TableCell>{r.text.growthPct}</TableCell>
              <TableCell>{r.text.avg14}</TableCell><TableCell>{r.text.avg23}</TableCell>
              <TableCell>Lowest is {r.lowest}</TableCell><TableCell />
            </TableRow>
            {r.levels.map((L) => (
              <TableRow key={L.name} sx={L.earned
                ? { "& td": { bgcolor: T.okSoft }, "& td:first-of-type": { boxShadow: `inset 3px 0 0 ${T.ok}` } }
                : undefined}>
                <TableCell sx={{ fontWeight: 600 }}>{L.name}</TableCell>
                <TableCell><Requirement check={L.checks.score} /></TableCell>
                <TableCell><Requirement check={L.checks.growth} /></TableCell>
                <TableCell><Requirement check={L.checks.d14} /></TableCell>
                <TableCell><Requirement check={L.checks.d23} /></TableCell>
                <TableCell><Requirement check={L.checks.gate} /></TableCell>
                <TableCell>
                  {L.earned
                    ? <Box component="span" sx={{ bgcolor: T.ok, color: "#fff", fontWeight: 600, fontSize: 12.5, px: 1, py: 0.35, borderRadius: "999px" }}>Projected</Box>
                    : <Box component="span" sx={{ fontWeight: 600, fontSize: 13, color: L.allOk ? T.ok : T.bad }}>{L.allOk ? "Met" : "Not met"}</Box>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}

// ---- The page ----------------------------------------------------------------
function WhatIf() {
  const [inputs, setInputs] = useState(SAMPLE)
  const r = useMemo(() => scoreTeacher(inputs), [inputs])
  const rate = (code, v) => setInputs((p) => ({ ...p, ratings: { ...p.ratings, [code]: v } }))
  const setGrowth = (v) => setInputs((p) => ({ ...p, growthPct: v }))

  // Show the slim summary bar only while the designation box is off screen.
  const panelRef = useRef(null)
  const [panelInView, setPanelInView] = useState(true)
  useEffect(() => {
    const el = panelRef.current
    if (!el || !("IntersectionObserver" in window)) return undefined
    const watcher = new IntersectionObserver(([entry]) => setPanelInView(entry.isIntersecting), { threshold: 0.2 })
    watcher.observe(el)
    return () => watcher.disconnect()
  }, [])

  return (
    <Box sx={{ maxWidth: 1240, mx: "auto" }}>
      <BackToTools />
      {/* ---- title ---- */}
      <Box component="header" sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                                     flexWrap: "wrap", gap: 2, mb: { xs: 3, md: 4 } }}>
        <Box>
          <Typography component="h1" sx={{ fontFamily: DISPLAY, fontWeight: 700, letterSpacing: "-0.02em",
                                           fontSize: { xs: 30, md: 40 }, lineHeight: 1.05 }}>
            TIA designation what-if
          </Typography>
          <Typography sx={{ fontSize: { xs: 15, md: 16.5 }, color: T.muted, mt: 1, maxWidth: 620 }}>
            Change any rating or your growth percent. Your TIA score and projected designation update as you go.
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => setInputs(SAMPLE)}
                sx={{ borderColor: T.line, color: T.ink, bgcolor: T.surface, "&:hover": { borderColor: T.muted, bgcolor: T.surface } }}>
          Reset to sample values
        </Button>
      </Box>

      {/* ---- the four boxes, then growth. On phones the designation comes first. ---- */}
      <Box sx={{ display: "grid", gap: 3,
                 gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" } }}>
        <Box sx={{ order: { xs: 2, lg: 0 } }}><HowItWorks r={r} /></Box>
        <Box ref={panelRef} sx={{ order: { xs: 1, lg: 0 } }}><ResultPanel r={r} /></Box>
        <Box sx={{ order: { xs: 3, lg: 0 } }}>
          <RatingCard id="g14" title="Planning and professional practices" codes={DIMS_1_4}
                      note={`Domains 1 and 4, worth ${WEIGHTS.d14}% of your TIA score. Each step up on one rating adds ${STEP.d14} points.`}
                      ratings={inputs.ratings} avgText={r.text.avg14} color={T.a} onRate={rate} />
        </Box>
        <Box sx={{ order: { xs: 4, lg: 0 } }}>
          <RatingCard id="g23" title="Instruction and learning environment" codes={DIMS_2_3}
                      note={`Domains 2 and 3, worth ${WEIGHTS.d23}% of your TIA score. Each step up on one rating adds ${STEP.d23} points.`}
                      ratings={inputs.ratings} avgText={r.text.avg23} color={T.b} onRate={rate} />
        </Box>
        <Box sx={{ order: { xs: 5, lg: 0 }, gridColumn: { lg: "1 / -1" } }}>
          <GrowthCard r={r} value={inputs.growthPct} onChange={setGrowth} />
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}><Requirements r={r} /></Box>

      <Typography sx={{ fontSize: 13, color: T.muted, mt: 2.5, textAlign: "center" }}>
        Starts with sample values. Nothing you enter is saved or sent anywhere.
      </Typography>

      {/* ---- slim summary bar: slides up while the designation box is off screen ---- */}
      <Box aria-hidden sx={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 1100, bgcolor: T.navy, color: "#fff",
        boxShadow: "0 -8px 24px rgba(19, 41, 74, .25)",
        transform: panelInView ? "translateY(110%)" : "translateY(0)",
        transition: "transform .2s ease", "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      }}>
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, md: 4 }, py: 1.25, pb: "calc(10px + env(safe-area-inset-bottom))",
                   display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19 }}>{r.designation}</Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>
            TIA score <Box component="span" sx={{ color: "#fff", fontWeight: 600, fontSize: 17, ml: 0.5, ...NUM }}>{r.text.score}</Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

// The page component React Router renders at /projects/teacher-what-if.
// ThemeProvider scopes this page's theme. The Box paints the background
// and resets the text color, because the site's outer Container
// (App.jsx) sets color "white". m: -2 cancels that Container's p: 2.
// The four-box layout starts at this width (the theme's lg breakpoint).
// Narrower than this, the page falls back to one column, so it asks for
// a wider window.
const MIN_WIDTH = 1100

// Covers the page and asks for a wider window. It closes by itself as
// soon as the window is wide enough; "Continue anyway" closes it too.
function TooNarrowNotice({ onContinue }) {
  return (
    <Box role="dialog" aria-modal="true" aria-labelledby="narrow-title" sx={{
      position: "fixed", inset: 0, zIndex: 2000, p: 2, display: "flex", alignItems: "center", justifyContent: "center",
      bgcolor: "rgba(19, 41, 74, .72)", backdropFilter: "blur(4px)", fontFamily: SANS,
      "&, & *": { boxSizing: "border-box" },
    }}>
      <Box sx={{ bgcolor: T.surface, borderRadius: "20px", p: { xs: 3, sm: 4 }, maxWidth: 420, textAlign: "center",
                 boxShadow: "0 24px 60px -20px rgba(19, 41, 74, .6)" }}>
        {/* a window with arrows pointing outward: "make it wider" */}
        <Box component="svg" viewBox="0 0 64 40" aria-hidden sx={{ width: 72, height: 45, mb: 1.5 }}>
          <rect x="14" y="4" width="36" height="28" rx="4" fill="none" stroke={T.navy} strokeWidth="3" />
          <line x1="14" y1="12" x2="50" y2="12" stroke={T.navy} strokeWidth="3" />
          <path d="M9 18 L3 22 L9 26 M55 18 L61 22 L55 26" fill="none" stroke={T.c} strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round" />
        </Box>
        <Typography id="narrow-title" component="h2" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 24,
                                                           letterSpacing: "-0.01em", color: T.ink }}>
          Make your window wider
        </Typography>
        <Typography sx={{ fontSize: 15, color: T.muted, mt: 1, lineHeight: 1.55 }}>
          This tool is laid out for a wide screen. Maximize your browser window or drag it wider, and this
          message closes on its own.
        </Typography>
        {/* autoFocus lets Enter continue. The focus ripple is off (it drew a grey
            circle inside the button); a clear outline marks keyboard focus instead. */}
        <Button variant="contained" disableElevation disableFocusRipple onClick={onContinue} autoFocus
                sx={{ mt: 3, bgcolor: T.navy, borderRadius: "10px", px: 2.5, "&:hover": { bgcolor: T.ink },
                      "&.Mui-focusVisible": { outline: `3px solid ${T.cDark}`, outlineOffset: 2 } }}>
          Continue anyway
        </Button>
      </Box>
    </Box>
  )
}

export default function TeacherWhatIfPage() {
  useWebFonts()
  // True while the window is narrower than MIN_WIDTH; it updates live as
  // the window is resized. noSsr answers on the first render, so phones
  // never see the page flash before the notice appears.
  const tooNarrow = useMediaQuery(`(max-width: ${MIN_WIDTH - 0.02}px)`, { noSsr: true })
  const [dismissed, setDismissed] = useState(false)
  return (
    <ThemeProvider theme={theme}>
      {/* border-box: the site has no CSS reset, and without it height: 100%
          plus padding makes each box taller than its grid slot. */}
      <Box sx={{ m: -2, minHeight: "100vh", bgcolor: T.page, color: T.ink, fontFamily: SANS,
                 px: { xs: 2, md: 4 }, pt: { xs: 3, md: 5 }, pb: 12,
                 "&, & *, & *::before, & *::after": { boxSizing: "border-box" } }}>
        <WhatIf />
      </Box>
      {tooNarrow && !dismissed && <TooNarrowNotice onContinue={() => setDismissed(true)} />}
    </ThemeProvider>
  )
}
