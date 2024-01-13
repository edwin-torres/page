import { ResponsiveBar } from '@nivo/bar'
export const enrollment_data = [
    {
      "status": "Full Time",
      "male": 1449,
      "maleColor": "hsl(131, 70%, 50%)",
      "female": 2133,
      "femaleColor": "hsl(153, 70%, 50%)",
      
    },
    {
      "status": "Part Time",
      "male": 2905,
      "maleColor": "hsl(13, 70%, 50%)",
      "female": 3705,
      "femaleColor": "hsl(267, 70%, 50%)",
      
    },
     
    
  ];

export const MyResponsiveBar = ({ data   }) => (
    <ResponsiveBar
        data={data}
        theme={{
            background: 'black',
            text: {
              fontSize: 22,
              fill: '#b0bec5'
      
            },
            

            axis:{
                legend:{
                    text:{
                        fontSize:22
                    }
                }
            },
            labels:{
                text:{
                    fontSize:18
                }
            }
            ,

          }}
        keys={[
            'male','female'
        ]}
        indexBy="status"
        margin={{ top: 20, right: 125, bottom: 75, left: 95  }}
        padding={0.25}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'set2' }}
         
       
        borderRadius={4}
        borderWidth={1}
        borderColor={{ theme: 'labels.text.fill' }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 2,
            tickPadding: 2,
            tickRotation: 0,
            legend: 'Enrollment Type',
            legendPosition: 'middle',
            legendOffset: 55,
            truncateTickAt: 0
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Total Enrollment',
            legendPosition: 'middle',
            legendOffset: -80,
            truncateTickAt: 0, 
            
        }}
        labelSkipWidth={8}
        labelSkipHeight={7}
        labelTextColor="black"
        legends={[
            {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: -149,
                itemsSpacing: 2,
                itemWidth: 99,
                itemHeight: 25,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
        role="application"
        ariaLabel="Nivo bar chart demo"
        groupMode="grouped"
        maxValue={7000}
    />
)
