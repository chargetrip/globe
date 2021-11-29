import * as THREE from 'three';
import { BarConfig } from '../types/bar';
import { calculateVec3FromLatLon } from '../utils/threejs-converters';

import barVertexShader from '../shaders/bar.vert.glsl';
import barFragmentShader from '../shaders/bar.frag.glsl';

export default class Bar {
    config: BarConfig

    constructor(config: BarConfig) {
      this.config = config;
    }

    draw(): THREE.Mesh {
      const targetVector = new THREE.Vector3(0, 0, 0);
      const position = calculateVec3FromLatLon(
        this.config.location.geometry.coordinates[0],
        this.config.location.geometry.coordinates[1],
        600,
      );

      const geometry = new THREE.CylinderGeometry(4, 4, 100);
      geometry.computeBoundingBox();

      if (!geometry.boundingBox) { throw Error('Globe - size of bar is unknown'); }

      const material = new THREE.ShaderMaterial({
        uniforms: {
          color1: {
            value: new THREE.Vector4(1.0, 1.0, 1.0, 0.0),
          },
          color2: {
            value: new THREE.Vector4(1.0, 1.0, 1.0, 0.5),
          },
          bboxMin: {
            value: geometry.boundingBox.min,
          },
          bboxMax: {
            value: geometry.boundingBox.max,
          },
        },
        fragmentShader: barFragmentShader,
        vertexShader: barVertexShader,
        transparent: true,
      });

      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(position.x, position.y, position.z);
      mesh.position.copy(position).multiplyScalar(1.08);
      mesh.geometry.rotateX((90 * Math.PI) / 180);
      mesh.lookAt(targetVector);

      return mesh;
    }
}
