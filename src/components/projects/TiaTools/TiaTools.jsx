// TIA tools: the landing page for the education data tools.
// Route: /tia-tools
//
// A short introduction, then one card per tool. Each card opens its tool;
// its small preview, drawn in code, plays a short animation on hover or
// keyboard focus.
import { Link as RouterLink } from "react-router-dom"
import { Box, Typography } from "@mui/material"
import { PageShell, T, DISPLAY, SANS } from "./tiaKit.jsx"

const GITHUB = "https://github.com/edwin-torres"
const LINKEDIN = "https://www.linkedin.com/in/torres-edwin/"

// The selector for "this card is hovered or has keyboard focus", used by
// the previews to start their animation.
const ON = ".tool-card:hover &, .tool-card:focus-within &"
const MOTION = (s = ".5s", delay = "0s") => ({
  transition: `all ${s} cubic-bezier(.2,.7,.2,1) ${delay}`,
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
})

// ---- Previews (decorative; each is a tiny drawing of its tool) ---------------

// Teacher what-if: two rating rows and the score bar. On hover a rating
// steps up from 3 to 4, the bar grows past the 63.3 marker, and the
// designation changes from Acknowledged to Recognized.
function TeacherPreview() {
  const box = (filled, hoverFilled) => ({
    width: 18, height: 14, borderRadius: "3px", border: "1px solid rgba(255,255,255,.25)",
    bgcolor: filled ? T.aDark : "transparent", ...MOTION(".35s"),
    [ON]: { bgcolor: hoverFilled ? T.aDark : "transparent" },
  })
  return (
    <Box sx={{ height: "100%", bgcolor: T.navy, px: 2.5, py: 2, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,.65)" }}>Projected designation</Typography>
        <Box sx={{ position: "relative", height: 26, width: 150 }}>
          <Typography sx={{ position: "absolute", right: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 19,
                            color: "rgba(255,255,255,.6)", ...MOTION(".35s"), [ON]: { opacity: 0, transform: "translateY(-8px)" } }}>
            Acknowledged
          </Typography>
          <Typography sx={{ position: "absolute", right: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, color: "#fff",
                            opacity: 0, transform: "translateY(8px)", ...MOTION(".35s", ".1s"), [ON]: { opacity: 1, transform: "none" } }}>
            Recognized
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "grid", gap: 0.75 }}>
        {[["2.4", 4, 4], ["3.1", 3, 4]].map(([code, rest, hover]) => (
          <Box key={code} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,.55)", width: 26 }}>{code}</Typography>
            {[1, 2, 3, 4, 5].map((n) => <Box key={n} sx={box(n === rest, n === hover)} />)}
          </Box>
        ))}
      </Box>
      <Box sx={{ position: "relative", height: 10 }}>
        <Box sx={{ height: "100%", borderRadius: "999px", bgcolor: "rgba(255,255,255,.12)", overflow: "hidden" }}>
          <Box sx={{ display: "flex", height: "100%", width: "60%", ...MOTION(".6s", ".15s"), [ON]: { width: "67%" } }}>
            <Box sx={{ width: "12%", bgcolor: T.aDark }} />
            <Box sx={{ width: "41%", bgcolor: T.bDark }} />
            <Box sx={{ width: "47%", bgcolor: T.cDark }} />
          </Box>
        </Box>
        {[59, 63.3, 68.1, 79].map((x) => (
          <Box key={x} sx={{ position: "absolute", left: `${x}%`, top: -3, width: 2, height: 16, ml: "-1px",
                             borderRadius: "1px", bgcolor: "rgba(255,255,255,.55)" }} />
        ))}
      </Box>
    </Box>
  )
}

// Principal what-if: a small breakdown table whose % earned cells fill in
// with their colors one after another.
function PrincipalPreview() {
  const rows = [["Quality of instruction", 60, "#E1E37A"], ["STAAR Domain 1", 100, "#63BE7B"],
                ["STAAR Domain 2", 70, "#B7D57F"], ["STAAR Domain 3", 100, "#63BE7B"], ["NWEA MAP", 75, "#C9DC7E"]]
  return (
    <Box sx={{ height: "100%", bgcolor: T.indigoSoft, px: 2.5, py: 1.75, display: "flex", flexDirection: "column", gap: 0.6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.25 }}>
        <Typography sx={{ fontSize: 12, color: T.indigo, fontWeight: 600 }}>Total points 81.50</Typography>
        <Box sx={{ fontSize: 11, fontWeight: 800, letterSpacing: ".04em", color: "#fff", px: 1, py: 0.25, borderRadius: "999px",
                   background: "linear-gradient(135deg, #11998e, #38ef7d)", opacity: 0.35, ...MOTION(".4s", ".45s"),
                   [ON]: { opacity: 1 } }}>
          Exemplary
        </Box>
      </Box>
      {rows.map(([label, pct, color], i) => (
        <Box key={label} sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 44px", gap: 1, alignItems: "center" }}>
          <Typography sx={{ fontSize: 11.5, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</Typography>
          <Box sx={{ fontSize: 11, fontWeight: 700, textAlign: "right", pr: 0.75, py: 0.2, borderRadius: "4px",
                     bgcolor: "rgba(76, 79, 196, .1)", color: T.muted, ...MOTION(".35s", `${i * 0.07}s`),
                     [ON]: { bgcolor: color, color: T.ink } }}>
            {pct}%
          </Box>
        </Box>
      ))}
    </Box>
  )
}

// Score cards: two small sheets that fan out.
function MiniSheet({ ok, sx }) {
  return (
    <Box sx={{ position: "absolute", top: 18, width: 104, height: 132, bgcolor: "#fff", borderRadius: "8px",
               boxShadow: "0 10px 22px -12px rgba(19, 41, 74, .45)", overflow: "hidden", ...MOTION(".45s"), ...sx }}>
      <Box sx={{ height: 20, bgcolor: T.navy }} />
      <Box sx={{ px: 1, pt: 0.75 }}>
        <Box sx={{ height: 9, width: "70%", borderRadius: "2px", bgcolor: ok ? T.green : "#9AA3A0", opacity: 0.85 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "3px", mt: 1 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Box key={i} sx={{ height: 9, borderRadius: "2px", bgcolor: !ok && i === 2 ? T.badSoft : i < 4 ? "#E7ECFC" : "#F0E9FA",
                               outline: !ok && i === 2 ? `1px solid ${T.bad}` : "none" }} />
          ))}
        </Box>
        <Box sx={{ height: 5, borderRadius: "2px", bgcolor: "#E3E8EE", mt: 1 }} />
        <Box sx={{ height: 5, width: "80%", borderRadius: "2px", bgcolor: "#E3E8EE", mt: 0.5 }} />
      </Box>
      {/* The back sheet (not ok) keeps its mark on the left, where the front sheet does not cover it. */}
      <Box sx={{ position: "absolute", [ok ? "right" : "left"]: 7, bottom: 7, width: 18, height: 18, borderRadius: "50%", fontSize: 11, fontWeight: 800,
                 display: "flex", alignItems: "center", justifyContent: "center",
                 bgcolor: ok ? T.okSoft : T.badSoft, color: ok ? T.ok : T.bad }}>
        {ok ? "✓" : "✗"}
      </Box>
    </Box>
  )
}

function ScoreCardsPreview() {
  return (
    <Box sx={{ height: "100%", bgcolor: T.greenSoft, position: "relative", overflow: "hidden" }}>
      <MiniSheet ok={false} sx={{ left: "calc(50% - 70px)", transform: "rotate(-4deg)",
                                  [ON]: { transform: "translateX(-26px) rotate(-9deg)" } }} />
      <MiniSheet ok sx={{ left: "calc(50% - 34px)", transform: "rotate(3deg)",
                          [ON]: { transform: "translateX(26px) rotate(8deg)" } }} />
    </Box>
  )
}

// ---- The cards -------------------------------------------------------------------
const TOOLS = [
  {
    key: "teacher", to: "/projects/teacher-what-if",
    accent: T.amber, shadow: "rgba(182, 90, 11, .45)", preview: <TeacherPreview />,
    audience: "For teachers", title: "TIA designation what-if",
    summary: "Shows how each of a teacher's 16 T-TESS ratings and their student growth add up to a TIA score and designation.",
    points: ["Set any rating with one click; the score updates instantly",
             "A live formula shows the 10 / 35 / 55 weighting",
             "See which requirements you meet, and the gap on the rest"],
    tags: ["React", "JavaScript", "TIA scoring rules"],
    hint: "Best on a laptop or desktop",
  },
  {
    key: "principal", to: "/projects/principal-scorecard",
    accent: T.indigo, shadow: "rgba(76, 79, 196, .45)", preview: <PrincipalPreview />,
    audience: "For principals and district leaders", title: "Principal effectiveness what-if",
    summary: "Models how T-PESS ratings, STAAR domain grades and college readiness measures combine into a principal's effectiveness level.",
    points: ["Six scoring groups by campus level and prior rating",
             "Every one of 14 components explained step by step",
             "Change any rating or grade and the level updates instantly"],
    tags: ["Python", "React", "Data validation"],
    hint: "Best on a laptop or desktop",
  },
  {
    key: "cards", to: "/projects/sample-score-cards",
    accent: T.green, shadow: "rgba(21, 122, 74, .45)", preview: <ScoreCardsPreview />,
    audience: "For HR and district staff", title: "Automated TIA score cards",
    summary: "A Python pipeline that checks the district's TIA lists and produces a personalized PDF score card for every teacher.",
    points: ["Builds every card straight from the district's Excel file",
             "One template, one PDF per teacher, named for sending",
             "Two sample cards with invented teachers"],
    tags: ["Python", "Excel", "PDF automation"],
    hint: "You can print or save both cards as a PDF",
  },
]

function ToolCard({ tool }) {
  return (
    <Box component="article" className="tool-card" sx={{
      position: "relative", height: "100%", display: "flex", flexDirection: "column",
      bgcolor: T.surface, border: `1px solid ${T.line}`, borderRadius: "20px", overflow: "hidden",
      transition: "transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .25s ease, border-color .25s ease",
      "&:hover, &:focus-within": {
        transform: "translateY(-6px) scale(1.015)", borderColor: tool.accent,
        boxShadow: `0 26px 48px -26px ${tool.shadow}`,
      },
      "@media (prefers-reduced-motion: reduce)": {
        transition: "box-shadow .2s ease, border-color .2s ease",
        "&:hover, &:focus-within": { transform: "none" },
      },
    }}>
      <Box aria-hidden sx={{ height: 172, flex: "none", borderBottom: `1px solid ${T.line}` }}>{tool.preview}</Box>

      <Box sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", flex: 1 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: tool.accent }}>{tool.audience}</Typography>
        <Typography component="h2" sx={{ fontFamily: DISPLAY, fontSize: 25, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.15, mt: 0.5 }}>
          {/* The title link covers the whole card (its ::after), so clicking anywhere opens the tool. */}
          <Box component={RouterLink} to={tool.to} sx={{
            color: "inherit", textDecoration: "none",
            "&::after": { content: '""', position: "absolute", inset: 0, borderRadius: "20px" },
            "&:focus-visible": { outline: "none" },
            "&:focus-visible::after": { outline: `3px solid ${tool.accent}`, outlineOffset: "-3px" },
          }}>
            {tool.title}
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 15, color: T.muted, lineHeight: 1.55, mt: 1 }}>{tool.summary}</Typography>

        <Box component="ul" sx={{ m: 0, mt: 2, p: 0, listStyle: "none", display: "grid", gap: 0.9 }}>
          {tool.points.map((p) => (
            <Box component="li" key={p} sx={{ display: "flex", gap: 1.25, fontSize: 14.5, lineHeight: 1.45 }}>
              <Box component="span" aria-hidden sx={{ mt: "7px", width: 6, height: 6, borderRadius: "2px", flex: "none", bgcolor: tool.accent }} />
              {p}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 2.5 }}>
          {tool.tags.map((t) => (
            <Box key={t} sx={{ fontSize: 12.5, fontWeight: 500, color: T.ink, bgcolor: T.page, borderRadius: "999px", px: 1.25, py: 0.4 }}>{t}</Box>
          ))}
        </Box>

        <Box sx={{ mt: "auto", pt: 3, display: "flex", alignItems: "center" }}>
          <Box aria-hidden sx={{ fontSize: 14.5, fontWeight: 600, color: "#fff", bgcolor: tool.accent, borderRadius: "10px", px: 2, py: 1 }}>
            Open the tool
          </Box>
        </Box>
        {tool.hint && <Typography sx={{ fontSize: 12.5, color: T.muted, mt: 1.25 }}>{tool.hint}</Typography>}
      </Box>
    </Box>
  )
}

// ---- The page --------------------------------------------------------------------
const PRINCIPLES = [
  ["Rules from the source", "Weights, cut points and lookups come straight from district handbooks and spreadsheets."],
  ["Checked before it's shared", "Results are compared against official sample score cards and the original calculations."],
  ["Sample data only", "No real teacher or principal data, and nothing you enter is saved."],
]

function ExternalLink({ href, children }) {
  return (
    <Box component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{
      fontSize: 14.5, fontWeight: 600, color: T.ink, textDecoration: "none",
      "&:hover": { textDecoration: "underline", textUnderlineOffset: "3px" },
      "&:focus-visible": { outline: `2px solid ${T.navy}`, outlineOffset: 3, borderRadius: "4px" },
    }}>
      {children}
    </Box>
  )
}

export default function TiaToolsPage() {
  return (
    <PageShell>
      <Box sx={{ maxWidth: 1180, mx: "auto" }}>
        {/* ---- top bar ---- */}
        <Box component="nav" aria-label="Site" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18 }}>Edwin Torres</Typography>
          <Box sx={{ display: "flex", gap: 2.5 }}>
            <ExternalLink href={GITHUB}>GitHub</ExternalLink>
            <ExternalLink href={LINKEDIN}>LinkedIn</ExternalLink>
          </Box>
        </Box>

        {/* ---- opening ---- */}
        <Box component="header" sx={{ mt: { xs: 6, md: 9 }, mb: { xs: 5, md: 7 }, maxWidth: 820 }}>
          <Typography component="h1" sx={{ fontFamily: DISPLAY, fontWeight: 800, letterSpacing: "-0.03em",
                                           lineHeight: 1.02, fontSize: { xs: 40, sm: 52, md: 68 } }}>
            TIA data you can trust, and explain.
          </Typography>
          <Typography sx={{ fontSize: { xs: 16.5, md: 19 }, color: T.muted, lineHeight: 1.55, mt: 2.5, maxWidth: 700 }}>
            I&apos;m the research and data analyst responsible for Teacher Incentive Allotment and strategic
            compensation data in a Texas school district. These tools use the same kind of scoring rules I work
            with every day, so anyone can change the inputs and see exactly how a score and designation are reached.
          </Typography>
          <Box component="ul" aria-label="Skills" sx={{ listStyle: "none", m: 0, mt: 3, p: 0, display: "flex", flexWrap: "wrap", gap: 1 }}>
            {["Python", "Excel", "React", "TIA", "T-TESS and T-PESS"].map((s) => (
              <Box component="li" key={s} sx={{ fontSize: 14, fontWeight: 600, color: T.navy, bgcolor: T.surface,
                                                border: `1px solid ${T.line}`, borderRadius: "999px", px: 1.5, py: 0.5 }}>
                {s}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ---- the tools ---- */}
        <Box component="section" aria-label="Tools" sx={{
          display: "grid", gap: 3, mx: "auto", maxWidth: { xs: 640, lg: "none" },
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(3, minmax(0, 1fr))" },
        }}>
          {TOOLS.map((tool) => <ToolCard key={tool.key} tool={tool} />)}
        </Box>

        {/* ---- how I build these ---- */}
        <Box component="section" aria-labelledby="how-title" sx={{ mt: { xs: 6, md: 9 } }}>
          <Typography id="how-title" component="h2" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: { xs: 24, md: 28 }, letterSpacing: "-0.01em" }}>
            How I build these
          </Typography>
          <Box sx={{ display: "grid", gap: { xs: 2.5, md: 4 }, mt: 2.5,
                     gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(3, minmax(0, 1fr))" } }}>
            {PRINCIPLES.map(([title, text]) => (
              <Box key={title} sx={{ borderTop: `2px solid ${T.navy}`, pt: 1.75 }}>
                <Typography sx={{ fontSize: 16.5, fontWeight: 600 }}>{title}</Typography>
                <Typography sx={{ fontSize: 15, color: T.muted, lineHeight: 1.55, mt: 0.5 }}>{text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ---- footer ---- */}
        <Box component="footer" sx={{ mt: { xs: 6, md: 9 }, pt: 3, borderTop: `1px solid ${T.line}`,
                                      display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2,
                                      fontFamily: SANS, fontSize: 14, color: T.muted }}>
          <span>Edwin Torres. Built with React.</span>
          <Box sx={{ display: "flex", gap: 2.5 }}>
            <ExternalLink href={GITHUB}>GitHub</ExternalLink>
            <ExternalLink href={LINKEDIN}>LinkedIn</ExternalLink>
          </Box>
        </Box>
      </Box>
    </PageShell>
  )
}
