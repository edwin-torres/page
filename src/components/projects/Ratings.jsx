import { ResponsiveHeatMap } from '@nivo/heatmap'

import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
 


const Ratings = () => {
 
  const [episodesData, setEpisodesData] = useState(null);
  const [searchTitle, setSearchTitle] = useState('Game of Thrones');
  const [options, setOptions] = useState([]);
  const [heatData, setHeatData] = useState(got_data);
  const [open, setOpen] = useState(false);

  const handleHeatMapData = (seriesName, episodesData) => {

    const showKeys = Object.keys(episodesData['Tv_Show_Name']).filter(key => episodesData['Tv_Show_Name'][key] === seriesName).map(Number);
    var heatMapData = [];

    showKeys.forEach(elem => {
      var tempHeatElem = {};
      var tempData = [];
      var tempDatapoint = {};
      var idx = heatMapData.findIndex(heatElem => heatElem['id'] === `Season ${episodesData['seasonNumber'][elem]}`);

      if (idx > -1) {

        tempDatapoint['x'] = `Ep. ${episodesData['episodeNumber'][elem]}`;
        tempDatapoint['y'] = episodesData['averageRating'][elem];
        tempData = heatMapData[idx]['data'];
        tempData.push(tempDatapoint);
        heatMapData[idx]['data'] = tempData;

      } else {

        tempHeatElem['id'] = `Season ${episodesData['seasonNumber'][elem]}`;
        tempDatapoint['x'] = `Ep. ${episodesData['episodeNumber'][elem]}`;
        tempDatapoint['y'] = episodesData['averageRating'][elem];
        tempData.push(tempDatapoint);
        tempHeatElem['data'] = tempData;
        heatMapData.push(tempHeatElem);

      }

    });

    var exit = false;
    heatMapData.forEach(elem => {

      if (elem['data'].length > 35) {

        exit = true;
        console.log('Exited');

      }

    }
    );


    if (exit) {
      return
    }

    heatMapData.sort((a, b) => {
      const nameA = a.id.toUpperCase();
      const nameB = b.id.toUpperCase();

      const wordsA = nameA.split(' ');
      const wordsB = nameB.split(' ');

      const seriesNumA = parseInt(wordsA.slice(-1)[0])
      const seriesNumB = parseInt(wordsB.slice(-1)[0])

      if (seriesNumA < seriesNumB) {
        return -1;
      }
      if (seriesNumA > seriesNumB) {
        return 1;
      }

      return 0;
    });

    heatMapData.forEach(elem => {

      elem.data.sort((a, b) => {
        const nameA = a.x.toUpperCase();
        const nameB = b.x.toUpperCase();

        const wordsA = nameA.split(' ');
        const wordsB = nameB.split(' ');

        const seriesNumA = parseInt(wordsA.slice(-1)[0])
        const seriesNumB = parseInt(wordsB.slice(-1)[0])

        if (seriesNumA < seriesNumB) {
          return -1;
        }
        if (seriesNumA > seriesNumB) {
          return 1;
        }
        return 0;
      });
    });

    setHeatData(heatMapData);

  };


  useEffect(() => {
    (async () => {
      const ep = await fetchData(episodes_url).then(elem => {

        const temp = []
        Array.from(new Set(Object.values(elem.Tv_Show_Name))).forEach(title => {
          const temp1 = {};
          temp1['title'] = title;
          temp.push(temp1);
        });
        setEpisodesData(elem);


        temp.sort((a, b) => {
          const nameA = a.title.toUpperCase();
          const nameB = b.title.toUpperCase();


          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });

        setOptions(temp);

      });
 

    })();
  }, [])



  return (
    <>

      { 

        options.length > 0 ?
          <>
            <Box sx={{ bgcolor: 'white', width: 250, m: 'auto', borderRadius: '16px' }}>


              <Autocomplete
                open={open}
                onInputChange={(_, value) => {
                  if (value.length === 0) {
                    if (open) setOpen(false);
                  } else {
                    if (!open) setOpen(true);
                  }
                }}
                onClose={() => setOpen(false)}

                id="free-solo-2-demo"
                onChange={(event, value) => setSearchTitle(value)}
                options={options.map((option) => option.title)}
                renderInput={(params) => (
                  <TextField

                    {...params}
                    label="Search input"

                    InputProps={{
                      ...params.InputProps,
                      type: 'search',
                    }}
                  />
                )}
              />


            </Box>

            <Box sx={{ p: 2, bgcolor: 'black', width: 250, m: 'auto', borderRadius: '16px' }}>

              <Button
                sx={{ width: 250, m: 'auto', borderRadius: '16px' }}
                variant='contained'
                onClick={() => {
                  if (searchTitle) {
                    handleHeatMapData(searchTitle, episodesData);

                  }

                }}

              >Create Heat Map</Button>
            </Box>

            <Box sx={{ height: 75, color: '#ffffff', bgcolor: 'black', m: 'auto', borderRadius: '16px', textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
              <Typography sx={{ pt: 2 }} variant="h4" gutterBottom>
                {searchTitle} Episode Ratings
              </Typography>
            </Box>

            <Box sx={{ height: 75, color: '#ffffff', bgcolor: 'black', m: 'auto', borderRadius: '16px', textAlign: 'center', display: { xs: 'block', sm: 'none' } }}>
              <Typography sx={{ pt: 2 }} variant="h4" gutterBottom>
                Please Rotate Phone <ScreenRotationIcon></ScreenRotationIcon> or Enlarge Screen <AspectRatioIcon></AspectRatioIcon>
              </Typography>
            </Box>

            <Box sx={{ height: 800, color: 'black', bgcolor: 'white', mt: 5, display: { xs: 'none', sm: 'block' } }}>

              <MyResponsiveHeatMap data={heatData} seriesTitle={searchTitle}></MyResponsiveHeatMap>

            </Box>
          </>

          :
          <Typography>LOADING...</Typography>


      }


    </>
  );

}

export default Ratings;



const got_data = [
  {
    "id": "Season 1",
    "data": [
      {
        "x": "Ep. 1",
        "y": 8.9
      },
      {
        "x": "Ep. 2",
        "y": 8.6
      },
      {
        "x": "Ep. 3",
        "y": 8.5
      },
      {
        "x": "Ep. 4",
        "y": 8.6
      },
      {
        "x": "Ep. 5",
        "y": 9
      },
      {
        "x": "Ep. 6",
        "y": 9.1
      },
      {
        "x": "Ep. 7",
        "y": 9.1
      },
      {
        "x": "Ep. 8",
        "y": 8.9
      },
      {
        "x": "Ep. 9",
        "y": 9.6
      },
      {
        "x": "Ep. 10",
        "y": 9.4
      }
    ]
  },
  {
    "id": "Season 2",
    "data": [
      {
        "x": "Ep. 1",
        "y": 8.6
      },
      {
        "x": "Ep. 2",
        "y": 8.4
      },
      {
        "x": "Ep. 3",
        "y": 8.7
      },
      {
        "x": "Ep. 4",
        "y": 8.6
      },
      {
        "x": "Ep. 5",
        "y": 8.6
      },
      {
        "x": "Ep. 6",
        "y": 8.9
      },
      {
        "x": "Ep. 7",
        "y": 8.8
      },
      {
        "x": "Ep. 8",
        "y": 8.6
      },
      {
        "x": "Ep. 9",
        "y": 9.7
      },
      {
        "x": "Ep. 10",
        "y": 9.3
      }
    ]
  },
  {
    "id": "Season 3",
    "data": [
      {
        "x": "Ep. 1",
        "y": 8.6
      },
      {
        "x": "Ep. 2",
        "y": 8.5
      },
      {
        "x": "Ep. 3",
        "y": 8.7
      },
      {
        "x": "Ep. 4",
        "y": 9.5
      },
      {
        "x": "Ep. 5",
        "y": 8.9
      },
      {
        "x": "Ep. 6",
        "y": 8.7
      },
      {
        "x": "Ep. 7",
        "y": 8.6
      },
      {
        "x": "Ep. 8",
        "y": 8.9
      },
      {
        "x": "Ep. 9",
        "y": 9.9
      },
      {
        "x": "Ep. 10",
        "y": 9.1
      }
    ]
  },
  {
    "id": "Season 4",
    "data": [
      {
        "x": "Ep. 1",
        "y": 9
      },
      {
        "x": "Ep. 2",
        "y": 9.7
      },
      {
        "x": "Ep. 3",
        "y": 8.7
      },
      {
        "x": "Ep. 4",
        "y": 8.7
      },
      {
        "x": "Ep. 5",
        "y": 8.6
      },
      {
        "x": "Ep. 6",
        "y": 9.7
      },
      {
        "x": "Ep. 7",
        "y": 9
      },
      {
        "x": "Ep. 8",
        "y": 9.7
      },
      {
        "x": "Ep. 9",
        "y": 9.6
      },
      {
        "x": "Ep. 10",
        "y": 9.6
      }
    ]
  },
  {
    "id": "Season 5",
    "data": [
      {
        "x": "Ep. 1",
        "y": 8.3
      },
      {
        "x": "Ep. 2",
        "y": 8.3
      },
      {
        "x": "Ep. 3",
        "y": 8.4
      },
      {
        "x": "Ep. 4",
        "y": 8.5
      },
      {
        "x": "Ep. 5",
        "y": 8.5
      },
      {
        "x": "Ep. 6",
        "y": 7.9
      },
      {
        "x": "Ep. 7",
        "y": 8.8
      },
      {
        "x": "Ep. 8",
        "y": 9.8
      },
      {
        "x": "Ep. 9",
        "y": 9.4
      },
      {
        "x": "Ep. 10",
        "y": 9.1
      }
    ]
  },
  {
    "id": "Season 6",
    "data": [
      {
        "x": "Ep. 1",
        "y": 8.4
      },
      {
        "x": "Ep. 2",
        "y": 9.3
      },
      {
        "x": "Ep. 3",
        "y": 8.6
      },
      {
        "x": "Ep. 4",
        "y": 9
      },
      {
        "x": "Ep. 5",
        "y": 9.7
      },
      {
        "x": "Ep. 6",
        "y": 8.3
      },
      {
        "x": "Ep. 7",
        "y": 8.5
      },
      {
        "x": "Ep. 8",
        "y": 8.3
      },
      {
        "x": "Ep. 9",
        "y": 9.9
      },
      {
        "x": "Ep. 10",
        "y": 9.9
      }
    ]
  },
  {
    "id": "Season 7",
    "data": [
      {
        "x": "Ep. 1",
        "y": 8.5
      },
      {
        "x": "Ep. 2",
        "y": 8.8
      },
      {
        "x": "Ep. 3",
        "y": 9.1
      },
      {
        "x": "Ep. 4",
        "y": 9.7
      },
      {
        "x": "Ep. 5",
        "y": 8.7
      },
      {
        "x": "Ep. 6",
        "y": 9
      },
      {
        "x": "Ep. 7",
        "y": 9.4
      }
    ]
  },
  {
    "id": "Season 8",
    "data": [
      {
        "x": "Ep. 1",
        "y": 7.6
      },
      {
        "x": "Ep. 2",
        "y": 7.9
      },
      {
        "x": "Ep. 3",
        "y": 7.5
      },
      {
        "x": "Ep. 4",
        "y": 5.5
      },
      {
        "x": "Ep. 5",
        "y": 6
      },
      {
        "x": "Ep. 6",
        "y": 4
      }
    ]
  }
];


const MyResponsiveHeatMap = ({ data, seriesTitle }) => (
  <ResponsiveHeatMap
    data={data}
    theme={{
      background: 'black',
      text: {
        fontSize: 20,
        fill: '#85d5f5'

      },
      legends: {
        title: {
          text: {
            fontSize: 20,

          },

        }
      }
    }}
    margin={{ top: 75, right: 90, bottom: 75, left: 150 }}
    valueFormat=">-.2s"
    axisTop={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: -90,
      legend: ` `,
      legendPosition: 'left',
      legendOffset: -55,

    }}

    borderRadius={15}
    xInnerPadding={0.05}
    yOuterPadding={0.05}
    yInnerPadding={0.05}
    forceSquare={true}
    borderColor={{
      from: 'color',
      modifiers: [
        [
          'darker',
          '0.5'
        ]
      ]
    }}

    axisLeft={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: ' ',
      legendPosition: 'middle',
      legendOffset: -72,

    }}
    colors={{
      type: 'diverging',
      scheme: 'red_yellow_green',
      divergeAt: 0.55,
      minValue: 0,
      maxValue: 10
    }}
    emptyColor="#555555"
    labelTextColor={{
      from: 'color',
      modifiers: [
        [
          'darker',
          '50'
        ]
      ]
    }}
    legends={[
      {
        anchor: 'bottom',
        translateX: 0,
        translateY: 40,
        length: 500,
        thickness: 15,
        direction: 'row',
        tickPosition: 'after',
        tickSize: 9,
        tickSpacing: 6,
        tickOverlap: false,
        tickFormat: ' >-.2s',
        title: 'Ratings',
        titleAlign: 'start',
        titleOffset: 5
      }
    ]}
  />
)



const episodes_url = 'https://raw.githubusercontent.com/edwin-torres/ratings/main/episodes.json';


async function fetchData(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res.json())
      .then((jsonData) => resolve(jsonData));
  });
}

