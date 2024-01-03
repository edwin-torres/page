import { useState, } from 'react';
import { useFrame, } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, } from '@react-three/drei';
import { Canvas, } from '@react-three/fiber';
import * as THREE from "three";



const angleToRadians = (angleInDeg) => (Math.PI / 180) * angleInDeg;

const Particles = ({ playing }) => {
  const side = 10;
  const small = side / 2;
  const long = small * Math.sqrt(3);



  const [initial_three, setInitial_Three] = useState(() => {

    return [[0, 0, 0], [small, long, 0], [side, 0, 0]];

  });

  const [points, setPoints] = useState(() => {
    const x = Math.random() * side;
    var y = 0;

    if (x < (small)) {
      y = Math.random() * ((long / small) * x);
    } else {
      y = Math.random() * ((-1 * long / small) * x + 2 * long);
    }



    return [[x, y, 0]];
  });


  const update_array = () => {

    const random_idx = Math.floor(Math.random() * 3);
    const random_vertex = initial_three[random_idx];
    setPoints((prev) => {
      const temp = [...prev];
      const latest_member = temp[temp.length - 1];
      const new_member = [.5 * (latest_member[0] + random_vertex[0]), .5 * (latest_member[1] + random_vertex[1]), 0]
      temp.push(new_member);
      return temp;
    });


  };

  const max_iterations = 5000;
  const [counter, setCounter] = useState(0);

  useFrame(() => {
    if (playing && counter < max_iterations) {
      update_array();
      setCounter(prev => prev + 1);
    }



  });

  return (

    <>
    

    
      <PerspectiveCamera makeDefault position={[5, 5, 15]} />

 

      {points.map((ele, id) => {
        return (
          <mesh

            key={id}
            onClick={update_array}
            position={ele}>
            <sphereGeometry args={[.015, 16, 16]} />
            <meshBasicMaterial color='#30a7d7' />
          </mesh>
        );
      })}
 

      <ambientLight args={["#ffffff", 2.25]} />
      <spotLight args={["#ffffff", 2, 70, angleToRadians(45), 0.9]} position={[-2, 10, 0]} castShadow />

      <Environment background>
        <mesh>
          <sphereGeometry args={[50, 100, 100]} />
          <meshBasicMaterial color="#000000" side={THREE.BackSide} />
        </mesh>

      </Environment>
      <OrbitControls target={[5, 5, 0]} />

   
    </>

  );
};

export default Particles;