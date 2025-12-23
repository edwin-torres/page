// src/components/projects/TeacherLookup.jsx
import React, { useMemo, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  Divider,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const designationChip = (designation, themeColors) => {
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
};

// Pull dimension keys automatically (Dimension 1.1 ... Dimension 4.4)
const isDimTextKey = (k) => k.startsWith("Dimension ") && !k.endsWith("_num");

function InfoCard({ title, children, themeColors }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "rgba(0,0,0,0.02)",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 800, color: themeColors.text, mb: 1 }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

export default function TeacherLookup({
  data = [], // pass includedFiltered here so it respects campus filter
  campusLabel = "ALL",
  themeColors = {
    bg: "#f4f6f8",
    paper: "#ffffff",
    primary: "#1b5e20",
    text: "#2c3e50",
    tabUnselected: "#546e7a",
  },
}) {
  const [teacherId, setTeacherId] = useState("");
  const normalizedId = useMemo(() => String(teacherId ?? "").trim(), [teacherId]);

  const teacherRow = useMemo(() => {
    if (!normalizedId) return null;

    // Match exactly as strings (your IDs are like "001")
    const found = data.find((d) => String(d.Teacher) === normalizedId);

    // Optional: allow users to type 1 and still match "001"
    if (found) return found;

    const padded = normalizedId.padStart(3, "0");
    return data.find((d) => String(d.Teacher) === padded) ?? null;
  }, [data, normalizedId]);

  const campusTitle = campusLabel === "ALL" ? "All Campuses" : `Campus ${campusLabel}`;

  // Build list of dimension text keys from the dataset shape
  const dimKeys = useMemo(() => {
    const sample = data?.[0];
    if (!sample) return [];
    return Object.keys(sample)
      .filter(isDimTextKey)
      .sort((a, b) => {
        // sort by numeric part like 1.1, 1.2, ...
        const na = Number(a.replace("Dimension ", ""));
        const nb = Number(b.replace("Dimension ", ""));
        return na - nb;
      });
  }, [data]);

  const formatNum = (v, digits = 2) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(digits) : "—";
  };

  const safe = (v) => (v === null || v === undefined || String(v).trim() === "" ? "—" : String(v));

  // Prefer *_r1 if present (your later columns), else fallback to avg_domain_*
  const avg14 = teacherRow?.avg14_r1 ?? teacherRow?.avg_domain_1_4;
  const avg23 = teacherRow?.avg23_r1 ?? teacherRow?.avg_domain_2_3;

  const growthPoints = 30.3; // assumed fixed growth points for this dashboard

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
        sx={{
          bgcolor: "transparent",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.text }}>
              Teacher lookup
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.tabUnselected }}>
              Search within <b>{campusTitle}</b> included teachers (complete ratings).
            </Typography>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ px: 1, pb: 2 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
              <TextField
                label="Teacher ID"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                size="small"
                placeholder='e.g. "001"'
                sx={{
                  minWidth: 220,
                  bgcolor: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.15)" },
                }}
              />

              {teacherRow ? (
                <Chip
                  label={`Found: Teacher ${teacherRow.Teacher} (Campus ${safe(teacherRow.Buildings)})`}
                  sx={{
                    fontWeight: 700,
                    bgcolor: "rgba(27, 94, 32, 0.12)",
                    color: themeColors.primary,
                  }}
                />
              ) : normalizedId ? (
                <Chip
                  label="Not found in current campus filter"
                  sx={{
                    fontWeight: 700,
                    bgcolor: "rgba(0,0,0,0.06)",
                    color: themeColors.tabUnselected,
                  }}
                />
              ) : null}
            </Box>

            {!teacherRow ? (
              <Typography variant="body2" sx={{ color: themeColors.tabUnselected }}>
                Enter a Teacher ID to view the full rating breakdown.
              </Typography>
            ) : (
              <>
                <Grid container spacing={2}>
                  {/* Summary card */}
                  <Grid item xs={12} md={4}>
                    <InfoCard title="Summary" themeColors={themeColors}>
                      <Typography variant="body2" sx={{ color: themeColors.text, mb: 1 }}>
                        <b>Teacher:</b> {safe(teacherRow.Teacher)}
                        <br />
                        <b>Campus:</b> {safe(teacherRow.Buildings)}
                      </Typography>

                      {/* ✅ Updated: standout designation */}
                      {(() => {
                        const designationRaw = teacherRow?.designation ?? "No Designation";
                        const designation = String(designationRaw || "No Designation").trim();
                        const dStyle = designationChip(designation, themeColors);

                        return (
                          <Box
                            sx={{
                              mt: 0.5,
                              p: 1,
                              borderRadius: 2,
                              bgcolor: dStyle.bg,
                              border: `1px solid ${dStyle.border}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 900, color: themeColors.text }}
                            >
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
                        );
                      })()}
                    </InfoCard>
                  </Grid>

                  {/* Domain averages + points */}
                  <Grid item xs={12} md={8}>
                    <InfoCard title="Domain averages + points" themeColors={themeColors}>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ color: themeColors.text }}>
                            <b>Avg Domain 1 &amp; 4:</b> {formatNum(avg14, 2)}
                            <br />
                            <b>Points (D1&amp;4):</b> {formatNum(teacherRow.points_d14, 1)}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ color: themeColors.text }}>
                            <b>Avg Domain 2 &amp; 3:</b> {formatNum(avg23, 2)}
                            <br />
                            <b>Points (D2&amp;3):</b> {formatNum(teacherRow.points_d23, 1)}
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />

                          <Typography variant="body2" sx={{ color: themeColors.text }}>
                            <b>Composite score:</b> {formatNum(teacherRow.composite_score, 1)}
                          </Typography>

                          {/* Show calculation */}
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mt: 0.5,
                              color: themeColors.tabUnselected,
                              lineHeight: 1.4,
                            }}
                          >
                            <b>Calculation:</b>{" "}
                            {formatNum(teacherRow.points_d14, 1)} (Domain 1&amp;4 points) +{" "}
                            {formatNum(teacherRow.points_d23, 1)} (Domain 2&amp;3 points) +{" "}
                            {formatNum(growthPoints, 1)} (Growth points) {" "}={" "}
                            <b>{formatNum(teacherRow.composite_score, 1)}</b>
                          </Typography>
                        </Grid>
                      </Grid>
                    </InfoCard>
                  </Grid>

                  {/* Dimension ratings */}
                  <Grid item xs={12}>
                    <InfoCard title="Dimension ratings" themeColors={themeColors}>
                      <Grid container spacing={1}>
                        {dimKeys.map((k) => (
                          <Grid key={k} item xs={12} sm={6} md={3}>
                            <Typography variant="body2" sx={{ color: themeColors.text }}>
                              <b>{k}:</b> {safe(teacherRow[k])}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </InfoCard>
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
