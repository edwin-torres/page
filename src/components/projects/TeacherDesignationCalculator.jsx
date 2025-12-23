// src/components/projects/TeacherDesignationCalculator.jsx
import React, { useMemo, useState } from "react";
import {
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/**
 * Rating -> numeric mapping (matches your Method/Assumptions)
 */
const RATING_OPTIONS = [
  { label: "Distinguished", value: 5 },
  { label: "Accomplished", value: 4 },
  { label: "Proficient", value: 3 },
  { label: "Developing", value: 2 },
  { label: "Improvement Needed", value: 1 },
];

// Domain groupings (8 items each, per your requirement)
const D14_KEYS = [
  "1.1",
  "1.2",
  "1.3",
  "1.4",
  "4.1",
  "4.2",
  "4.3",
  "4.4",
];

const D23_KEYS = [
  "2.1",
  "2.2",
  "2.3",
  "2.4",
  "2.5",
  "3.1",
  "3.2",
  "3.3",
];

// Points tables exactly from the image
const D14_POINTS_BY_TENTH = {
  3.7: 7.4,
  3.8: 7.6,
  3.9: 7.8,
  4.0: 8.0,
  4.1: 8.2,
  4.2: 8.4,
  4.3: 8.6,
  4.4: 8.8,
  4.5: 9.0,
  4.6: 9.2,
  4.7: 9.4,
  4.8: 9.6,
  4.9: 9.8,
  5.0: 10.0,
};

const D23_POINTS_BY_TENTH = {
  3.7: 25.9,
  3.8: 26.6,
  3.9: 27.3,
  4.0: 28.0,
  4.1: 28.7,
  4.2: 29.4,
  4.3: 30.1,
  4.4: 30.8,
  4.5: 31.5,
  4.6: 32.2,
  4.7: 32.9,
  4.8: 33.6,
  4.9: 34.3,
  5.0: 35.0,
};

function roundToTenth(n) {
  return Math.round(n * 10) / 10;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Apply threshold floor:
 * - if avg < 3.7 => 0 points
 * - else round avg to 1 decimal and use table lookup
 */
function pointsFromTable(avgRaw, table, floor = 3.7) {
  if (avgRaw == null) return null;
  if (avgRaw < floor) return 0;

  const avgRounded = roundToTenth(avgRaw);
  const key = clamp(avgRounded, 3.7, 5.0).toFixed(1);

  // If somehow not in table (should be), fallback safely
  const pts = table[key] ?? table[Number(key)] ?? null;
  return pts == null ? null : pts;
}

function designationFromComposite(composite) {
  if (composite == null) return "—";

  // From your table:
  // No Designation: < 63.3
  // Recognized: 63.3 - 68.0
  // Exemplary: 68.1 - 78.9
  // Master: 79.0+
  if (composite >= 79.0) return "Master";
  if (composite >= 68.1) return "Exemplary";
  if (composite >= 63.3) return "Recognized";
  return "No Designation";
}

function designationChip(designation, themeColors) {
  const d = String(designation || "No Designation").trim();

  const map = {
    "No Designation": {
      bg: "rgba(233, 197, 166, 0.35)",
      fg: themeColors.text,
      border: "rgba(233,197,166,0.9)",
    },
    Recognized: {
      bg: "#eb8672ff",
      fg: "#a53a2a",
      border: "rgba(244,123,99,0.8)",
    },
    Exemplary: {
      bg: "#f2df5a",
      fg: "#6b5a00",
      border: "rgba(242,223,90,0.9)",
    },
    Master: {
      bg: "rgba(227, 163, 55, 0.22)",
      fg: "#6a3f00",
      border: "rgba(227,163,55,0.9)",
    },
  };

  return map[d] ?? map["No Designation"];
}

function meanFromRatings(ratingsObj, keys) {
  // user requested: divide by 8 for both D1&4 and D2&3
  const nums = keys.map((k) => Number(ratingsObj[k])).filter((v) => Number.isFinite(v));
  if (nums.length !== keys.length) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return sum / 8;
}

function DimSelect({ dimKey, label, value, onChange }) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(dimKey, Number(e.target.value))}
      >
        {RATING_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function TeacherDesignationCalculator({
  themeColors = {
    bg: "#f4f6f8",
    paper: "#ffffff",
    primary: "#1b5e20",
    text: "#2c3e50",
    tabUnselected: "#546e7a",
  },
  growthPoints = 30.3, // fixed default per prompt
  floor = 3.7,
}) {
  // Default everything to "Proficient" to start (3)
  const [ratings, setRatings] = useState(() => {
    const r = {};
    [...D14_KEYS, ...D23_KEYS].forEach((k) => (r[k] = 3));
    return r;
  });

  const setRating = (k, v) => setRatings((prev) => ({ ...prev, [k]: v }));

  const avg14 = useMemo(() => meanFromRatings(ratings, D14_KEYS), [ratings]);
  const avg23 = useMemo(() => meanFromRatings(ratings, D23_KEYS), [ratings]);

  const points14 = useMemo(
    () => pointsFromTable(avg14, D14_POINTS_BY_TENTH, floor),
    [avg14, floor]
  );
  const points23 = useMemo(
    () => pointsFromTable(avg23, D23_POINTS_BY_TENTH, floor),
    [avg23, floor]
  );

  const composite = useMemo(() => {
    if (points14 == null || points23 == null) return null;
    return points14 + points23 + growthPoints;
  }, [points14, points23, growthPoints]);

  const designation = useMemo(() => designationFromComposite(composite), [composite]);
  const dStyle = useMemo(
    () => designationChip(designation, themeColors),
    [designation, themeColors]
  );

  const fmt = (n, d = 2) => (n == null ? "—" : Number(n).toFixed(d));

  // Helpful warning (your earlier note) — Master can’t happen with 30.3 fixed growth
  const maxCompositePossible = 10.0 + 35.0 + growthPoints;
  const masterPossible = maxCompositePossible >= 79.0;

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: 0,
        bgcolor: themeColors.paper,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <Accordion
        disableGutters
        elevation={0}
        sx={{ bgcolor: "transparent", "&:before": { display: "none" } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.text }}>
              TIA designation calculator (simulator)
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.tabUnselected }}>
              Select T-TESS ratings → averages → points (table) → composite → designation (not saved).
            </Typography>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ px: 1, pb: 2 }}>
            {/* D1&4 */}
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: themeColors.text }}>
              Domain 1 & 4 ratings (8 dimensions)
            </Typography>
            <Typography variant="caption" sx={{ color: themeColors.tabUnselected }}>
              Average = (sum of numeric ratings) ÷ 8
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              {D14_KEYS.map((k) => (
                <Grid key={k} item xs={12} sm={6} md={3}>
                  <DimSelect
                    dimKey={k}
                    label={`Dimension ${k}`}
                    value={ratings[k]}
                    onChange={setRating}
                  />
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* D2&3 */}
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: themeColors.text }}>
              Domain 2 & 3 ratings (8 dimensions)
            </Typography>
            <Typography variant="caption" sx={{ color: themeColors.tabUnselected }}>
              Average = (sum of numeric ratings) ÷ 8
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              {D23_KEYS.map((k) => (
                <Grid key={k} item xs={12} sm={6} md={3}>
                  <DimSelect
                    dimKey={k}
                    label={`Dimension ${k}`}
                    value={ratings[k]}
                    onChange={setRating}
                  />
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Output */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "rgba(0,0,0,0.02)",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                    Averages + points (threshold table)
                  </Typography>

                  <Typography variant="body2" sx={{ color: themeColors.text }}>
                    <b>Avg Domain 1 & 4:</b> {fmt(avg14, 3)}{" "}
                    <span style={{ color: themeColors.tabUnselected }}>
                      (rounded to {avg14 == null ? "—" : roundToTenth(avg14).toFixed(1)} for table)
                    </span>
                    <br />
                    <b>Points (D1&4):</b> {points14 == null ? "—" : points14.toFixed(1)}{" "}
                    <span style={{ color: themeColors.tabUnselected }}>
                      {avg14 != null && avg14 < floor ? `(avg < ${floor} → 0)` : ""}
                    </span>
                    <br />
                    <br />
                    <b>Avg Domain 2 & 3:</b> {fmt(avg23, 3)}{" "}
                    <span style={{ color: themeColors.tabUnselected }}>
                      (rounded to {avg23 == null ? "—" : roundToTenth(avg23).toFixed(1)} for table)
                    </span>
                    <br />
                    <b>Points (D2&3):</b> {points23 == null ? "—" : points23.toFixed(1)}{" "}
                    <span style={{ color: themeColors.tabUnselected }}>
                      {avg23 != null && avg23 < floor ? `(avg < ${floor} → 0)` : ""}
                    </span>
                    <br />
                    <br />
                    <b>Growth points (fixed):</b> {growthPoints.toFixed(1)}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 1, color: themeColors.tabUnselected, lineHeight: 1.4 }}
                  >
                    Composite = {points14 == null ? "—" : points14.toFixed(1)} +{" "}
                    {points23 == null ? "—" : points23.toFixed(1)} + {growthPoints.toFixed(1)} ={" "}
                    <b>{composite == null ? "—" : composite.toFixed(1)}</b>
                  </Typography>

                  {!masterPossible && (
                    <Typography variant="caption" sx={{ display: "block", mt: 1, color: themeColors.tabUnselected }}>
                      Note: With caps 10 (D1&4) + 35 (D2&3) and fixed growth {growthPoints.toFixed(1)},
                      max composite is {maxCompositePossible.toFixed(1)}; Master (≥ 79.0) cannot occur under this assumption.
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "rgba(0,0,0,0.02)",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                    Designation result (cut table)
                  </Typography>

                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: dStyle.bg,
                      border: `1px solid ${dStyle.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 900, color: themeColors.text }}>
                      Designation
                    </Typography>

                    <Chip
                      label={designation}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        bgcolor: "rgba(255,255,255,0.75)",
                        color: dStyle.fg,
                        border: `1px solid ${dStyle.border}`,
                        height: 28,
                        "& .MuiChip-label": { px: 1.25 },
                      }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ mt: 1.5, color: themeColors.text }}>
                    <b>Composite:</b> {composite == null ? "—" : composite.toFixed(1)}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="body2" sx={{ color: themeColors.text }}>
                    <b>Cut scores:</b>
                    <br />
                    No Designation: &lt; 63.3
                    <br />
                    Recognized: 63.3 – 68.0
                    <br />
                    Exemplary: 68.1 – 78.9
                    <br />
                    Master: 79.0+
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
