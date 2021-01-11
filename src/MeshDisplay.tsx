import { Triangle } from 'plotboilerplate/src/js/Triangle';
import { Delaunay } from 'plotboilerplate/src/js/utils/algorithms/delaunay';
import { delaunay2voronoi } from 'plotboilerplate/src/js/utils/algorithms/delaunay2voronoi';
import { VoronoiCell } from 'plotboilerplate/src/js/utils/datastructures/VoronoiCell';
import { Vertex } from 'plotboilerplate/src/js/Vertex';
import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, MeshProps, useFrame } from 'react-three-fiber';
import { Face3, Vector3 } from 'three';

import { VoronoiGeometry } from './VoronoiGeometry';

import type { Mesh } from 'three';
interface VoronoiMeshProps extends MeshProps {
    voronoiDiagram : Array<VoronoiCell>;
    voronoiCellScale : number;
}

const VoronoiMesh : React.FC<VoronoiMeshProps> = (props) => {

  const ref = useRef<Mesh>()

  const voronoiGeometry : VoronoiGeometry = new VoronoiGeometry( props );
  // <VoronoiGeometry {...props} />

  // const vertices = React.useMemo(() => cubeVertices.map(v => new THREE.Vector3(...v)), [])
  // const faces = React.useMemo(() => cubeFaces.map(f => new THREE.Face3(...f)), [])

  const vertices = React.useMemo(() => voronoiGeometry.vertices.map(v => new Vector3(v.x,v.y,v.z)), [])
  const faces = React.useMemo(() => voronoiGeometry.faces.map(f => new Face3(f.a,f.b,f.c)), [])


  return (
    <mesh ref={ref}>
      <geometry attach="geometry" vertices={vertices} faces={faces} onUpdate={self => self.computeFaceNormals()} />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  )
  
};

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
}


export const MeshDisplay: React.FC<MeshProps> = (props) => {

  const width : number = 600;
  const height : number = 300;

  const [ voronoiDiagram, setVoronoiDiagram ] = React.useState<Array<VoronoiCell>>( [] );

  React.useEffect( () => {
     const pointList : Vertex[] = [];
     for( var i = 0; i < 32; i++ ) {
        pointList.push( new Vertex( Math.random()*width - width/2,
  		      	      Math.random()*height - height/2 ) );
     }
     const delau : Delaunay = new Delaunay( pointList );
     const triangles : Array<Triangle>  = delau.triangulate();
     // trianglesPointCount = pointList.length;
     // voronoiDiagram = [];

     var voronoiBuilder : delaunay2voronoi = new delaunay2voronoi(pointList,triangles);
     const diagram : Array<VoronoiCell> = voronoiBuilder.build();
     setVoronoiDiagram( diagram );
  } );

  return (
  <Canvas>
    <ambientLight />
    <pointLight position={[10, 10, 10]} />
    <VoronoiMesh 
      position={[0,0,0]} 
      voronoiDiagram={voronoiDiagram} 
      voronoiCellScale={0.8} />
  </Canvas>
  )
}