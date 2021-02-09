import { Bounds } from 'plotboilerplate/src/js/Bounds';
import { Polygon } from 'plotboilerplate/src/js/Polygon';
import { Triangle } from 'plotboilerplate/src/js/Triangle';
import { Delaunay } from 'plotboilerplate/src/js/utils/algorithms/delaunay';
import { delaunay2voronoi } from 'plotboilerplate/src/js/utils/algorithms/delaunay2voronoi';
import { VoronoiCell } from 'plotboilerplate/src/js/utils/datastructures/VoronoiCell';
import { Vertex } from 'plotboilerplate/src/js/Vertex';
import React, { useRef } from 'react';
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


interface VoronoiMeshProps extends MeshProps {
    voronoiDiagram : Array<VoronoiCell>;
    clipPolygon : Polygon;
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
		clipPolygon={props.clipPolygon}
		voronoiCellScale={props.voronoiCellScale} />
	    <orbitControls args={[camera, domElement]} />
	</>
    );
}

interface VoronoiPropState {
    cells: Array<VoronoiCell>;
    clipPolygon : Polygon;
}

export const MeshDisplay: React.FC<MeshProps> = (props) => {

    const [ voronoiState, setVoronoiDiagram ] =
	React.useState<VoronoiPropState>( { cells : [], clipPolygon : new Polygon([],false) } );

    React.useEffect( () => {
	const pointList : Vertex[] = [];
	for( var i = 0; i < 32; i++ ) {
            pointList.push( new Vertex( -1 + Math.random()*2, 
					-1 + Math.random()*2 
            ));
	}
	const delau : Delaunay = new Delaunay( pointList );
	const triangles : Array<Triangle>  = delau.triangulate();

	const voronoiBuilder : delaunay2voronoi = new delaunay2voronoi(pointList,triangles);
	const diagram : Array<VoronoiCell> = voronoiBuilder.build();
	const clipBoxPolygon : Polygon = Bounds.computeFromVertices( pointList ).toPolygon();

	setVoronoiDiagram( { cells : diagram, clipPolygon : clipBoxPolygon } );
    }, [setVoronoiDiagram] );

    const voronoiCellScale = 0.8;


    return (
	<Canvas>
	    <Scene voronoiDiagram={voronoiState.cells}
		   clipPolygon={voronoiState.clipPolygon}
		   voronoiCellScale={0.8} />
	</Canvas>

    )
}
