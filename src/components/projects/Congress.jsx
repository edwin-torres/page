 
import { ResponsiveStream } from '@nivo/stream'
import { Link,  Box, Button, Typography } from "@mui/material";
import { congress_data } from './CongressData';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';

 
const Congress = () => {
   

    return(
        
<>

<Box sx={{ textAlign: 'center', m: 2, display: { xs: 'none', sm: 'block' } }}>
<Typography variant="h5" gutterBottom sx={{ textAlign: 'left' }}>
          Source:  <Link href="https://github.com/unitedstates/congress-legislators" target="_blank" underline="hover">unitedstates github</Link> 

        </Typography>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'left' }}>
          Data Preparation:  <Link href="https://github.com/edwin-torres/congress/blob/main/Congress.ipynb" target="_blank" underline="hover">code</Link> 

        </Typography>
       
      </Box>
        <Box sx={{ height: 75, color: '#ffffff', bgcolor: 'black', m: 'auto', borderRadius: '16px', textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
        <Typography sx={{ pt: 2 }} variant="h4" gutterBottom>
          Composition of U.S. Congress <br></br> by Generation (1940-2024)
        </Typography>
        
      </Box>

      <Box sx={{ height: 75, color: '#ffffff', bgcolor: 'black', m: 'auto', borderRadius: '16px', textAlign: 'center', display: { xs: 'block', sm: 'none' } }}>
        <Typography sx={{ pt: 2 }} variant="h4" gutterBottom>
          Please Rotate Phone <ScreenRotationIcon></ScreenRotationIcon> or Enlarge Screen <AspectRatioIcon></AspectRatioIcon>
        </Typography>
      </Box>

     

        <Box sx={{ height:{ xs: 400, lg:800 } ,  width:'80%',  color: 'black', bgcolor: 'white',  display: { xs: 'none', sm: 'block' } , aspectRatio: .99, m:'auto', mt:5, }}>

        <MyResponsiveStream data={congress_data}  ></MyResponsiveStream>

      </Box>


      
</>
    );

}

export default Congress;

  
const MyResponsiveStream = ({ data  }) => (
    <ResponsiveStream
        data={data}
        theme={{
            background: 'black',
            text: {
              fontSize: 14,
              fill: '#85d5f5'
      
            },
            legends: {
              title: {
                text: {
                  fontSize: 20,
                  fill: '#85d5f5'
                },
      
              }
            }
          }}
        curve="basis"
        keys={['Progressive',
        'Missionary',
        'Lost',
        'Greatest',
        'Silent',
        'Baby Boomer',
        'Generation X',
        'Millennial',
        'Generation Z']}
        margin={{ top: 20, right: 125, bottom: 50, left: 60 }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendOffset: 36, 
            format:function(value){ 
                const year = value + 1940;
                if (year%10 === 0 ){return year.toString();};
                return '';
            }
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendOffset: -40, 
            format:function(value){ 
                const new_val = value+50;


                return new_val.toString() + '%';
            }
        }}
        enableGridX={false}
        enableGridY={false}
        offsetType="silhouette"
        colors={{ scheme: 'category10' }}
        fillOpacity={0.85}
        borderColor={{ theme: 'background' }}
        defs={[
            {
                id: 'dots',
                type: 'patternDots',
                background: 'inherit',
                color: '#2c998f',
                size: 4,
                padding: 2,
                stagger: true
            },
            {
                id: 'squares',
                type: 'patternSquares',
                background: 'inherit',
                color: '#e4c912',
                size: 6,
                padding: 2,
                stagger: true
            }
        ]}
        fill={[
            {
                match: {
                    id: 'Paul'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'Marcel'
                },
                id: 'squares'
            }
        ]}
        dotSize={8}
        dotColor={{ from: 'color' }}
        dotBorderWidth={2}
        dotBorderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.7
                ]
            ]
        }}
        legends={[
            {
                anchor: 'bottom-right',
                 
                direction: 'column',
                translateX: 65,
                itemWidth: 55,
                itemHeight: 30,
                itemTextColor: '#ffffff',
                symbolSize: 13,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#85d5f5'
                        }
                    }
                ]
            }
        ]}
      
    />
)
