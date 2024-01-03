import React, { useRef, useEffect, useState } from "react";

import { Box, Button, Typography ,Link} from '@mui/material';
import * as tf from '@tensorflow/tfjs';
 
let info = [];
let pixels = []
function Mnist() {
  let canvas = useRef();

  let [predictionNum, setpredictionNum] = useState(-1);
  const [draw, setDraw] = useState(true);
  const [showButton, setShowButton] = useState(false);
 
//s
  useEffect(() => {

    play();
    console.log("MNIST MOUNTED");

    return () => {
      //clear();
      console.log("MNIST UNMONUNTED");
    };
  },[]);

  const play = () => {

    const cxt = canvas.current.getContext("2d");
    canvas.current.width = 280;

    canvas.current.height = 280;

   
    cxt.lineWidth = 10;
    cxt.strokeStyle = "red";
    cxt.beginPath();
    cxt.rect(20, 280 * .2, 240, 280 * .7);
    cxt.stroke();


    //Eventlisteners
    
        let painting = false;
        canvas.current.addEventListener("mousedown", startPainting);
        function startPainting() {

          if(draw){
            painting = true;
          }else{
            painting = false;
          }
          


        }
    
        canvas.current.addEventListener("mouseup", endPainting);
        function endPainting() {
          painting = false;
          cxt.beginPath();
          setShowButton(true);
        }
        canvas.current.addEventListener("mousemove", drawCurve);
    
        function drawCurve(e) {
    
          if (!painting) {
            return;
          }
          cxt.lineWidth = 22;
          cxt.lineCap = "round";
          cxt.beginPath();
          let relativeX = e.clientX - canvas.current.offsetLeft;
          let relativeY = e.clientY - canvas.current.offsetTop;
    
          info.push(relativeX);
          info.push(relativeY);
    
          cxt.lineTo(relativeX, relativeY);
          cxt.strokeStyle = "white";
          cxt.stroke();
        }

  
    
  };



  function imageData() {

    let pixelData = []
    const cxt = canvas.current.getContext("2d");

    let x = 0;
    let y = 0;
    let half = 0


    half = (info.length) / 2;
    pixelData = info;
    clear();


    cxt.scale(.095, .095);

    for (let i = 0; i < half; i++) {
      x = pixelData[Math.floor(2 * i)];
      y = pixelData[Math.floor(2 * i) + 1];
      cxt.lineTo(x, y);
      cxt.strokeStyle = "white";
      cxt.stroke();

    }
    cxt.setTransform(1, 0, 0, 1, 0, 0);



    const imgData = cxt.getImageData(0, 0, 28, 28).data


    for (let i = 0; i < imgData.length; i++) {
      if (i % 4 === 1) {

        pixels.push(imgData[i] > 0 ? 1 : 0)
      }
    }


  }



  function indexOfMax(arr) {
    if (arr.length === 0) {
      return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        maxIndex = i;
        max = arr[i];
      }
    }

    return maxIndex;
  }
  async function makePrediction() {


    const model = await tf.loadLayersModel('https://raw.githubusercontent.com/edwin-torres/cnn/main/model.json');

    const example = tf.tensor4d(pixels, [1, 28, 28, 1]);

    const prediction = model.predict(example);

    setpredictionNum(indexOfMax(prediction.dataSync()));
    info = [];
    pixels = [];
  }



  function clear() {
    info = [];

    const cxt = canvas.current.getContext("2d");
    cxt.beginPath();
    cxt.strokeStyle = "#DC143C";
    cxt.clearRect(0, 0, canvas.current.width, canvas.current.height);
  }



  return (
    <div>

      

      <Box sx={{ textAlign: 'center', m: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'left' }}>
        Using <Typography   sx={{  textAlign: 'left', color:'red', fontSize:35 }} gutterBottom  display="inline"> ONE</Typography> stroke, use the mouse to draw a single digit inside the red box.  Cover as much of the red box as possible.  
        </Typography>
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'left' }}>
          The nueral network used in this project was developed in  <Link href="https://github.com/edwin-torres/cnn/blob/main/DigitPrediction-CNN.ipynb" target="_blank" underline="hover">this jupyter notebook.</Link>.
          </Typography>

          <Typography variant="h4" gutterBottom sx={{ textAlign: 'left', color:'NavajoWhite', fontSize:55 }}>
          Prediction: {predictionNum > -1 ? predictionNum : ' '}
          </Typography>
         
         
          

        </Box>

      

 

     {draw? <div style={{
           
          textAlign: "center",
        }}><canvas
        style={{
          size: "100%",
          border: "5px solid black",
          background: 'black',
       
        }}
        ref={canvas}
      /></div>:<></>}

     

      {draw && showButton?   <Box sx={{ m: 2, textAlign:'center' }} >


   
        <Button
          onClick={() => {
            imageData();
            makePrediction();
            setDraw(false);
          }}
          sx={{ m: 2, textAlign:'center' }} variant="contained"

        >
          Make Prediction
        </Button>   </Box>


      :<></>}


    </div>
  );
}

export default Mnist;


