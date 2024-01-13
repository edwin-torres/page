import { ResponsiveBar } from '@nivo/bar'
export const age_data = [
    {
      "age": "Under 18",
      "male": 1641,
      "maleColor": "hsl(131, 70%, 50%)",
      "female": 2175,
      "femaleColor": "hsl(153, 70%, 50%)",
      
    },
    {
      "age": "18-20",
      "male": 1553,
      "maleColor": "hsl(13, 70%, 50%)",
      "female": 1958,
      "femaleColor": "hsl(267, 70%, 50%)",
      
    },
    {
        "age": "21-25",
        "male": 806,
        "maleColor": "hsl(131, 70%, 50%)",
        "female": 1020,
        "femaleColor": "hsl(153, 70%, 50%)",
        
      },
      {
        "age": "26-30",
        "male": 176,
        "maleColor": "hsl(13, 70%, 50%)",
        "female": 304,
        "femaleColor": "hsl(267, 70%, 50%)",
        
      },
      {
        "age": "31-40",
        "male": 95,
        "maleColor": "hsl(131, 70%, 50%)",
        "female": 258,
        "femaleColor": "hsl(153, 70%, 50%)",
        
      },
      {
        "age": "Over 40",
        "male": 83,
        "maleColor": "hsl(13, 70%, 50%)",
        "female": 123,
        "femaleColor": "hsl(267, 70%, 50%)",
        
      },
     
    
  ];

export const AgeBar = ({ data   }) => (
    <ResponsiveBar
        data={data}
        theme={{
            background: 'black',
            text: {
              fontSize: 18,
              fill: '#b0bec5'
      
            },
            

            axis:{
                legend:{
                    text:{
                        fontSize:30
                    }
                }
            },
            labels:{
                text:{
                    fontSize:15
                }
            }
            ,



          }}
        keys={[
            'male','female'
        ]}
        indexBy="age"
        margin={{ top: 20, right: 125, bottom: 75, left: 95    }}
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
            legend: 'Age',
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
        maxValue={4000}
         
        enableLabel={false}
        enableGridX={false}
        enableGridY={false}
    />
)
