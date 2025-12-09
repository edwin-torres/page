// src/components/CampusRanking.jsx
import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  LinearProgress,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { ResponsiveBar } from "@nivo/bar";

// Fallback to your local data if props aren't provided
import { df_metrics_23_english as d23, df_metrics_24_english as d24 } from "./Data/tiaData";

const METRICS = [
  { key: "ALL_GROWTH_RATE", label: "All Students Growth", fmt: "pct" },
  { key: "ECODIS_GROWTH_RATE", label: "Econ Disadv. Growth", fmt: "pct" },
  { key: "HISPANIC_GROWTH_RATE", label: "Hispanic Growth", fmt: "pct" },
  { key: "WHITE_GROWTH_RATE", label: "White Growth", fmt: "pct" },
  { key: "AFR_AMER_GROWTH_RATE", label: "African American Growth", fmt: "pct" },
  { key: "FEMALE_GROWTH_RATE", label: "Female Growth", fmt: "pct" },
  { key: "MALE_GROWTH_RATE", label: "Male Growth", fmt: "pct" },
];

// 👇 NEW: map each metric to its corresponding count field
const COUNT_FIELDS = {
  ALL_GROWTH_RATE: "ALL_STUDENT_COUNT",
  ECODIS_GROWTH_RATE: "ECODIS_COUNT",
  HISPANIC_GROWTH_RATE: "HISPANIC_COUNT",
  WHITE_GROWTH_RATE: "WHITE_COUNT",
  AFR_AMER_GROWTH_RATE: "AFR_AMER_COUNT",
  FEMALE_GROWTH_RATE: "FEMALE_COUNT",
  MALE_GROWTH_RATE: "MALE_COUNT",
  // if you later add points metric to this chart, fall back to ALL_STUDENT_COUNT
};

const fmtNumber = (v) =>
  v == null || Number.isNaN(v) ? "—" : Intl.NumberFormat().format(v);

const fmtPercent = (v) =>
  v == null || Number.isNaN(v)
    ? "—"
    : Intl.NumberFormat(undefined, {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(v);

export default function CampusRanking(props) {
  const theme = useTheme();

  // be robust if props are missing
  const rows23 = Array.isArray(props?.data23) ? props.data23 : d23 ?? [];
  const rows24 = Array.isArray(props?.data24) ? props.data24 : d24 ?? [];

  const [year, setYear] = useState(2024);
  const [metricKey, setMetricKey] = useState("ALL_GROWTH_RATE");

  const rows = year === 2023 ? rows23 : rows24;
  const isPct = METRICS.find((m) => m.key === metricKey)?.fmt === "pct";
  const format = isPct ? fmtPercent : fmtNumber;

  const chartData = useMemo(() => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const countField = COUNT_FIELDS[metricKey] ?? "ALL_STUDENT_COUNT";

    return safeRows
      .filter((r) => r && r[metricKey] != null)
      .map((r) => ({
        campus: r.CAMPUS,
        value: r[metricKey],
        n: r?.[countField] ?? null, // 👈 carry sample size for label/tooltip
      }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 12);
  }, [rows, metricKey]);

  const textColor = theme.palette.text.primary;
  const gridColor =
    theme.palette.mode === "dark"
      ? alpha("#ffffff", 0.22)
      : alpha("#000000", 0.12);

  const whiteSelectSx = {
    color: "#0c0b0bff",
    "& .MuiSvgIcon-root": { color: "#292020ff" },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.25)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.45)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.65)",
    },
  };
  const whiteMenuProps = {
    PaperProps: {
      sx: {
        bgcolor: "#fff",
        color: "#111",
        maxHeight: 360,
        "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(0,0,0,0.06)" },
        "& .MuiMenuItem-root.Mui-selected:hover": {
          bgcolor: "rgba(0,0,0,0.10)",
        },
      },
    },
  };

  return (
    <Card sx={{ bgcolor: "background.paper", height: 460 }}>
      <CardContent sx={{ height: "100%" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          sx={{ mb: 1 }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ color: "#000", fontSize:20,fontWeight: 600   }}>
              Metric — {METRICS.find((m) => m.key === metricKey)?.label}
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: "black" }}>Year</InputLabel>
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

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel sx={{ color: "black" }}>Metric</InputLabel>
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
        </Stack>

        <Box sx={{ height: 360 }}>
          {chartData.length ? (
            <ResponsiveBar
              data={chartData}
              layout="horizontal"
              keys={["value"]}
              indexBy="campus"
              margin={{ top: 10, right: 24, bottom: 56, left: 200 }}
              padding={0.3}
              colors={["#59A14F"]}
              enableGridY={false}
              enableGridX
              valueScale={{ type: "linear", min: 0, max: isPct ? 1 : "auto" }}
              axisLeft={{ tickSize: 0, tickPadding: 6 }}
              axisBottom={{
                tickSize: 0,
                tickPadding: 8,
                tickRotation: 0,
                tickValues: isPct ? [0, 0.25, 0.5, 0.75, 1] : undefined,
                format: (d) => (isPct ? fmtPercent(d) : fmtNumber(d)),
                legend: isPct ? " " : "",
                legendOffset: 40,
                legendPosition: "middle",
              }}
              labelSkipWidth={60}
              // 👇 NEW: show value plus sample size on the bar
              label={(d) => {
                const n = d.data?.n;
                const nTxt = n == null ? "" : `  (n=${fmtNumber(n)})`;
                return `${format(d.value)}${nTxt}`;
              }}
              valueFormat={(v) => format(v)}
              theme={{
                textColor,
                labels: { text: { fontSize: 20, fill: 'black',  } },
                axis: {
                  domain: { line: { stroke: gridColor } },
                  ticks: {
                    text: { fontSize: 15, fill: textColor },
                    line: { stroke: gridColor },
                  },
                  legend: { text: { fill: textColor } },
                },
                grid: { line: { stroke: gridColor, strokeDasharray: "4 4" } },
                tooltip: {
                  container: {
                    fontSize: 14,
                    background: "rgba(0,0,0,0.9)",
                    color: "#fff",
                    border: `1px solid ${gridColor}`,
                  },
                },
              }}
              tooltip={({ data, value }) => (
                <Box sx={{ p: 1 }}>
                  <Typography variant="caption">
                    <strong>{data.campus}</strong>
                    <br />
                    {format(value)}{" "}
                    {data.n != null ? `• n=${fmtNumber(data.n)}` : ""}
                  </Typography>
                </Box>
              )}
            />
          ) : (
            <Box sx={{ mt: 4 }}>
              <LinearProgress />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
