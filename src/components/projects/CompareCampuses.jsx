// src/components/CompareCampuses.jsx
import React, { useMemo, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

// your data
import { data23, data24 } from "./Data/tiaData";

/** Metric options to compare */
const METRICS = [
  { key: "ALL_STUDENT_POINTS", label: "All Student Points", fmt: "num" },
  { key: "ALL_STUDENT_COUNT", label: "All Student Count", fmt: "num" },
  { key: "ALL_GROWTH_RATE", label: "All Growth Rate", fmt: "pct" },
  { key: "ECODIS_GROWTH_RATE", label: "Econ Disadvantaged Growth", fmt: "pct" },
  { key: "HISPANIC_GROWTH_RATE", label: "Hispanic Growth", fmt: "pct" },
  { key: "WHITE_GROWTH_RATE", label: "White Growth", fmt: "pct" },
  { key: "AFR_AMER_GROWTH_RATE", label: "African American Growth", fmt: "pct" },
  { key: "FEMALE_GROWTH_RATE", label: "Female Growth", fmt: "pct" },
  { key: "MALE_GROWTH_RATE", label: "Male Growth", fmt: "pct" },
];

const fmtNumber = (v) =>
  v == null || Number.isNaN(v) ? "—" : Intl.NumberFormat().format(v);

const fmtPercent = (v) =>
  v == null || Number.isNaN(v)
    ? "—"
    : Intl.NumberFormat(undefined, {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(v);

/** Build a normalized "catalog" of campuses for each year */
function useYearMaps() {
  const map23 = useMemo(() => new Map(data23.map((r) => [r.id, r])), []);
  const map24 = useMemo(() => new Map(data24.map((r) => [r.id, r])), []);
  const campuses = useMemo(() => {
    const byId = new Map();
    [...data23, ...data24].forEach((r) => {
      if (!byId.has(r.id)) {
        byId.set(r.id, {
          id: r.id,
          CAMPUS: r.CAMPUS,
          DISTRICT: r.DISTRICT,
        });
      }
    });
    return [...byId.values()].sort((a, b) => a.CAMPUS.localeCompare(b.CAMPUS));
  }, []);
  return { map23, map24, campuses };
}

/** Main component */
export default function CompareCampuses() {
  const theme = useTheme();
  const { map23, map24, campuses } = useYearMaps();

  const [year, setYear] = useState(2024);
  const [metricKey, setMetricKey] = useState("ALL_GROWTH_RATE");

  // --- Default select THREE campuses ---
  const [selectedIds, setSelectedIds] = useState(() => {
    const preferredNames = [
      "SOUTHWEST H S",
      "SOUTHWEST LEGACY H S",
      "CAST STEM H S",
    ];
    const preferredIds = preferredNames
      .map((name) => campuses.find((c) => c.CAMPUS === name)?.id)
      .filter(Boolean);

    if (preferredIds.length >= 3) return preferredIds.slice(0, 3);
    // fallback to first 3 in the list (unique, truthy)
    const fallback = campuses.slice(0, 3).map((c) => c.id);
    const merged = [...new Set([...preferredIds, ...fallback])].slice(0, 3);
    return merged;
  });

  const isPct = METRICS.find((m) => m.key === metricKey)?.fmt === "pct";
  const format = isPct ? fmtPercent : fmtNumber;
  const yearMap = year === 2023 ? map23 : map24;

  // Build data for Nivo: one bar per campus
  const chartData = useMemo(() => {
    return selectedIds
      .map((id) => {
        const row = yearMap.get(id);
        const campus = campuses.find((c) => c.id === id);
        const label = campus ? campus.CAMPUS : String(id);
        return { campus: label, value: row?.[metricKey] ?? null };
      })
      .filter((d) => d.value != null);
  }, [selectedIds, yearMap, metricKey, campuses]);

  // Colors & theme for dark/light
  const textColor = theme.palette.text.primary;
  const gridColor =
    theme.palette.mode === "dark"
      ? alpha("#ffffff", 0.22)
      : alpha("#000000", 0.12);
  const barColors =
    theme.palette.mode === "dark"
      ? ["#67D5B5", "#4CC9F0", "#B8F2E6"]
      : ["#59A14F", "#4E79A7", "#F28E2B"];

  // Limit selection to 3 campuses
  const handleCampusChange = (e) => {
    const val = e.target.value;
    if (val.length <= 3) setSelectedIds(val);
  };

  // White-on-black select styling
  const whiteSelectSx = {
    color: "#fff",
    "& .MuiSvgIcon-root": { color: "#fff" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.35)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.7)" },
  };
  const whiteLabelSx = {
    color: "#fff",
    "&.Mui-focused": { color: "#fff" },
    "&.MuiInputLabel-shrink": { color: "#fff" },
  };
  const whiteMenuProps = {
    PaperProps: {
      sx: {
        bgcolor: "#121212",
        color: "#fff",
        maxHeight: 360,
        "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,255,255,0.12)" },
        "& .MuiMenuItem-root.Mui-selected:hover": { bgcolor: "rgba(255,255,255,0.18)" },
      },
    },
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ md: "center" }}
        sx={{ mb: 2 }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700} color="#fff">
            Compare Campuses (Side-by-Side Bars)
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Choose a year, metric, then select up to three campuses.
          </Typography>
        </Box>

        {/* Year selector */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={whiteLabelSx}>Year</InputLabel>
          <Select
            label="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={whiteSelectSx}
            MenuProps={whiteMenuProps}
          >
            <MenuItem value={2023}>2023</MenuItem>
            <MenuItem value={2024}>2024</MenuItem>
          </Select>
        </FormControl>

        {/* Metric selector */}
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel sx={whiteLabelSx}>Metric</InputLabel>
          <Select
            label="Metric"
            value={metricKey}
            onChange={(e) => setMetricKey(e.target.value)}
            sx={whiteSelectSx}
            MenuProps={whiteMenuProps}
          >
            {METRICS.map((m) => (
              <MenuItem key={m.key} value={m.key}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Campus multi-select (max 3) */}
        <FormControl size="small" sx={{ minWidth: 360 }}>
          <InputLabel sx={whiteLabelSx}>Campuses (max 3)</InputLabel>
          <Select
            multiple
            label="Campuses (max 3)"
            value={selectedIds}
            onChange={handleCampusChange}
            renderValue={(ids) => (
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {ids.map((id) => {
                  const c = campuses.find((x) => x.id === id);
                  return (
                    <Chip
                      key={id}
                      size="small"
                      label={`${c?.CAMPUS ?? id}`}
                      sx={{ color: "#000", bgcolor: "#fff", "& .MuiChip-label": { px: 0.5 } }}
                    />
                  );
                })}
              </Stack>
            )}
            sx={whiteSelectSx}
            MenuProps={whiteMenuProps}
          >
            {campuses.map((c) => {
              const selectedCount = selectedIds.length;
              const isSelected = selectedIds.includes(c.id);
              const disableThis = !isSelected && selectedCount >= 3;
              return (
                <MenuItem key={c.id} value={c.id} disabled={disableThis}>
                  {c.CAMPUS} ({c.id})
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ height: 440, bgcolor: "background.paper" }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: "#fff" }}>
                {METRICS.find((m) => m.key === metricKey)?.label} — {year}
              </Typography>
              <Box sx={{ height: 360 }}>
                {chartData.length ? (
                  <ResponsiveBar
                    data={chartData}
                    keys={["value"]}
                    indexBy="campus"
                    margin={{ top: 10, right: 20, bottom: 80, left: 80 }}
                    padding={0.35}
                    colors={barColors}
                    enableGridY
                    // Force 0–100% axis for percent metrics
                    valueScale={{ type: "linear", min: 0, max: isPct ? 1 : "auto" }}
                    axisBottom={{ tickSize: 0, tickPadding: 6, tickRotation: 0  }}
                    axisLeft={{
                      tickValues: isPct ? [0, 0.2, 0.4, 0.6, 0.8, 1] : undefined,
                      format: (d) => (isPct ? fmtPercent(d) : fmtNumber(d)),
                    }}
                    labelSkipHeight={14}
                    label={(d) => format(d.value)}
                    labelTextColor={textColor}
                    valueFormat={(v) => format(v)}
                    theme={{
                      textColor,
                      labels: { text: { fontSize: 15, fill: textColor } },
                      axis: {
                        domain: { line: { stroke: gridColor } },
                        ticks: {
                          text: { fontSize: 15, fill: textColor },
                          line: { stroke: gridColor },
                        },
                      },
                      grid: { line: { stroke: gridColor, strokeDasharray: "4 4" } },
                      tooltip: {
                        container: {
                          fontSize: 15,
                          background: theme.palette.background.paper,
                          color: theme.palette.text.primary,
                          border: `1px solid ${gridColor}`,
                        },
                      },
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: "100%",
                      display: "grid",
                      placeItems: "center",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Typography variant="body2">
                      Select up to three campuses to compare.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
