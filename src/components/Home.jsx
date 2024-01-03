import React from "react";
import { Typography, Box, } from '@mui/material';
import picture from '../assets/popcorn.gif';

const About = () => {

  return (
    <>
      <Box sx={{  textAlign: 'center',   justifyItems:'center'}}>



        <Box
          component="img"
          sx={{
            height: 125,
            width: 125,
            borderRadius: '150px',
          
           

          }}
          alt="edwin"
          src={picture}
        />
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'left',  maxWidth:'xl', mx:'auto' }}>
          Hi, I'm Edwin. I am a math educator interested in computer science and machine learning.  During my free time, I like to ride my bike 🚴 and study the french language 🥖.

        </Typography>



      </Box>

    </>
  );
};

export default About;