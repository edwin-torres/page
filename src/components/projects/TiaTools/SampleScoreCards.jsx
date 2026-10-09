// Automated TIA score cards: how the pipeline works, and two sample cards.
// Route: /projects/sample-score-cards
//
// The two teachers, their campus, IDs and district are invented. Their
// numbers come from the same scoring rules as the teacher what-if
// (../TeacherWhatIf/whatIfMath.js), so every value on a card is computed,
// not typed in. "Print or save as PDF" prints just the two cards, one per page.
import { Box, Button, GlobalStyles, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import { scoreTeacher, DIMS_1_4, DIMS_2_3, NONE, WEIGHTS } from "../TeacherWhatIf/whatIfMath.js"
import { PageShell, BackToTools, T, DISPLAY, NUM } from "./tiaKit.jsx"

const ratingsFrom = (r14, r23) => Object.fromEntries([
  ...DIMS_1_4.map((c, i) => [c, r14[i]]), ...DIMS_2_3.map((c, i) => [c, r23[i]]),
])

// Two invented teachers: one earns Recognized; one has a strong score but
// a single rating of 2, which blocks every designation.
const SAMPLES = [
  {
    id: "sample-1", heading: "Sample 1: earns Recognized",
    name: "Jordan Ellis", campus: "Cedar Grove Elementary", employeeId: "100482",
    current: "Acknowledged", growthSource: "MAP",
    ratings: ratingsFrom([4, 4, 3, 4, 4, 4, 3, 4], [4, 4, 4, 4, 3, 4, 4, 4]), growthPct: 58.4,
  },
  {
    id: "sample-2", heading: "Sample 2: a strong score, blocked by one rating",
    name: "Morgan Reyes", campus: "Lakeview Middle School", employeeId: "100917",
    current: NONE, growthSource: "District assessment",
    ratings: ratingsFrom([4, 4, 2, 4, 4, 5, 4, 4], [5, 4, 4, 5, 4, 4, 5, 4]), growthPct: 80.25,
  },
]

// The pipeline, in the order it runs.
const STEPS = [
  ["Load the lists", "Read each teacher's ratings, growth and designation from the district's Excel file. Employee IDs stay as text so leading zeros are not lost."],
  ["Check the data", "Set aside rows with missing values, flag duplicate IDs, and recalculate each designation to make sure it matches the file."],
  ["Fill the template", "Place each teacher's numbers into one shared score card design. Numbers are truncated, never rounded, to follow the scoring rules."],
  ["Print to PDF", "Save every card as its own PDF, named by employee ID, without overwriting copies made earlier."],
  ["Prepare to send", "Build a list that pairs each PDF with its teacher, so every card can be emailed to the right person."],
]

// ---- One score card ------------------------------------------------------------

function Lab({ children }) {
  return <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: T.muted }}>{children}</Typography>
}

function Panel({ children, top, sx }) {
  return (
    <Box sx={{ border: "1px solid #CFD6D2", borderRadius: "10px", px: 2, py: 1.25, bgcolor: "#fff",
               ...(top ? { borderTop: `4px solid ${top}` } : {}), ...sx }}>
      {children}
    </Box>
  )
}

function ChipPanel({ title, weight, codes, ratings, avgText, color, tint }) {
  return (
    <Panel top={color}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{title}</Typography>
        <Typography sx={{ fontSize: 11.5, color: T.muted, fontWeight: 600 }}>{weight}% of the score</Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(0, 1fr))", gap: "5px", mt: 1 }}>
        {codes.map((code) => {
          const v = ratings[code]
          const low = v < 3
          return (
            <Box key={code} sx={{ borderRadius: "6px", textAlign: "center", pt: 0.6, pb: 0.4, bgcolor: low ? T.badSoft : tint }}>
              <Typography sx={{ fontSize: 19, fontWeight: 800, lineHeight: 1, color: low ? T.bad : color }}>{v}</Typography>
              <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: T.muted, mt: 0.4 }}>{code}</Typography>
            </Box>
          )
        })}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mt: 1, pt: 0.75,
                 borderTop: `1px solid ${T.line}`, fontSize: 12.5, color: T.muted }}>
        <span>{title.replace("T-TESS ", "")} average</span>
        <Typography component="span" sx={{ fontSize: 20, fontWeight: 800, color, ...NUM }}>{avgText}</Typography>
      </Box>
    </Panel>
  )
}

const Mark = ({ ok }) => (
  <Box component="span" sx={{ color: ok ? T.ok : T.bad, fontWeight: 800, ml: 0.5 }}>{ok ? "✓" : "✗"}</Box>
)

function ScoreCard({ s }) {
  const r = scoreTeacher({ ratings: s.ratings, growthPct: s.growthPct })
  const none = r.designation === NONE
  return (
    <Box className="score-sheet" sx={{
      bgcolor: "#fff", borderRadius: "16px", p: { xs: 2, sm: 3.5 }, maxWidth: 860, mx: "auto",
      boxShadow: "0 20px 44px -26px rgba(19, 41, 74, .5)", display: "grid", gap: 1.25,
      gridTemplateColumns: "minmax(0, 1fr)",   // lets wide tables scroll inside their panel on phones
      WebkitPrintColorAdjust: "exact", printColorAdjust: "exact",
    }}>
      {/* 1. header */}
      <Box sx={{ bgcolor: T.navy, color: "#fff", borderRadius: "10px", px: 2.5, py: 1.75, display: "flex",
                 flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, opacity: 0.8 }}>Sample ISD</Typography>
          <Typography sx={{ fontFamily: DISPLAY, fontSize: { xs: 21, sm: 25 }, fontWeight: 700, lineHeight: 1.1 }}>2025–2026 TIA Score Card</Typography>
        </Box>
        <Box sx={{ textAlign: { sm: "right" } }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{s.name}</Typography>
          <Typography sx={{ fontSize: 12.5, opacity: 0.9 }}>{s.campus}, Employee ID {s.employeeId}</Typography>
          <Typography sx={{ fontSize: 11.5, opacity: 0.7 }}>Generated October 1, 2026</Typography>
        </Box>
      </Box>

      {/* 2. designations */}
      <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "minmax(0, 1.8fr) minmax(0, 1fr)" } }}>
        <Panel sx={{ border: `2px solid ${none ? "#9AA3A0" : T.green}` }}>
          <Lab>Preliminary new designation*</Lab>
          <Typography sx={{ fontFamily: DISPLAY, fontSize: { xs: 30, sm: 36 }, fontWeight: 800, lineHeight: 1.05, mt: 0.25,
                            color: none ? "#5B6560" : "#0F5B37" }}>
            {r.designation}
          </Typography>
          <Typography sx={{ fontSize: 11, color: T.muted, mt: 0.5 }}>*Subject to eligibility review, data validation, and TEA approval.</Typography>
        </Panel>
        <Panel>
          <Lab>Current active designation</Lab>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#3A423E", mt: 0.75 }}>{s.current}</Typography>
        </Panel>
      </Box>

      {/* 3 and 4. the 16 ratings */}
      <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" } }}>
        <ChipPanel title="T-TESS Domains 1 and 4" weight={WEIGHTS.d14} codes={DIMS_1_4} ratings={s.ratings}
                   avgText={r.text.avg14} color={T.a} tint="#E7ECFC" />
        <ChipPanel title="T-TESS Domains 2 and 3" weight={WEIGHTS.d23} codes={DIMS_2_3} ratings={s.ratings}
                   avgText={r.text.avg23} color={T.b} tint="#F0E9FA" />
      </Box>

      {/* 5 and 6. growth and weighted points */}
      <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "minmax(0, 1fr) minmax(0, 1.9fr)" } }}>
        <Panel top={T.c}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Student growth</Typography>
            <Typography sx={{ fontSize: 11.5, color: T.muted, fontWeight: 600 }}>{WEIGHTS.growth}%</Typography>
          </Box>
          <Typography sx={{ fontSize: 38, fontWeight: 800, color: T.c, lineHeight: 1, mt: 1, letterSpacing: "-0.02em", ...NUM }}>{r.text.growthPct}</Typography>
          <Typography sx={{ fontSize: 11.5, color: T.muted, mt: 1 }}>
            Percent of student records meeting or exceeding the growth target. Growth measure: <b style={{ color: T.ink }}>{s.growthSource}</b>
          </Typography>
        </Panel>
        <Panel>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Weighted points calculation</Typography>
            <Typography sx={{ fontSize: 11.5, color: T.muted, fontWeight: 600 }}>100 points possible</Typography>
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ mt: 0.5, "& td, & th": { px: 0.75, py: 0.6, fontSize: 12.5, borderColor: T.line, ...NUM },
                                      "& th": { fontSize: 11, color: T.muted, fontWeight: 600 } }}>
              <TableHead><TableRow><TableCell>Component</TableCell><TableCell align="right">Raw</TableCell><TableCell>Calculation</TableCell><TableCell align="right">Points</TableCell></TableRow></TableHead>
              <TableBody>
                <TableRow><TableCell>Domains 1 and 4 ({WEIGHTS.d14}%)</TableCell><TableCell align="right">{r.text.avg14}</TableCell><TableCell>{r.text.avg14} ÷ 5 × {WEIGHTS.d14}</TableCell><TableCell align="right">{r.text.points14}</TableCell></TableRow>
                <TableRow><TableCell>Domains 2 and 3 ({WEIGHTS.d23}%)</TableCell><TableCell align="right">{r.text.avg23}</TableCell><TableCell>{r.text.avg23} ÷ 5 × {WEIGHTS.d23}</TableCell><TableCell align="right">{r.text.points23}</TableCell></TableRow>
                <TableRow><TableCell>Student growth ({WEIGHTS.growth}%)</TableCell><TableCell align="right">{r.text.growthPct}</TableCell><TableCell>{r.text.growthDecimal} × {WEIGHTS.growth}</TableCell><TableCell align="right">{r.text.pointsGrowth}</TableCell></TableRow>
                <TableRow sx={{ "& td": { fontWeight: 800, fontSize: 13.5, bgcolor: "#E8EEF4", borderTop: `2px solid ${T.navy}`, borderBottom: 0 } }}>
                  <TableCell>Total TIA score</TableCell><TableCell /><TableCell /><TableCell align="right">{r.text.score}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
          <Typography sx={{ fontSize: 10.5, color: T.muted, mt: 0.5 }}>Points truncated to four decimals for display; the total uses unrounded values.</Typography>
        </Panel>
      </Box>

      {/* 7. minimum requirements */}
      <Panel>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Minimum requirements for TIA designations</Typography>
          <Typography sx={{ fontSize: 11.5, color: T.muted, fontWeight: 600 }}>all must be met</Typography>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ mt: 0.5, minWidth: 560, "& td, & th": { px: 0.75, py: 0.6, fontSize: 12.5, textAlign: "center", borderColor: T.line, ...NUM },
                                    "& td:first-of-type, & th:first-of-type": { textAlign: "left", whiteSpace: "nowrap" },
                                    "& th": { fontSize: 11, color: T.muted, fontWeight: 600, lineHeight: 1.25 } }}>
            <TableHead>
              <TableRow>
                <TableCell>TIA designation</TableCell><TableCell>TIA score</TableCell><TableCell>Student growth</TableCell>
                <TableCell>Domain 1 and 4 average</TableCell><TableCell>Domain 2 and 3 average</TableCell>
                <TableCell>All 16 ratings 3 or better</TableCell><TableCell>All met?</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow sx={{ "& td": { bgcolor: "#EEF1EF", fontWeight: 700 } }}>
                <TableCell>This teacher</TableCell><TableCell>{r.text.score}</TableCell><TableCell>{r.text.growthPct}</TableCell>
                <TableCell>{r.text.avg14}</TableCell><TableCell>{r.text.avg23}</TableCell><TableCell>Lowest: {r.lowest}</TableCell><TableCell />
              </TableRow>
              {r.levels.map((L) => (
                <TableRow key={L.name} sx={L.earned ? { "& td": { bgcolor: T.earned } } : undefined}>
                  <TableCell sx={{ fontWeight: 700 }}>{L.name}{L.earned && <Box component="span" sx={{ color: "#6B5D00", ml: 0.5 }}>◀</Box>}</TableCell>
                  <TableCell>{L.checks.score.cut}<Mark ok={L.checks.score.ok} /></TableCell>
                  <TableCell>{L.checks.growth.cut}<Mark ok={L.checks.growth.ok} /></TableCell>
                  <TableCell>{L.checks.d14.cut}<Mark ok={L.checks.d14.ok} /></TableCell>
                  <TableCell>{L.checks.d23.cut}<Mark ok={L.checks.d23.ok} /></TableCell>
                  <TableCell>3<Mark ok={L.checks.gate.ok} /></TableCell>
                  <TableCell><Mark ok={L.allOk} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Panel>

      {/* 8. the 3-or-better rule */}
      <Panel sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
        <Box sx={{ width: 26, height: 26, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
                   fontSize: 15, fontWeight: 800, bgcolor: r.gateOk ? T.okSoft : T.badSoft, color: r.gateOk ? T.ok : T.bad }}>
          {r.gateOk ? "✓" : "✗"}
        </Box>
        <Typography sx={{ fontSize: 12.5, color: T.muted }}>
          <b style={{ color: T.ink }}>{r.gateOk ? "All 16 ratings are Proficient or higher." : "Not all 16 ratings are Proficient or higher."}</b>{" "}
          All 16 T-TESS dimensions must be rated 3 (Proficient) or better. Lowest rating on this evaluation: <b style={{ color: T.ink }}>{r.lowest}</b>
          {!r.gateOk && ` (${r.lowCodes.join(", ")})`}.
        </Typography>
      </Panel>
    </Box>
  )
}

// One sentence under each sample's heading, written from its own numbers.
function caption(s) {
  const r = scoreTeacher({ ratings: s.ratings, growthPct: s.growthPct })
  if (!r.gateOk) {
    return `A TIA score of ${r.text.score} would clear the score minimum for every level, but dimension ${r.lowCodes.join(", ")} is rated ${r.lowest}. Every rating must be 3 or higher, so no designation is earned.`
  }
  const above = r.levels.find((L) => L.earned)
  return `A TIA score of ${r.text.score} with ${r.text.growthPct} growth meets every ${above.name} requirement, but not the higher Exemplary minimums.`
}

// ---- The page --------------------------------------------------------------------
export default function SampleScoreCardsPage() {
  return (
    <PageShell>
      {/* Printing shows only the two cards, one per Letter page. */}
      <GlobalStyles styles={{
        "@media print": {
          "@page": { size: "Letter", margin: "0.4in" },
          "body, html": { background: "#fff !important" },
          // no full-screen minimum height or page padding on paper (it made a blank third page)
          ".tia-shell": { minHeight: "0 !important", padding: "0 !important", margin: "0 !important", background: "#fff !important" },
          ".no-print": { display: "none !important" },
          ".score-sheet": { boxShadow: "none !important", padding: "0 !important", maxWidth: "none !important", breakAfter: "page" },
          ".sample-block:last-of-type .score-sheet": { breakAfter: "auto" },
        },
      }} />
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Box className="no-print">
          <BackToTools />
          <Typography component="h1" sx={{ fontFamily: DISPLAY, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05,
                                           fontSize: { xs: 34, md: 46 }, mt: 1 }}>
            Automated TIA score cards
          </Typography>
          <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: T.muted, lineHeight: 1.55, mt: 1.5, maxWidth: 760 }}>
            A Python notebook turns a district&apos;s TIA lists into a personalized score card for every teacher. The two
            samples below use invented teachers and a fictional district; every number on them is computed from the scoring rules.
          </Typography>

          <Box component="ol" aria-label="How the pipeline works" sx={{
            listStyle: "none", p: 0, m: 0, mt: 4, display: "grid", gap: 2,
            gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(5, minmax(0, 1fr))" },
          }}>
            {STEPS.map(([title, text], i) => (
              <Box component="li" key={title} sx={{ bgcolor: T.surface, border: `1px solid ${T.line}`, borderRadius: "14px", p: 2 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: T.green, color: "#fff", fontSize: 14, fontWeight: 700,
                           display: "flex", alignItems: "center", justifyContent: "center", ...NUM }}>{i + 1}</Box>
                <Typography sx={{ fontSize: 15.5, fontWeight: 600, mt: 1.25 }}>{title}</Typography>
                <Typography sx={{ fontSize: 13.5, color: T.muted, lineHeight: 1.5, mt: 0.5 }}>{text}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mt: 4 }}>
            <Box component="ul" aria-label="Built with" sx={{ listStyle: "none", p: 0, m: 0, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {["Python", "pandas", "Jinja2", "Playwright", "Excel"].map((t) => (
                <Box component="li" key={t} sx={{ fontSize: 13, fontWeight: 500, bgcolor: T.surface, border: `1px solid ${T.line}`,
                                                  borderRadius: "999px", px: 1.25, py: 0.4 }}>{t}</Box>
              ))}
            </Box>
            <Button variant="contained" disableElevation onClick={() => window.print()}
                    sx={{ ml: { sm: "auto" }, bgcolor: T.navy, borderRadius: "10px", px: 2.25, "&:hover": { bgcolor: T.ink } }}>
              Print or save as PDF
            </Button>
          </Box>
        </Box>

        {SAMPLES.map((s) => (
          <Box component="section" key={s.id} className="sample-block" aria-labelledby={s.id} sx={{ mt: { xs: 5, md: 7 } }}>
            <Box className="no-print" sx={{ maxWidth: 860, mx: "auto", mb: 2 }}>
              <Typography id={s.id} component="h2" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: { xs: 22, md: 26 }, letterSpacing: "-0.01em" }}>
                {s.heading}
              </Typography>
              <Typography sx={{ fontSize: 15.5, color: T.muted, lineHeight: 1.55, mt: 0.5 }}>{caption(s)}</Typography>
            </Box>
            <ScoreCard s={s} />
          </Box>
        ))}

        <Typography className="no-print" sx={{ fontSize: 13, color: T.muted, mt: 5, textAlign: "center" }}>
          Sample ISD, its campuses and both teachers are fictional.
        </Typography>
      </Box>
    </PageShell>
  )
}
