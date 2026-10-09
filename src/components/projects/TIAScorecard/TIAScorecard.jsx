// TIA Scorecard (SY 2023-24, Teacher Type 11)
// Route: /projects/tia-scorecard
//
// This file collects the inputs and draws the scorecard; all scoring
// lives in ./math.js. The met/miss marks come from the same computed
// values as the designation, so the two can never disagree.
import { useMemo, useState } from "react"
import { analyzeRoster, buildResult, configFor, CUT_TABLES,
         defaultsFor } from "./math.js"
import { ROSTER } from "./roster.js"
import {
  Alert, Box, Button, Card, CardContent, Chip, Container,
  IconButton, MenuItem, Paper, Popover, Select, Stack, Table,
  TableBody, TableCell, TableHead, TableRow, TextField,
  ThemeProvider, Typography,
  createTheme,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"

const theme = createTheme({
  palette: {
    primary: { main: "#217346" },
    secondary: { main: "#ad9744" },
    background: { default: "#eef2ee" },
  },
  typography: {
    fontFamily: '-apple-system, "Segoe UI", Roboto, Inter, sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    // Tighter cells and smaller input text so the whole card fits at
    // 100% zoom.
    MuiTableCell: { styleOverrides: {
      root: { padding: "5px 8px", fontSize: 13.5 } } },
    MuiSelect: { styleOverrides: { select: { fontSize: 13.5 } } },
    MuiMenuItem: { styleOverrides: { root: { fontSize: 13.5 } } },
  },
})

const headerSx = {
  background: "linear-gradient(135deg, #1a5c34, #2e9e57)",
  color: "#fff", px: 2, py: 1.2,
}
const cellHeadSx = { fontWeight: 700, color: "#1a5c34", fontSize: 12.5 }
const redNum = { color: "#c62828", fontWeight: 700 }

// defaultsFor (in math.js) supplies each teacher type's starting
// inputs.

// ---- Print report ------------------------------------------------
// A print-only layout (#alief-report) that stays hidden on screen.
// Every value and formula in it comes from buildResult, so the view
// itself holds no math.
const printCss = `
#alief-report { display: none; }
/* Printing shows the page as seen. To print the report layout
   instead, add:
   @media print {
     #alief-app, .MuiPopover-root { display: none !important; }
     body { background: #fff !important; }
     #alief-report { display: block !important; padding: 0; }
   }
*/
#alief-report { color: #111; font-size: 12px;
  font-family: -apple-system, "Segoe UI", Roboto, Inter, sans-serif; }
#alief-report .rhead { border-bottom: 3px solid #1a5c34;
  padding-bottom: 8px; margin-bottom: 14px; }
#alief-report .rhead h1 { margin: 0; font-size: 20px; color: #1a5c34; }
#alief-report .meta { display: flex; gap: 18px; flex-wrap: wrap;
  margin-top: 6px; font-size: 11.5px; color: #333; }
#alief-report .meta b { color: #1a5c34; }
#alief-report h2 { font-size: 13.5px; color: #1a5c34;
  margin: 16px 0 6px; border-bottom: 1px solid #cdd8cf;
  padding-bottom: 3px; }
#alief-report table { width: 100%; border-collapse: collapse;
  page-break-inside: avoid; }
#alief-report th, #alief-report td { border: 1px solid #c9d4cb;
  padding: 4px 7px; font-size: 11.5px; text-align: center; }
#alief-report th { background: #eef4ef; color: #1a5c34; }
#alief-report .left { text-align: left; }
#alief-report .rn { color: #c62828; font-weight: 700; }
#alief-report .overall-line { display: flex;
  justify-content: space-between; align-items: center;
  border: 2px solid #c62828; border-radius: 8px; padding: 8px 14px;
  margin-top: 14px; font-weight: 700; }
#alief-report .big { font-size: 18px; color: #c62828; }
#alief-report .rnote { margin-top: 10px; padding: 8px 12px;
  border-left: 4px solid #888; background: #f5f5f5;
  font-size: 11.5px; }
#alief-report .formula-cell { text-align: left; font-size: 10.5px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
#alief-report .ok { color: #16a34a; } #alief-report .miss { color: #dc2626; }
#alief-report .gapline { display: block; font-size: 9.5px; color: #b45309; }
#alief-report .rfoot { margin-top: 16px; font-size: 10px; color: #777;
  text-align: center; }
#alief-report .appendix { break-before: page;
  page-break-before: always; }
`

function ReportView({ result, config, entered, teacherType, person }) {
  const labelFor = (v) =>
    config.ttess_levels.find((lv) => lv.value === v)?.label ?? "—"
  const today = new Date().toLocaleDateString("en-US",
    { year: "numeric", month: "long", day: "numeric" })
  const appendix = [
    ...config.dimensions.map((dim, d) =>
      ["Dimension " + dim,
       result.ttess.dimension_explanations?.[d]?.formula]),
    ["T-TESS Score", result.ttess.score_explanation?.formula],
    ...result.growth.rows.map((row) =>
      [row.measure + " score earned", row.earned_explanation?.formula]),
    ["Overall %MEE", result.growth.overall_percent_explanation?.formula],
    ["Student Survey", result.survey_explanation?.formula],
    ["Overall TIA Score", result.overall_explanation?.formula],
  ].filter(([, f]) => f)
  return (
    <div id="alief-report">
      <div className="rhead">
        <h1>Alief ISD TIA Scorecard</h1>
        <div className="meta">
          <span><b>Teacher:</b> {person.name}</span>
          <span><b>ID:</b> {person.id}</span>
          <span><b>Campus:</b> {person.campus}</span>
          <span><b>Teacher Type:</b> {teacherType}</span>
          <span><b>School Year:</b> 2023-2024</span>
          <span><b>Printed:</b> {today}</span>
        </div>
      </div>

      <h2>Teacher T-TESS Component</h2>
      <table>
        <tbody>
          <tr>
            <th className="left">Dimension</th>
            {config.observations.map((o) => (
              <th key={o.label}>{o.label}<br />
                <small>weight {o.weight}%</small></th>
            ))}
            <th>Score</th>
          </tr>
          {config.dimensions.map((dim, d) => (
            <tr key={dim}>
              <td className="left"><b>{dim}</b></td>
              {entered.ttess[d].map((v, oi) => (
                <td key={oi}>{v === null ? "—" : labelFor(v)}</td>
              ))}
              <td><b>{result.ttess.dimension_scores[d]}</b></td>
            </tr>
          ))}
          <tr>
            <td className="left"
                colSpan={config.observations.length + 1}>
              <b>T-TESS Score</b></td>
            <td className="rn">{result.ttess.score}</td>
          </tr>
        </tbody>
      </table>

      <h2>Student Growth Component</h2>
      <table>
        <tbody>
          <tr>
            <th className="left">Measure</th>
            <th>% Meeting or Exceeding</th>
            <th>Growth Rating</th><th>Score Earned</th>
          </tr>
          {result.growth.rows.map((row) => (
            <tr key={row.measure}>
              <td className="left">{row.measure}</td>
              <td>{row.percent}</td>
              <td>{row.rating ?? "—"}</td>
              <td className="rn">{row.earned}</td>
            </tr>
          ))}
          <tr>
            <td className="left" colSpan={3}>
              <b>Overall % Meeting or Exceeding Growth</b></td>
            <td className="rn">{result.growth.overall_percent}</td>
          </tr>
        </tbody>
      </table>

      {result.has_survey && (
        <>
        <h2>Student Survey Component — Grades 3-12</h2>
        <table>
          <tbody>
            <tr>
              <th className="left">Score (max 5)</th>
              <td className="rn">{result.survey}</td>
            </tr>
          </tbody>
        </table>
        </>
      )}

      <div className="overall-line">
        <span>Overall TIA Score</span>
        <span className="big">
          {result.overall} &nbsp;·&nbsp; {result.designation}
        </span>
      </div>

      <h2>Designation Requirements</h2>
      <table>
        <tbody>
          <tr>
            <th className="left">Designation Level</th>
            <th>Overall TIA Score Cutoffs</th><th>T-TESS Score</th>
            <th>Student Survey</th><th>Overall %MEE</th>
          </tr>
          <tr>
            <td className="left"><b>This teacher</b></td>
            {result.cut_table.actuals.map((a, i) => (
              <td key={i}><b>{a}</b></td>
            ))}
          </tr>
          {[...result.cut_table.rows].reverse().map((row) => (
            <tr key={row.label}>
              <td className="left"><b>{row.label}</b>
                {row.label === result.designation && " ★ AWARDED"}</td>
              {row.cells.map((c, i) => (
                <td key={i}>
                  {c.waived ? "—" : (
                    <>
                      {c.text}{" "}
                      <span className={c.met ? "ok" : "miss"}>
                        {c.met ? "✓" : "✗"}</span>
                      {c.gap && <span className="gapline">{c.gap}</span>}
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* The break sits on this WRAPPER, so the note lands at the
          top of the new page, just before the computations. */}
      <div className="appendix">
      {result.note && <div className="rnote">{result.note}</div>}
      {result.ttess.ineligible_reason && (
        <div className="rnote">
          Eligibility: {result.ttess.ineligible_reason}</div>
      )}

      <h2>Appendix — how each number was computed</h2>
      <table>
        <tbody>
          <tr>
            <th className="left">Number</th>
            <th className="left">Formula</th>
          </tr>
          {appendix.map(([name, formula]) => (
            <tr key={name}>
              <td className="left">{name}</td>
              <td className="formula-cell">{formula}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="rfoot">Mock data only · truncated, never rounded
        (4 places on cells, 6 on overalls)</div>
    </div>
  )
}

// ---- Cut-sensitivity analysis views --------------------------------
// A screen view and a print-only one-pager; both show analyzeRoster's
// results as they are (all classification happens in math.js).

const DESIG_COLOR = {
  "Masters": "#8a6d1a", "Exemplary": "#1a5c34",
  "Recognized": "#2e6da4", "Not Designated": "#777",
  "Ineligible": "#b45309",
}
function Desig({ d }) {
  return <Typography component="span"
    sx={{ color: DESIG_COLOR[d], fontWeight: 700,
          fontSize: "inherit" }}>{d}</Typography>
}

// The cut editor: the user's live table. Values stay strings in state
// (so half-typed numbers are allowed) and are parsed when used.
const CUT_BANDS = ["Masters", "Exemplary", "Recognized"]
const CUT_COLS = [
  ["overall", "Overall TIA Score", 0, 5, 0.05],
  ["ttess", "T-TESS Score", 0, 5, 0.05],
  ["survey", "Student Survey", 1, 5, 0.1],
  ["pct", "Overall %MEE", 0, 100, 0.5],
]
const formFromTable = (t) => Object.fromEntries(t.bands.map((b) =>
  [b.label, { overall: String(b.overall), ttess: String(b.ttess),
              survey: String(b.survey), pct: String(b.pct) }]))
const tableFromForm = (f) => ({
  label: "your cuts", source: "set live in the cut editor",
  bands: CUT_BANDS.map((label) => ({
    label,
    overall: Number(f[label].overall) || 0,
    ttess: Number(f[label].ttess) || 0,
    survey: Number(f[label].survey) || 0,
    pct: Number(f[label].pct) || 0,
  })),
})

// The FIXED base table: the 24-25 reference cuts — the same table
// the Scorecard tab judges by. Display only, never editable.
function BaseCuts() {
  return (
    <Table size="small" sx={{ maxWidth: 460 }}>
      <TableHead>
        <TableRow>
          <TableCell sx={cellHeadSx}>Designation Level</TableCell>
          {CUT_COLS.map(([k, label]) => (
            <TableCell key={k} sx={cellHeadSx} align="center">
              {label}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {CUT_TABLES.reference.bands.map((b) => (
          <TableRow key={b.label}>
            <TableCell sx={{ fontWeight: 700 }}>{b.label}</TableCell>
            <TableCell align="center">≥ {b.overall}</TableCell>
            <TableCell align="center">≥ {b.ttess}</TableCell>
            <TableCell align="center">≥ {b.survey}</TableCell>
            <TableCell align="center">≥ {b.pct}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function CutEditor({ form, setForm }) {
  const setCell = (band, key, v) =>
    setForm({ ...form, [band]: { ...form[band], [key]: v } })
  return (
    <Table size="small" sx={{ maxWidth: 620 }}>
      <TableHead>
        <TableRow>
          <TableCell sx={cellHeadSx}>Designation Level</TableCell>
          {CUT_COLS.map(([k, label]) => (
            <TableCell key={k} sx={cellHeadSx} align="center">
              {label}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {CUT_BANDS.map((band) => (
          <TableRow key={band}>
            <TableCell sx={{ fontWeight: 700 }}>{band}</TableCell>
            {CUT_COLS.map(([k, , lo, hi, step]) => (
              <TableCell key={k} align="center">
                ≥ <TextField size="small" type="number"
                           variant="standard"
                           value={form[band][k]}
                           onChange={(e) =>
                             setCell(band, k, e.target.value)}
                           onWheel={(e) => e.target.blur()}
                           inputProps={{
                             min: lo, max: hi, step,
                             style: { textAlign: "center",
                                      width: 64 } }} />
                {k === "pct" && <span> %</span>}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function CountsTable({ counts }) {
  const rows = [
    ["Under the base cuts", counts.reference],
    ["Under the adjusted cuts", counts.actual],
  ]
  return (
    <Table size="small" sx={{ maxWidth: 760 }}>
      <TableHead>
        <TableRow>
          {["", "Masters", "Exemplary", "Recognized", "Designated",
            "Not Designated", "Ineligible"].map((h, i) => (
            <TableCell key={i} sx={cellHeadSx}
                       align={i === 0 ? "left" : "center"}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(([label, c]) => (
          <TableRow key={label}>
            <TableCell sx={{ fontWeight: 600 }}>{label}</TableCell>
            <TableCell align="center">{c.Masters}</TableCell>
            <TableCell align="center">{c.Exemplary}</TableCell>
            <TableCell align="center">{c.Recognized}</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              {c.designated} of 40</TableCell>
            <TableCell align="center">{c["Not Designated"]}</TableCell>
            <TableCell align="center">{c.Ineligible}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}


const ROSTER_HEADS = ["Teacher", "Campus", "T-TESS", "Overall %MEE",
                      "Survey", "Overall", "Reference", "Actual"]
function RosterCells({ r }) {
  return (
    <>
      <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
      <TableCell align="center">{r.campus}</TableCell>
      <TableCell align="center">{r.ttess}</TableCell>
      <TableCell align="center">{r.pct}</TableCell>
      <TableCell align="center">
        {r.survey === null ? "—" : r.survey}</TableCell>
      <TableCell align="center">{r.overall}</TableCell>
      <TableCell align="center"><Desig d={r.reference} /></TableCell>
      <TableCell align="center"><Desig d={r.actual} /></TableCell>
    </>
  )
}

function AnalysisView({ analysis, form, setForm, onOpen }) {
  const moved = analysis.movers.length
  return (
    <Stack spacing={2}>
      <SectionCard title="The cuts — base (fixed) vs adjusted (editable)">
        <Stack direction="row" spacing={4} useFlexGap
               sx={{ flexWrap: "wrap", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="subtitle2"
                        sx={{ color: "#1a5c34", mb: 0.5 }}>
              Base cuts
            </Typography>
            <BaseCuts />
          </Box>
          <Box>
            <Typography variant="subtitle2"
                        sx={{ color: "#8a6d1a", mb: 0.5 }}>
              Adjusted cuts (editable)
            </Typography>
            <CutEditor form={form} setForm={setForm} />
            <Button size="small" variant="outlined" sx={{ mt: 1 }}
                    onClick={() =>
                      setForm(formFromTable(CUT_TABLES.reference))}>
              Reset to base
            </Button>
          </Box>
        </Stack>
      </SectionCard>

      <SectionCard title={`Designation counts — ${moved} of 40 change`}>
        <CountsTable counts={analysis.counts} />
      </SectionCard>

      <SectionCard title="The roster, re-judged live">
        <Typography variant="caption" color="text.secondary">
          Click a teacher to open their card in the scorecard view.
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              {[...ROSTER_HEADS.slice(0, 6), "Under base cuts",
                "Under adjusted cuts"].map((h, i) => (
                <TableCell key={h} sx={cellHeadSx}
                           align={i === 0 ? "left" : "center"}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {analysis.rows.map((r) => (
              <TableRow key={r.id} hover
                        sx={{ cursor: "pointer",
                              bgcolor: r.status === "mover"
                                ? (r.direction === "up"
                                    ? "#f2f8f3" : "#fdf3f2")
                                : undefined }}
                        onClick={() => onOpen(r.id)}>
                <RosterCells r={r} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </Stack>
  )
}

// The print one-pager: summary + movers on page one, the full
// roster as its own page (the .appendix break). `cuts` is the
// PARSED live table, so the print shows the numbers actually used.
function AnalysisReport({ analysis, cuts }) {
  const today = new Date().toLocaleDateString("en-US",
    { year: "numeric", month: "long", day: "numeric" })
  const c = analysis.counts
  const cellRow = (r) => (
    <>
      <td className="left">{r.name}</td>
      <td>{r.campus}</td><td>{r.ttess}</td><td>{r.pct}</td>
      <td>{r.survey === null ? "—" : r.survey}</td>
      <td>{r.overall}</td><td>{r.reference}</td><td>{r.actual}</td>
    </>
  )
  return (
    <div id="alief-report">
      <div className="rhead">
        <h1>Cut-Sensitivity Analysis — Alief ISD TIA Designations</h1>
        <div className="meta">
          <span><b>Roster:</b> 40 invented Teacher Type 11 teachers
            (mock data)</span>
          <span><b>Weights:</b> SY 2023-2024</span>
          <span><b>Printed:</b> {today}</span>
        </div>
      </div>

      <h2>The question</h2>
      <p style={{ fontSize: 11.5, margin: "4px 0" }}>
        The same 40 teachers were scored once, then judged under two
        cut tables: the baseline {CUT_TABLES.reference.label}
        {" "}({CUT_TABLES.reference.source}) and an adjusted table
        {" "}({cuts.source}). Scores never change between runs, so
        every movement below is cut policy, not performance.
      </p>

      <h2>The two cut tables</h2>
      <table>
        <tbody>
          <tr><th className="left">Table</th><th>Level</th>
            <th>Overall</th><th>T-TESS</th><th>Survey</th>
            <th>%MEE</th></tr>
          {CUT_TABLES.reference.bands.map((b, i) => (
            <tr key={"r" + b.label}>
              {i === 0 && <td className="left" rowSpan={3}>
                <b>Baseline</b></td>}
              <td>{b.label}</td><td>≥ {b.overall}</td>
              <td>≥ {b.ttess}</td><td>≥ {b.survey}</td>
              <td>≥ {b.pct}%</td></tr>
          ))}
          {cuts.bands.map((b, i) => (
            <tr key={"y" + b.label}>
              {i === 0 && <td className="left" rowSpan={3}>
                <b>Adjusted</b></td>}
              <td>{b.label}</td><td>≥ {b.overall}</td>
              <td>≥ {b.ttess}</td><td>≥ {b.survey}</td>
              <td>≥ {b.pct}%</td></tr>
          ))}
        </tbody>
      </table>

      <h2>Designation counts</h2>
      <table>
        <tbody>
          <tr><th className="left">Cut table</th><th>Masters</th>
            <th>Exemplary</th><th>Recognized</th><th>Designated</th>
            <th>Not Designated</th><th>Ineligible</th></tr>
          {[["Baseline", c.reference], ["Adjusted", c.actual]]
            .map(([label, cc]) => (
            <tr key={label}>
              <td className="left"><b>{label}</b></td>
              <td>{cc.Masters}</td><td>{cc.Exemplary}</td>
              <td>{cc.Recognized}</td>
              <td><b>{cc.designated} of 40</b></td>
              <td>{cc["Not Designated"]}</td><td>{cc.Ineligible}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>The movers ({analysis.movers.length} of 40) — and why</h2>
      <table>
        <tbody>
          <tr><th className="left">Teacher</th><th>Campus</th>
            <th>T-TESS</th><th>%MEE</th><th>Survey</th><th>Overall</th>
            <th>Baseline</th><th>Adjusted</th>
            <th className="left">Why</th></tr>
          {analysis.movers.map((r) => (
            <tr key={r.id}>{cellRow(r)}
              <td className="left">
                {(r.direction === "up" ? "released by "
                                       : "now blocked by ")
                  + r.releasedBy.join(" + ")}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>Where cut policy cannot reach</h2>
      <p style={{ fontSize: 11.5, margin: "4px 0" }}>
        {analysis.untouchable.map((r) =>
          r.status === "ineligible"
            ? `${r.name}: Ineligible (a T-TESS observation rating below Proficient) — eligibility precedes cut policy. `
            : `${r.name}: survey below 3 — a floor the adjustment leaves in place. `)}
        Moving these cuts does nothing for such teachers; reaching
        them would take a different lever.
      </p>

      <div className="appendix">
        <h2>Appendix — the full mock roster</h2>
        <table>
          <tbody>
            <tr><th className="left">Teacher</th><th>Campus</th>
              <th>T-TESS</th><th>%MEE</th><th>Survey</th>
              <th>Overall</th><th>Reference</th><th>Actual</th>
              <th className="left">Status</th></tr>
            {analysis.rows.map((r) => (
              <tr key={r.id}>{cellRow(r)}
                <td className="left">{r.status === "mover"
                  ? r.releasedBy.join(" + ") : r.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rfoot">Every name, campus and score is invented ·
        truncated, never rounded</div>
    </div>
  )
}

function SectionCard({ title, children, sx }) {
  return (
    <Card elevation={3} sx={{ overflow: "hidden", ...sx }}>
      <Box sx={headerSx}>
        <Typography sx={{ fontWeight: 700, letterSpacing: ".02em" }}>
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ pt: 1.5, overflowX: "auto" }}>{children}</CardContent>
    </Card>
  )
}

// The click-for-the-math icon: a small info button beside a computed
// number. Clicking opens a Popover with the formula behind it (the
// text comes from math.js; this component only displays it).
// `light` turns the icon white for dark backgrounds (the Overall bar).
function ExplainIcon({ explanation, light }) {
  const [anchor, setAnchor] = useState(null)
  if (!explanation) return null
  return (
    <>
      <IconButton size="small" aria-label="How this was calculated"
                  onClick={(e) => {
                    e.currentTarget.blur()   // avoids an aria-hidden focus warning
                    setAnchor(e.currentTarget)
                  }}
                  sx={{ ml: 0.5, p: 0.25 }}>
        <InfoOutlinedIcon
          sx={{ fontSize: 15,
                color: light ? "rgba(255,255,255,.85)" : "#8a9a8e" }} />
      </IconButton>
      <Popover open={Boolean(anchor)} anchorEl={anchor}
               onClose={() => setAnchor(null)}
               anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
               transformOrigin={{ vertical: "top", horizontal: "center" }}>
        <Box sx={{ p: 1.5, maxWidth: 440 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600,
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>
            {explanation.formula}
          </Typography>
          {explanation.note && (
            <Typography variant="caption" color="text.secondary"
                        sx={{ display: "block", mt: 0.5 }}>
              {explanation.note}
            </Typography>
          )}
        </Box>
      </Popover>
    </>
  )
}

function Met({ met }) {
  return met
    ? <CheckCircleIcon sx={{ fontSize: 16, verticalAlign: "-3px",
                             color: "#16a34a" }} />
    : <CancelIcon sx={{ fontSize: 16, color: "#dc2626",
                        verticalAlign: "-3px" }} />
}

const JANE = { name: "Jane Doe", id: "11235",
               campus: "Alief Middle School" }

function App() {
  const [teacherType, setTeacherType] = useState(11)
  const [view, setView] = useState("card")      // card | analysis
  const [person, setPerson] = useState(JANE)    // whose card is open
  // The live cut editor: the form holds strings, parsed into a cut
  // table, and the whole roster is re-analyzed on every edit (useMemo
  // keyed on the form). It starts loaded with the base cuts.
  const [cutForm, setCutForm] = useState(
    () => formFromTable(CUT_TABLES.reference))   // opens = base
  const yourCuts = useMemo(() => tableFromForm(cutForm), [cutForm])
  const analysis = useMemo(() => analyzeRoster(ROSTER, yourCuts),
                           [yourCuts])
  // Click-through: load a roster teacher into the scorecard view.
  // Deep-copy the arrays: the scorecard edits its own state, and
  // ROSTER itself must never change.
  const openTeacher = (id) => {
    const t = ROSTER.find((x) => x.id === id)
    if (!t) return
    setTeacherType(11)
    setPerson({ name: t.name, id: t.id, campus: t.campus })
    setEntered({ ttess: t.ttess.map((r) => [...r]),
                 growth: t.growth.map((p) => [...p]),
                 survey: t.survey })
    setView("card")
  }
  // The config is a lookup and the result is derived: recomputed from
  // the inputs on every render, so it can never be stale.
  // If the teacher type ever changes, reset `entered` in the same event,
  // not in a useEffect: an effect runs after the render, leaving one
  // render where a four-measure config reads three-measure inputs.
  const config = useMemo(() => configFor(teacherType), [teacherType])
  const [entered, setEntered] = useState(() => defaultsFor(11))
  const result = useMemo(
    () => (entered
      ? buildResult({ type: teacherType, ...entered })
      : null),
    [entered, teacherType])

  if (!config || !entered) {
    return <Typography sx={{ p: 3 }}>Loading…</Typography>
  }

  const setCell = (d, o, v) => {
    const grid = entered.ttess.map((row) => [...row])
    grid[d][o] = v
    setEntered({ ...entered, ttess: grid })
  }
  const setGrowth = (i, j, v) => {
    const rows = entered.growth.map((p) => [...p])
    rows[i][j] = v
    setEntered({ ...entered, growth: rows })
  }
  // Clamp typed values on blur. HTML min/max only limit the spinner
  // arrows, so a typed 150 or -5 would otherwise get through. Each box
  // has its own range (percents 0 to 100, survey 1 to 5); a non-number
  // such as a half-typed "1e" falls to the low end.
  const clamp = (v, lo, hi) =>
    Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo

  return (
    <>
    <style>{printCss}</style>
    <Container maxWidth="xl" sx={{ py: 3 }} id="alief-app">
      {/* The page shows the scorecard only, so `view` stays "card". The
          Cut Analysis views (AnalysisView, AnalysisReport) are kept but
          not reachable. To add a view switch, import ToggleButton and
          ToggleButtonGroup from @mui/material and render:
          <ToggleButtonGroup exclusive value={view}
                             onChange={(e, v) => v && setView(v)}>
            <ToggleButton value="card">📋 Scorecard</ToggleButton>
            <ToggleButton value="analysis">📊 Cut Analysis</ToggleButton>
          </ToggleButtonGroup>
          */}

      {/* ---- header ---- */}
      <Paper elevation={4} sx={{ ...headerSx, borderRadius: 3, mb: 2,
                                 display: "flex", alignItems: "center",
                                 justifyContent: "space-between",
                                 flexWrap: "wrap", gap: 1.5, py: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Alief ISD TIA Scorecard
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center",
                                                   flexWrap: "wrap" }}
               useFlexGap>
          {view === "card" && (
            <>
              <Chip label={person.name}
                    sx={{ bgcolor: "#f0c633", fontWeight: 700 }} />
              <Chip label={`ID ${person.id}`} variant="outlined"
                    sx={{ color: "#fff",
                          borderColor: "rgba(255,255,255,.5)" }} />
              <Chip label={person.campus} variant="outlined"
                    sx={{ color: "#fff",
                          borderColor: "rgba(255,255,255,.5)" }} />
              {/* Teacher Type 11 only; Types 2 and 10 remain in math.js. */}
              <Chip label="Teacher Type 11" variant="outlined"
                    sx={{ color: "#fff",
                          borderColor: "rgba(255,255,255,.5)" }} />
            </>
          )}
          {/* Print button hidden; the report views and print CSS remain.
              To show it, render:
              <Button size="small" onClick={() => window.print()}
                      sx={{ bgcolor: "#fff", color: "#1a5c34",
                            fontWeight: 700, borderRadius: 999,
                            px: 2,
                            "&:hover": { bgcolor: "#f0c633" } }}>
                🖨 Print report
              </Button> */}
        </Stack>

      </Paper>

      {view === "card" && (<>
      {/* ---- the two component cards ---- */}
      <Box sx={{ display: "grid", gap: 2,
                 gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" } }}>
        {/* T-TESS */}
        <SectionCard title="Teacher T-TESS Component">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={cellHeadSx}>Dimension</TableCell>
                {config.observations.map((o) => (
                  <TableCell key={o.label} sx={cellHeadSx} align="center">
                    {o.label}
                    <Typography variant="caption" color="text.secondary"
                                sx={{ display: "block" }}>
                      weight {o.weight}%
                    </Typography>
                  </TableCell>
                ))}
                <TableCell sx={cellHeadSx} align="center">Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {config.dimensions.map((dim, d) => (
                <TableRow key={dim} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{dim}</TableCell>
                  {config.observations.map((o, oi) => {
                    const uncovered = o.covers && !o.covers.includes(dim)
                    return (
                      <TableCell key={oi} align="center"
                                 sx={uncovered
                                   ? { bgcolor: "#eceff1", color: "#90a4ae" }
                                   : undefined}>
                        {uncovered ? "—" : (
                          <Select size="small" variant="standard"
                                  value={entered.ttess[d][oi] ?? 4}
                                  onChange={(e) =>
                                    setCell(d, oi, Number(e.target.value))}>
                            {config.ttess_levels.map((lv) => (
                              <MenuItem key={lv.value} value={lv.value}>
                                {lv.label}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      </TableCell>
                    )
                  })}
                  <TableCell align="center" sx={{ fontWeight: 600,
                                                  whiteSpace: "nowrap" }}>
                    {result ? result.ttess.dimension_scores[d] : ""}
                    {result && (
                      <ExplainIcon
                        explanation={result.ttess.dimension_explanations?.[d]} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: "#f2f8f3" }}>
                <TableCell colSpan={config.observations.length + 1}
                           sx={{ fontWeight: 700 }}>
                  T-TESS Score
                </TableCell>
                <TableCell align="center" sx={{ ...redNum,
                                                whiteSpace: "nowrap" }}>
                  {result ? result.ttess.score : ""}
                  {result && (
                    <ExplainIcon
                      explanation={result.ttess.score_explanation} />
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </SectionCard>

        {/* Growth + survey + overall */}
        <Stack spacing={2}>
          <SectionCard title="Student Growth Component">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={cellHeadSx}>Measure</TableCell>
                  <TableCell sx={cellHeadSx} align="center">% Meeting or Exceeding</TableCell>
                  <TableCell sx={cellHeadSx} align="center">Growth Rating</TableCell>
                  <TableCell sx={cellHeadSx} align="center">Score Earned</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {config.measures.map((m, i) => (
                  <TableRow key={m.name} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{m.name}</TableCell>
                    <TableCell align="center">
                      <TextField size="small" type="number" variant="standard"
                                 value={entered.growth[i][0]}
                                 onChange={(e) =>
                                   setGrowth(i, 0, Number(e.target.value))}
                                 onBlur={() =>
                                   setGrowth(i, 0,
                                             clamp(entered.growth[i][0],
                                                   0, 100))}
                                 onWheel={(e) => e.target.blur()}
                                 inputProps={{
                                   min: 0, max: 100, step: 0.01,
                                   style: { textAlign: "right", width: 92 } }} />
                      <Typography component="span" variant="body2"> %</Typography>
                    </TableCell>
                    {m.mode === "score" ? (
                      // A continuous measure (Amplify / iReady) has
                      // no rating label: the fractional score is
                      // entered here, and the red Score Earned cell
                      // echoes it, like the district card.
                      <TableCell align="center">
                        <TextField size="small" type="number"
                                   variant="standard"
                                   value={entered.growth[i][1]}
                                   onChange={(e) =>
                                     setGrowth(i, 1,
                                               Number(e.target.value))}
                                   onBlur={() =>
                                     setGrowth(i, 1,
                                               clamp(entered.growth[i][1],
                                                     1, 5))}
                                   onWheel={(e) => e.target.blur()}
                                   inputProps={{
                                     min: 1, max: 5, step: 0.0001,
                                     style: { textAlign: "right",
                                              width: 92 } }} />
                      </TableCell>
                    ) : (
                      <TableCell align="center">
                        <Select size="small" variant="standard"
                                value={entered.growth[i][1]}
                                onChange={(e) =>
                                  setGrowth(i, 1, e.target.value)}>
                          {config.growth_levels.map((lv) => (
                            <MenuItem key={lv} value={lv}>{lv}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                    )}
                    <TableCell align="center" sx={{ ...redNum,
                                                    whiteSpace: "nowrap" }}>
                      {result ? result.growth.rows[i].earned : ""}
                      {result && (
                        <ExplainIcon
                          explanation={result.growth.rows[i].earned_explanation} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Stack direction="row" spacing={2} sx={{ mt: 1.5,
                    alignItems: "center", justifyContent: "flex-end" }}>
              <Typography variant="body2" color="text.secondary">
                Overall % Meeting or Exceeding Growth
              </Typography>
              <Chip color="primary"
                    label={result ? result.growth.overall_percent : "…"}
                    sx={{ fontWeight: 700, fontSize: 15 }} />
              {result && (
                <ExplainIcon
                  explanation={result.growth.overall_percent_explanation} />
              )}
            </Stack>
          </SectionCard>

          {/* Types 1-4 have NO survey — the card vanishes and the
              designation walk waives its floor (math.js). */}
          {config.survey_weight > 0 && (
          <SectionCard title="Student Survey Component — Grades 3-12">
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Score (max 5)
              </Typography>
              <TextField size="small" type="number"
                         value={entered.survey}
                         onChange={(e) => setEntered({ ...entered,
                           survey: Number(e.target.value) })}
                         onBlur={() => setEntered({ ...entered,
                           survey: clamp(entered.survey, 1, 5) })}
                         onWheel={(e) => e.target.blur()}
                         inputProps={{
                           min: 1, max: 5, step: 0.000001,
                           style: { width: 110 } }} />
              <Typography sx={redNum}>
                {result ? result.survey : ""}
              </Typography>
              {result && (
                <ExplainIcon explanation={result.survey_explanation} />
              )}
            </Stack>
          </SectionCard>
          )}

          <Paper elevation={4}
                 sx={{ p: 2, borderRadius: 3, display: "flex",
                       alignItems: "center", justifyContent: "space-between",
                       background: "linear-gradient(135deg, #8f1d1d, #c62828)",
                       color: "#fff" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Overall TIA Score
            </Typography>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {result ? result.overall : "…"}
              </Typography>
              {result && (
                <ExplainIcon light
                             explanation={result.overall_explanation} />
              )}
              {result && (
                <Chip icon={<EmojiEventsIcon sx={{ color: "#ad9744 !important" }} />}
                      label={result.designation}
                      sx={{ bgcolor: "#fff", fontWeight: 800, fontSize: 14 }} />
              )}
            </Stack>
          </Paper>
        </Stack>
      </Box>

      {/* ---- the designation cut table ---- */}
      {result && (
        <Card elevation={3} sx={{ mt: 2, overflow: "hidden" }}>
          <Box sx={headerSx}>
            <Typography sx={{ fontWeight: 700 }}>
              Designation Requirements
            </Typography>
            <Typography variant="caption" sx={{ opacity: .85 }}>
              Every requirement met earns a green check; a miss shows a
              red ✗. The HIGHEST row with all checks is the designation
              this teacher fully meets — the award.
            </Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Designation Level", "Overall TIA Score Cutoffs",
                  "T-TESS Score", "Student Survey",
                  "Student Growth %MEE"].map((col, i) => (
                  <TableCell key={col} sx={cellHeadSx}
                             align={i === 0 ? "left" : "center"}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* This teacher's OWN values, in the cut columns' voice —
                  the table reads self-contained: "you have X; each
                  band needs Y". */}
              <TableRow sx={{ bgcolor: "#fdf6e3" }}>
                <TableCell sx={{ fontWeight: 700, color: "#8a6d1a" }}>
                  This teacher
                </TableCell>
                {result.cut_table.actuals.map((a, i) => (
                  <TableCell key={i} align="center"
                             sx={{ fontWeight: 700, color: "#8a6d1a" }}>
                    {a}
                  </TableCell>
                ))}
              </TableRow>
              {/* No row highlighting: band rows stay white and the
                  green checks and red ✗s tell the story; only the
                  gold This-teacher row is tinted. The AWARDED chip
                  names the earned designation. */}
              {[...result.cut_table.rows].reverse().map((row) => {
                const earned = row.label === result.designation
                return (
                  <TableRow key={row.label}>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {row.label}
                      {earned && (
                        <Chip size="small" label="AWARDED"
                              sx={{ ml: 1, bgcolor: "#217346",
                                    color: "#fff", fontWeight: 700 }} />
                      )}
                    </TableCell>
                    {row.cells.map((cell, i) => (
                      <TableCell key={i} align="center">
                        {cell.waived ? (
                          <Typography component="span"
                                      sx={{ color: "#90a4ae" }}>
                            —
                          </Typography>
                        ) : (
                          <>
                            {cell.text} <Met met={cell.met} />
                            {cell.gap && (
                              <Typography variant="caption"
                                          sx={{ display: "block",
                                                color: "#b45309" }}>
                                {cell.gap}
                              </Typography>
                            )}
                          </>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {result.note && (
            <Alert severity="info" sx={{ m: 1.5 }}>{result.note}</Alert>
          )}
          {result.ttess.ineligible_reason && (
            <Alert severity="warning" sx={{ m: 1.5 }}>
              Eligibility: {result.ttess.ineligible_reason}
            </Alert>
          )}
        </Card>
      )}
      </>)}

      {view === "analysis" && (
        <AnalysisView analysis={analysis} form={cutForm}
                      setForm={setCutForm} onOpen={openTeacher} />
      )}
    </Container>
    {view === "card" && result && (
      <ReportView result={result} config={config} entered={entered}
                  teacherType={teacherType} person={person} />
    )}
    {view === "analysis" && (
      <AnalysisReport analysis={analysis} cuts={yourCuts} />
    )}
    </>
  )
}

// The page component React Router renders at /projects/tia-scorecard.
// ThemeProvider scopes the green theme to this page. The Box paints
// the page's background and resets the text color, because the
// site's outer Container (App.jsx) sets color "white", which plain
// text here would otherwise inherit. m: -2 cancels that Container's
// p: 2 padding so the background reaches the edges.
export default function TIAScorecardPage() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", color: "text.primary",
                 fontFamily: theme.typography.fontFamily,
                 minHeight: "100vh", m: -2 }}>
        <App />
      </Box>
    </ThemeProvider>
  )
}
