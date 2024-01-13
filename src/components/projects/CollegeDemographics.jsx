
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import { enrollment_data, MyResponsiveBar } from './Demographics/Enrollment';
import { major_data, MyResponsivePie } from './Demographics/Majors';
import { Link,  Box, Button, Typography } from "@mui/material";
import { AgeBar, age_data } from './Demographics/Age';
 
const Demographics = () =>{


    return(
        
        <>
        
        <Box sx={{ textAlign: 'center', m: 2, display: { xs: 'none', sm: 'block' } }}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
                  Source:  <Link href="https://www.laredo.edu/about/institutional-research-and-planning/_files/Students%20Demographics%20by%20Semester%20FALL%202023%20Nov%20171.pdf" target="_blank" underline="hover">Laredo College Fall 2023 Data</Link> 
        
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
              This data provides an overview of the student population at Laredo College in Fall 2023, highlighting its diversity and educational preferences.
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
               <strong style={{color:'#009688'}}> Gender Distribution: </strong> There is a higher number of female students compared to male students, with females constituting over 57% of the total headcount.
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
                <strong style={{color:'#009688'}}>Enrollment Status: </strong>A significant majority of students are enrolled part-time, which may indicate that many students are balancing education with other commitments like work or family.
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
                <strong style={{color:'#009688'}}>Major Preferences:</strong> Academic majors are the most popular choice among students, followed by vocational and tech-prep majors. This suggests a strong inclination towards academic and traditional educational paths.
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
                <strong style={{color:'#009688'}}> Age Diversity: </strong>The age distribution is varied, with the largest group being those aged under 18, followed closely by the 18-20 age group. The majority of students are in the traditional college age range, but there is also a notable presence of older students.
                </Typography>
               
              </Box>

              

<Box sx={{ height: 75, color: '#f1f8e9', bgcolor: 'black', m: 'auto', borderRadius: '16px', textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ pt: 1 }} variant="h3" gutterBottom>
                  Enrollement Status
                </Typography>
                
              </Box>
        
              <Box sx={{ height: 75, color: '#ffffff', bgcolor: 'black', m: 'auto', borderRadius: '16px', textAlign: 'center', display: { xs: 'block', sm: 'none' }  }}>
                <Typography sx={{ pt: 2 }} variant="h4" gutterBottom>
                  Please Rotate Phone <ScreenRotationIcon></ScreenRotationIcon> or Enlarge Screen <AspectRatioIcon></AspectRatioIcon>
                </Typography>
              </Box>
        


<Box sx={{ height:{ sm: 400, lg:800 } ,  width:'80%',   color: 'black', bgcolor: 'white',    display: { xs: 'none', sm: 'block' }, aspectRatio: .99, m:'auto' ,}}>

           
<MyResponsiveBar data={enrollment_data}></MyResponsiveBar>      

</Box>


<Box sx={{ height: 75, color: '#f1f8e9', bgcolor: 'black', m: 'auto', borderRadius: '16px', textAlign: 'center', display: { xs: 'none', sm: 'block' }, mt:10 }}>
                <Typography sx={{ pt: 2 }} variant="h3" gutterBottom>
                Declared Major
                </Typography>
                
              </Box>
        
            
        
             
        
              <Box sx={{ height:{ sm: 400, lg:800 } ,  width:'80%',   color: 'black', bgcolor: 'white',    display: { xs: 'none', sm: 'block' }, aspectRatio: .99, m:'auto'}}>
      <MyResponsivePie data={major_data}></MyResponsivePie>       
      
</Box>


<Box sx={{ height: 75, color: '#f1f8e9', bgcolor: 'black', m: 'auto', borderRadius: '16px', textAlign: 'center', display: { xs: 'none', sm: 'block' }, mt:10  }}>
                <Typography sx={{ pt: 2 }} variant="h3" gutterBottom>
               Age Distribution
                </Typography>
                
              </Box>
         
             
        
              <Box sx={{ height:{ sm: 400, lg:800 } ,  width:'80%',   color: 'black', bgcolor: 'white',    display: { xs: 'none', sm: 'block' }, aspectRatio: .99, m:'auto'}}>
      
      <AgeBar data={age_data}></AgeBar>      
      
</Box>
        
        </>
            );
};


export default Demographics;