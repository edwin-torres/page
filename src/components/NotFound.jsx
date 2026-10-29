// Page not found: shown for any address that matches no route
// (the path="*" route in App.jsx). It only says the page does not exist,
// with no links anywhere else.
import { useEffect, useLayoutEffect } from "react"
import { useLocation } from "react-router-dom"
import { Box, ThemeProvider, Typography } from "@mui/material"
import { T, DISPLAY, SANS, theme, useWebFonts } from "./projects/TiaTools/tiaKit.jsx"

// Each piece fades up a little later than the one before it.
const fadeUp = (delay) => ({
  animation: `nf-up .7s cubic-bezier(.2,.7,.2,1) ${delay}s both`,
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
})

export default function NotFound({ onShow, address: wrongAddress }) {
  useWebFonts()
  const location = useLocation()
  // App.jsx passes the full address when the folder part is wrong;
  // otherwise the wrong part is the route after the #.
  const address = wrongAddress ?? `#${location.pathname}${location.search}`

  // Tell App.jsx to hide the navbar while this page is showing. A layout
  // effect runs before the browser paints, so the navbar never flashes.
  useLayoutEffect(() => {
    onShow?.(true)
    return () => onShow?.(false)
  }, [onShow])

  // The browser tab says "Page not found" while this page is open.
  useEffect(() => {
    const before = document.title
    document.title = "Page not found"
    return () => { document.title = before }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <Box component="main" sx={{
        // m: -2 cancels the site's outer Container padding (App.jsx)
        m: -2, minHeight: "100vh", position: "relative", overflow: "hidden",
        display: "grid", placeItems: "center", px: 3, py: 8,
        bgcolor: T.page, color: T.ink, fontFamily: SANS,
        "&, & *, & *::before, & *::after": { boxSizing: "border-box" },
        "@keyframes nf-up": { from: { opacity: 0, transform: "translateY(14px)" }, to: { opacity: 1, transform: "none" } },
      }}>
        {/* Background: a soft glow and a dot grid that fades out toward the edges */}
        <Box aria-hidden sx={{
          position: "absolute", width: 720, height: 720, borderRadius: "50%",
          left: "50%", top: "50%", transform: "translate(-50%, -58%)",
          background: `radial-gradient(circle, ${T.indigoSoft} 0%, rgba(236, 237, 251, 0) 65%)`,
        }} />
        <Box aria-hidden sx={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(#C9D2DD 1.2px, transparent 1.2px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 60% 55% at 50% 45%, #000 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 45%, #000 0%, transparent 100%)",
        }} />

        <Box sx={{ position: "relative", textAlign: "center", maxWidth: 640, width: "100%" }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, ...fadeUp(0),
                     fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.indigo,
                     bgcolor: "rgba(255, 255, 255, .7)", border: `1px solid ${T.line}`, borderRadius: "999px", px: 1.75, py: 0.6 }}>
            <Box component="span" aria-hidden sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: T.indigo }} />
            Error 404
          </Box>

          {/* The big number, filled with a navy to indigo gradient */}
          <Typography aria-hidden sx={{
            ...fadeUp(0.08),
            fontFamily: DISPLAY, fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.05em",
            fontSize: "clamp(112px, 24vw, 232px)", mt: 2.5,
            background: `linear-gradient(135deg, ${T.navy} 0%, ${T.indigo} 58%, #8C8FF2 100%)`,
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            fontVariantNumeric: "lining-nums",
          }}>
            404
          </Typography>

          <Typography component="h1" sx={{ ...fadeUp(0.16), fontFamily: DISPLAY, fontWeight: 700, letterSpacing: "-0.02em",
                                            lineHeight: 1.1, fontSize: { xs: 30, md: 42 }, mt: 3 }}>
            This page doesn&apos;t exist
          </Typography>
          <Typography sx={{ ...fadeUp(0.22), fontSize: { xs: 16, md: 18 }, color: T.muted, lineHeight: 1.55, mt: 1.5 }}>
            Check the address for a typo.
          </Typography>

          {/* The address that was not found, so a typo is easy to spot */}
          <Box sx={{ ...fadeUp(0.28), mt: 3.5, display: "inline-block", maxWidth: "100%",
                     bgcolor: T.surface, border: `1px solid ${T.line}`, borderRadius: "12px", px: 2, py: 1.1,
                     boxShadow: "0 10px 30px -18px rgba(19, 41, 74, .35)" }}>
            <Typography component="code" sx={{ fontFamily: '"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace',
                                               fontSize: 14, color: T.ink, wordBreak: "break-all" }}>
              {address}
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
