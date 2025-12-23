// src/components/projects/MethodAssumptions.jsx
import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function MethodAssumptions({
  themeColors,
  growthPoints = 30.3,
  excludedCount = 52,
}) {
  return (
    <Accordion
      defaultExpanded={false}
      disableGutters
      elevation={0}
      sx={{
        mt: 2,
        bgcolor: themeColors.paper,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: themeColors.text }}>
            Method / Assumptions
          </Typography>
          <Typography variant="body2" sx={{ color: themeColors.tabUnselected, mt: 0.25 }}>
            Key rules used to compute points + designations.
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0 }}>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
         

          
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: themeColors.text }}>
              Rating → numeric mapping
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.75 }}>
              <Chip label="Distinguished = 5" size="small" />
              <Chip label="Accomplished = 4" size="small" />
              <Chip label="Proficient = 3" size="small" />
              <Chip label="Developing = 2" size="small" />
              <Chip label="Improvement Needed = 1" size="small" />
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: themeColors.text }}>
              Missing data handling
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.tabUnselected }}>
              Teachers with ≥1 missing/NA dimension rating were excluded from the included dataset.
              Current excluded count: <b>{excludedCount}</b>.
            </Typography>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
