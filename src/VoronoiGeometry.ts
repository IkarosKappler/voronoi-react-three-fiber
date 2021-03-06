/**
 * A THREE geometry that defines a 3D Voronoi visualisation from a 2D Voronoi diagram.
 *
 * @requires THREE.Geometry
 * @requires VoronoiCell
 *
 * @author   Ikaros Kappler
 * @version  1.0.0
 * @date     2021-01-10
 * @modified 2021-02-09 Added Sutherland-Hodgman polygon clipping.
 **/

import { Polygon } from 'plotboilerplate/src/js/Polygon';
import { Vertex } from 'plotboilerplate/src/js/Vertex';
import { XYCoords } from 'plotboilerplate/src/js/interfaces';
import { sutherlandHodgman } from 'plotboilerplate/src/js/utils/algorithms/sutherlandHodgman';
import { VoronoiCell } from 'plotboilerplate/src/js/utils/datastructures/VoronoiCell';
import { Face3, Geometry, Vector3 } from 'three';

interface CellIndices {
    bottomVertexIndices : Array<number>;
    topVertexIndices : Array<number>;
}

interface VoronoiGeometryProps {
    voronoiDiagram : Array<VoronoiCell>;
    clipPolygon : Polygon;
    voronoiCellScale : number;
}

// TODO: since version ^1.11.1 this function should be part of plotboilerplate
const cloneVertexArray = ( vertices : Array<XYCoords> ) : Array<Vertex> => {
    const result : Array<Vertex> = [];
    for( var i = 0; i < vertices.length; i++ ) {
	result.push( new Vertex(vertices[i].x, vertices[i].y) );
    }
    return result;
};

/**
 * @param {VoronoiCell[]} voronoiDiagram
 **/
export class VoronoiGeometry extends Geometry {

    
    private voronoiCellIndices : Array<CellIndices>;
    
    constructor( options : VoronoiGeometryProps ) {
	super();

	// interface CellIndices { bottomVertexIndices : number[], topVertexIndices : number[] }
	this.voronoiCellIndices= [];
	
	this.buildVertices( options );
	this.buildFaces( options );
    };

    buildVertices( options : VoronoiGeometryProps ) {
	var voronoiDiagram = options.voronoiDiagram;
	var clipPolygon = options.clipPolygon;
	for( var v in voronoiDiagram ) {
	    var cell : VoronoiCell = voronoiDiagram[v];

	    
	    var polygon = cell.toPolygon();
	    
	    // Crop too large Voronoi cells to fit inside the convex hull
	    polygon = new Polygon(
		cloneVertexArray(sutherlandHodgman(polygon.vertices, clipPolygon.vertices)),
		false
	    );
	    polygon.scale( options.voronoiCellScale, cell.sharedVertex );

	    // Create a cell
	    var bottomVertexIndices = [];
	    var topVertexIndices = [];
	    for( var i in polygon.vertices ) {
		bottomVertexIndices.push( this.vertices.length );	
		this.vertices.push( new Vector3( polygon.vertices[i].x, polygon.vertices[i].y, 0 ) );
		topVertexIndices.push( this.vertices.length );
		this.vertices.push( new Vector3( polygon.vertices[i].x, polygon.vertices[i].y, 0.1 ) ); // Height 
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
								cell.topVertexIndices[(i+1)%n],
								cell.topVertexIndices[i]
								) );
				// Fill top and bottom area
				this.faces.push( new Face3( cell.bottomVertexIndices[0],
								cell.bottomVertexIndices[i],
								cell.bottomVertexIndices[(i+1)%n] ) );
				this.faces.push( new Face3( cell.topVertexIndices[0],
								cell.topVertexIndices[(i+1)%n] ,
								cell.topVertexIndices[i] 
								) );
				}
		}	
    };

}
