
import { Canvas, } from '@react-three/fiber';

import Cube from './Cube'
import { Link, Typography, Box, } from '@mui/material';
import { useState } from 'react';
 




export default function Astar() {


  const [supported, _] = useState(browser==="chrome" || browser==="MS Edge Chromium");
  
  
  

  return (


    <>
    {supported?
    <>
    <Box sx={{ textAlign: 'center', m: 2 }}>
    <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>
          Use the mouse to zoom in/out and rotate. 
        </Typography>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>
          This is a visualizaion of the <Link href="https://en.wikipedia.org/wiki/A*_search_algorithm" target="_blank" underline="hover">A* search algorithm</Link>.

        </Typography>
       
      </Box>
      <Canvas style={{ height: '90vh', width: '100%', }} shadows >
        <Cube></Cube>
      </Canvas>
    </>
    :
    <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>
    Please use Chrome Browswer or Microsoft Edge. {browser} is not supported. 
  </Typography>
    }
      

    </>
  )
}




var browser = (function (agent) {
  switch (true) {
      case agent.indexOf("edge") > -1: return "MS Edge (EdgeHtml)";
      case agent.indexOf("edg") > -1: return "MS Edge Chromium";
      case agent.indexOf("opr") > -1 && !!window.opr: return "opera";
      case agent.indexOf("chrome") > -1 && !!window.chrome: return "chrome";
      case agent.indexOf("trident") > -1: return "Internet Explorer";
      case agent.indexOf("firefox") > -1: return "firefox";
      case agent.indexOf("safari") > -1: return "safari";
      default: return "other";
  }
})(window.navigator.userAgent.toLowerCase());
 