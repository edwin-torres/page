// Principal Scorecard: lookup tables.
//
// Scoring weights, letter grade points, growth points and
// effectiveness thresholds, kept as plain objects so the page needs no
// server. Each table notes the spreadsheet it comes from; if a
// spreadsheet changes, update the matching table here.
//
// A "bucket" is campus level + previous year campus rating group:
// ES / MS / HS, then AC (rating A, B or C) or DF (rating D or F).

export const BUCKETS = ["ES-AC", "ES-DF", "MS-AC", "MS-DF", "HS-AC", "HS-DF"]

// Source: "Deployed sample data.xlsx", sheet "Complete Scoring Weights".
// Points available for each subcategory, per bucket. Every bucket's
// column adds up to 100.
export const SUBCATEGORY_WEIGHTS = {
  "Quality of Instruction": { "ES-AC": 10, "ES-DF": 10, "MS-AC": 10, "MS-DF": 10, "HS-AC": 10, "HS-DF": 10 },
  "Executive Leadership":   { "ES-AC": 5,  "ES-DF": 5,  "MS-AC": 5,  "MS-DF": 5,  "HS-AC": 5,  "HS-DF": 5 },
  "School Culture":         { "ES-AC": 2.5, "ES-DF": 2.5, "MS-AC": 2.5, "MS-DF": 2.5, "HS-AC": 2.5, "HS-DF": 2.5 },
  "Human Capital":          { "ES-AC": 2.5, "ES-DF": 2.5, "MS-AC": 2.5, "MS-DF": 2.5, "HS-AC": 2.5, "HS-DF": 2.5 },
  "STAAR DOMAIN 1":         { "ES-AC": 20, "ES-DF": 0,  "MS-AC": 35, "MS-DF": 0,  "HS-AC": 20, "HS-DF": 0 },
  "STAAR DOMAIN 2":         { "ES-AC": 10, "ES-DF": 30, "MS-AC": 15, "MS-DF": 45, "HS-AC": 10, "HS-DF": 30 },
  "STAAR DOMAIN 3":         { "ES-AC": 20, "ES-DF": 20, "MS-AC": 30, "MS-DF": 35, "HS-AC": 20, "HS-DF": 20 },
  "NWEA MAP":               { "ES-AC": 30, "ES-DF": 30, "MS-AC": 0,  "MS-DF": 0,  "HS-AC": 0,  "HS-DF": 0 },
  "CCMR":                   { "ES-AC": 0,  "ES-DF": 0,  "MS-AC": 0,  "MS-DF": 0,  "HS-AC": 20, "HS-DF": 20 },
  // The sheet also lists "SAT/AP/TSI" (HS: 5) and "Postsecondary" (HS: 5).
  // Those totals are earned through the Met points in HS_GROWTH_POINTS
  // below (SAT 2 + AP 1 + TSI 2 = 5, and Core
  // Complete 3 + Associates 2 = 5), so they are not repeated here.
}

// Source: "points.xlsx", one sheet per bucket. Letter grade → points
// earned. D and F share one row ("D-F").
export const GRADE_POINTS = {
  "ES-AC": { "STAAR Domain 1": { A: 20, B: 14, C: 8, "D-F": 0 }, "STAAR Domain 2A": { A: 10, B: 7,  C: 4,  "D-F": 0 }, "STAAR Domain 3": { A: 20, B: 14, C: 8,  "D-F": 0 }, CCMR: { A: 0,  B: 0,  C: 0, "D-F": 0 } },
  "ES-DF": { "STAAR Domain 1": { A: 0,  B: 0,  C: 0, "D-F": 0 }, "STAAR Domain 2A": { A: 30, B: 24, C: 18, "D-F": 0 }, "STAAR Domain 3": { A: 20, B: 14, C: 8,  "D-F": 0 }, CCMR: { A: 0,  B: 0,  C: 0, "D-F": 0 } },
  "MS-AC": { "STAAR Domain 1": { A: 35, B: 28, C: 21, "D-F": 0 }, "STAAR Domain 2A": { A: 15, B: 12, C: 9,  "D-F": 0 }, "STAAR Domain 3": { A: 30, B: 24, C: 18, "D-F": 0 }, CCMR: { A: 0,  B: 0,  C: 0, "D-F": 0 } },
  "MS-DF": { "STAAR Domain 1": { A: 0,  B: 0,  C: 0, "D-F": 0 }, "STAAR Domain 2A": { A: 45, B: 36, C: 27, "D-F": 0 }, "STAAR Domain 3": { A: 35, B: 28, C: 21, "D-F": 0 }, CCMR: { A: 0,  B: 0,  C: 0, "D-F": 0 } },
  "HS-AC": { "STAAR Domain 1": { A: 20, B: 14, C: 8, "D-F": 0 }, "STAAR Domain 2A": { A: 10, B: 7,  C: 4,  "D-F": 0 }, "STAAR Domain 3": { A: 20, B: 14, C: 8,  "D-F": 0 }, CCMR: { A: 20, B: 14, C: 8, "D-F": 0 } },
  "HS-DF": { "STAAR Domain 1": { A: 0,  B: 0,  C: 0, "D-F": 0 }, "STAAR Domain 2A": { A: 30, B: 24, C: 18, "D-F": 0 }, "STAAR Domain 3": { A: 20, B: 14, C: 8,  "D-F": 0 }, CCMR: { A: 20, B: 14, C: 8, "D-F": 0 } },
}

// Source: "SAT-AP-TSI-Associates-Core Complete.xlsx". High school
// growth metrics earn either the Met or the Not Met points.
export const HS_GROWTH_POINTS = {
  SAT:             { Met: 2, NotMet: 0 },
  AP:              { Met: 1, NotMet: 0 },
  TSI:             { Met: 2, NotMet: 0 },
  Associates:      { Met: 2, NotMet: 0 },
  "Core Complete": { Met: 3, NotMet: 0 },
}

// Source: "Deployed sample data.xlsx", sheet "Thresholds". Minimum total
// points for each effectiveness level, by campus level.
export const THRESHOLDS = [
  { level: "Unsatisfactory", ES: 0,  MS: 0,  HS: 0 },
  { level: "Progressing",    ES: 50, MS: 48, HS: 49 },
  { level: "Proficient I",   ES: 60, MS: 60, HS: 61 },
  { level: "Proficient II",  ES: 70, MS: 71, HS: 73 },
  { level: "Exemplary",      ES: 77, MS: 78, HS: 80 },
  { level: "Master",         ES: 84, MS: 86, HS: 88 },
]
