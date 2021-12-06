/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as THREE from 'three';
import { CubicBezierCurve3 } from 'three';
import { hexToVec3 } from '../utils/threejs-converters';
import type { ArcConfig } from '../types/arc';
import calculateArcControlPoints from '../utils/arc-controlpoints';
import arcDefaults from '../defaults/arc-defaults';

import arcVertexShader from '../shaders/arc.vert.glsl';
import arcFragmentShader from '../shaders/arc.frag.glsl';

// TODO: <Wouter> Replace 600 in this file with globe radius that is defined outside of this class
export default class Arc {
  readonly config: ArcConfig;

  constructor(config: ArcConfig) {
    this.config = {
      ...arcDefaults,
      ...config,
    };
  }

  draw(): THREE.Mesh {
    const controlPoints = calculateArcControlPoints(this.config);
    const curve = new CubicBezierCurve3(
      controlPoints.start,
      controlPoints.midStart,
      controlPoints.midEnd,
      controlPoints.end,
    );

    const vec3StartColor = hexToVec3(this.config.startColor!) ?? new THREE.Vector3(1.0, 0.0, 1.0);
    const vec3EndColor = hexToVec3(this.config.endColor!) ?? new THREE.Vector3(1.0, 1.0, 0.0);

    const geometry = new THREE.TubeBufferGeometry(curve, 44, this.config.radius!, 8);
    geometry.computeBoundingBox();

    if (!geometry.boundingBox) { throw Error('Globe - size of arc is unknown'); }

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
      fragmentShader: arcFragmentShader,
      vertexShader: arcVertexShader,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }
}
