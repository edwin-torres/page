import * as React from 'react';
 
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { NavLink } from "react-router-dom";
import { Box } from '@mui/material';

 
export default function BasicCard({name, description, appRoute, code_url}) {
  return (
    <Card sx={{p:0,m:0,bgcolor:'#d7ccc8' , borderRadius:'16px',justifyContent:'center',  textAlign:'center', display:'flex'  }}>
      <CardContent>
        <Box sx={{  p:0,m:0,  height:200, width:355, }}>

      
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
           
        </Typography>
        <Typography variant="h5" component="div" sx={{ mt:3, mb:3 }}>
          {name}
        </Typography>
         
        <Typography sx={{ mb: 3 }} variant="body2">
          {description}
          <br />
         
        </Typography>
    
        <Button
                 
                component={NavLink} to={ appRoute}
                 
                //onClick={handleCloseNavMenu}
                sx={{ m: 1 , bgcolor:'#30a7d7', '&.MuiButton-root:hover':{bgcolor: '#F15A59'}   }}
                variant='contained'  size="small"
        > Web App</Button>

        <Button
                 
                 component={NavLink} to={ code_url}
                 target="_blank"
                 //onClick={handleCloseNavMenu}
                 sx={{ m: 1 , bgcolor:'#30a7d7', '&.MuiButton-root:hover':{bgcolor: '#F15A59'}  }}
                 variant='contained'  size="small"
         > Code</Button>

</Box>
      </CardContent>
      <CardActions >
        
       
      </CardActions>
    </Card>
  );
}