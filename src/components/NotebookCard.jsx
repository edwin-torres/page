import * as React from 'react';
 
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { NavLink } from "react-router-dom";
import { Box } from '@mui/material';

 
export default function BasicCard({name, description, code_url}) {
  return (
    <Card sx={{p:0,m:0,bgcolor:'#d7ccc8' , borderRadius:'16px',justifyContent:'center',  textAlign:'center', display:'flex'  }}>
      <CardContent>
        <Box sx={{  p:0,m:0,  height:200, width:355,    }}>

      
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
           
        </Typography>

        <Box sx={{justifyContent:'center',  textAlign:'center', display:'flex'  }}>
        <Typography variant="h5" component="div" sx={{ mt:3, mb:3,   maxWidth:200, minHeight:75}}>
          {name}
        </Typography>

        </Box>
         
        <Typography sx={{ mb: 3 }} variant="body2">
          {description}
          <br />
         
        </Typography>
     

        <Button
                 
                 component={NavLink} to={ code_url}
                 target="_blank"
                 //onClick={handleCloseNavMenu}
                 sx={{ m: 1 , bgcolor:'#30a7d7', '&.MuiButton-root:hover':{bgcolor: '#F15A59'}  }}
                 variant='contained'  size="small"
         > Notebook</Button>

</Box>
      </CardContent>
      <CardActions >
        
       
      </CardActions>
    </Card>
  );
}