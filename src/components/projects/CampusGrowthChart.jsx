// src/components/TIABarDashboard.jsx
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
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

// your data exports
import { data23, data24 } from "./Data/tiaData";

/** -----------------------------------------------
 * Pick the metrics you want to show as bar pairs
 * ----------------------------------------------- */
const METRICS = [
  { key: "ALL_GROWTH_RATE", label: "All Students Growth Rate", fmt: "pct" },
  { key: "ECODIS_GROWTH_RATE", label: "Economically Disadvantaged Growth", fmt: "pct" },
  { key: "HISPANIC_GROWTH_RATE", label: "Hispanic Growth", fmt: "pct" },
  { key: "WHITE_GROWTH_RATE", label: "White Growth", fmt: "pct" },
  { key: "AFR_AMER_GROWTH_RATE", label: "African American Growth", fmt: "pct" },
  { key: "FEMALE_GROWTH_RATE", label: "Female Growth", fmt: "pct" },
  { key: "MALE_GROWTH_RATE", label: "Male Growth", fmt: "pct" },
];

/** -----------------------
 * Small format helpers
 * ----------------------- */
const fmtNumber = (v) =>
  v == null || Number.isNaN(v) ? "—" : Intl.NumberFormat().format(v);

const fmtPercent = (v) =>
  v == null || Number.isNaN(v)
    ? "—"
    : Intl.NumberFormat(undefined, {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(v);

/** ------------------------------------------------------
 * A single bar-pair chart (2023 vs 2024) for 1 metric
 * ------------------------------------------------------ */
function BarPair({ title, v23, v24, isPercent = false, height = 280 }) {
  const theme = useTheme();
  const textColor = theme.palette.text.primary;
  const gridColor =
    theme.palette.mode === "dark" ? alpha("#ffffff", 0.22) : alpha("#000000", 0.12);
  const tooltipBg = theme.palette.background.paper;
  const tooltipFg = theme.palette.text.primary;

  // Professional colors: Green vs Blue/Slate (Distinctive for years)
  const barColors =
    theme.palette.mode === "dark"
      ? ["#67D5B5", "#4CC9F0"] // high contrast on dark
      : ["#59A14F", "#4E79A7"]; // pleasant on light (Green 2023, Blue 2024)

  const data = useMemo(
    () => [
      { year: "2023", value: v23, missing: v23 == null },
      { year: "2024", value: v24, missing: v24 == null },
    ],
    [v23, v24]
  );

  const valueFmt = isPercent ? fmtPercent : fmtNumber;

  // 1. Check if both are missing (keep your existing "No Data" card)
  const bothMissing =
    (v23 == null || Number.isNaN(v23)) && (v24 == null || Number.isNaN(v24));

  if (bothMissing) {
    return (
      <Card sx={{ height, bgcolor: "background.paper", color: "text.primary" }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {title}
          </Typography>
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              height: height - 80,
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">No data for 2023 or 2024</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 2. Define a Custom Layer to draw text when only ONE bar is missing
  const MissingDataLayer = ({ xScale, innerHeight }) => {
    return data.map((d) => {
      if (d.missing) {
        return (
          <text
            key={`${d.year}-missing`}
            x={xScale(d.year) + xScale.bandwidth() / 2} // Center X
            y={innerHeight / 2} // Center Y
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fill: "black", // Light gray text
              fontSize: 14,
              fontWeight: 500,
              pointerEvents: "none", // Let clicks pass through
            }}
          >
            No Data
          </text>
        );
      }
      return null;
    });
  };

  return (
    <Card sx={{ height, bgcolor: "background.paper", color: "text.primary" }}>
      <CardContent
        sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 1 }}
      >
        <Typography variant="subtitle1" sx={{ fontSize: 20, fontWeight: 600 }}>
          {title}
        </Typography>
        <Box sx={{ flex: 1, minHeight: 160 }}>
          <ResponsiveBar
            data={data}
            keys={["value"]}
            indexBy="year"
            margin={{ top: 10, right: 24, bottom: 36, left: 56 }}
            padding={0.4}
            enableGridY
            colors={barColors}
            
            // 3. Add the custom layer here so it draws ON TOP of the grid
            layers={['grid', 'axes', 'bars', 'markers', 'legends', MissingDataLayer]}

            // Force 0–100% Y-axis for percent metrics
            valueScale={{
              type: "linear",
              min: 0,
              max: isPercent ? 1 : "auto",
            }}

            axisLeft={{
              tickValues: isPercent ? [0, 0.2, 0.4, 0.6, 0.8, 1] : undefined,
              format: (d) => (isPercent ? fmtPercent(d) : fmtNumber(d)),
            }}
            axisBottom={{ tickSize: 0, tickPadding: 8 }}
            labelSkipHeight={14}
            
            // Only show label if value exists (prevents "0%" showing on missing bars)
            label={(d) => (d.data.missing ? "" : valueFmt(d.value))}
            
            labelTextColor={textColor}
            tooltip={({ value, indexValue, data: d }) => {
                if (d.missing) return null; // Don't show tooltip for missing data
                return (
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: tooltipBg,
                      color: tooltipFg,
                      border: `1px solid ${gridColor}`,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption">
                      {indexValue}: <strong>{valueFmt(value)}</strong>
                    </Typography>
                  </Box>
                )
            }}
            valueFormat={(v) => (isPercent ? fmtPercent(v) : fmtNumber(v))}
            theme={{
              textColor,
              labels: { text: { fontSize: 17, fill: textColor } },
              axis: {
                domain: { line: { stroke: gridColor } },
                ticks: {
                  text: { fontSize: 14, fill: textColor },
                  line: { stroke: gridColor },
                },
                legend: { text: { fill: textColor } },
              },
              grid: { line: { stroke: gridColor, strokeDasharray: "4 4" } },
              tooltip: {
                container: { fontSize: 14, background: tooltipBg, color: tooltipFg },
              },
            }}
          />
        </Box>
        <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            2023: <strong>{v23 == null ? "N/A" : valueFmt(v23)}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            2024: <strong>{v24 == null ? "N/A" : valueFmt(v24)}</strong>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

/** ------------------------------------------------
 * Main: bar graphs dashboard for a chosen campus
 * ------------------------------------------------ */
export default function TIABarDashboard() {
  // Index both years by ID ("id")
  const map23 = useMemo(() => new Map(data23.map((r) => [r.id, r])), []);
  const map24 = useMemo(() => new Map(data24.map((r) => [r.id, r])), []);

  // Build campus list (union if you want; here from 2023 only)
  const campuses = useMemo(
    () =>
      data23
        .map((r) => ({
          id: r.id,
          label: r.CAMPUS,
          district: r.DISTRICT,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  const DEFAULT_CAMPUS_ID = 686; // e.g., SOUTHWEST H S
  const [selectedId, setSelectedId] = useState(
    data23.find((r) => r.id === DEFAULT_CAMPUS_ID)?.id ?? data23[0]?.id ?? null
  );

  const selected23 = selectedId != null ? map23.get(selectedId) : null;
  const selected24 = selectedId != null ? map24.get(selectedId) : null;

  const campusName = selected23?.CAMPUS ?? selected24?.CAMPUS ?? "Unknown Campus";
  const districtName = selected23?.DISTRICT ?? selected24?.DISTRICT ?? "";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header + Selector */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ md: "center" }}
        sx={{ mb: 2 }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            Annual Growth Scores — {campusName}
          </Typography>
          {districtName && (
            <Typography variant="body2" color="text.secondary">
              {districtName}
            </Typography>
          )}
        </Box>

        <FormControl size="small" sx={{ minWidth: 280 }}>
          <InputLabel sx={{ color: "black" }}>Campus</InputLabel>
          <Select
            sx={{ color: "black" }}
            label="Campus"
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            MenuProps={{ PaperProps: { style: { maxHeight: 360 } } }}
          >
            {campuses.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.label} ({c.id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Charts grid */}
      <Grid container spacing={2}>
        {METRICS.map(({ key, label, fmt }) => {
          const v23 = selected23?.[key] ?? null;
          const v24 = selected24?.[key] ?? null;
          return (
            <Grid item xs={12} md={6} lg={4} key={key}>
              <BarPair
                title={label}
                v23={v23}
                v24={v24}
                isPercent={fmt === "pct"}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}