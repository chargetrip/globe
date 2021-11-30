import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GlobeCamera from '../controllers/camera';
import globeDefaults from '../defaults/globe-defaults';
import { GlobeConfig } from '../types/globe';

import Arc from './arc';
import Bar from './bar';
import Globe from './globe';
import Marker from './marker';

export default class GlobeScene {
  #scene: THREE.Scene;
  #camera: THREE.PerspectiveCamera;
  #renderer: THREE.WebGLRenderer;

  #markerMeshes: THREE.Mesh[] = [];
  #dotSphereMesh: THREE.Mesh | null = null;

  readonly globeConfig: GlobeConfig;
  readonly container: string;

  camera: GlobeCamera;

  constructor(
    container: string,
    globeConfig: GlobeConfig = globeDefaults,
    antialias = true,
    alpha = true,
  ) {
    this.#scene = new THREE.Scene();
    this.#camera = new THREE.PerspectiveCamera();
    this.#renderer = new THREE.WebGLRenderer({ antialias, alpha });

    this.globeConfig = {
      ...globeDefaults,
      ...globeConfig,
      baseSphere: {
        ...globeDefaults.baseSphere,
        ...globeConfig.baseSphere,
      },
      atmosphere: {
        ...globeDefaults.atmosphere,
        ...globeConfig.atmosphere,
      },
      dotSphere: {
        ...globeDefaults.dotSphere,
        ...globeConfig.dotSphere,
      },
    };

    this.container = container;
    this.camera = new GlobeCamera(this.#camera);

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
    const globe = new Globe(this.globeConfig);

    const baseSphere = globe.drawBaseSphere();
    this.#scene.add(baseSphere);

    if (this.globeConfig.atmosphere?.render) {
      const atmosphere = globe.drawAtmosphere();
      this.#scene.add(atmosphere);
    }

    globe.drawDotSphere().then((dotSphere) => {
      this.#dotSphereMesh = dotSphere;
      this.#scene.add(dotSphere);
    });
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    this.#markerMeshes.forEach((marker) => {
      const currentTime = marker.material.uniforms.time.value;
      marker.material.uniforms.time.value = (currentTime - 0.015) % 1024;
    });

    if (this.#dotSphereMesh && this.globeConfig.animates) {
      const currentTime = this.#dotSphereMesh.material.uniforms.time.value;
      this.#dotSphereMesh.material.uniforms.time.value = (currentTime + 0.01) % 1024;
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

  addMarkers(markers: Marker | Marker[]): void {
    let localMarkers = markers;
    if (!Array.isArray(markers)) { localMarkers = [markers]; }

    (localMarkers as Marker[]).forEach((marker) => {
      const mesh = marker.draw();
      this.#markerMeshes.push(mesh);
      this.#scene.add(mesh);
    });
  }

  addBar(bar: Bar): void {
    const barMesh = bar.draw();
    this.#scene.add(barMesh);
  }
}
