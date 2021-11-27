import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Arc from './arc';

export default class GlobeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  container: string;

  constructor(
    container: string,
    antialias = true,
    alpha = true,
  ) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer({ antialias, alpha });

    this.container = container;

    this.init();
  }

  private init(): void {
    const container = document.getElementById(this.container);

    this.camera.fov = 45;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.near = 100;
    this.camera.far = 4000;

    this.camera.position.set(0, 0, 1800);
    this.camera.updateProjectionMatrix();

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.autoRotate = true;

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(this.renderer.domElement);

    this.render();
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  addArc(arc: Arc): void {
    console.log(this.scene);
  }
}
