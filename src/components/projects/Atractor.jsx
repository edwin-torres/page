import { useState, } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, OrbitControls, PerspectiveCamera, Environment, } from '@react-three/drei';
import * as THREE from "three";
  
const angleToRadians = (angleInDeg) => (Math.PI / 180) * angleInDeg;

const Attractor = ({ follow }) => {


  //Parameters
  const sigma = 10.0;
  const beta = 8.0 / 3.0;
  const rho = 28.0;
  var dt = .005;

  // used to stop the animation after
  // max number of calculations
  const max_calculations = 25000;
  const [idx, setIdx] = useState(0);

  // coordinates of first object
  const [x, setX] = useState(.01);
  const [y, setY] = useState(0.02);
  const [z, setZ] = useState(0);

  const [dx, setDX] = useState((sigma * (y - x)) * dt);
  const [dy, setDY] = useState((x * (rho - z) - y) * dt);
  const [dz, setDZ] = useState((x * y - beta * z) * dt);

  // coordinates of second object
  const [a, setA] = useState(.01);
  const [b, setB] = useState(.05);
  const [c, setC] = useState(0);

  const [da, setDA] = useState((sigma * (b - a)) * dt);
  const [db, setDB] = useState((a * (rho - c) - b) * dt);
  const [dc, setDC] = useState((a * b - beta * c) * dt);

  // needed for drawing path
  const [points, setPoints] = useState([new THREE.Vector3(x, y, z)]);
  const [points1, setPoints1] = useState([new THREE.Vector3(a, b, c)]);

  // needed for showing object moving

  const [ballPoints, setBallPoints] = useState([x, y, z]);
  const [ballPoints1, setBallPoints1] = useState([a, b, c]);
 
  const [camX, setCamX] = useState(x);
  const [camY, setCamY] = useState(y);
  const [camZ, setCamZ] = useState(z);
 

  useFrame(({ clock }) => {


    if (idx < max_calculations) {

      setIdx(ele => ele + 1)

      setDX((sigma * (y - x)) * dt);
      setDY((x * (rho - z) - y) * dt);
      setDZ((x * y - beta * z) * dt);

      setDA((sigma * (b - a)) * dt);
      setDB((a * (rho - c) - b) * dt);
      setDC((a * b - beta * c) * dt);

      setX(prev => {
        if (follow.ball1) {
          setCamX(prev - dx);
        }

        return prev + dx;
      });
      setY(prev => {

        if (follow.ball1) {
          setCamY(prev - dy);
        }

        return prev + dy;
      });
      setZ(prev => {
        if (follow.ball1) {
          setCamZ(prev - dz);
        }

        return prev + dz;
      });

      setA(prev => {

        if (follow.ball2) {
          setCamX(prev - da);
        }

        return prev + da;
      });
      setB(prev => {
        if (follow.ball2) {
          setCamY(prev - db);
        }
        return prev + db;
      });
      setC(prev => {
        if (follow.ball2) {
          setCamZ(prev - dc);
        }

        return prev + dc;

      });


      setPoints(prev => {
        const temp = [...prev]

        temp.push(new THREE.Vector3(x, y, z))

        return temp;

      })


      setPoints1(prev => {
        const temp = [...prev]

        temp.push(new THREE.Vector3(a, b, c))

        return temp;

      })


      setBallPoints(old => {
        const temp = [...old];

        temp[0] = x
        temp[1] = y
        temp[2] = z

        //setCamCoordinates(old);

        return temp;
      }
      );

      setBallPoints1(old => {
        const temp = [...old];

        temp[0] = a
        temp[1] = b
        temp[2] = c


        return temp;
      }
      );



    };





  });

  return (
    <>

      <PerspectiveCamera makeDefault position={follow.default ? [0, 25, 125] : [camX, camY + 2, camZ + 10]} />

      <mesh position={ballPoints} castShadow >
        <sphereGeometry args={[.25, 32, 32]} />
        <meshStandardMaterial color='#30a7d7' />
      </mesh>

      <mesh position={ballPoints1} castShadow >
        <sphereGeometry args={[.25, 32, 32]} />
        <meshStandardMaterial color='#e57373' />
      </mesh>

      <Line points={points}
        color={'#30a7d7'}
        opacity={1}
        transparent
        lineWidth={2}

      ></Line>

      <Line points={points1}
        color={'#e57373'}
        opacity={1}
        transparent
        lineWidth={2}

      ></Line>



      <ambientLight args={["#ffffff", 0.25]} />
      <spotLight args={["#ffffff", 2, 70, angleToRadians(45), 0.9]} position={[-2, 10, 0]} castShadow />

      <Environment background>
        <mesh>
          <sphereGeometry args={[50, 100, 100]} />
          <meshBasicMaterial color="#000000" side={THREE.BackSide} />
        </mesh>
      </Environment>
      <OrbitControls target={follow.default ? [0, 0, 0] : [camX, camY, camZ - 2]} />
    </>
  )
};
 

export default Attractor;