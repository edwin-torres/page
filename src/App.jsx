 
import { Routes, Route, useLocation} from "react-router-dom";
import { Container } from '@mui/material';
 

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
 
import AnalyticsTabs from "./components/projects/AnalyticsTabs";
import TIADesignationDashboard from "./components/projects/TIADesignationDashboard";
import TIAScorecardPage from "./components/projects/TIAScorecard/TIAScorecard";
import PrincipalScorecardPage from "./components/projects/PrincipalScorecard/PrincipalScorecard";
import TeacherWhatIfPage from "./components/projects/TeacherWhatIf/TeacherWhatIf";
import TiaToolsPage from "./components/projects/TiaTools/TiaTools";
import SampleScoreCardsPage from "./components/projects/TiaTools/SampleScoreCards";


function App() {
   const location = useLocation(); // 2. Get current location
  const isAnalyticsPage =
  location.pathname === "/projects/analytics" ||
  location.pathname === "/projects/tia-designations" ||
  location.pathname === "/projects/tia-scorecard" ||
  location.pathname === "/projects/principal-scorecard" ||
  location.pathname === "/projects/teacher-what-if" ||
  location.pathname === "/projects/sample-score-cards" ||
  location.pathname === "/tia-tools";

const containerColor = isAnalyticsPage ? "#f4f6f8" : "black";

  return (
    <>
    {/* 4. Only show NavBar if we are NOT on the analytics page */}
      {!isAnalyticsPage && <NavBar />}
     
    
   
    <Container maxWidth={false} disableGutters sx={{ p: 2,  bgcolor: containerColor,   color: 'white' }} >


    
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
 
      <Route path='/projects/analytics' element={<AnalyticsTabs />} />
    <Route path="/projects/tia-designations" element={<TIADesignationDashboard />} />
    <Route path="/projects/tia-scorecard" element={<TIAScorecardPage />} />
    <Route path="/projects/principal-scorecard" element={<PrincipalScorecardPage />} />
    <Route path="/projects/teacher-what-if" element={<TeacherWhatIfPage />} />
    <Route path="/projects/sample-score-cards" element={<SampleScoreCardsPage />} />
    <Route path="/tia-tools" element={<TiaToolsPage />} />

 

      {/* Using path="*"" means "match anything" */}
      <Route path="*" element={<About />} />

    </Routes>
  </Container>
  </>
  )
}

export default App
