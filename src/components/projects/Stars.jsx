import { useState, } from 'react';
import { useFrame, } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, } from '@react-three/drei';
import * as THREE from "three";

 
const angleToRadians = (angleInDeg) => (Math.PI / 180) * angleInDeg;

const Stars = ({ playing }) => {

  const star_sizes = [.05, .1, .2, .15, .05, .1];



  function Star(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;


    this.color = Math.random() < .9 ? '#30a7d7' : '#e57373';
    this.size = star_sizes[Math.floor(Math.random() * star_sizes.length)];


  };

  const number_stars = 295;
  const a = .5;

  const CreateStar = (angle, rotation, x_offset, y_offset, z_offset) => {

    return new Star(a * (Math.cos(angle + rotation) * Math.exp(angle)) + x_offset, a * (Math.sin(angle + rotation)) * Math.exp(angle) + y_offset, z_offset);
  };

  const [stars, setStars] = useState(() => {

    const stars = [];
    const numerator = 8;

    const rotation = Math.PI / numerator;

    for (let index = 0; index < number_stars; index++) {

 
      const mod = index;
      const angle = .025 * mod;
      const a = .5;
      var x_offset = 5 * Math.random();
      var y_offset = 5 * Math.random();
      var z_offset = 5 * Math.random();

 
      for (let i = 0; i < 2 * numerator + 1; i++) {

        if (mod < 115) {
          if (Math.random() < .1) {
            stars.push(CreateStar(angle, i * rotation, x_offset, y_offset, z_offset));
          }
        } else if (mod < 150) {
          if (Math.random() < .9) {
            stars.push(CreateStar(angle, i * rotation, x_offset, y_offset, z_offset));
          }
        } else if (mod < 200) {
          if (Math.random() < .9) {
            stars.push(CreateStar(angle, i * rotation, x_offset, y_offset, z_offset));
          }
        } else {

          stars.push(CreateStar(angle, i * rotation, x_offset, y_offset, z_offset));

        }
 

      }
 

    }



    return stars;
  });

  const update_stars = (angle) => {
    setStars(prev => {
      const temp = [...prev];
      temp.forEach((star) => {
        star.x = star.x * Math.cos(angle) - star.y * Math.sin(angle);
        star.y = star.x * Math.sin(angle) + star.y * Math.cos(angle);
      });

      return temp;


    });

  };

 

  const max_iterations = 2000;
  const [counter, setCounter] = useState(0);

  const [time_gap, setTimeGap] = useState(null);

  const [animationTime, setAnimationTime] = useState(.02);
  const [start, setStart] = useState(true);




  useFrame(({ clock }) => {
    if (playing && counter < max_iterations) {
      if (clock.elapsedTime > time_gap && !start) {
        update_stars(-.0005);
        setCounter(prev => prev + 1);
        setTimeGap(clock.elapsedTime + animationTime);
      }


      if (start) {

        setTimeGap(clock.elapsedTime + animationTime);
        setStart(false);
      }

    }



  });

  return (

    <>
      <PerspectiveCamera makeDefault position={[-15, 40, 59]} />

 
      {stars.map((ele, id) => {
        return (
          <mesh

            key={id}

            position={[ele.x, ele.z, -1 * ele.y]}>
            <sphereGeometry args={[ele.size, 16, 16]} />
            <meshBasicMaterial color={ele.color} />
          </mesh>
        );
      })}

 

      <ambientLight args={["#ffffff", 0.25]} />
      <spotLight args={["#ffffff", 2, 70, angleToRadians(45), 0.9]} position={[-2, 10, 0]} castShadow />

      <Environment background>
        <mesh>
          <sphereGeometry args={[50, 100, 100]} />
          <meshBasicMaterial color="#000000" side={THREE.BackSide} />
        </mesh>

      </Environment>
      <OrbitControls target={[5, 0, 0]} />
    </>

  );
};

export default Stars;