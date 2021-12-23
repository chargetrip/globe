import * as THREE from 'three';
import { X_AXIS, Y_AXIS, degreesToRadians } from '../utils/threejs';
import type { GlobeConfig } from '../types/globe';

export default class GlobeCamera {
  #clock: THREE.Clock;

  pivot: THREE.Object3D;
  camera: THREE.PerspectiveCamera;
  targetQuaternion: THREE.Quaternion;
  targetPosition: THREE.Vector3;

  #t: number;
  #speed: number;

  cameraAnimation: GlobeConfig["cameraAnimation"];

  constructor(
    camera: THREE.PerspectiveCamera,
    clock: THREE.Clock,
    t: number,
    speed: number,
    cameraAnimation: GlobeConfig["cameraAnimation"]
  ) {
    this.camera = camera;

    this.#clock = clock;
    this.pivot = new THREE.Object3D();
    this.pivot.add(camera);
    this.targetQuaternion = new THREE.Quaternion();
    this.targetPosition = new THREE.Vector3(0, 0, 2000);

    this.cameraAnimation = cameraAnimation;

    this.#t = t;
    this.#speed = speed;
  }

  public lookAt(lat: number, lng: number, alt = 2000): void {
    const rotationY = new THREE.Quaternion();
    const rotationX = new THREE.Quaternion();

    rotationY.setFromAxisAngle(Y_AXIS, degreesToRadians(lng));
    rotationX.setFromAxisAngle(X_AXIS, degreesToRadians(-lat));

    this.targetQuaternion.copy(rotationY.multiply(rotationX)); 
    this.targetPosition.z = alt;
  }
}
