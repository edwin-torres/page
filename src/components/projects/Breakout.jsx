import React, { useRef, useEffect } from "react";

import { Typography, Box, Link, Button } from '@mui/material';

 

function Breakout() {
  let canvas = useRef();
  const requestRef = useRef();

  useEffect(() => {
    play();
    console.log("Breakout MOUNTED");

    return () => {
      cancelAnimationFrame(requestRef.current);
      console.log("Breakout UNMONUNTED");
    };
    //   return () => {
    //     cancelAnimationFrame(requestRef.current);
    //     window.location.reload();
    //   }
  }); // I was getting an error when accessesing a different route

  const play = () => {
    let ctx = canvas.current.getContext("2d");

    ///////////Some Params//////////
    let b = {};
    let score = 0;
    let lives = 3;
    /////////////////////Colors//////////////////////
    // let colorArray = ['yellow','red','green','black','aqua'];
    let color = "white";
    let newColor = "";
    ////////////Ball///////////////
    let x = canvas.current.width / 2;
    let y = canvas.current.height - 30;
    let dx = -2;
    let dy = -2;
    let ballRadius = 10;

    function drawBall() {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    }
    ////////////////Paddle////////////////
    let paddleHeight = 10;
    let paddleWidth = 85;
    let paddleX = canvas.current.width / 2 - paddleWidth / 2;
    function drawPaddle() {
      ctx.beginPath();
      ctx.rect(
        paddleX,
        canvas.current.height - paddleHeight,
        paddleWidth,
        paddleWidth
      );
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    }

    ////////////////////////Bricks/////////////////////
    let brickRowCount = 3;
    let brickColumnCount = 5;
    let brickWidth = 75;
    let brickHeight = 10;
    let brickPadding = 10;
    let brickOffsetTop = 55;
    let brickOffsetLeft = 165;

    let bricks = [];
    let brickX = 0;
    let brickY = 0;

    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    function drawBricks() {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fillStyle = "white";
            ctx.fill();
          }
        }
      }
    }

    ///////////////CollisionDetection/////////////////

    function collisionDetection() {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          b = bricks[c][r];
          if (b.status === 1) {
            if (
              x > b.x &&
              x < b.x + brickWidth &&
              y > b.y &&
              y < b.y + brickHeight
            ) {
              dy = -dy;
              b.status = 0;
              score++;
            }
            if (score === brickColumnCount * brickRowCount) {
              alert("USER WINS!\nScore: " + score);
              document.location.reload();
              //clearInterval(interval);
            }
          }
        }
      }
    }

    /////////////Score///////////////////

    function drawScore() {
      ctx.font = "15px Arial";
      ctx.fillStyle = "white";
      ctx.fillText("Score: " + score, 8, 20);
    }

    //////////Lives/////////////////
    function drawLives() {
      ctx.font = "15px Arial";
      ctx.fillStyle = "white";
      ctx.fillText("Lives: " + lives, canvas.current.width - 65, 20);
    }

    //////////////UserControl//////////////////
    let rightPressed = false;
    let leftPressed = false;

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    // document.addEventListener("mousemove", mouseMoveHandler,false);
    canvas.current.addEventListener("mousemove", mouseMoveHandler, false);

    function mouseMoveHandler(e) {
      let relativeX = e.clientX - canvas.current.offsetLeft;
      if (
        relativeX > paddleWidth / 4 &&
        relativeX < canvas.current.width - paddleWidth / 4
      ) {
        paddleX = relativeX - paddleWidth / 2;
      }
    }
    function keyDownHandler(e) {
      if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
      } else {
        if (e.key === "Left" || e.key === "ArrowLeft") {
          leftPressed = true;
        }
      }
    }
    function keyUpHandler(e) {
      if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
      } else {
        if (e.key === "Left" || e.key === "ArrowLeft") {
          leftPressed = false;
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
      drawBall();
      drawPaddle();
      drawScore();
      drawLives();
      drawBricks();
      collisionDetection();

      //////////////Ball////////////////////////
      if (
        x + dx - ballRadius < 0 ||
        x + dx + ballRadius > canvas.current.width
      ) {
        dx = -dx;
        //newColor = colorArray[ Math.floor( Math.random()*colorArray.length )];

        while (color === newColor) {
          //newColor = colorArray[ Math.floor( Math.random()*colorArray.length )];
        }
        // color = newColor;
        // color = 'black';
      }
      if (y + dy - ballRadius < 0) {
        dy = -dy;
      } else {
        if (y + dy + ballRadius > canvas.current.height) {
          if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -1.03 * dy;
          } else {
            lives--;
            if (lives === 0) {
              alert("Game Over!");
              document.location.reload();
            } else {
              x = canvas.current.width / 2;
              y = canvas.current.height - 30;
              dx = -2;
              dy = -2;
              paddleX = canvas.current.width / 2 - paddleWidth / 2;
            }
          }
        }
      }

      x = x + dx;
      y = y + dy;
      ///////////////////////Paddle////////////////////

      if (rightPressed === true) {
        paddleX = paddleX + 7;
        if (paddleX + paddleWidth > canvas.current.width) {
          paddleX = canvas.current.width - paddleWidth;
        }
      }
      if (leftPressed === true) {
        paddleX = paddleX - 7;
        if (paddleX < 0) {
          paddleX = 0;
        }
      }

      requestRef.current = requestAnimationFrame(draw);
    }

    draw();
  };

  return (
    
    <Box sx={{  textAlign:'center', justifyItems:'center',   }}>
    
       
        <Typography variant="h3" sx={{textAlign:'center',  }}>Breakout</Typography>
        
       
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>
        Following this <Link href="https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript" target="_blank" underline="hover">canvas tutorial</Link>.
        </Typography>

        {/* <div className ="btn">
<button onClick = {play} >Play Game</button>

</div> */}
   
 
        <Box sx={{display:'relative'}}>


        
      <canvas
        style={{
          size: "100%",
          border: "10px solid #424242",

        }}
        ref={canvas}
        width="750"
        height="500"
      />

</Box>
   </Box>
  );
}

export default Breakout;
