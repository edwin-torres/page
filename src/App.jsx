 
import { Routes, Route, } from "react-router-dom";
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


function App() {
   
  return (
    <>
    
    <NavBar></NavBar>
    
   
    <Container maxWidth={false} disableGutters sx={{ p: 2,  bgcolor: 'black',   color: 'white' }} >


    
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
      
 

      {/* Using path="*"" means "match anything" */}
      <Route path="*" element={<About />} />

    </Routes>
  </Container>
  </>
  )
}

export default App
