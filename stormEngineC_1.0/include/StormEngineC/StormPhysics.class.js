/* FILE OBSOLETE */
/*
StormEngineC. 3D Engine Javascript.
Copyright (C) 2010 Roberto Gonzalez. Stormcolor.com.

This file is part of StormEngineC.

StormEngineC is free software; you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

StormEngineC is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with StormEngineC; If not, see <http://www.gnu.org/licenses/>.
 */

/* 
StormPhysics

La gravedad se añade como una fuerza.
Filtro colision-> substeps, colDetect de nodo, dynamic/static, impacto?, area deteccion proporcional a velocidad, AABB por nodo, AABB por cara(array), rayTriangleIntersect, dot.
Calculos -> DYNAMIC-STATIC, DYNAMIC-DYNAMIC, dir A y B tras impacto, diferencia velocidad (masa, parametro de impacto b, coef. restitución)

TODO Calculos: velocidad rotacional (parametro de impacto b)
 */
StormPhysics = function() {
	this.nodes = stormEngineC.nodes;
	this.lines = stormEngineC.lines;
	
	this.lastUpdatePhysics = 0;
};

StormPhysics.prototype.collisionUpdateForces = function(elapsed) {
	
	// Recorremos ahora los objetos dinamicos de la escena para saber si existe algun impacto entre ellos.
	// De ser asi variamos de nuevo el collisionVecForce de cada nodo dinamico
	var arrayVertex;
	var idx3;
	var n;
	var nb;
	var b;
	var bO;
	var vecVertex;
	var u;
	var v;
	var vecNormal;
	var nodoTieneImpacto = false;
	var substeps = 0;
	if(this.lastUpdatePhysics > substeps) {
		this.lastUpdatePhysics = 0;
		for(n = 0; n < this.nodes.length; n++) {
			if(this.nodes[n].collisionDetect == true && this.nodes[n].collisionType == 'DYNAMIC') { 
				/*var line = new Object; // mostrar vector fuerza
				line.origin = this.nodes[n].getPosition();
				line.end = this.nodes[n].getPosition().add(this.nodes[n].collisionVecForce.x(10.0));
				this.lines.push(line);*/
				
					nodoTieneImpacto = false;
					for(nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
						// recorremos vertices del objeto(nodo) "dinamico" segun su indice
						if(nodoTieneImpacto == false) {
							arrayVertex = [];
							bO = this.nodes[n].buffersObjects[nb];
							for(b = 0; b < bO.nodeMeshIndexArray.length; b++) {
								idx3 = bO.nodeMeshIndexArray[b] * 3;
								
								// vertice
								var matVertexA = $M16([
									                     1.0, 0.0, 0.0, bO.nodeMeshVertexArray[idx3],
									                     0.0, 1.0, 0.0, bO.nodeMeshVertexArray[idx3+1],
									                     0.0, 0.0, 1.0, bO.nodeMeshVertexArray[idx3+2],
									                     0.0, 0.0, 0.0, 1.0
									                     ]);
								matVertexA = this.nodes[n].mWMatrixFrame.x(matVertexA);
								
								vecVertex = $V3([matVertexA.e[3], matVertexA.e[7], matVertexA.e[11]]); // posicion xyz en WORLD SPACE de un vertice
								
								// si tenemos 3 vertices sacamos normal y mandamos a comprobar intersecciones de este vector(vertice dinamico) con los triangulos de la escena
								arrayVertex.push(vecVertex);
								if(arrayVertex.length == 3) {
									u = arrayVertex[1].subtract(arrayVertex[0]);
									v = arrayVertex[2].subtract(arrayVertex[0]);
									vecNormal = u.cross(v); // normal al triangulo
									
									var rEnd = vecNormal.normalize().x(0.02);
									//rEnd = rEnd.x(this.nodes[n].collisionVecForce.modulus());
									rEnd = vecVertex.add(rEnd);
									nodoTieneImpacto = this.collisionRayScene(vecVertex, rEnd, n);
			
								    arrayVertex = [];
								}
								
							}
						}
					}
				
			}
		}
	} else if(this.lastUpdatePhysics <= substeps && elapsed != undefined){
		this.lastUpdatePhysics += elapsed;
	}
	// recorremos nodos dinamicos de nuevo y suamos al mWMatrix de cada uno su vector collisionVecForce que tienen almacenados para el frame actual
	for(var n = 0; n < this.nodes.length; n++) {
		if(this.nodes[n].collisionDetect == true && this.nodes[n].collisionType == 'DYNAMIC') {
			this.nodes[n].setTranslate($V3([this.nodes[n].collisionVecForce.e[0], this.nodes[n].collisionVecForce.e[1], this.nodes[n].collisionVecForce.e[2]]), 'WORLD');
		}
	}
};

StormPhysics.prototype.collisionRayScene = function(vecRayOrigin, vecRayEnd, numNode) {
	/*var line = new Object; // mostrar normales objeto dinamico
	line.origin = vecRayOrigin;
	line.end = vecRayEnd;
	this.lines.push(line);*/
	
	var matRayEnd;
	var n;
	var nb;
	var b;
	var margin = 0.02;
	for(n = 0; n < this.nodes.length; n++) {
		// recorremos de nuevo objetos de la escena para comprobar si existe interseccion con algun triangulo de la escena del vector vecRayOrigin-vecRayEnd
		// que viene dado por el vertice del objeto dinamico. No comprobamos las intersecciones con el objeto(nodo) del actual vertice (numNode)
		if(n != numNode) {
			if(this.nodes[n].collisionDetect == true) {
				var matBLFar = $M16([
				                     1.0, 0.0, 0.0, this.nodes[n].collisionAABB_BLFarX,
				                     0.0, 1.0, 0.0, this.nodes[n].collisionAABB_BLFarY,
				                     0.0, 0.0, 1.0, this.nodes[n].collisionAABB_BLFarZ,
				                     0.0, 0.0, 0.0, 1.0
				                     ]);
				matBLFar = this.nodes[n].mWMatrixFrame.x(matBLFar);
				
				var matTRNear = $M16([
			                     1.0, 0.0, 0.0, this.nodes[n].collisionAABB_TRNearX,
			                     0.0, 1.0, 0.0, this.nodes[n].collisionAABB_TRNearY,
			                     0.0, 0.0, 1.0, this.nodes[n].collisionAABB_TRNearZ,
			                     0.0, 0.0, 0.0, 1.0
			                     ]);
				matTRNear = this.nodes[n].mWMatrixFrame.x(matTRNear);
				// AABB de nodo
				if(vecRayEnd.e[0] >= matBLFar.e[3]-0.03 && vecRayEnd.e[0] <= matTRNear.e[3]+0.03) {
					if(vecRayEnd.e[1] >= matBLFar.e[7]-0.03 && vecRayEnd.e[1] <= matTRNear.e[7]+0.03) {
						if(vecRayEnd.e[2] >= matBLFar.e[11]-0.03 && vecRayEnd.e[2] <= matTRNear.e[11]+0.03) {
							
							
							// er tema k mas kema
							for(nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
								// recorremos vertices del objeto(nodo) segun su indice
								var bO = this.nodes[n].buffersObjects[nb];
								for(b = 0; b < bO.nodeMeshIndexArray.length/3; b++) {
									// AABB por caras
									var saltosIdx = b*3; 
									
									var aabbIdx = bO.nodeMeshIndexArray[saltosIdx]*6;
									
									var matBLFarF = $M16([
								                     1.0, 0.0, 0.0, bO.nodeMeshAABBArray[aabbIdx],
								                     0.0, 1.0, 0.0, bO.nodeMeshAABBArray[aabbIdx+1],
								                     0.0, 0.0, 1.0, bO.nodeMeshAABBArray[aabbIdx+2],
								                     0.0, 0.0, 0.0, 1.0
								                     ]);
									matBLFarF = this.nodes[n].mWMatrixFrame.x(matBLFarF);
									
									var matTRNearF = $M16([
								                     1.0, 0.0, 0.0, bO.nodeMeshAABBArray[aabbIdx+3],
								                     0.0, 1.0, 0.0, bO.nodeMeshAABBArray[aabbIdx+4],
								                     0.0, 0.0, 1.0, bO.nodeMeshAABBArray[aabbIdx+5],
								                     0.0, 0.0, 0.0, 1.0
								                     ]);
									matTRNearF = this.nodes[n].mWMatrixFrame.x(matTRNearF);
								
									if(vecRayEnd.e[0] >= matBLFarF.e[3]-0.03 && vecRayEnd.e[0] <= matTRNearF.e[3]+0.03) {
										if(vecRayEnd.e[1] >= matBLFarF.e[7]-0.03 && vecRayEnd.e[1] <= matTRNearF.e[7]+0.03) {
											if(vecRayEnd.e[2] >= matBLFarF.e[11]-0.03 && vecRayEnd.e[2] <= matTRNearF.e[11]+0.03) {
															var idxA = bO.nodeMeshIndexArray[saltosIdx] * 3; // )* 3 = itemSize
															var idxB = bO.nodeMeshIndexArray[saltosIdx+1] * 3;
															var idxC = bO.nodeMeshIndexArray[saltosIdx+2] * 3;
															
															// vertice
															var matVertexA = $M16([
																                     1.0, 0.0, 0.0, bO.nodeMeshVertexArray[idxA],
																                     0.0, 1.0, 0.0, bO.nodeMeshVertexArray[idxA+1],
																                     0.0, 0.0, 1.0, bO.nodeMeshVertexArray[idxA+2],
																                     0.0, 0.0, 0.0, 1.0
																                     ]);
															matVertexA = this.nodes[n].mWMatrixFrame.x(matVertexA);
															
															var matVertexB = $M16([
																                     1.0, 0.0, 0.0, bO.nodeMeshVertexArray[idxB],
																                     0.0, 1.0, 0.0, bO.nodeMeshVertexArray[idxB+1],
																                     0.0, 0.0, 1.0, bO.nodeMeshVertexArray[idxB+2],
																                     0.0, 0.0, 0.0, 1.0
																                     ]);
															matVertexB = this.nodes[n].mWMatrixFrame.x(matVertexB);
															
															var matVertexC = $M16([
																                     1.0, 0.0, 0.0, bO.nodeMeshVertexArray[idxC],
																                     0.0, 1.0, 0.0, bO.nodeMeshVertexArray[idxC+1],
																                     0.0, 0.0, 1.0, bO.nodeMeshVertexArray[idxC+2],
																                     0.0, 0.0, 0.0, 1.0
																                     ]);
															matVertexC = this.nodes[n].mWMatrixFrame.x(matVertexC);

																
																
																
															var vecVertexA = $V3([matVertexA.e[3], matVertexA.e[7], matVertexA.e[11]]); // posicion xyz en WORLD SPACE de un vertice
															var vecVertexB = $V3([matVertexB.e[3], matVertexB.e[7], matVertexB.e[11]]);
															var vecVertexC = $V3([matVertexC.e[3], matVertexC.e[7], matVertexC.e[11]]);
															
															
															// si tenemos 3 vertices podemos comprobar interseccion de vecRayOrigin, vecRayEnd con el triangulo dado por los 3 vertices
						
						
															
															var stormRayTriangle = new StormRayTriangle();
															stormRayTriangle.setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC);
															var p = stormRayTriangle.getP();
															var normal = stormRayTriangle.getN();
															
														    if(p > 0.0){
														    	if(this.nodes[numNode].collisionAnterior == false) {
															    	//if(this.nodes[numNode].collisionVecForce.dot(normal) < 0.0) {
															    		
																    	var dirAReflect = this.nodes[numNode].collisionVecForce.normalize().reflect(normal);
																    	var velA = this.nodes[numNode].collisionVecForce.modulus();
																    	
																    	var conservacion = (this.nodes[numNode].collisionCoefR + this.nodes[n].collisionCoefR)/2.0;
																    	
																    	
																		if(this.nodes[n].collisionType == 'STATIC') {
																			velA = velA * conservacion;
																			
																	    	this.nodes[numNode].collisionVecForce = dirAReflect.x(velA);
																		} else {
																			var velB = this.nodes[n].collisionVecForce.modulus();
																			if(velA >= velB) {
																				// - Velocidad total es velA + velB.
																				// - Para A tenemos que calcular un vector V que desplaze su actual dir collisionVecForce a su dir 
																				// 		tras un impacto (VR)(que es el vector resultante de reflejar dir de collisionVecForce(incidente) con
																				// 		la dir(normal) del punto de interseccion.
																				// - La dir de B tras un impacto (VR) es distinta a la de A. La de B es la propia dir(normal) del punto de interseccion.
																				// - El modulo de ambos VR será = a la velocidad total.
																				// - Ahora disminuimos el vector V de cada uno proporcional a difVel,b y mass
																				// - difVel(diferencia de velocidad), que significa que:
																				// 		si velocidad de B es = a A difVel = 0. Se contraresta la V de A y de B
																				// 		si velocidad de B es < a A o 0(en reposo difVel = 1) . No se contraresta la V de A y B.
																				// - b(parametro de imapacto b), que significa que:
																				// 		si A impacta al borde del objeto B, A no transmite toda la energía a B. B no se mueve, A si. Se contraresta la V solo de B
																				// 		si A impacta al centro del objeto B, A transmite toda la energía a B. B se mueve, A no.  Se contraresta la V solo de A
																				//
																				
																		    	var totalMass = this.nodes[numNode].collisionMass + this.nodes[n].collisionMass;
																				var massA = this.nodes[numNode].collisionMass/totalMass;
																				var massB = this.nodes[numNode].collisionMass/totalMass;
																				
																				// obtenemos angulo entre dir inicial y dir final de A (esto será el parametro de impacto b)
																		    	var b = dirAReflect.dot(this.nodes[numNode].collisionVecForce.normalize())*-1.0; // A impacta misma dir B = 1.0
																				
																				velAFinal = velA * conservacion * massA * (1.0-b);
																				velBFinal = velB * conservacion * massB * b;
																				var difVel = (velAFinal - velBFinal)/velAFinal; // B misma vel A difVel = 0; B reposo difVel = 1
																				
																				
																	    		// A
																	    		dirAReflect = dirAReflect.x(velAFinal+velBFinal);
																	    		var vecDesplazA =  dirAReflect.subtract(this.nodes[numNode].collisionVecForce);
																	    		vecDesplazA = vecDesplazA.x(1.0-difVel);
																	    		
																	    		this.nodes[numNode].collisionVecForce = this.nodes[numNode].collisionVecForce.add(vecDesplazA);
																	    		
																	    		// B
																	    		var dirBReflect = normal.x(-1.0).x(velBFinal+velAFinal);
																	    		var vecDesplazB =  dirBReflect.subtract(this.nodes[n].collisionVecForce);
																	    		vecDesplazB = vecDesplazB.x(difVel);
																	    		
																	    		this.nodes[n].collisionVecForce = this.nodes[n].collisionVecForce.add(vecDesplazB);
																			} else {
																				return false;
																			}
																    	}
																    	
																    	
																    	
																		this.nodes[numNode].collisionAnterior = true;
																    	//return true;
															    	//}
														    	}
														    }
											} else {
										    	this.nodes[numNode].collisionAnterior = false;
										    }
										} else {
									    	this.nodes[numNode].collisionAnterior = false;
									    }
									
									} else {
								    	this.nodes[numNode].collisionAnterior = false;
								    }
								}
							} // fin AABBs caras
							
							
						}
					}
				} // fin AABBs nodos
				
			}
		}
	}
	
	return false;
};

StormPhysics.prototype.collisionApplyForces = function() {
	// Primero recorrer nodos dinamicos y aplicar fuerzas externas que varien inicialmente el collisionVecForce de cada nodo dinamico
	for(var n = 0; n < this.nodes.length; n++) {
		if(this.nodes[n].collisionDetect == true && this.nodes[n].collisionType == 'DYNAMIC' && this.nodes[n].collisionAnterior == false) {
			var totalForce = $V3([0.0, 0.0, 0.0]);
			for(var nb = 0; nb < this.nodes[n].collisionExternForces.length; nb++) {
				totalForce = totalForce.add(this.nodes[n].collisionExternForces[nb]);
			}
			this.nodes[n].collisionVecForce = this.nodes[n].collisionVecForce.add(totalForce);
		}
	}
};