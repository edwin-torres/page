// src/components/projects/AnalyticsTabs.jsx
import React, { Suspense, useState, useEffect } from "react";
import { Box, Tabs, Tab, Typography, Paper, Link,  ToggleButton, ToggleButtonGroup } from "@mui/material";

// Lazy load the charts
const TIABarDashboard = React.lazy(() => import("./CampusGrowthChart"));
const CampusRanking = React.lazy(() => import("./CampusRanking"));

// 🔹 NEW: Lazy load the English charts
const TIABarDashboardEnglish = React.lazy(() => import("./CampusGrowthChartEnglish"));
const CampusRankingEnglish = React.lazy(() => import("./CampusRankingEnglish"));


export default function AnalyticsTabs() {
  const [tab, setTab] = useState(() => localStorage.getItem("analytics:tab") || "growth");

   // 🔹 NEW: subject state
  const [subject, setSubject] = useState(
    () => localStorage.getItem("analytics:subject") || "algebra"
  );

  useEffect(() => {
    localStorage.setItem("analytics:tab", tab);
  }, [tab]);

   // 🔹 NEW: persist subject too
  useEffect(() => {
    localStorage.setItem("analytics:subject", subject);
  }, [subject]);


  // SWISD / Professional Color Palette
  const themeColors = {
    bg: "#f4f6f8",         // Light Gray Dashboard Background
    paper: "#ffffff",      // White Card Background
    primary: "#1b5e20",    // Professional Forest Green (SWISD style)
    text: "#2c3e50",       // Dark Slate Blue/Gray for text (High contrast)
    tabUnselected: "#546e7a" // Gray for unselected tabs
  };

  // 🔹 NEW: subject toggle handler
  const handleSubjectChange = (_event, newSubject) => {
    if (newSubject !== null) {
      setSubject(newSubject);
    }
  };

  return (
    // MAIN CONTAINER: This overrides the global black background for this specific route
    <Box 
      sx={{ 
        p: { xs: 2, md: 4 }, 
        bgcolor: themeColors.bg, 
        minHeight: "100vh", // Ensures this view covers the black background
        color: themeColors.text
      }}
    >
      {/* Instruction line - Now Dark Gray */}
      <Typography
        variant="h5" // Increased size slightly for hierarchy
        sx={{ 
          mb: 3, 
          fontWeight: 600,
          color: themeColors.text 
        }}
      >
        SOUTHWEST ISD - Growth & Analysis ({subject.toUpperCase()})
      </Typography>

      {/* 🔹 NEW: Subject toggle (Algebra / English) */}
      <ToggleButtonGroup
        value={subject}
        exclusive
        onChange={handleSubjectChange}
        sx={{
    mb: 2,
    "& .MuiToggleButton-root": {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "1rem",
      color: themeColors.tabUnselected,
      backgroundColor: "rgba(0,0,0,0.05)",   // same as unselected tabs
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
      color: "#ffffff",                     // white text
      backgroundColor: themeColors.primary, // green like selected tab
      boxShadow: "0 4px 12px rgba(27, 94, 32, 0.3)",
      "&:hover": {
        backgroundColor: themeColors.primary,
      },
    },
  }}
        aria-label="Select subject"
      >
        <ToggleButton value="algebra" aria-label="Algebra I">
          Algebra I
        </ToggleButton>
        <ToggleButton value="english" aria-label="English I">
          English I
        </ToggleButton>
      </ToggleButtonGroup>

      <Typography variant="body1" sx={{ mb: 2, color: "black" }}>
        Select a tab below to view year-over-year growth and campus comparisons.
      </Typography>

      {/* TABS COMPONENT */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          mb: 3,
          gap: 1,
          "& .MuiTabs-indicator": { display: "none" }, // Hide the default underline
          "& .MuiTabs-flexContainer": { gap: 2 },
          
          // DEFAULT TAB STYLES (Unselected)
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            color: themeColors.tabUnselected,
            backgroundColor: "rgba(0,0,0,0.05)", // Faint gray for structure
            borderRadius: 2,
            minHeight: 40,
            px: 3,
            transition: "all 0.2s ease",
          },
          
          // HOVER STATE
          "& .MuiTab-root:hover": {
            backgroundColor: "rgba(0,0,0,0.1)",
            color: themeColors.primary,
          },

          // SELECTED TAB STYLES
          "& .MuiTab-root.Mui-selected": {
            color: "#ffffff", // White text
            backgroundColor: themeColors.primary, // Green Background
            boxShadow: "0 4px 12px rgba(27, 94, 32, 0.3)", // Subtle green shadow
          },
        }}
        aria-label="Analytics views"
      >
        <Tab value="growth" label="Growth (2023 vs 2024)" />
        <Tab value="ranking" label="Campus Comparisons" />
      </Tabs>

      {/* CHART CONTAINER AREA */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3,
          bgcolor: themeColors.paper, 
          borderRadius: 3,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)", // Very soft shadow
          border: "1px solid rgba(0,0,0,0.08)" 
        }}
      >
          <Suspense fallback={<Typography sx={{ p: 2 }}>Loading visualization...</Typography>}>
          {/* 🔹 UPDATED: choose chart by tab + subject */}
          {tab === "growth" && (
            subject === "algebra" ? <TIABarDashboard /> : <TIABarDashboardEnglish />
          )}

          {tab === "ranking" && (
            subject === "algebra" ? <CampusRanking /> : <CampusRankingEnglish />
          )}
        </Suspense>
        <Paper 
  elevation={0} 
  sx={{ 
    p: 3,
    bgcolor: themeColors.paper, 
    borderRadius: 3,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    border: "1px solid rgba(0,0,0,0.08)" 
  }}
>
 

  {/* Data source footer */}
  <Box sx={{ mt: 3, pt: 1, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
    <Typography variant="caption" sx={{ color: "text.secondary" }}>
      Data Source: Texas Education Agency (TEA), Texas Academic Performance Reports (TAPR). 
      Sample data used for demonstration purposes.&nbsp;
      <Link
        href="https://tea.texas.gov/texas-schools/accountability/academic-accountability/performance-reporting/texas-academic-performance-reports"
        target="_blank"
        rel="noopener noreferrer"
      >
        View TAPR reports
      </Link>
    </Typography>
  </Box>
</Paper>

      </Paper>
    </Box>
  );
}