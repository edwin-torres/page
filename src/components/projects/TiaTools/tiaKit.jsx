// Shared look for the TIA tools pages: colors, fonts, page shell and the
// "back to TIA tools" link. Used by the landing page (/tia-tools), the
// sample score cards, and the two what-if tools.
import { useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
import { Box, ThemeProvider, createTheme } from "@mui/material"

// Bricolage Grotesque for headlines, IBM Plex Sans for everything else
// (its tabular numbers keep scores from shifting width). Both fall back
// to system fonts if they cannot load.
export const FONT_HREF = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
export const SANS = '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif'
export const DISPLAY = '"Bricolage Grotesque", "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif'

export const T = {
  page: "#EDF1F5", surface: "#FFFFFF", ink: "#142233", muted: "#5A6B7D", line: "#DCE3EB", navy: "#13294A",
  // score parts (same as the teacher what-if)
  a: "#2F55D4", aDark: "#7F9CFF", b: "#7446C9", bDark: "#BC9DF6", c: "#C4600C", cDark: "#F6A64A",
  // one accent per tool
  amber: "#B65A0B", indigo: "#4C4FC4", indigoSoft: "#ECEDFB", green: "#157A4A", greenSoft: "#E6F3EC",
  ok: "#17804D", okSoft: "#E4F4EB", bad: "#C2362B", badSoft: "#FCE9E7", gap: "#9A4A06", earned: "#FFF3A3",
}

export const NUM = { fontVariantNumeric: "tabular-nums" }

export const theme = createTheme({
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1100, xl: 1536 } },
  palette: { primary: { main: T.navy }, text: { primary: T.ink, secondary: T.muted } },
  typography: { fontFamily: SANS, button: { textTransform: "none", fontWeight: 600 } },
  shape: { borderRadius: 10 },
})

// Load the two web fonts once.
export function useWebFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = FONT_HREF
    document.head.appendChild(link)
  }, [])
}

// The page background and theme. m: -2 cancels the site's outer
// Container padding (App.jsx); border-box makes padding count inside
// every box's width and height (the site has no CSS reset).
export function PageShell({ children, sx }) {
  useWebFonts()
  return (
    <ThemeProvider theme={theme}>
      <Box className="tia-shell" sx={{ m: -2, minHeight: "100vh", bgcolor: T.page, color: T.ink, fontFamily: SANS,
                 px: { xs: 2, md: 4 }, pt: { xs: 3, md: 4 }, pb: 8,
                 "&, & *, & *::before, & *::after": { boxSizing: "border-box" }, ...sx }}>
        {children}
      </Box>
    </ThemeProvider>
  )
}

// The small link back to the TIA tools page, shown at the top of each tool.
export function BackToTools({ color = T.muted, hover = T.ink }) {
  return (
    <Box component={RouterLink} to="/tia-tools" sx={{
      display: "inline-flex", alignItems: "center", gap: 0.75, mb: 2,
      fontFamily: SANS, fontSize: 14, fontWeight: 600, color, textDecoration: "none",
      "&:hover": { color: hover, textDecoration: "underline", textUnderlineOffset: "3px" },
      "&:focus-visible": { outline: `2px solid ${hover}`, outlineOffset: 3, borderRadius: "4px" },
    }}>
      <Box component="svg" viewBox="0 0 16 16" aria-hidden sx={{ width: 14, height: 14 }}>
        <path d="M10 3 L5 8 L10 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Box>
      Edwin Torres · TIA tools
    </Box>
  )
}
