import * as THREE from 'three';
import { BarConfig } from '../types/bar';
import { calculateVec3FromLatLon, hexToVec3 } from '../utils/threejs-converters';

import barVertexShader from '../shaders/bar.vert.glsl';
import barFragmentShader from '../shaders/bar.frag.glsl';
import barDefaults from '../defaults/bar-defaults';

export default class Bar {
    readonly config: BarConfig

    constructor(config: BarConfig) {
      this.config = {
        ...barDefaults,
        ...config,
      };
    }

    draw(): THREE.Mesh {
      const targetVector = new THREE.Vector3(0, 0, 0);
      const position = calculateVec3FromLatLon(
        this.config.location.geometry.coordinates[0],
        this.config.location.geometry.coordinates[1],
        600,
      );

      const geometry = new THREE.CylinderGeometry(
        this.config.radiusTop!,
        this.config.radiusBottom!,
        this.config.height!,
      );
      geometry.computeBoundingBox();

      const vec3StartColor = hexToVec3(this.config.startColor!) ?? new THREE.Vector3(1.0, 0.0, 1.0);
      const vec3EndColor = hexToVec3(this.config.endColor!) ?? new THREE.Vector3(1.0, 1.0, 0.0);

      if (!geometry.boundingBox) { throw Error('Globe - size of bar is unknown'); }

      const material = new THREE.ShaderMaterial({
        uniforms: {
          startColor: {
            value: new THREE.Vector4(
              vec3StartColor.x,
              vec3StartColor.y,
              vec3StartColor.z,
              this.config.startColorOpacity!,
            ),
          },
          endColor: {
            value: new THREE.Vector4(
              vec3EndColor.x,
              vec3EndColor.y,
              vec3EndColor.z,
              this.config.endColorOpacity!,
            ),
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
      mesh.position.copy(position).multiplyScalar(1.0 + (geometry.boundingBox.max.y * 2) / 1250);
      mesh.geometry.rotateX((90 * Math.PI) / 180);
      mesh.lookAt(targetVector);

      return mesh;
    }
}
