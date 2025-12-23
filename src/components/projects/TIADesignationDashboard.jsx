// src/components/projects/TIADesignationDashboard.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
} from "@mui/material";

// ✅ Data imports (as you requested)
import dashData from "./Data/dashData.json";
import removedTeachers from "./Data/removed_teachers.json";
import DesignationOverview from "./DesignationOverview";
import TeacherLookup from "./TeacherLookup";
import MethodAssumptions from "./MethodAssumptions";
import CampusComparison from "./CampusComparison";
import TeacherDesignationCalculator from "./TeacherDesignationCalculator";

function KpiCard({ label, value, themeColors }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        bgcolor: themeColors.paper,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: themeColors.tabUnselected, fontWeight: 700 }}
      >
        {label}
      </Typography>
      <Typography
        variant="h4"
        sx={{ mt: 0.5, color: themeColors.text, fontWeight: 800 }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

export default function TIADesignationDashboard() {
  // Same palette as AnalyticsTabs
  const themeColors = {
    bg: "#f4f6f8",
    paper: "#ffffff",
    primary: "#1b5e20",
    text: "#2c3e50",
    tabUnselected: "#546e7a",
    highlighted:  "#a9e0b2ff", 
  };

  const [campus, setCampus] = useState("ALL");

  // Build campus list from BOTH included + removed, filtering out null/empty/"null"
  const campuses = useMemo(() => {
    const allBuildings = [
      ...dashData.map((d) => d.Buildings),
      ...removedTeachers.map((d) => d.Buildings),
    ].filter(
      (b) =>
        b !== null &&
        b !== undefined &&
        String(b).trim() !== "" &&
        String(b).toLowerCase() !== "null"
    );

    const uniq = Array.from(new Set(allBuildings)).sort((a, b) => {
      const sa = String(a);
      const sb = String(b);
      const na = Number(sa);
      const nb = Number(sb);

      const aIsNum = Number.isFinite(na);
      const bIsNum = Number.isFinite(nb);

      if (aIsNum && bIsNum) return na - nb; // numeric sort
      if (aIsNum) return -1; // numbers first
      if (bIsNum) return 1;
      return sa.localeCompare(sb); // text sort
    });

    return ["ALL", ...uniq];
  }, []);

  // Filter included (clean) and removed lists by campus (string-safe)
  const includedFiltered = useMemo(() => {
    if (campus === "ALL") return dashData;
    return dashData.filter((d) => String(d.Buildings) === String(campus));
  }, [campus]);

  const removedFiltered = useMemo(() => {
    if (campus === "ALL") return removedTeachers;
    return removedTeachers.filter((d) => String(d.Buildings) === String(campus));
  }, [campus]);

  // KPIs (campus-aware)
  const includedTeachers = includedFiltered.length;
  const excludedTeachers = removedFiltered.length;
  const totalTeachersOriginal = includedTeachers + excludedTeachers;
  const pctIncluded =
    totalTeachersOriginal > 0
      ? (includedTeachers / totalTeachersOriginal) * 100
      : 0;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: themeColors.bg,
        minHeight: "100vh",
        color: themeColors.text,
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: themeColors.text }}
          >
            TIA Designation Summary  
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, color: themeColors.tabUnselected }}
          >
            Filter by campus to view key counts for the selected building.
          </Typography>
        </Box>

        <FormControl
          size="small"
           variant="outlined"
          sx={{
            minWidth: 240,
            bgcolor: themeColors.paper,
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(18, 227, 28, 0.15)",
              border:2
              
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(191, 19, 19, 0.25)",
            },
            "& .MuiInputLabel-root": {
              color: themeColors.tabUnselected,
              fontWeight: 700,
            },
          }}
        >
          <InputLabel id="campus-select-label">Campus</InputLabel>
          <Select
            labelId="campus-select-label"
            value={campus}
            label="Campus"
            onChange={(e) => setCampus(e.target.value)}
          >
            {campuses.map((c) => (
              <MenuItem key={c} value={c}>
                {c === "ALL" ? "All Campuses" : `Campus ${c}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* KPI row */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="Total teachers (original)"
            value={totalTeachersOriginal.toLocaleString()}
            themeColors={themeColors}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="Teachers included (complete ratings)"
            value={includedTeachers.toLocaleString()}
            themeColors={themeColors}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="Teachers excluded (missing ratings)"
            value={excludedTeachers.toLocaleString()}
            themeColors={themeColors}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="% included"
            value={`${pctIncluded.toFixed(1)}%`}
            themeColors={themeColors}
          />
        </Grid>
      </Grid>

      {/* Designation overview charts */}
      <DesignationOverview
        data={includedFiltered}
        campusLabel={campus}
        themeColors={themeColors}
      />
<CampusComparison
  dataAllIncluded={dashData}     // IMPORTANT: all included teachers
  selectedCampus={campus}        // highlight selected campus if not ALL
  themeColors={themeColors}
/>
      <TeacherLookup
  data={dashData}
  campusLabel={'ALL'}
  themeColors={themeColors}
/>

<TeacherDesignationCalculator themeColors={themeColors} />

<MethodAssumptions
  themeColors={themeColors}
  growthPoints={30.3}
  excludedCount={removedTeachers.length}
/>

     
    </Box>
  );
}
