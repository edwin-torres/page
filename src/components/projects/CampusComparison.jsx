import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function mean(nums) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function median(nums) {
  if (!nums.length) return null;
  const a = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

function campusLabel(c) {
  return c === "ALL" ? "All Campuses" : `Campus ${c}`;
}

export default function CampusComparison({ dataAllIncluded, selectedCampus, themeColors }) {
  const [metric, setMetric] = useState("pct_recognized_plus");
  const [direction, setDirection] = useState("desc");
  const [topN, setTopN] = useState(30);
  const [search, setSearch] = useState("");

  // Build campus summaries from INCLUDED data only
  const campusSummary = useMemo(() => {
    const map = new Map();

    for (const t of dataAllIncluded) {
      const campus = String(t.Buildings ?? "Unknown");

      if (!map.has(campus)) {
        map.set(campus, {
          campus,
          included: 0,
          no_designation: 0,
          recognized: 0,
          exemplary: 0,
          master: 0,
          scores: [],
        });
      }

      const row = map.get(campus);
      row.included += 1;

      const des = t.designation || "No Designation";
      if (des === "Recognized") row.recognized += 1;
      else if (des === "Exemplary") row.exemplary += 1;
      else if (des === "Master") row.master += 1;
      else row.no_designation += 1;

      if (typeof t.composite_score === "number" && Number.isFinite(t.composite_score)) {
        row.scores.push(t.composite_score);
      }
    }

    const out = Array.from(map.values()).map((r) => {
      const inc = r.included || 0;

      const recognizedPlus = r.recognized + r.exemplary + r.master;
      const exemplaryPlus = r.exemplary + r.master;

      const avg = mean(r.scores);
      const med = median(r.scores);

      return {
        campus: r.campus,
        included: inc,

        // counts
        no_designation: r.no_designation,
        recognized: r.recognized,
        exemplary: r.exemplary,
        master: r.master,

        // percents (within included)
        pct_no_designation: inc ? (100 * r.no_designation) / inc : 0,
        pct_recognized: inc ? (100 * r.recognized) / inc : 0,
        pct_exemplary: inc ? (100 * r.exemplary) / inc : 0,
        pct_master: inc ? (100 * r.master) / inc : 0,

        pct_recognized_plus: inc ? (100 * recognizedPlus) / inc : 0,
        pct_exemplary_plus: inc ? (100 * exemplaryPlus) / inc : 0,

        avg_composite: avg,
        median_composite: med,
      };
    });

    // numeric-first campus sort for stable display
    out.sort((a, b) => {
      const na = Number(a.campus);
      const nb = Number(b.campus);
      const aIsNum = Number.isFinite(na);
      const bIsNum = Number.isFinite(nb);
      if (aIsNum && bIsNum) return na - nb;
      if (aIsNum) return -1;
      if (bIsNum) return 1;
      return String(a.campus).localeCompare(String(b.campus));
    });

    return out;
  }, [dataAllIncluded]);

  const metricDefs = useMemo(
    () => [
      {
        key: "pct_recognized_plus",
        label: "% Recognized+",
        fmt: (v) => `${v.toFixed(1)}%`,
        value: (r) => r.pct_recognized_plus ?? 0,
      },
      {
        key: "pct_exemplary_plus",
        label: "% Exemplary+",
        fmt: (v) => `${v.toFixed(1)}%`,
        value: (r) => r.pct_exemplary_plus ?? 0,
      },
      {
        key: "avg_composite",
        label: "Avg Composite",
        fmt: (v) => (v == null ? "—" : v.toFixed(1)),
        value: (r) => (r.avg_composite == null ? -Infinity : r.avg_composite),
      },
      {
        key: "median_composite",
        label: "Median Composite",
        fmt: (v) => (v == null ? "—" : v.toFixed(1)),
        value: (r) => (r.median_composite == null ? -Infinity : r.median_composite),
      },
      {
        key: "included",
        label: "Included Teachers",
        fmt: (v) => `${Math.round(v).toLocaleString()}`,
        value: (r) => r.included ?? 0,
      },
    ],
    []
  );

  const activeMetric = metricDefs.find((m) => m.key === metric) || metricDefs[0];

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    const base = q
      ? campusSummary.filter((r) => String(r.campus).toLowerCase().includes(q))
      : campusSummary;

    const sorted = [...base].sort((a, b) => {
      const av = activeMetric.value(a);
      const bv = activeMetric.value(b);
      return direction === "desc" ? bv - av : av - bv;
    });

    return sorted;
  }, [campusSummary, search, activeMetric, direction]);

  const topSlice = useMemo(() => filteredSorted.slice(0, topN), [filteredSorted, topN]);

  // for bar scaling
  const maxVal = useMemo(() => {
    if (!topSlice.length) return 1;
    const vals = topSlice.map((r) => activeMetric.value(r)).filter((v) => Number.isFinite(v));
    return Math.max(1, ...vals);
  }, [topSlice, activeMetric]);

  const highlightCampus = selectedCampus && selectedCampus !== "ALL" ? String(selectedCampus) : null;
  // Rank campuses by the active metric (uses current sort direction)
  const rankSorted = useMemo(() => {
    const arr = [...campusSummary];
    arr.sort((a, b) => {
      const av = activeMetric.value(a);
      const bv = activeMetric.value(b);
      return direction === "desc" ? bv - av : av - bv;
    });
    return arr;
  }, [campusSummary, activeMetric, direction]);

  const selectedCampusRank = useMemo(() => {
    if (!highlightCampus) return null;
    const idx = rankSorted.findIndex((r) => String(r.campus) === highlightCampus);
    return idx >= 0 ? idx + 1 : null;
  }, [highlightCampus, rankSorted]);

  const totalCampuses = campusSummary.length;

  // District benchmark computed from INCLUDED teachers only
  const districtBenchmark = useMemo(() => {
    // totals from campusSummary counts (safe + fast)
    const totals = campusSummary.reduce(
      (acc, r) => {
        acc.included += r.included ?? 0;
        acc.recognized += r.recognized ?? 0;
        acc.exemplary += r.exemplary ?? 0;
        acc.master += r.master ?? 0;
        return acc;
      },
      { included: 0, recognized: 0, exemplary: 0, master: 0 }
    );

    const denom = totals.included || 0;

    if (metric === "pct_recognized_plus") {
      const num = totals.recognized + totals.exemplary + totals.master;
      return denom ? (100 * num) / denom : 0;
    }

    if (metric === "pct_exemplary_plus") {
      const num = totals.exemplary + totals.master;
      return denom ? (100 * num) / denom : 0;
    }

    // composite metrics: compute from teacher-level included data
    const scores = (dataAllIncluded || [])
      .map((t) => t?.composite_score)
      .filter((v) => typeof v === "number" && Number.isFinite(v));

    if (metric === "avg_composite") return mean(scores);
    if (metric === "median_composite") return median(scores);

    if (metric === "included") return totals.included;

    return null;
  }, [metric, campusSummary, dataAllIncluded]);

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
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
            <Typography variant="h5" sx={{ fontWeight: 900, color: themeColors.text }}>
              Campus Comparison
            </Typography>
            
            
             <Typography variant="body1" sx={{ mt: 0.5, color: themeColors.tabUnselected }}>
              • Recognized+ is the percentage of teachers with any designation (Recognized, Exemplary, or Master).{" "}
              <br></br> • Exemplary+ is the percentage of teachers with higher designations (Exemplary or Master).<br></br>
            </Typography> 
            
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ px: 1, pb: 2 }}>
                {/* Rank + District benchmark */}
    <Grid container spacing={2} sx={{ mt: 0.5, mb: 1.5 }}>
      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(0,0,0,0.02)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Typography variant="body2" sx={{ color: themeColors.tabUnselected, fontWeight: 800 }}>
             {highlightCampus ? `${campusLabel(highlightCampus)}` : "Select Campus (top of page) to see "} Rank ({direction === "desc" ? "High → Low" : "Low → High"})
          </Typography>

          <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900, color: themeColors.text }}>
            {highlightCampus && selectedCampusRank
              ? `${selectedCampusRank} of ${totalCampuses}`
              : "—"}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(0,0,0,0.02)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Typography variant="body2" sx={{ color: themeColors.tabUnselected, fontWeight: 800 }}>
            District benchmark (included teachers only)
          </Typography>

          <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900, color: themeColors.text }}>
            {districtBenchmark == null
              ? "—"
              : metric.startsWith("pct_")
              ? `${districtBenchmark.toFixed(1)}%`
              : metric === "included"
              ? Math.round(districtBenchmark).toLocaleString()
              : districtBenchmark.toFixed(1)}
          </Typography>
        </Paper>
      </Grid>
    </Grid>

            {/* Controls */}
            <Grid container spacing={2} sx={{ mt: 1.5, alignItems: "center" }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Metric</InputLabel>
                  <Select value={metric} label="Metric" onChange={(e) => setMetric(e.target.value)}>
                    {metricDefs.map((m) => (
                      <MenuItem key={m.key} value={m.key}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort</InputLabel>
                  <Select value={direction} label="Sort" onChange={(e) => setDirection(e.target.value)}>
                    <MenuItem value="desc">High → Low</MenuItem>
                    <MenuItem value="asc">Low → High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Top N</InputLabel>
                  <Select value={topN} label="Top N" onChange={(e) => setTopN(Number(e.target.value))}>
                    {[10, 15, 20, 25, 30].map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

               
            </Grid>

            {/* Visual + Table */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Top N bars */}
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "rgba(0,0,0,0.02)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    height: "95%",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                    Top {topN} by {activeMetric.label}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {topSlice.map((r) => {
                      const raw = activeMetric.value(r);
                      const safe = Number.isFinite(raw) ? raw : 0;
                      const w = Math.max(0, Math.min(100, (safe / maxVal) * 100));
                      const isHighlight = highlightCampus && String(r.campus) === highlightCampus;

                      return (
                        <Box
                          key={r.campus}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "110px 1fr 70px",
                            gap: 1,
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isHighlight ? 1000 : 700,
                              color: isHighlight ? 'black' : themeColors.text,
                              bgcolor: isHighlight ? themeColors.highlighted : '',
                            }}
                          >
                            {campusLabel(r.campus)}
                          </Typography>

                          <Box
                            sx={{
                              height: 10,
                              borderRadius: 999,
                              bgcolor: "rgba(0,0,0,0.08)",
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${w}%`,
                                height: "100%",
                                bgcolor: themeColors.primary,
                                
                              }}
                            />
                          </Box>

                          <Typography variant="body2" sx={{ textAlign: "right", fontWeight: 800 }}>
                            {activeMetric.key.includes("pct")
                              ? activeMetric.fmt(r[activeMetric.key])
                              : activeMetric.key === "included"
                              ? activeMetric.fmt(r.included)
                              : activeMetric.fmt(r[activeMetric.key])}
                          </Typography>
                        </Box>
                      );
                    })}

                    {!topSlice.length && (
                      <Typography variant="body2" sx={{ color: themeColors.tabUnselected }}>
                        No campuses match the current search/filter.
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Full campus table */}
              <Grid item xs={12} md={7}>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,0.06)",
                    maxHeight: 420,
                    bgcolor: "rgba(0,0,0,0.02)",
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Campus</TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          # of Teachers
                        </TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          % Recognized+
                        </TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          % Exemplary+
                        </TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          Avg Composite
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filteredSorted.map((r) => {
                        const isHighlight = highlightCampus && String(r.campus) === highlightCampus;

                        return (
                          <TableRow
                            key={r.campus}
                            hover
                            sx={{
                                
                                bgcolor: isHighlight ? themeColors.highlighted: "transparent",
                               
                            }}
                          >
                            <TableCell sx={{ fontWeight: isHighlight ? 900 : 700 }}>
                              {campusLabel(r.campus)}
                            </TableCell>
                            <TableCell align="right">{r.included.toLocaleString()}</TableCell>
                            <TableCell align="right">{r.pct_recognized_plus.toFixed(1)}%</TableCell>
                            <TableCell align="right">{r.pct_exemplary_plus.toFixed(1)}%</TableCell>
                            <TableCell align="right">
                              {r.avg_composite == null ? "—" : r.avg_composite.toFixed(1)}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {!filteredSorted.length && (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ color: themeColors.tabUnselected }}>
                            No campuses match the current search/filter.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>

            <br></br>  
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
