
import { ResponsivePie } from '@nivo/pie';
import { Box, Typography } from '@mui/material';

const split = {
    'Academic Majors': {
        'Male': 3285,
        'Female': 4693
    },
    'Vocational Majors': {
        'Male': 740,
        'Female': 801
    },
    'Tech-Prep Majors': {
        'Male': 329,
        'Female': 344
    }
}

export const MyResponsivePie = ({ data }) => (
    <ResponsivePie
        data={data}
        tooltip={({
            datum: {
                id,
                value,
                color
            }
        }) => <Box style={{
            padding: 12,
            color,
            background: '#222222'
        }}>
                <strong>
                    {id}<br /> Total Enrollment: {split[id].Female + split[id].Male}
                </strong>
                <Typography>-----------</Typography>


                <strong>
                    Male: {split[id].Male}
                </strong>
                <br />
                <strong>
                    Female: {split[id].Female}
                </strong>
                <Typography>-----------</Typography>

            </Box>}



        arcLabel={e => e.value + "%"}
        theme={{
            background: 'black',
            text: {
                fontSize: 22,
                fill: '#b0bec5'

            },
            labels: {
                text: {
                    fontSize: 22
                }
            }
            ,

            axis: {

                legend: {
                    text: {
                        fontSize: 22
                    }
                }
            }

        }}
        margin={{ top: 35, right: 55, bottom: 70, left: 95 }}
        cornerRadius={5}
        activeInnerRadiusOffset={22}
        activeOuterRadiusOffset={16}
        colors={{ scheme: 'accent' }}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    '0.6'
                ]
            ]
        }}
        arcLinkLabelsSkipAngle={15}
        arcLinkLabelsTextOffset={4}
        arcLinkLabelsTextColor="#e3f2fd"
        arcLinkLabelsOffset={-7}
        arcLinkLabelsStraightLength={28}
        arcLinkLabelsThickness={5}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsRadiusOffset={0.75}
        arcLabelsSkipAngle={23}
        arcLabelsTextColor="black"



        legends={[
            {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 20,
                translateY: 45,
                itemsSpacing: 0,
                itemWidth: 210,
                itemHeight: 15,
                itemTextColor: '#e3f2fd',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 20,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
    />
)


export const major_data = [
    {
        "id": "Academic Majors",
        "label": "Academic Majors",
        "value": 78.28,
        "color": "hsl(3, 70%, 50%)"
    },
    {
        "id": "Vocational Majors",
        "label": "Vocational Majors",
        "value": 15.12,
        "color": "hsl(242, 70%, 50%)"
    },
    {
        "id": "Tech-Prep Majors",
        "label": "Tech-Prep Majors",
        "value": 6.60,
        "color": "hsl(105, 70%, 50%)"
    },

];