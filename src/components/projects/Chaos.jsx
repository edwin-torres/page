import { useState } from 'react';
import { Canvas, } from '@react-three/fiber';
import Particles from './Particles';

import { Typography, Box, Link, Button } from '@mui/material';


export default function Chaos() {

  const [animate, setAnimate] = useState(false);
  return (

    < >
      <Box sx={{ textAlign: 'center',  }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>
          Use the mouse to zoom in/out and rotate. 
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'left' }}>
          I made this after watching <Link href="https://www.youtube.com/watch?v=IGlGvSXkRGI" target="_blank" underline="hover">this video</Link>.
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'left' }}>
          You can find more information here: <Link href="https://en.wikipedia.org/wiki/Chaos_game" target="_blank" underline="hover">Chaos Game</Link>.
        </Typography>


        <Button sx={{ mt: 1 }} variant="contained" onClick={() => {


          setAnimate(true);

        }}>Start Animation</Button>
      </Box>


      <Canvas style={{ height: '70vh', width: '100%' }} shadows >
        <Particles playing={animate}  ></Particles>
      </Canvas>

    </ >

  );
};

