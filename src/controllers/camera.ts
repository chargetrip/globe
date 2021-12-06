import * as THREE from 'three';
import { Vector3 } from 'three';
import { calculateVec3FromLatLon } from '../utils/threejs-converters';

export default class GlobeCamera {
  camera: THREE.PerspectiveCamera;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  moveTo(lat: number, lon: number, alt: number): void {
    const pos = calculateVec3FromLatLon(lat, lon, alt + 600);

    this.camera.position.lerp(pos, 0.1);
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.camera.updateProjectionMatrix();
  }
}
