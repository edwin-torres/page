import * as React from 'react';
 
import Box from '@mui/material/Box';
 
import Grid from '@mui/material/Unstable_Grid2';
import ProjectCard from './ProjectCard';
 
 
export default function Projects() {
  const projects = [
    {
      name:'IMBD Episode Ratings', 
      description: '2-d visualization of popular TV Series', 
      appRoute:'/projects/ratings', 
      codeUrl: 'https://www.wikidata.org/wiki/Wikidata:Main_Page'
    },
    {
      name:'Lorenz Attractor ', 
      description: 'Sensitive dependence on initial condition.', 
      appRoute:'/projects/lorenz', 
      codeUrl: 'https://www.wikidata.org/wiki/Wikidata:Main_Page'
    },
    {
      name:'Path Finder', 
      description: 'Path finding algorithm using A*  ', 
      appRoute:'/projects/astar', 
      codeUrl: 'https://www.wikidata.org/wiki/Wikidata:Main_Page'
    },
    {
      name:'Chaos', 
      description: 'Sierpinski triangle via chaos game.', 
      appRoute:'/projects/chaos', 
      codeUrl: 'https://www.wikidata.org/wiki/Wikidata:Main_Page'
    },
    {
      name:'Spiral', 
      description: 'Just a cool rotating spiral 🌌.', 
      appRoute:'/projects/spiral', 
      codeUrl: 'https://www.wikidata.org/wiki/Wikidata:Main_Page'
    },
    {
      name:'Convolutional Neural Network', 
      description: 'Predicts a digit 0-9.', 
      appRoute:'/projects/mnist', 
      codeUrl: 'https://www.wikidata.org/wiki/Wikidata:Main_Page'
    },


  ];
 

  return (
    <Box sx={{ p:0,m:0, flexGrow: 1,bgcolor:'black',textAlign:'center', justifyContent:'center',  display:'flex'   }}>
      <Grid     container sx={{bgcolor:'black',     }} spacing={{ xs: 1, md: 2 }} columns={{ xs: 1, sm: 2, md: 3 }}>
      {projects.map((project, index) => (
          <Grid sx={{bgcolor:'black',     }}   xs={1} sm={1} md={1} key={index}>
            <ProjectCard 
            name={project.name} 
            description={project.description}
            appRoute={project.appRoute}
            code_url={project.codeUrl}
            /> 
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
 