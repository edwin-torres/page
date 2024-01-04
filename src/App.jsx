 
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

      {/* Using path="*"" means "match anything" */}
      <Route path="*" element={<About />} />

    </Routes>
  </Container>
  </>
  )
}

export default App
