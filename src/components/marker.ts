import * as THREE from 'three';

import { calculateVec3FromLatLon } from '../utils/threejs-converters';
import { MarkerConfig } from '../types/marker';

import markerVertexShader from '../shaders/marker.vert.glsl';
import markerFragmentShader from '../shaders/marker.frag.glsl';

export default class Marker {
  config: MarkerConfig | MarkerConfig[]

  isAnimating = true;

  constructor(config: MarkerConfig | MarkerConfig[]) {
    this.config = config;
  }

  draw(): THREE.Mesh[] {
    let markers = this.config;
    if (!Array.isArray(markers)) { markers = [markers]; }

    const meshes: THREE.Mesh[] = [];
    const targetVector = new THREE.Vector3(0, 0, 0);
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        circleRadius: { value: 0.04 },
        borderInnerRadius: { value: 0.2 },
        borderOuterRadius: { value: 0.25 },
        time: { value: 1.0 },
      },
      fragmentShader: markerFragmentShader,
      vertexShader: markerVertexShader,
      transparent: true,
      side: THREE.BackSide,
    });

    (markers as MarkerConfig[]).forEach((marker) => {
      const position = calculateVec3FromLatLon(
        marker.location.geometry.coordinates[0],
        marker.location.geometry.coordinates[1],
        600,
      );

      const mesh = new THREE.Mesh(geometry, material);

      // Offset position to prevent shader intersection with globe dots
      mesh.position.copy(position).multiplyScalar(1.0025);
      mesh.lookAt(targetVector);

      meshes.push(mesh);
    });

    return meshes;
  }

  startAnimation(): void {
    this.isAnimating = true;
  }

  stopAnimation(): void {
    this.isAnimating = false;
  }
}
