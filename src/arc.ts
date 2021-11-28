import { geoInterpolate } from 'd3-geo';
import THREE, { CubicBezierCurve3 } from 'three';
import { calculateVec3FromLatLon, hexToVec3 } from './threejs-extensions';
import { ArcConfig } from './types';
import { ControlPoints } from './types/arc';

import barVertexShader from './shaders/bar.vert.glsl';
import barFragmentShader from './shaders/bar.frag.glsl';

// TODO: <Wouter> Replace 600 in this file with globe radius that is defined outside of this class
export default class Arc {
    config: ArcConfig

    constructor(config: ArcConfig) {
      this.config = config;
    }

    draw(): THREE.Mesh {
      const controlPoints = this.calculateArcControlPoints();
      const curve = new CubicBezierCurve3(
        controlPoints.start,
        controlPoints.midStart,
        controlPoints.midEnd,
        controlPoints.end,
      );

      const { startColor, endColor } = this.config;
      const vec3StartColor = startColor ? hexToVec3(startColor) : new THREE.Vector3(1.0, 0.0, 1.0);
      const vec3EndColor = endColor ? hexToVec3(endColor) : new THREE.Vector3(1.0, 1.0, 0.0);

      const geometry = new THREE.TubeBufferGeometry(curve, 44, 0.5, 8);
      geometry.computeBoundingBox();

      const material = new THREE.ShaderMaterial({
        uniforms: {
          startColor: {
            value: new THREE.Vector4(vec3StartColor.x, vec3StartColor.y, vec3StartColor.z, 1.0),
          },
          endColor: {
            value: new THREE.Vector4(vec3EndColor.x, vec3EndColor.y, vec3EndColor.z, 1.0),
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

      return mesh;
    }

    private calculateArcControlPoints(): ControlPoints {
      const startCoords = {
        lon: this.config.startLocation.geometry.coordinates[0],
        lat: this.config.startLocation.geometry.coordinates[1],
      };

      const endCoords = {
        lon: this.config.endLocation.geometry.coordinates[0],
        lat: this.config.endLocation.geometry.coordinates[1],
      };

      const startVec3 = calculateVec3FromLatLon(startCoords.lat, startCoords.lon, 600);
      const endVec3 = calculateVec3FromLatLon(endCoords.lat, startCoords.lon, 600);
      const arcHeight = startVec3.distanceTo(endVec3) * 0.25 + 600;

      const interpolate = geoInterpolate(
        [startCoords.lon, startCoords.lat],
        [endCoords.lon, endCoords.lat],
      );

      const midCoords = {
        start: interpolate(0.25),
        end: interpolate(0.75),
      };

      const midStartVec3 = calculateVec3FromLatLon(
        midCoords.start[1],
        midCoords.start[0],
        arcHeight,
      );

      const midEndVec3 = calculateVec3FromLatLon(
        midCoords.end[1],
        midCoords.end[0],
        arcHeight,
      );

      return {
        start: startVec3,
        midStart: midStartVec3,
        midEnd: midEndVec3,
        end: endVec3,
      };
    }
}
