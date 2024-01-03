import { useState } from 'react';
import { Canvas, } from '@react-three/fiber';
import Stars from './Stars';

import { Box, Button, Typography } from '@mui/material';


export default function Spiral() {

  const [animate, setAnimate] = useState(false);
  return (

    < >
      <Box sx={{ textAlign: 'center', m: 2 }}>
 
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>
          Use the mouse to zoom in/out and rotate. 
        </Typography>
        <Button sx={{ m: 2 }} variant="contained" onClick={() => {


          setAnimate(true);

        }}>Start Animation</Button>
      </Box>


      <Canvas style={{ height: '70vh', width: '100%' }} shadows >
        <Stars playing={animate}  ></Stars>
      </Canvas>

    </ >

  );
};

