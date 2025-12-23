// src/components/projects/DesignationOverview.jsx
import React, { useMemo } from "react";
import { Box, Paper, Typography, Grid , Alert, Stack,Chip  } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";

const DESIGNATIONS = ["No Designation", "Recognized", "Exemplary", "Master"];
const COLOR_MAP = {
  "No Designation": "#e9c5a6", // same tan
  "Recognized": "#f47b63",     // same coral
  "Exemplary": "#f2df5a",      // same yellow
  "Master": "#e3a337",         // same gold
};

export default function DesignationOverview({
  data = [],
  campusLabel = "ALL",
  themeColors = {
    bg: "#f4f6f8",
    paper: "#ffffff",
    primary: "#1b5e20",
    text: "#2c3e50",
    tabUnselected: "#546e7a",
  },
}) {
  // Count teachers by designation
  const counts = useMemo(() => {
    const base = Object.fromEntries(DESIGNATIONS.map((k) => [k, 0]));
    const normalize = (s) => String(s ?? "").trim();

for (const row of data) {
  const raw = normalize(row.designation);
  const key = DESIGNATIONS.includes(raw) ? raw : "No Designation";
  base[key] += 1;
}
    return base;
  }, [data]);

  const barData = useMemo(
    () =>
      DESIGNATIONS.map((d) => ({
        designation: d,
        teachers: counts[d] ?? 0,
      })),
    [counts]
  );

  const pieData = useMemo(
    () =>
      DESIGNATIONS.map((d) => ({
        id: d,
        label: d,
        value: counts[d] ?? 0,
      })),
    [counts]
  );

  const total = data.length;

  const nivoTheme = useMemo(
  () => ({
    text: { fill: themeColors.text, fontSize: 14 }, // general default

    axis: {
      domain: { line: { stroke: "rgba(0,0,0,0.2)" } },
      ticks: {
        line: { stroke: "rgba(0,0,0,0.2)" },
        text: { fill: themeColors.text, fontSize: 15 }, // axis tick labels
      },
      legend: { text: { fill: themeColors.text, fontSize: 15 } }, // axis legend (e.g. "Teachers")
    },

    legends: {
      text: { fill: themeColors.text, fontSize: 15 }, // legend items
    },

    tooltip: {
      container: { fontSize: 14 }, // tooltip text
    },
  }),
  [themeColors.text]
);

  const campusTitle = campusLabel === "ALL" ? "All Campuses" : `Campus ${campusLabel}`;

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        p: 3,
        bgcolor: themeColors.paper,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: themeColors.text }}>
            Designation Overview ({campusTitle})
          </Typography>
          <Typography variant="body2" sx={{ color: themeColors.tabUnselected, mt: 0.25 }}>
            Based on included teachers only (n = {total.toLocaleString()}).
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Bar chart */}
        <Grid item xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: 400,
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.08)",
              bgcolor: "rgba(0,0,0,0.02)",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColors.text, mb: 1 }}>
              Count of teachers by designation
            </Typography>

            <Box sx={{ height: 350 }}>
              <ResponsiveBar
                data={barData}
               colors={({ indexValue }) => COLOR_MAP[indexValue] ?? "#cccccc"}

                keys={["teachers"]}
                indexBy="designation"
                margin={{ top: 22, right: 46, bottom: 60, left: 70 }}
                padding={0.35}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                theme={nivoTheme}
                enableLabel={false}
                axisTop={null}
                axisRight={null}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Teachers",
                  legendPosition: "middle",
                  legendOffset: -50,
                  
                }}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 8,
                  tickRotation: -20,
                }}
                tooltip={({ indexValue, value }) => (
                  <div
                    style={{
                      padding: 10,
                      background: "white",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: 8,
                    }}
                  >
                    <strong>{indexValue}</strong>
                    <div>Teachers: {value}</div>
                  </div>
                )}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Pie chart */}
        <Grid item xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: 400,
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.08)",
              bgcolor: "rgba(0,0,0,0.02)",
              overflow: "visible",   // ✅ add this
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeColors.text, mb: 1 }}>
              Percent by designation
            </Typography>

            <Box sx={{height: 375, mb: 2, overflow: "visible" }}>
              <ResponsivePie
                data={pieData}
                theme={nivoTheme}
                margin={{ top: 55, right: 120, bottom: 30, left: 0}}
                enableArcLinkLabels={false}
                
                innerRadius={0.55}
                arcLinkLabelsDiagonalLength={15}
        arcLinkLabelsStraightLength={10}
                cornerRadius={3}
                activeOuterRadiusOffset={2}
                enableArcLabels={false}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsThickness={4}
                arcLinkLabelsTextColor={themeColors.text}
                arcLinkLabelsColor={{ from: "color" }}
               legends={[
  {
    anchor: "right",
    direction: "column",
    translateX: 45,
    itemWidth: 100,
    itemHeight: 21,
    itemsSpacing: 9,
    itemTextColor: themeColors.text,
    symbolSize: 17,
    symbolShape: "circle",
  },
]}
                tooltip={({ datum }) => {
                  const pct = total > 0 ? ((datum.value / total) * 100).toFixed(1) : "0.0";
                  return (
                    <div
                      style={{
                        padding: 10,
                        background: "white",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: 8,
                      }}
                    >
                      <strong>{datum.id}</strong>
                      <div>Teachers: {datum.value}</div>
                      <div>Percent: {pct}%</div>
                    </div>
                  );
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
<Alert
  severity="info"
  sx={{
    mt: 2,
    borderRadius: 3,
    bgcolor: "rgba(27, 94, 32, 0.06)",
    color: themeColors.text,
    border: "1px solid rgba(0,0,0,0.08)",
    "& .MuiAlert-icon": { color: themeColors.primary },
  }}
>
  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5 }}>
    Key notes 
  </Typography>

  <Stack spacing={0.5}>
    <Typography variant="body2">
      • Growth points were fixed at <b>30.3</b> for all teachers (per the assessment prompt).
    </Typography>

    <Typography variant="body2">
      • <b>Threshold rule:</b> if a domain average is <b>&lt; 3.7</b>, that domain earns <b>0</b> points.
    </Typography>

    <Typography variant="body2">
      • With observation point caps of <b>10</b> (Domains 1&amp;4) + <b>35</b> (Domains 2&amp;3) and fixed growth of{" "}
      <b>30.3</b>, the maximum composite is <b>75.3</b>; therefore <b>Master (≥ 79)</b> cannot occur under these
      assumptions.
    </Typography>
     <Typography variant="body2">
      • Designation cut scores provided:  <b> &lt; 63.3 </b> (No Designation) / <b>63.3–68.0</b> (Recognized) / <b>68.1–78.9</b> (Exemplary) / <b>79+</b> (Master).
    </Typography>
  </Stack>
</Alert>
 

    </Paper>
  );
}
