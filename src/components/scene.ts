import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Arc from './arc';
import Bar from './bar';
import Globe from './globe';
import Marker from './marker';

export default class GlobeScene {
  #scene: THREE.Scene;
  #camera: THREE.PerspectiveCamera;
  #renderer: THREE.WebGLRenderer;

  #marker: Marker | null = null;
  #markerMesh: THREE.Mesh | null = null;

  container: string;

  constructor(
    container: string,
    antialias = true,
    alpha = true,
  ) {
    this.#scene = new THREE.Scene();
    this.#camera = new THREE.PerspectiveCamera();
    this.#renderer = new THREE.WebGLRenderer({ antialias, alpha });

    this.container = container;

    this.init();
    this.drawGlobe();
  }

  private init(): void {
    const container = document.getElementById(this.container);

    if (container === null) {
      throw Error('GlobeKit - No container found');
    }

    this.#camera.fov = 45;
    this.#camera.aspect = container.clientWidth / container.clientHeight;
    this.#camera.near = 100;
    this.#camera.far = 4000;

    this.#camera.position.set(0, 0, 1800);
    this.#camera.updateProjectionMatrix();

    const controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    controls.autoRotate = true;

    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(this.#renderer.domElement);

    this.animate();
  }

  private drawGlobe(): void {
    const globe = new Globe();
    const baseSphere = globe.drawBaseSphere();
    const atmosphere = globe.drawAtmosphere();

    this.#scene.add(baseSphere);
    this.#scene.add(atmosphere);
    globe.drawDotSphere().then((dotSphere) => this.#scene.add(dotSphere));
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    if (this.#marker && this.#marker.isAnimating && this.#markerMesh) {
      const currentTime = this.#markerMesh.material.uniforms.time.value;
      this.#markerMesh.material.uniforms.time.value = (currentTime + 0.015) % 1024;
    }

    this.render();
  }

  private render(): void {
    this.#renderer.render(this.#scene, this.#camera);
  }

  addArc(arc: Arc): void {
    const arcMesh = arc.draw();
    this.#scene.add(arcMesh);
  }

  addMarker(marker: Marker): void {
    const markerMeshes = marker.draw();
    this.#marker = marker;
    this.#markerMesh = markerMeshes[0];
    markerMeshes.forEach((mesh) => this.#scene.add(mesh));
  }

  addBar(bar: Bar): void {
    const barMesh = bar.draw();
    this.#scene.add(barMesh);
  }
}
