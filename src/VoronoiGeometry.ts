/**
 * A THREE geometry that defines a 3D Voronoi visualisation from a 2D Voronoi diagram.
 *
 * @requires THREE.Geometry
 * @requires VoronoiCell
 *
 * @author  Ikaros Kappler
 * @version 1.0.0
 * @date    2021-01-10
 **/

import { VoronoiCell } from 'plotboilerplate/src/js/utils/datastructures/VoronoiCell';
import { Face3, Geometry, Vector3 } from 'three';

interface CellIndices {
    bottomVertexIndices : Array<number>;
    topVertexIndices : Array<number>;
}

interface VoronoiGeometryProps {
	voronoiDiagram : Array<VoronoiCell>;
	voronoiCellScale : number;
}

/**
 * @param {VoronoiCell[]} voronoiDiagram
 **/
export class VoronoiGeometry extends Geometry {

    
    private voronoiCellIndices : Array<CellIndices>;
    
    constructor( options : VoronoiGeometryProps ) {

		// THREE.Geometry.call( this );
		super();

		// interface CellIndices { bottomVertexIndices : number[], topVertexIndices : number[] }
		this.voronoiCellIndices= [];
		
		this.buildVertices( options );
		this.buildFaces( options );
    };

    buildVertices( options : VoronoiGeometryProps ) {
		var voronoiDiagram = options.voronoiDiagram;
		for( var v in voronoiDiagram ) {
			var cell : VoronoiCell = voronoiDiagram[v];
			var polygon = cell.toPolygon();
			polygon.scale( options.voronoiCellScale, (cell as unknown).sharedVertex );

			// Create a cell
			var bottomVertexIndices = [];
			var topVertexIndices = [];
			for( var i in polygon.vertices ) {
			bottomVertexIndices.push( this.vertices.length );	
			this.vertices.push( new Vector3( polygon.vertices[i].x, polygon.vertices[i].y, 0 ) );
			topVertexIndices.push( this.vertices.length );
			this.vertices.push( new Vector3( polygon.vertices[i].x, polygon.vertices[i].y, 16 ) ); // Height
			}

			this.voronoiCellIndices.push( { bottomVertexIndices : bottomVertexIndices, topVertexIndices : topVertexIndices } );
		}	
    };

    buildFaces( options : VoronoiGeometryProps ) {
		for( var c in this.voronoiCellIndices ) {

			// Now create faces
			var cell = this.voronoiCellIndices[c];
			var n = cell.bottomVertexIndices.length;
			for( var i = 0; i < n; i++) {
			// Fill sides 
			this.faces.push( new Face3( cell.bottomVertexIndices[i],
							cell.bottomVertexIndices[(i+1)%n],
							cell.topVertexIndices[i] ) );
			this.faces.push( new Face3( cell.bottomVertexIndices[(i+1)%n],
							cell.topVertexIndices[i],
							cell.topVertexIndices[(i+1)%n]
							) );
			// Fill top and bottom area
			this.faces.push( new Face3( cell.bottomVertexIndices[0],
							cell.bottomVertexIndices[i],
							cell.bottomVertexIndices[(i+1)%n] ) );
			this.faces.push( new Face3( cell.topVertexIndices[0],
							cell.topVertexIndices[i],
							cell.topVertexIndices[(i+1)%n] ) );
			}
		}	
    };

}
