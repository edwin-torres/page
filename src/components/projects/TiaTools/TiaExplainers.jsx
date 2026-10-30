// TIA growth explainers: one card per step by step walkthrough.
// Route: /tia-explainers
//
// Same look as the TIA tools page. Three explainers are standalone pages in
// public/tia-explainers/ (plain links); the STAAR one is a route in this app
// (a router link). Each card's small drawing animates on hover or keyboard focus.
import { Link as RouterLink } from "react-router-dom"
import { Box, Typography } from "@mui/material"
import { PageShell, T, DISPLAY, SANS } from "./tiaKit.jsx"

const GITHUB = "https://github.com/edwin-torres"
const LINKEDIN = "https://www.linkedin.com/in/torres-edwin/"
const STATIC = `${import.meta.env.BASE_URL}tia-explainers/` // "/page/tia-explainers/"

// "This card is hovered or has keyboard focus": starts each drawing's animation.
const ON = ".ex-card:hover &, .ex-card:focus-within &"
const MOTION = (s = ".6s", delay = "0s") => ({
  transition: `all ${s} cubic-bezier(.22,.8,.24,1) ${delay}`,
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
})

// The explainers' teal scale, light to dark.
const TEAL = ["#5fb5af", "#3a9c9a", "#21807f", "#166468", "#0d4850"]

// ---- Drawings (decorative) ------------------------------------------------------------

// Gap closure: each row runs to a perfect score. The dark part is half the
// gap, ending at the target. On hover each post-test dot slides out from the
// pre-test; three pass their target, one falls short.
function GapPreview() {
  const rows = [[20, 57], [46, 82], [64, 74], [80, 92]] // pre-test, post-test
  return (
    <Box sx={{ height: "100%", bgcolor: "#E4F2F1", px: 3, py: 2.5, display: "grid", alignContent: "space-evenly" }}>
      {rows.map(([pre, post], i) => {
        const target = pre + (100 - pre) / 2
        const met = post >= target
        return (
          <Box key={pre} sx={{ position: "relative", height: 14 }}>
            <Box sx={{ position: "absolute", left: 0, right: 0, top: 6.5, height: "1px", bgcolor: "rgba(13,72,80,.18)" }} />
            <Box sx={{ position: "absolute", left: `${pre}%`, width: `${100 - pre}%`, top: 2, height: 10, bgcolor: TEAL[1], opacity: 0.22 }} />
            <Box sx={{ position: "absolute", left: `${pre}%`, width: `${target - pre}%`, top: 2, height: 10, bgcolor: TEAL[2], opacity: 0.85 }} />
            <Box sx={{ position: "absolute", left: `${target}%`, top: -2, width: 2, height: 18, ml: "-1px", bgcolor: T.ink }} />
            <Box sx={{ position: "absolute", left: `${pre}%`, top: 1, width: 12, height: 12, ml: "-6px", borderRadius: "50%", bgcolor: "#8a95a8", border: "2px solid #E4F2F1" }} />
            <Box sx={{
              position: "absolute", left: `${pre}%`, top: 0, width: 14, height: 14, ml: "-7px", borderRadius: "50%",
              bgcolor: met ? TEAL[3] : "#fff", border: `2.5px solid ${TEAL[3]}`, opacity: 0,
              ...MOTION(".7s", `${0.08 * i}s`), [ON]: { left: `${post}%`, opacity: 1 },
            }} />
          </Box>
        )
      })}
    </Box>
  )
}

// PE quintile: five groups by starting score, darker for higher starts. On
// hover each group's target line drops in and its dots spread out by growth.
function QuintilePreview() {
  const groups = [[18, 46], [24, 50], [30, 54], [36, 58], [42, 62]] // dots from, target at
  return (
    <Box sx={{ height: "100%", bgcolor: T.indigoSoft, px: 3, py: 2, display: "grid", alignContent: "space-evenly" }}>
      {groups.map(([from, target], q) => (
        <Box key={q} sx={{ position: "relative", height: 16, borderLeft: `3px solid ${TEAL[q]}`, pl: 1 }}>
          {[0, 1, 2, 3].map((k) => (
            <Box key={k} sx={{
              position: "absolute", top: 3, width: 10, height: 10, borderRadius: "50%", bgcolor: TEAL[q],
              left: `${from + k * 4}%`, ...MOTION(".7s", `${0.05 * q}s`), [ON]: { left: `${from + 8 + k * (10 + q)}%` },
            }} />
          ))}
          <Box sx={{
            position: "absolute", left: `${target + 18}%`, top: -3, width: 2, height: 22, bgcolor: T.indigo,
            transform: "scaleY(0)", ...MOTION(".45s", `${0.3 + 0.06 * q}s`), [ON]: { transform: "scaleY(1)" },
          }} />
        </Box>
      ))}
    </Box>
  )
}

// PreK: two subjects side by side, five quintile bars each. On hover the bars
// grow to each group's growth.
function PrekPreview() {
  const subjects = [["Math", [62, 54, 47, 40, 33]], ["Literacy", [70, 58, 50, 41, 30]]]
  return (
    <Box sx={{ height: "100%", bgcolor: "#FBF0E4", px: 3, py: 2.25, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
      {subjects.map(([name, heights], s) => (
        <Box key={name} sx={{ display: "flex", flexDirection: "column" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: T.amber }}>{name}</Typography>
          <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 0.75, borderBottom: "1px solid rgba(182,90,11,.3)", mt: 1 }}>
            {heights.map((h, q) => (
              <Box key={q} sx={{
                flex: 1, height: `${Math.round(h * 0.45)}%`, bgcolor: TEAL[q], borderRadius: "3px 3px 0 0",
                ...MOTION(".6s", `${0.05 * q + 0.08 * s}s`), [ON]: { height: `${h}%` },
              }} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

// STAAR transition table: a small 6 by 6 table. On hover a student waiting on
// last year's row slides into this year's column, and the cell fills in.
function StaarPreview() {
  const n = 6
  const row = 0, col = 1 // Did Not Meet Low last year, Did Not Meet High this year
  const cell = 100 / n
  return (
    <Box sx={{ height: "100%", bgcolor: "#E8EDFB", display: "grid", placeItems: "center" }}>
      <Box sx={{ position: "relative", width: { xs: "68%", sm: 290 }, height: 128, ml: "26px" }}>
        {/* last year's row, highlighted */}
        <Box sx={{ position: "absolute", left: -26, right: 0, top: `${row * cell}%`, height: `${cell}%`, bgcolor: "rgba(217,154,0,.16)" }} />
        {/* the cell, filling in */}
        <Box sx={{ position: "absolute", left: `${col * cell}%`, top: `${row * cell}%`, width: `${cell}%`, height: `${cell}%`,
                   bgcolor: "rgba(58,156,154,.28)", opacity: 0, ...MOTION(".35s", ".5s"), [ON]: { opacity: 1 } }} />
        <Box sx={{ position: "absolute", left: `calc(${col * cell}% + 3px)`, top: `calc(${row * cell}% + 1px)`, fontSize: 10, fontWeight: 700,
                   color: TEAL[2], opacity: 0, ...MOTION(".3s", ".6s"), [ON]: { opacity: 1 } }}>1</Box>
        {/* grid lines */}
        <Box sx={{ position: "absolute", inset: 0, border: "1px solid rgba(47,85,212,.35)",
                   backgroundImage: "linear-gradient(rgba(47,85,212,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(47,85,212,.22) 1px, transparent 1px)",
                   backgroundSize: `${cell}% ${cell}%` }} />
        {/* the student */}
        <Box sx={{
          position: "absolute", top: `calc(${(row + 0.5) * cell}% - 6px)`, left: -19, width: 12, height: 12, borderRadius: "50%",
          bgcolor: "#d2dae4", boxShadow: "0 0 0 2.5px #d99a00", ...MOTION(".6s"),
          [ON]: { left: `calc(${(col + 0.5) * cell}% - 6px)` },
        }} />
      </Box>
    </Box>
  )
}

// ---- The cards -------------------------------------------------------------------------
const EXPLAINERS = [
  {
    key: "gap", href: `${STATIC}gap-closure-growth.html`, accent: "#166468", shadow: "rgba(22, 100, 104, .45)", preview: <GapPreview />,
    model: "Half the gap model", title: "Gap closure growth",
    summary: "How pre-test and post-test scores become a teacher's growth score, with a target for every student.",
    steps: 8,
  },
  {
    key: "pe", href: `${STATIC}quintile-growth-pe.html`, accent: T.indigo, shadow: "rgba(76, 79, 196, .45)", preview: <QuintilePreview />,
    model: "Quintile model", title: "PE quintile growth",
    summary: "How beginning and end of year PE scores are grouped into quintiles that each set their own target.",
    steps: 9,
  },
  {
    key: "prek", href: `${STATIC}quintile-growth-prek.html`, accent: T.amber, shadow: "rgba(182, 90, 11, .45)", preview: <PrekPreview />,
    model: "Quintile model, two subjects", title: "PreK quintile growth",
    summary: "The quintile model for PreK, with math and literacy scored side by side.",
    steps: 14,
  },
  {
    key: "staar", to: "/projects/staar-transition-growth", accent: "#2F55D4", shadow: "rgba(47, 85, 212, .45)", preview: <StaarPreview />,
    model: "STAAR transition table", title: "STAAR transition growth",
    summary: "How last year's and this year's STAAR results meet in TEA's transition table to earn growth points.",
    steps: 13,
  },
]

function ExplainerCard({ ex }) {
  // The title link covers the whole card (its ::after), so clicking anywhere opens the explainer.
  const linkSx = {
    color: "inherit", textDecoration: "none",
    "&::after": { content: '""', position: "absolute", inset: 0, borderRadius: "20px" },
    "&:focus-visible": { outline: "none" },
    "&:focus-visible::after": { outline: `3px solid ${ex.accent}`, outlineOffset: "-3px" },
  }
  const link = ex.to
    ? <Box component={RouterLink} to={ex.to} sx={linkSx}>{ex.title}</Box>
    : <Box component="a" href={ex.href} sx={linkSx}>{ex.title}</Box>
  return (
    <Box component="article" className="ex-card" sx={{
      position: "relative", height: "100%", display: "flex", flexDirection: "column",
      bgcolor: T.surface, border: `1px solid ${T.line}`, borderRadius: "20px", overflow: "hidden",
      transition: "transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .25s ease, border-color .25s ease",
      "&:hover, &:focus-within": { transform: "translateY(-6px) scale(1.012)", borderColor: ex.accent, boxShadow: `0 26px 48px -26px ${ex.shadow}` },
      "@media (prefers-reduced-motion: reduce)": {
        transition: "box-shadow .2s ease, border-color .2s ease",
        "&:hover, &:focus-within": { transform: "none" },
      },
    }}>
      <Box aria-hidden sx={{ height: 170, flex: "none", borderBottom: `1px solid ${T.line}` }}>{ex.preview}</Box>
      <Box sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", flex: 1 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: ex.accent }}>{ex.model}</Typography>
        <Typography component="h2" sx={{ fontFamily: DISPLAY, fontSize: 25, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.15, mt: 0.5 }}>
          {link}
        </Typography>
        <Typography sx={{ fontSize: 15, color: T.muted, lineHeight: 1.55, mt: 1 }}>{ex.summary}</Typography>
        <Box sx={{ mt: "auto", pt: 3, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box aria-hidden sx={{ fontSize: 14.5, fontWeight: 600, color: "#fff", bgcolor: ex.accent, borderRadius: "10px", px: 2, py: 1 }}>
            Open the explainer
          </Box>
          <Typography sx={{ fontSize: 13.5, color: T.muted }}>{ex.steps} steps</Typography>
        </Box>
      </Box>
    </Box>
  )
}

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

export default function TiaExplainersPage() {
  return (
    <PageShell>
      <Box sx={{ maxWidth: 1080, mx: "auto" }}>
        <Box component="nav" aria-label="Site" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18 }}>Edwin Torres</Typography>
          <Box sx={{ display: "flex", gap: 2.5 }}>
            <ExternalLink href={GITHUB}>GitHub</ExternalLink>
            <ExternalLink href={LINKEDIN}>LinkedIn</ExternalLink>
          </Box>
        </Box>

        <Box component="header" sx={{ mt: { xs: 6, md: 9 }, mb: { xs: 5, md: 7 }, maxWidth: 780 }}>
          <Typography component="h1" sx={{ fontFamily: DISPLAY, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.02, fontSize: { xs: 40, sm: 52, md: 64 } }}>
            TIA growth, explained.
          </Typography>
          <Typography sx={{ fontSize: { xs: 16.5, md: 19 }, color: T.muted, lineHeight: 1.55, mt: 2.5, maxWidth: 660 }}>
            Step by step walkthroughs of how student scores become a teacher&apos;s TIA growth score. Each one follows a made-up class from the first score to the final percentage.
          </Typography>
        </Box>

        <Box component="section" aria-label="Explainers" sx={{
          display: "grid", gap: 3, mx: "auto", maxWidth: { xs: 640, md: "none" },
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" },
        }}>
          {EXPLAINERS.map((ex) => <ExplainerCard key={ex.key} ex={ex} />)}
        </Box>

        <Box component="footer" sx={{ mt: { xs: 6, md: 9 }, pt: 3, borderTop: `1px solid ${T.line}`,
                                      display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2,
                                      fontFamily: SANS, fontSize: 14, color: T.muted }}>
          <span>Every student, teacher and score in these explainers is made up for illustration.</span>
          <Box sx={{ display: "flex", gap: 2.5 }}>
            <ExternalLink href={GITHUB}>GitHub</ExternalLink>
            <ExternalLink href={LINKEDIN}>LinkedIn</ExternalLink>
          </Box>
        </Box>
      </Box>
    </PageShell>
  )
}
