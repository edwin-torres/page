// Principal Scorecard: What-If Analysis
// Route: /projects/principal-scorecard
//
// Collects the inputs and draws the results; all scoring lives in
// ./principalMath.js. The result is recomputed with useMemo on every
// change, so it always matches the form. Components with no weight
// for the current bucket show "—" in the breakdown instead of 0%.
import { useMemo, useState } from "react"
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardContent,
  Checkbox, FormControlLabel, MenuItem, Paper, Slider, Tab, Table,
  TableBody, TableCell, TableHead, TableRow, Tabs, TextField,
  ThemeProvider, Typography, createTheme, useMediaQuery,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  scorePrincipal, scoringGroupParts, thresholdsFor, pyFixed, pySigned, TSI_COHORTS,
} from "./principalMath.js"
import { BackToTools } from "../TiaTools/tiaKit.jsx"

const FONT = '-apple-system, "Segoe UI", Roboto, Inter, sans-serif'
const theme = createTheme({
  palette: {
    primary: { main: "#667eea" },
    secondary: { main: "#764ba2" },
    background: { default: "#f4f6f8" },
    text: { primary: "#1e293b" },
  },
  typography: { fontFamily: FONT },
  shape: { borderRadius: 12 },
  components: {
    MuiTableCell: { styleOverrides: { root: { padding: "6px 10px", fontSize: 13.5 } } },
  },
})

// ---- The form's starting values -------------------------------------
const DOMAINS = {
  "Domain 1": ["1.1", "1.2", "1.3", "1.4", "1.5"],
  "Domain 2": ["2.1", "2.2", "2.3", "2.4"],
  "Domain 3": ["3.1", "3.2", "3.3", "3.4"],
  "Domain 4": ["4.1", "4.2"],
  "Domain 5": ["5.1", "5.2", "5.3", "5.4", "5.5"],
}
const DEFAULT_INPUTS = {
  firstName: "Edwin", lastName: "Torres", campusName: "Sample School",
  level: "ES", rating: "A",
  domains: Object.fromEntries(Object.values(DOMAINS).flat().map((d) => [d, 3])),
  staar1: "A", staar2a: "B", staar3: "A", ccmr: "A", nwea: 0.75,
  sat: { prev: 0.20, current: 0.50 },
  ap: { prev: 0.40, current: 0.10 },
  tsi09: { prev: 0.70, current: 0.99 },
  tsi10: { prev: 0.12, current: 0.22 },
  tsi11: { prev: 0.45, current: 0.57 },
  tsi12: { prev: 0.11, current: 0.25 },
  core: { prev: 0.10, current: 0.40 },
  associates: { prev: 122, current: 155 },
  useR: false, r: 0.50,
}
const GRADES = ["A", "B", "C", "D", "F"]

// ---- Small display helpers -------------------------------------------

// Renders "**bold**" spans inside explanation text.
function Rich({ text }) {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>)
}

// Draws one explanation (a list of { p } / { ul } / { ol } blocks).
function Explanation({ blocks }) {
  return (
    <Box sx={{ fontSize: 14, lineHeight: 1.6, color: "#334155",
               "& p": { my: 0.75 }, "& ul, & ol": { my: 0.5, pl: 3 } }}>
      {blocks.map((b, i) => {
        if (b.p !== undefined) return <p key={i}><Rich text={b.p} /></p>
        const items = (b.ul ?? b.ol).map((t, j) => <li key={j}><Rich text={t} /></li>)
        return b.ul ? <ul key={i}>{items}</ul> : <ol key={i}>{items}</ol>
      })}
    </Box>
  )
}

// Level badge colors.
function badgeBackground(level) {
  const l = level.toLowerCase()
  if (l.includes("exemplary") || l.includes("master"))
    return "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
  if (l.includes("ineffective") || l.includes("unsatisfactory"))
    return "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
  if (l.includes("developing") || l.includes("progressing"))
    return "linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
  return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
}
function LevelBadge({ level, big }) {
  return (
    <Box component="span" sx={{
      display: "inline-block", px: big ? 2 : 1.5, py: big ? 0.75 : 0.5,
      borderRadius: 999, background: badgeBackground(level), color: "#fff",
      fontWeight: 800, fontSize: big ? 15 : 12, letterSpacing: ".05em",
      textTransform: "uppercase", textShadow: "0 1px 2px rgba(0,0,0,.25)",
    }}>
      {level}
    </Box>
  )
}

// The "% Earned" heat color (red → yellow → green).
function pctColor(p) {
  const stops = [[0, [248, 105, 107]], [0.5, [255, 235, 132]], [1, [99, 190, 123]]]
  const x = Math.min(1, Math.max(0, p))
  const [[x0, c0], [x1, c1]] = x <= 0.5 ? [stops[0], stops[1]] : [stops[1], stops[2]]
  const t = (x - x0) / (x1 - x0)
  const rgb = c0.map((v, i) => Math.round(v + (c1[i] - v) * t))
  return `rgb(${rgb.join(",")})`
}

// Slightly smaller text for the inputs panel. These rules sit on the
// inputs Card, so they reach only the fields inside it.
const INPUT_PANEL_TEXT = {
  "& .MuiInputBase-input": { fontSize: 14 },
  "& .MuiTab-root": { fontSize: 13 },
  "& .MuiTypography-body2": { fontSize: 13 },
  "& .MuiTypography-caption": { fontSize: 11.5 },
  "& .MuiFormControlLabel-label": { fontSize: 14 },
}

function SectionLabel({ children }) {
  return (
    <Typography sx={{
      fontSize: 11.5, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: ".08em", color: "#64748b", mt: 3, mb: 1.5, pb: 0.75,
      borderBottom: "2px solid #e2e8f0",
    }}>
      {children}
    </Typography>
  )
}

function Caption({ children }) {
  return <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1 }}>{children}</Typography>
}

function PickField({ label, value, options, onChange, minWidth = 110 }) {
  return (
    <TextField select size="small" label={label} value={value}
               onChange={(e) => onChange(e.target.value)} sx={{ minWidth }}
               SelectProps={{ MenuProps: { sx: { "& .MuiMenuItem-root": { fontSize: 14 } } } }}>
      {options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
    </TextField>
  )
}

// A 0 to 1 slider. `asPercent` shows 0.2 as "20%", matching how the
// growth explanations print it; MAP stays "0.75" like its explanation.
function FracSlider({ label, value, onChange, asPercent = true, min = 0, max = 1, disabled }) {
  const show = (v) => (asPercent ? `${Math.round(v * 100)}%` : v.toFixed(2))
  return (
    <Box sx={{ px: 0.5 }}>
      <Typography variant="body2" sx={{ display: "flex", justifyContent: "space-between",
                                        color: disabled ? "text.disabled" : "inherit" }}>
        <span>{label}</span><strong>{show(value)}</strong>
      </Typography>
      <Slider size="small" value={value} min={min} max={max} step={0.01}
              disabled={disabled} valueLabelDisplay="auto" valueLabelFormat={show}
              onChange={(e, v) => onChange(v)} />
    </Box>
  )
}

// Previous-year / current-year slider pair.
function PairSliders({ label, pair, onChange }) {
  return (
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
      <FracSlider label={`Previous ${label}`} value={pair.prev}
                  onChange={(v) => onChange({ ...pair, prev: v })} />
      <FracSlider label={`Current ${label}`} value={pair.current}
                  onChange={(v) => onChange({ ...pair, current: v })} />
    </Box>
  )
}

// Whole-number box (0 to 10000). HTML
// min/max only limit the arrow buttons, so typed values are clamped
// when the box loses focus.
function CountField({ label, value, onChange }) {
  return (
    <TextField size="small" type="number" label={label} value={value}
               onChange={(e) => onChange(Number(e.target.value))}
               onBlur={() => onChange(Math.min(10000, Math.max(0, Math.round(value) || 0)))}
               onWheel={(e) => e.target.blur()}
               inputProps={{ min: 0, max: 10000, step: 1 }} fullWidth />
  )
}

function Panel({ children }) {
  return <Box sx={{ pt: 2 }}>{children}</Box>
}

// ---- The page ----------------------------------------------------------
function WhatIf() {
  const [inp, setInp] = useState(DEFAULT_INPUTS)
  const [domainTab, setDomainTab] = useState(0)
  const [hsTab, setHsTab] = useState(0)
  const result = useMemo(() => scorePrincipal(inp), [inp])

  const set = (key, value) => setInp((prev) => ({ ...prev, [key]: value }))
  const setDomain = (d, value) =>
    setInp((prev) => ({ ...prev, domains: { ...prev.domains, [d]: value } }))

  const domainNames = Object.keys(DOMAINS)

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto" }}>
      <BackToTools />
      {/* ---- title + What-If header ---- */}
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: 26, md: 34 } }}>
        📊 Principal Performance &amp; Effectiveness
      </Typography>
      <Paper elevation={0} sx={{
        background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        color: "#fff", px: { xs: 2.5, md: 4 }, py: 2.5, borderRadius: 4, mb: 3,
        boxShadow: "0 10px 30px rgba(32, 58, 67, 0.25)",
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>What-If Analysis</Typography>
        <Typography sx={{ opacity: 0.85, fontSize: 14.5 }}>
          Model custom scenarios. Results update as you change any input.
        </Typography>
      </Paper>

      <Box sx={{ display: "grid", gap: 3, alignItems: "start",
                 gridTemplateColumns: { xs: "1fr", md: "minmax(0, 5fr) minmax(0, 6fr)" } }}>
        {/* ================= INPUTS ================= */}
        <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
          <CardContent sx={{ px: { xs: 2, md: 3 }, ...INPUT_PANEL_TEXT }}>
            <SectionLabel>👤 Basic Information</SectionLabel>
            <Box sx={{ display: "grid", gap: 1.5,
                       gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
              <TextField size="small" label="First Name" value={inp.firstName}
                         inputProps={{ maxLength: 50 }} onChange={(e) => set("firstName", e.target.value)} />
              <TextField size="small" label="Last Name" value={inp.lastName}
                         inputProps={{ maxLength: 50 }} onChange={(e) => set("lastName", e.target.value)} />
              <TextField size="small" label="Campus Name" value={inp.campusName}
                         inputProps={{ maxLength: 100 }} onChange={(e) => set("campusName", e.target.value)} />
              <PickField label="Campus Level" value={inp.level} options={["ES", "MS", "HS"]}
                         onChange={(v) => set("level", v)} />
              <PickField label="Campus Rating" value={inp.rating} options={GRADES}
                         onChange={(v) => set("rating", v)} />
            </Box>

            <SectionLabel>🏫 T-PESS Domain Scores (1-5)</SectionLabel>
            <Tabs value={domainTab} onChange={(e, v) => setDomainTab(v)}
                  variant="scrollable" scrollButtons="auto"
                  sx={{ borderBottom: "1px solid #e2e8f0", minHeight: 40,
                        "& .MuiTab-root": { minHeight: 40, textTransform: "none" } }}>
              {domainNames.map((n) => <Tab key={n} label={n} />)}
            </Tabs>
            <Panel>
              <Box sx={{ display: "grid", gap: 1.5,
                         gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}>
                {DOMAINS[domainNames[domainTab]].map((d) => (
                  <PickField key={d} label={d} value={inp.domains[d]} minWidth={80}
                             options={[1, 2, 3, 4, 5]} onChange={(v) => setDomain(d, Number(v))} />
                ))}
              </Box>
            </Panel>

            <SectionLabel>📝 STAAR Letter Grades &amp; MAP</SectionLabel>
            <Box sx={{ display: "grid", gap: 1.5, mb: 2,
                       gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
              <PickField label="STAAR Domain 1" value={inp.staar1} options={GRADES} onChange={(v) => set("staar1", v)} />
              <PickField label="STAAR Domain 2A" value={inp.staar2a} options={GRADES} onChange={(v) => set("staar2a", v)} />
              <PickField label="STAAR Domain 3" value={inp.staar3} options={GRADES} onChange={(v) => set("staar3", v)} />
            </Box>
            <Caption>NWEA MAP affects ES only.</Caption>
            <FracSlider label="NWEA MAP" value={inp.nwea} asPercent={false}
                        onChange={(v) => set("nwea", v)} />

            <SectionLabel>🎓 HS Metrics</SectionLabel>
            <Caption>These metrics affect HS only.</Caption>
            <PickField label="CCMR Letter Grade" value={inp.ccmr} options={GRADES} minWidth={170}
                       onChange={(v) => set("ccmr", v)} />
            <Tabs value={hsTab} onChange={(e, v) => setHsTab(v)} variant="scrollable" scrollButtons="auto"
                  sx={{ mt: 2, borderBottom: "1px solid #e2e8f0", minHeight: 40,
                        "& .MuiTab-root": { minHeight: 40, textTransform: "none" } }}>
              {["SAT", "AP", "TSI", "Core Complete", "Associates"].map((n) => <Tab key={n} label={n} />)}
            </Tabs>
            <Panel>
              {hsTab === 0 && <PairSliders label="SAT" pair={inp.sat} onChange={(p) => set("sat", p)} />}
              {hsTab === 1 && <PairSliders label="AP" pair={inp.ap} onChange={(p) => set("ap", p)} />}
              {hsTab === 2 && (
                <>
                  <Caption>All four grade levels (9–12) must each grow by ≥ 10 points to earn Met points.</Caption>
                  {TSI_COHORTS.map(([key, label]) => (
                    <PairSliders key={key} label={`TSI ${label.replace(" grade", "")}`}
                                 pair={inp[key]} onChange={(p) => set(key, p)} />
                  ))}
                </>
              )}
              {hsTab === 3 && <PairSliders label="Core Complete" pair={inp.core} onChange={(p) => set("core", p)} />}
              {hsTab === 4 && (
                <>
                  <Caption>Associates are raw counts. Met = current is at least 10% larger than previous.</Caption>
                  <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
                    <CountField label="Previous Associates" value={inp.associates.prev}
                                onChange={(v) => set("associates", { ...inp.associates, prev: v })} />
                    <CountField label="Current Associates" value={inp.associates.current}
                                onChange={(v) => set("associates", { ...inp.associates, current: v })} />
                  </Box>
                </>
              )}
            </Panel>

            <SectionLabel>📈 Congruence Metric (R Value)</SectionLabel>
            <FormControlLabel label="Include R value adjustment"
                              control={<Checkbox checked={inp.useR}
                                                 onChange={(e) => set("useR", e.target.checked)} />} />
            <FracSlider label="R Value (correlation between evaluator ratings and student growth)"
                        value={inp.r} min={-1} max={1} asPercent={false} disabled={!inp.useR}
                        onChange={(v) => set("r", v)} />
            <Caption>
              0.50 or higher → +2 · 0.24–0.49 → +1 · 0–0.23 → −3 · negative → −4.
              Only applied when the box is checked.
            </Caption>
          </CardContent>
        </Card>

        {/* ================= RESULTS ================= */}
        <Box>
          <Paper elevation={0} sx={{
            background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", color: "#fff",
            p: { xs: 2.5, md: 3 }, borderRadius: 5, mb: 2,
            boxShadow: "0 15px 40px rgba(30, 60, 114, 0.3)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 2,
          }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                🎯 {inp.firstName.trim() || "Custom"} {inp.lastName.trim() || "Principal"}
              </Typography>
              <Typography sx={{ opacity: 0.85, fontSize: 14.5 }}>
                🏫 {inp.campusName.trim() || "Custom Campus"} · {inp.level}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 12.5, opacity: 0.8, letterSpacing: ".1em" }}>TOTAL POINTS</Typography>
              <Typography sx={{ fontSize: 42, fontWeight: 700, lineHeight: 1 }}>
                {pyFixed(result.totalPoints, 2)}
              </Typography>
              {inp.useR && (
                <Typography sx={{ fontSize: 13.5, opacity: 0.85, mt: 0.5 }}>
                  Base {pyFixed(result.basePoints, 2)} {pySigned(result.rAdjustment)} R value adjustment
                </Typography>
              )}
            </Box>
          </Paper>

          <Box sx={{ display: "grid", gap: 2, mb: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
              <CardContent>
                <Caption>⭐ EFFECTIVENESS LEVEL</Caption>
                <LevelBadge level={result.level} big />
              </CardContent>
            </Card>
            <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
              <CardContent>
                <Caption>📦 SCORING GROUP</Caption>
                {(() => {
                  const g = scoringGroupParts(result.bucket)
                  return (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {g.level} · {g.rating.charAt(0).toUpperCase() + g.rating.slice(1)}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75 }}>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>{g.weights}</Typography>
                        <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: "#475569",
                                                    border: "1px solid #cbd5e1", borderRadius: 1,
                                                    px: 0.75, py: 0.1 }}>
                          {result.bucket}
                        </Box>
                      </Box>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          </Box>

          {/* How the level was decided: the thresholds for this campus level. */}
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", mb: 2 }}>
            <CardContent sx={{ pb: "12px !important" }}>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                🪜 Effectiveness levels for {inp.level} campuses
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {[...thresholdsFor(inp.level)].reverse().map((t) => {
                  const mine = t.level === result.level
                  return (
                    <Box key={t.level} sx={{
                      px: 1.25, py: 0.5, borderRadius: 2, fontSize: 13,
                      border: mine ? "2px solid #667eea" : "1px solid #e2e8f0",
                      bgcolor: mine ? "#eef2ff" : "#fff", fontWeight: mine ? 700 : 400,
                    }}>
                      {t.level} ≥ {t.min}
                    </Box>
                  )
                })}
              </Box>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", mb: 2 }}>
            <CardContent sx={{ overflowX: "auto" }}>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>📋 Detailed Score Breakdown</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Scoring Component", "Allocated Weight", "Earned Points", "% Earned"].map((h, i) => (
                      <TableCell key={h} align={i === 0 ? "left" : "right"}
                                 sx={{ fontWeight: 700, color: "#475569" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.components.map((c) => {
                    const applies = c.weight > 0
                    const share = applies ? c.score / c.weight : 0
                    return (
                      <TableRow key={c.name} sx={{ "& td": { color: applies ? undefined : "#94a3b8" } }}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell align="right">{pyFixed(c.weight, 2)}</TableCell>
                        <TableCell align="right">{pyFixed(c.score, 2)}</TableCell>
                        <TableCell align="right" sx={{ bgcolor: applies ? pctColor(share) : "transparent",
                                                       fontWeight: 600 }}>
                          {applies ? `${pyFixed(share * 100, 0)}%` : "—"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {inp.useR && (
                    <>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Base points</TableCell>
                        <TableCell /><TableCell align="right">{pyFixed(result.basePoints, 2)}</TableCell><TableCell />
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>R value adjustment</TableCell>
                        <TableCell /><TableCell align="right">{pySigned(result.rAdjustment)}</TableCell><TableCell />
                      </TableRow>
                    </>
                  )}
                  <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                    <TableCell sx={{ fontWeight: 800 }}>Total points</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {pyFixed(result.components.reduce((a, c) => a + c.weight, 0), 2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{pyFixed(result.totalPoints, 2)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
              <Caption>
                <Box component="span" sx={{ display: "block", mt: 1 }}>
                  “—” means the component carries no weight for this scoring group (campus level and rating), so it cannot earn points.
                </Box>
              </Caption>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
            <CardContent>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>🔍 How was this calculated?</Typography>
              {result.components.map((c) => (
                <Accordion key={c.name} disableGutters elevation={0}
                           sx={{ border: "1px solid #e2e8f0", "&:not(:last-of-type)": { borderBottom: 0 },
                                 "&:before": { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontSize: 14.5 }}>
                      {c.name} — <strong>{pyFixed(c.score, 2)}</strong> points
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Explanation blocks={c.explanation} />
                  </AccordionDetails>
                </Accordion>
              ))}
              {result.rExplanation && (
                <Accordion disableGutters elevation={0}
                           sx={{ border: "1px solid #e2e8f0", borderTop: 0, "&:before": { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontSize: 14.5 }}>
                      R Value (Congruence Metric) — <strong>{pySigned(result.rAdjustment)}</strong> points
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Explanation blocks={result.rExplanation} />
                  </AccordionDetails>
                </Accordion>
              )}
            </CardContent>
          </Card>

        </Box>
      </Box>
    </Box>
  )
}

// The page component React Router renders at /projects/principal-scorecard.
// ThemeProvider scopes this page's theme. The Box paints the background
// and resets the text color, because the site's outer Container
// (App.jsx) sets color "white", which plain text here would otherwise
// inherit. m: -2 cancels that Container's p: 2 padding.
// The two-column layout needs about this much width. Narrower than
// this, headings wrap and the Domain tabs get cut off.
const MIN_WIDTH = 1250

// Covers the page and asks for a wider window. It closes by itself as
// soon as the window is wide enough; "Continue anyway" closes it too.
function TooNarrowNotice({ onContinue }) {
  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 2000, p: 2,
               bgcolor: "rgba(15, 23, 42, 0.72)", backdropFilter: "blur(3px)",
               display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper elevation={8} sx={{ maxWidth: 440, p: 4, borderRadius: 4, textAlign: "center" }}>
        <Typography sx={{ fontSize: 40, lineHeight: 1, mb: 1.5 }}>🖥️</Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Please make your window bigger
        </Typography>
        <Typography sx={{ color: "#475569", fontSize: 15, lineHeight: 1.6, mb: 3 }}>
          This dashboard is designed for a wide screen. Maximize your browser window
          or drag it wider, and this message will close on its own.
        </Typography>
        <Button variant="outlined" onClick={onContinue}>Continue anyway</Button>
      </Paper>
    </Box>
  )
}

export default function PrincipalScorecardPage() {
  // True while the window is narrower than MIN_WIDTH; it updates live
  // as the window is resized. noSsr reads the width on the first render,
  // so the page never flashes before the notice appears.
  const tooNarrow = useMediaQuery(`(max-width: ${MIN_WIDTH - 0.02}px)`, { noSsr: true })
  const [dismissed, setDismissed] = useState(false)
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ m: -2, minHeight: "100vh", bgcolor: "background.default", color: "text.primary",
                 fontFamily: FONT, p: { xs: 2, md: 3 } }}>
        <WhatIf />
      </Box>
      {tooNarrow && !dismissed && <TooNarrowNotice onContinue={() => setDismissed(true)} />}
    </ThemeProvider>
  )
}
