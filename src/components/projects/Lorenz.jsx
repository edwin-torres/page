import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Attractor from './Atractor'
import { Button, Box, Typography } from '@mui/material';


import Link from '@mui/material/Link';


export default function Lorenz() {

  const [camView, setCamView] = useState({
    ball1: false,
    ball2: false,
    default: true
  });


  return (


    < >



      <Box sx={{ textAlign: 'center', m: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>
          Use the mouse to zoom in/out and rotate. 
        </Typography>
       

        <Button sx={{ mt: 2,  mr: 2,  ml: 2 }} variant="contained" onClick={() => {

          setCamView(prev => {
            const temp = { ...prev };
            temp.ball1 = false;
            temp.ball2 = false;
            temp.default = true;

            return temp;
          });


        }}>Default</Button>

        <Button sx={{mt: 2,  mr: 2,  ml: 2 }} variant="contained" onClick={() => {

          setCamView(prev => {
            const temp = { ...prev };
            temp.ball1 = true;
            temp.ball2 = false;
            temp.default = false;

            return temp;
          });

        }}>Follow Ball 1</Button>


        <Button sx={{ mt: 2,  mr: 2,  ml: 2 }} variant="contained" onClick={() => {

          setCamView(prev => {
            const temp = { ...prev };
            temp.ball1 = false;
            temp.ball2 = true;
            temp.default = false;

            return temp;
          });

        }}>Follow Ball 2 </Button>



      </Box>
      <Canvas style={{ height: '50vh', width: '100%' }} shadows >
        <Attractor follow={camView}></Attractor>
      </Canvas>

      <Typography variant="h5" gutterBottom sx={{ textAlign: 'left', maxWidth:'555px' }}>
          I created this  <Link href="https://en.wikipedia.org/wiki/Lorenz_system" target="_blank" underline="hover">Lorenz  System</Link>  visualization after watching <Link href="https://youtu.be/fDek6cYijxI?si=IHO4v3pfxyJBv82F&t=282" target="_blank" underline="hover">this cool video</Link> by Derek Muller, Ph.D. 
          You can oberve two objects with very proximate initial position.  After a few seconds, their trajectories are very different.


        </Typography>


    </ >
  )
}