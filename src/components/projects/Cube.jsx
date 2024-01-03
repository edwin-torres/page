import { useRef, useState,  useEffect, Fragment } from 'react'
import {  useFrame } from '@react-three/fiber'
import {  OrbitControls,  PerspectiveCamera, Environment, Text, } from '@react-three/drei'

import * as THREE from "three"
 


const angleToRadians = (angleInDeg) => (Math.PI / 180) * angleInDeg;
 

export default function Cube() {
  
 
  
  const cube_size = 40;
  var ballId = 0;
  var rowId = 0;
  var ball_x = 0;
  var ball_y = 0;
  const openSet_color = '#03a9f4';
  const closeSet_color = '#FF0C0C';
  const available_color = 'white';
  const blocked_color = 'black';
  const path_color = '#efe436';
  const current_color = openSet_color;
  const start_color = '#51ed15';
  const end_color = '#d715ed';
  // used to stop the animation after
  // max number of calculations
   
  const mesh = useRef()
  // Set up state for the hovered and active state

  const [active, setActive] = useState(false)
  const [activeID, setActiveID] = useState(-1);

  // Nodes still needed to be evaluated
  const [openSet, setOpenSet] = useState([]);

  // Nodes already visited and evaluated
  const [closedSet, setClosedSet] = useState([]);

  const [userPromtText, setUserPromtText] = useState('Choose Starting Node');
  const [textColor, setTextColor] = useState(start_color);
  const [endSelected, setEndSelected] = useState(false);
  const [finished, setFinished] = useState(false);
  const [animate, setAnimate] = useState(false);

  
  function BallObject(x, y, z) {
    this.f = 0;
    this.g = Number.MAX_VALUE;
    this.h = 0;

    this.prev = null;

    this.isBlocked = Math.random() < .25 ? true : false;

    this.isStart = false;
    this.isEnd = false;

    this.cameFrom = null;

    this.x = x;
    this.y = y;
    this.z = z;

    this.id = -1;
    this.color = this.isBlocked ? blocked_color : available_color;

    this.isInOpenSet = false;
    this.neighbors = [];




  };

  //used to find neighbors
  //up,down,left,right,and diagonals
  const transformations = [[0, -1], [0, 1], [-1, 0], [1, 0], [1, 1], [-1, -1], [-1, 1], [1, -1]];

 

  const [allowStart, setAllowStart] = useState(true);
  const [allowEnd, setAllowEnd] = useState(false);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);


  const [userStart, setUserStart] = useState(null);
  const [userEnd, setUserEnd] = useState(null);


  const pathCamPoints = [];
  
  
  const [balls, setBalls] = useState(() => {

    const grid_list = [];

    for (let i = 0; i < cube_size; i++) {
      const ball_list = [];

      for (let j = 0; j < cube_size; j++) {

        var temp_ball = new BallObject(i, j, 0);
 

        ball_list.push(temp_ball);

      }

      grid_list.push(ball_list);


    }

    grid_list.forEach((row) => {

      row.forEach((ball) => { 

        // Adding Neighbors
        transformations.forEach(([x, y]) => {

          const newX = ball.x + x;
          const newY = ball.y + y;

          if ((newX >= 0) && (newY >= 0) && (newX <= cube_size - 1) && (newY <= cube_size - 1)) {
            if (!grid_list[newX][newY].isBlocked) {
              ball.neighbors.push(grid_list[newX][newY])
            }

          }



        });

      });
    });

 


    return grid_list;
  });


  const distance = (nodeA, nodeB) => {
    return Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
  };



  const step = () => {

    openSet.forEach(node => { 
      if(!node.isStart && !node.isEnd){
        node.color = openSet_color;
      }
       });
    closedSet.forEach(node => { 
      if(!node.isStart && !node.isEnd){
        node.color = closeSet_color;
      }
      
       });


    var min_f_index = 0;
    if (openSet.length > 0) {

      for (let index = 0; index < openSet.length; index++) {
        if (openSet[index].f < openSet[min_f_index].f) {
          min_f_index = index;
        }

      }

      var current = openSet[min_f_index];
      

      if (!current.isStart && !current.isEnd) {
        current.color = current_color;
      }



      for (let index = openSet.length - 1; index >= 0; index--) {

        if (openSet[index] === current) {
          openSet.splice((openSet.indexOf(openSet[index])), 1);

        }
      }

      var continueFlag = true;
      setOpenSet(prevOpen => {
        const temp = [...prevOpen];

        current.neighbors.forEach(neighbor => {
          if (!closedSet.includes(neighbor)) {
            if (neighbor === end) {
              end.prev = current;
              var goal = end;


             
              var stop = 500;
           
              while (goal.prev && stop > 0) {
                if(!goal.isEnd && !goal.isStart){
                  goal.color = path_color;
                }
                pathCamPoints.push([goal.x,goal.y,goal.z]);
               
                goal = goal.prev;
                stop = stop - 1;
  

              }
              pathCamPoints.push([start.x,start.y,start.z]);
              continueFlag = false;
              setFinished(true);
              setAnimate(false);
              setUserPromtText('Path Found!');
              setTextColor(path_color); 

            }

            if (continueFlag) {
              if (!neighbor.isBlocked && !openSet.includes(neighbor)) {
                neighbor.color = openSet_color;
                neighbor.g = current.g + distance(neighbor, current);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.prev = current;
                temp.push(neighbor);
              }
            }
 
          }

        });
        return temp;
      }



      );

      setClosedSet(prev => {
        const temp = [...prev];
        temp.push(current);
        return temp;
      });

    } else {

      if(userStart === userEnd ){
        console.log('Start is end');
        setUserPromtText('Start is End.');
        setFinished(true);
    }else{
      console.log('NO solution.  Empty openset. ');
      setUserPromtText('No Path Possible.');
      setTextColor('red');
      setFinished(true);

    } 
      
    }

  };
 
 

  const handleStart = (start) => {

    setUserStart(start);

  };

  const handleEnd = (end) => {

    setUserEnd(end);

  };


  const updateStartandEnd = (start, end) => {

    if (start===end) {return}

    start.g = 0;
    start.f = distance(start, end);

    start.isStart = true;
    start.isEnd = false;
    start.isBlocked = false;

    end.isStart = false;
    end.isEnd = true;
    end.isBlocked = false;

    start.color = start_color;
    end.color = end_color;
  

    setStart(start);
    setEnd(end);
    balls.forEach(row =>
      row.forEach(ball => ball.h = distance(ball, end))



    );

    setOpenSet(prev => {
      const temp = [...prev];

      temp.push(start);
      return temp;
    }
 

    );

 
  };

  
  

  const [time_gap, setTimeGap] = useState(null);
 
  const [animationTime, setAnimationTime] = useState(.025);
  const [playing, setPlaying] = useState(false);
   

  useFrame(({ clock }) => {
 
  if(playing){
     
     if( endSelected){
      
      updateStartandEnd(userStart, userEnd);
      
      setEndSelected(false);
      setAnimate(true);
      setTimeGap(clock.elapsedTime+animationTime);
     

     }


     if(clock.elapsedTime>time_gap){

      
      if(!finished && animate){
      
        step();
       }


       
       setTimeGap(clock.elapsedTime+animationTime);

       if(finished && !animate){
        setPlaying(false);
         
        setAnimationTime(0.0245)
       }
 
    }

   
  } 


  })


 
  return (
    <>


      <Text color={textColor} fontSize={2}   anchorX="left" anchorY="middle" position={[-2, cube_size + 2, 0]}>
        {userPromtText}
      </Text>

      <Text color={openSet_color} fontSize={2}  anchorX="left" anchorY="middle" position={[cube_size*.55, cube_size + 4.5, 0]}>
        Nodes in queue to be explored. 
      </Text>

      <Text color={closeSet_color} fontSize={2}    anchorX="left" anchorY="middle" position={[cube_size*.55, cube_size + 2, 0]}>
        Nodes already explored. 
      </Text>
      <PerspectiveCamera makeDefault position={ [25, 18, 75]}   />
       
  

      {balls.map((row, idx) => {

        row.id = rowId;
        rowId = rowId + 1;

        return (
          <Fragment key={idx}>


            {
              row.map((point, id) => {

                point.id = ballId;
                ballId = ballId + 1;

                ball_x = point.id % cube_size;
                ball_y = point.id % cube_size;

                return (

                  <mesh
                    ref={mesh}
                    scale={activeID === point.id && active ? 1.5 : 1}
                    onClick={(event) => {
                      

                      if (allowStart && !balls[row.id % cube_size][point.id % cube_size].isBlocked) {
                        point.color = start_color;
                        balls[row.id % cube_size][point.id % cube_size].isStart = true;
                        handleStart(balls[row.id % cube_size][point.id % cube_size]);
                        
                        setAllowStart(false);
                        setUserPromtText('Choose Ending Node');
                        setTextColor(end_color);
                        setAllowEnd(true);
                        setPlaying(true);
                      }
                      if (allowEnd && !balls[row.id % cube_size][point.id % cube_size].isBlocked) {
                        point.color = end_color;
                       
                          handleEnd(balls[row.id % cube_size][point.id % cube_size]);
                      
                        
                         
                        setAllowEnd(false);
                        setEndSelected(true);
                      }

                      if (activeID != point.id) {
                        setActiveID(point.id)
                        setActive(true)
                      } else { setActive(!active) }

                    }}


                    key={id} position={ [point.x, point.y, point.z]} castShadow >


                    <sphereGeometry args={[0.40, 16, 16]} />
                    <meshStandardMaterial color={point.color}  />


                  </mesh>

                );
              })
            }
          </Fragment>

        );
 

      })}

 
<ambientLight args={["#ffffff", 1.75]} />
      <spotLight args={["#ffffff", 1555, 70, angleToRadians(45), 0.9]} position={[60, 55, 15]} castShadow />

      <Environment background>
        <mesh>
          <sphereGeometry args={[50, 100, 100]} />
          <meshBasicMaterial color="#000000" side={THREE.BackSide} />
        </mesh>

      </Environment>
      <OrbitControls target={ [25, 18, 0]} />
    </>
  )
}
 


