import { Triangle } from 'plotboilerplate/src/js/Triangle';
import { Delaunay } from 'plotboilerplate/src/js/utils/algorithms/delaunay';
import { delaunay2voronoi } from 'plotboilerplate/src/js/utils/algorithms/delaunay2voronoi';
import { VoronoiCell } from 'plotboilerplate/src/js/utils/datastructures/VoronoiCell';
import { Vertex } from 'plotboilerplate/src/js/Vertex';
import React, { useRef, useState } from 'react';
import { Canvas, extend, MeshProps, ReactThreeFiber, useFrame, useThree } from 'react-three-fiber';
import { DoubleSide, Face3, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { VoronoiGeometry } from './VoronoiGeometry';

import type { Mesh } from 'three';


// https://www.gitmemory.com/issue/drcmda/react-three-fiber/130/504994917
declare module JSX{
  interface IntrinsicElements{
      "group": any,
      "geometry": any,
      "lineBasicMaterial": any,
      "mesh": any,
      "octahedronGeometry": any,
      "meshBasicMaterial": any,
      "orbitControls": any, //I added this
      "primitive": any, //I added this
      "ambientLight": any //I added this
  }
}

// https://spectrum.chat/react-three-fiber/general/property-orbitcontrols-does-not-exist-on-type-jsx-intrinsicelements~44712e68-4601-4486-b4b4-5e112f3dc09e
declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>
    }
  }
}


extend({ OrbitControls })


// interface IntrinsicElements{
//   "group": any,
//   "geometry": any,
//   "lineBasicMaterial": any,
//   "mesh": any,
//   "octahedronGeometry": any,
//   "meshBasicMaterial": any,
//   "orbitControls": any, //I added this
//   "primitive": any, //I added this
//   "ambientLight": any //I added this
// }


interface VoronoiMeshProps extends MeshProps {
    voronoiDiagram : Array<VoronoiCell>;
    voronoiCellScale : number;
}

const VoronoiMesh : React.FC<VoronoiMeshProps> = (props) => {

  const ref = useRef<Mesh>()

  const voronoiGeometry : VoronoiGeometry = new VoronoiGeometry( props );
  const vertices : Array<Vector3> = React.useMemo(() => voronoiGeometry.vertices.map(v => new Vector3(v.x,v.y,v.z)), [voronoiGeometry.vertices])
  const faces : Array<Face3> = React.useMemo(() => voronoiGeometry.faces.map(f => new Face3(f.a,f.b,f.c)), [voronoiGeometry.faces])

  return (
    <mesh 
      ref={ref}>
      <geometry attach="geometry" vertices={vertices} faces={faces} onUpdate={self => self.computeFaceNormals()} />
      <meshStandardMaterial color={'orange'} side={DoubleSide} />
    </mesh>
  )
  
};

/*
const MyMesh: React.FC<MeshProps> = (props) => {
  // This reference will give us direct access to the mesh
  const mesh = useRef<Mesh>()

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    if (mesh.current) mesh.current.rotation.x = mesh.current.rotation.y += 0.01
  })

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
        <boxBufferGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
} */

const Scene : React.FC<VoronoiMeshProps> = (props) => {
  const {
    camera,
    gl: { domElement }
  } = useThree()
  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <VoronoiMesh 
        position={[0,0,0]} 
        scale={[1,1,1]}
        voronoiDiagram={props.voronoiDiagram} 
        voronoiCellScale={props.voronoiCellScale} />
      <orbitControls args={[camera, domElement]} />
    </>
  )
}


export const MeshDisplay: React.FC<MeshProps> = (props) => {

  const width : number = 200;
  const height : number = 100;

  const [ voronoiDiagram, setVoronoiDiagram ] = React.useState<Array<VoronoiCell>>( [] );

  React.useEffect( () => {
     const pointList : Vertex[] = [];
     for( var i = 0; i < 32; i++ ) {
        pointList.push( new Vertex( Math.random(), // *width,
                    Math.random() // *height) 
        ));
     }
     const delau : Delaunay = new Delaunay( pointList );
     const triangles : Array<Triangle>  = delau.triangulate();

     var voronoiBuilder : delaunay2voronoi = new delaunay2voronoi(pointList,triangles);
     const diagram : Array<VoronoiCell> = voronoiBuilder.build();
     setVoronoiDiagram( diagram );
  }, [setVoronoiDiagram] );

  const voronoiCellScale = 0.8;


  return (
    <Canvas>
      <Scene voronoiDiagram={voronoiDiagram} voronoiCellScale={0.8} />
      {/* <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <VoronoiMesh 
        position={[0,0,0]} 
        voronoiDiagram={voronoiDiagram} 
        voronoiCellScale={voronoiCellScale} /> */}
    </Canvas>

  )
}