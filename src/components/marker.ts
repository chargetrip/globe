import * as THREE from 'three';

import { calculateVec3FromLatLon, hexToVec3 } from '../utils/threejs-converters';
import type { MarkerConfig } from '../types/marker';
import markerDefaults from '../defaults/marker-defaults';

import markerVertexShader from '../shaders/marker.vert.glsl';
import markerFragmentShader from '../shaders/marker.frag.glsl';
import randMinMax from '../utils/time';

export default class Marker {
  readonly config: MarkerConfig;

  constructor(config: MarkerConfig) {
    this.config = {
      ...markerDefaults,
      ...config,
    };
  }

  draw(): THREE.Mesh {
    const targetVector = new THREE.Vector3(0, 0, 0);

    const geometry = new THREE.PlaneGeometry(this.config.size, this.config.size);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        circleRadius: { value: this.config.circleRadius },
        borderInnerRadius: { value: this.config.borderInnerRadius },
        borderOuterRadius: { value: this.config.borderOuterRadius },
        time: { value: randMinMax(0, 10) },
        ringColor: { value: hexToVec3(this.config.color) },
      },
      fragmentShader: markerFragmentShader,
      vertexShader: markerVertexShader,
      transparent: true,
      side: THREE.BackSide,
    });

    const position = calculateVec3FromLatLon(
      this.config.location.geometry.coordinates[0],
      this.config.location.geometry.coordinates[1],
      600,
    );

    const mesh = new THREE.Mesh(geometry, material);

    // Offset position to prevent shader intersection with globe dots
    mesh.position.copy(position).multiplyScalar(1.0025);
    mesh.lookAt(targetVector);

    return mesh;
  }
}
