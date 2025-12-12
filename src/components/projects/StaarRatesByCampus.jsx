import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";

// ✅ Named export import
import { data_approaches_meets_masters as data } from "./Data/tiaData";

const themeColors = {
  bg: "#f4f6f8",
  paper: "#ffffff",
  primary: "#1b5e20",
  bars: "#59A14F",
  text: "#000000ff",
  tabUnselected: "#000000ff",
};

const cleanCampusId = (id) => {
  if (id == null) return "";
  return String(id).replace(/^'+/, "");
};

const fmtPct = (x) => {
  if (x == null || Number.isNaN(x)) return "—";
  return `${(x * 100).toFixed(1)}%`;
};

export default function StaarRatesByCampus({ subject = "algebra" }) {
  const [year, setYear] = useState(2024);
  const [subgroup, setSubgroup] = useState("All Students");
  const [level, setLevel] = useState("Approaches");

  // 🔹 Map AnalyticsTabs subject -> dataset subject label
  const subjectLabel = subject === "english" ? "English I" : "Algebra I";

  // ✅ Axis font sizes
  const AXIS_TICK_FONT = 17;
  const AXIS_LEGEND_FONT = 17;

  // Years depend on subject (so dropdown is valid)
  const years = useMemo(() => {
    const s = new Set(
      (data || [])
        .filter((d) => String(d.subject) === String(subjectLabel))
        .map((d) => d.year)
    );
    return Array.from(s).sort((a, b) => a - b);
  }, [subjectLabel]);

  // Subgroups depend on subject + year (so dropdown is valid)
  const subgroups = useMemo(() => {
    const s = new Set(
      (data || [])
        .filter(
          (d) =>
            String(d.subject) === String(subjectLabel) &&
            Number(d.year) === Number(year)
        )
        .map((d) => d.subgroup)
    );
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [subjectLabel, year]);

  // ✅ Keep year valid when subject changes
  useEffect(() => {
    if (!years.includes(year) && years.length > 0) {
      setYear(years[years.length - 1]); // latest available year
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years]);

  // ✅ Keep subgroup valid when subject/year changes
  useEffect(() => {
    if (!subgroups.includes(subgroup)) {
      setSubgroup(subgroups.includes("All Students") ? "All Students" : (subgroups[0] || "All Students"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subgroups]);

  // Filter for selected subject/year/subgroup
  const filtered = useMemo(() => {
    return (data || [])
      .filter(
        (d) =>
          String(d.subject) === String(subjectLabel) &&
          Number(d.year) === Number(year) &&
          String(d.subgroup) === String(subgroup)
      )
      .map((d) => ({ ...d, CAMPUS_ID: cleanCampusId(d.CAMPUS_ID) }));
  }, [subjectLabel, year, subgroup]);

  // Bar chart data for selected level (exclude nulls)
  const barData = useMemo(() => {
    const rows = filtered.filter((d) => d.level === level && d.rate != null);
    rows.sort((a, b) => String(a.CAMPUS).localeCompare(String(b.CAMPUS)));
    return rows.map((d) => ({ campus: d.CAMPUS, rate: d.rate }));
  }, [filtered, level]);

  const campusCount = useMemo(() => {
    const s = new Set(filtered.map((d) => d.CAMPUS));
    return s.size;
  }, [filtered]);

  const missingCount = useMemo(() => {
    return filtered.filter((d) => d.level === level && d.rate == null).length;
  }, [filtered, level]);

  const toggleGroupSx = {
    mb: 0,
    "& .MuiToggleButton-root": {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "1rem",
      color: themeColors.tabUnselected,
      backgroundColor: "rgba(0,0,0,0.05)",
      borderRadius: 2,
      px: 3,
      minHeight: 40,
      border: "none",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.1)",
        color: themeColors.primary,
      },
    },
    "& .MuiToggleButton-root.Mui-selected": {
      color: "#ffffff",
      backgroundColor: themeColors.primary,
      boxShadow: "0 4px 12px rgba(27, 94, 32, 0.3)",
      "&:hover": {
        backgroundColor: themeColors.primary,
      },
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: themeColors.paper,
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.text }}>
            STAAR Rates by Campus
          </Typography>
          <Typography variant="body2" sx={{ color: themeColors.tabUnselected }}>
            {subjectLabel} • Filter by year and subgroup, then choose Approaches/Meets/Masters to compare campuses.
          </Typography>
        </Box>

        <Divider />

        {/* Controls */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 260 }}>
              <InputLabel>Subgroup</InputLabel>
              <Select
                value={subgroup}
                label="Subgroup"
                onChange={(e) => setSubgroup(e.target.value)}
              >
                {subgroups.map((sg) => (
                  <MenuItem key={sg} value={sg}>
                    {sg}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup
              size="small"
              exclusive
              value={level}
              onChange={(_, v) => v && setLevel(v)}
              sx={toggleGroupSx}
            >
              <ToggleButton value="Approaches">Approaches</ToggleButton>
              <ToggleButton value="Meets">Meets</ToggleButton>
              <ToggleButton value="Masters">Masters</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label={`${campusCount} campuses`}
              variant="outlined"
              sx={{ color: themeColors.text, borderColor: "rgba(0,0,0,0.15)" }}
            />
            <Chip
              size="small"
              label={`${missingCount} missing`}
              variant="outlined"
              sx={{ color: themeColors.text, borderColor: "rgba(0,0,0,0.15)" }}
            />
          </Stack>
        </Stack>

        {/* Chart */}
        <Box sx={{ height: { xs: 420, md: 520 } }}>
          {barData.length === 0 ? (
            <Box
              sx={{
                height: "100%",
                display: "grid",
                placeItems: "center",
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "divider",
                backgroundColor: themeColors.bg,
              }}
            >
              <Typography variant="body2" sx={{ color: themeColors.tabUnselected }}>
                No chartable values for this selection (all missing/suppressed).
              </Typography>
            </Box>
          ) : (
            <ResponsiveBar
              data={barData}
              keys={["rate"]}
              indexBy="campus"
              margin={{ top: 30, right: 20, bottom: 120, left: 75 }}
              padding={0.25}
              valueScale={{ type: "linear", min: 0, max: 1 }}
              indexScale={{ type: "band", round: true }}
              colors={() => themeColors.bars}

              enableLabel={true}
              label={(d) => fmtPct(d.value)}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#080000ff"
              labelPosition="end"
              labelOffset={-5}

              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}

              axisLeft={{
                tickValues: 6,
                legend: "Rate",
                legendPosition: "middle",
                legendOffset: -60,
                format: (v) => `${Math.round(v * 100)}%`,
              }}
              axisBottom={{
                tickRotation: 0,
                legend: "Campus",
                legendPosition: "middle",
                legendOffset: 55,
              }}
              tooltip={({ indexValue, value }) => (
                <Box
                  sx={{
                    p: 1,
                    bgcolor: themeColors.paper,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColors.text }}>
                    {indexValue}
                  </Typography>
                  <Typography variant="body2" sx={{ color: themeColors.tabUnselected }}>
                    {subjectLabel} • {subgroup} • {level}:{" "}
                    <b style={{ color: themeColors.primary }}>{fmtPct(value)}</b>
                  </Typography>
                </Box>
              )}
              theme={{
                axis: {
                  ticks: {
                    text: { fill: themeColors.tabUnselected, fontSize: AXIS_TICK_FONT },
                  },
                  legend: {
                    text: { fill: themeColors.tabUnselected, fontSize: AXIS_LEGEND_FONT },
                  },
                },
                labels: {
                  text: { fill: "#000000ff", fontSize: 18, fontWeight: 300 },
                },
                tooltip: { container: { background: "transparent" } },
                grid: { line: { stroke: "rgba(0,0,0,0.08)" } },
              }}
            />
          )}
        </Box>

        <Typography variant="caption" sx={{ color: themeColors.tabUnselected }}>
          Note: “missing” usually means suppressed or unavailable subgroup counts (null rate).
        </Typography>
      </Stack>
    </Paper>
  );
}
