import * as React from 'react';
 
import Box from '@mui/material/Box';
 
import Grid from '@mui/material/Unstable_Grid2';
import NotebookCard from './NotebookCard'
 
 
export default function Notebooks() {
  const projects = [
    {
      name:'Forecasting Oil Production', 
      description: ' ', 
      
      codeUrl: 'https://github.com/edwin-torres/Shale/blob/main/shale.ipynb'
    },
    {
      name:'Airline Ratings', 
      description: ' ', 
      
      codeUrl: 'https://github.com/edwin-torres/airline-reviews/blob/main/AirlineReviews.ipynb'
    },
    

  ];
 

  return (
    <Box sx={{ p:0,m:0, flexGrow: 1,bgcolor:'black',textAlign:'center', justifyContent:'center',  display:'flex'   }}>
      <Grid     container sx={{bgcolor:'black',     }} spacing={{ xs: 1, md: 2 }} columns={{ xs: 1, sm: 2, md: 3 }}>
      {projects.map((project, index) => (
          <Grid sx={{bgcolor:'black',     }}   xs={1} sm={1} md={1} key={index}>
            <NotebookCard 
            name={project.name} 
            description={project.description}
             
            code_url={project.codeUrl}
            /> 
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
 