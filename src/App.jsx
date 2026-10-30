 
import { useState } from "react";
import { Routes, Route, useLocation} from "react-router-dom";
import { Container, GlobalStyles } from '@mui/material';
 

import About from './components/Home'
import NavBar from './components/Nav';
import Projects from './components/Projects';
import Ratings from './components/projects/Ratings';
import Lorenz from "./components/projects/Lorenz";
import Astar from "./components/projects/Astar";
import Chaos from "./components/projects/Chaos";
import Spiral from "./components/projects/Spiral";
import Mnist from "./components/projects/Minst";
import Notebooks from './components/Notebooks';
import Breakout from "./components/projects/Breakout";
import Congress from "./components/projects/Congress";
import CollegeDemographics from './components/projects/CollegeDemographics';
import ConnectionGrid from "./components/projects/Connections";
 
import TIADesignationDashboard from "./components/projects/TIADesignationDashboard";
import TIAScorecardPage from "./components/projects/TIAScorecard/TIAScorecard";
import PrincipalScorecardPage from "./components/projects/PrincipalScorecard/PrincipalScorecard";
import TeacherWhatIfPage from "./components/projects/TeacherWhatIf/TeacherWhatIf";
import TiaToolsPage from "./components/projects/TiaTools/TiaTools";
import SampleScoreCardsPage from "./components/projects/TiaTools/SampleScoreCards";
import NotFound from "./components/NotFound";
import StaarTransitionPage from "./components/projects/StaarTransition/StaarTransition";
import TiaExplainersPage from "./components/projects/TiaTools/TiaExplainers";


function App() {
   const location = useLocation(); // 2. Get current location
  // true while the "page not found" screen is showing (NotFound sets it)
  const [notFound, setNotFound] = useState(false);
  const isAnalyticsPage =
  location.pathname === "/projects/tia-designations" ||
  location.pathname === "/projects/tia-scorecard" ||
  location.pathname === "/projects/principal-scorecard" ||
  location.pathname === "/projects/teacher-what-if" ||
  location.pathname === "/projects/sample-score-cards" ||
  location.pathname === "/tia-tools" ||
  location.pathname === "/projects/staar-transition-growth" ||
  location.pathname === "/tia-explainers";

const containerColor = isAnalyticsPage ? "#f4f6f8" : "black";

  // The part of the address before the # must be the site's own folder (/page/).
  // Anything else, like /page/tia-explainer, is a wrong address: the dev server
  // and the live site's 404.html both load this app for it, so say so instead
  // of showing the home page.
  const BASE = import.meta.env.BASE_URL; // "/page/", from vite.config.js
  const wrongFolder = ![BASE, BASE + "index.html"].includes(window.location.pathname);

  return (
    <>
    {/* 4. Only show NavBar if we are NOT on the analytics page or the not found page */}
      {!isAnalyticsPage && !notFound && <NavBar />}
      {/* Light pages reach the window edges: drop the browser's default 8px body margin,
          which otherwise shows the black page background as a thin frame */}
      {(isAnalyticsPage || notFound) && <GlobalStyles styles={{ body: { margin: 0 } }} />}
     
    
   
    <Container maxWidth={false} disableGutters sx={{ p: 2,  bgcolor: containerColor,   color: 'white' }} >


    
    {wrongFolder ? (
      <NotFound onShow={setNotFound} address={window.location.pathname + window.location.hash} />
    ) : (
    <Routes>

      <Route path="/" element={<About />} />
      <Route path='/home' element={<About />} />
      <Route path='/projects' element={<Projects />} />
      <Route path='/jupyter-notebooks' element={<Notebooks />} />
      <Route path='/projects/ratings' element={<Ratings />} />
      <Route path='/projects/lorenz' element={<Lorenz />} />
      <Route path='/projects/astar' element={<Astar />} />
      <Route path='/projects/chaos' element={<Chaos />} />
      <Route path='/projects/spiral' element={<Spiral />} />
      <Route path='/projects/mnist' element={<Mnist />} />
      <Route path='/projects/breakout' element={<Breakout />} />
      <Route path='/projects/congress' element={<Congress />} />
      <Route path='/projects/college-demographics' element={<CollegeDemographics />} />
      <Route path='/projects/connections' element={<ConnectionGrid />} />
 
    <Route path="/projects/tia-designations" element={<TIADesignationDashboard />} />
    <Route path="/projects/tia-scorecard" element={<TIAScorecardPage />} />
    <Route path="/projects/principal-scorecard" element={<PrincipalScorecardPage />} />
    <Route path="/projects/teacher-what-if" element={<TeacherWhatIfPage />} />
    <Route path="/projects/sample-score-cards" element={<SampleScoreCardsPage />} />
    <Route path="/tia-tools" element={<TiaToolsPage />} />
    <Route path="/projects/staar-transition-growth" element={<StaarTransitionPage />} />
    <Route path="/tia-explainers" element={<TiaExplainersPage />} />

 

      {/* Using path="*"" means "match anything": any address with no route above */}
      <Route path="*" element={<NotFound onShow={setNotFound} />} />

    </Routes>
    )}
  </Container>
  </>
  )
}

export default App
