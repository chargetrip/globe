import * as THREE from 'three';
import GlobeCamera from '../controllers/camera';
import globeDefaults from '../defaults/globe-defaults';
import type { GlobeConfig } from '../types/globe';

import Arc from './arc';
import Bar from './bar';
import Globe from './globe';
import Marker from './marker';

export default class GlobeScene {
  #clock: THREE.Clock;
  #scene: THREE.Scene;

  #camera: THREE.PerspectiveCamera;
  camera: GlobeCamera;

  #renderer: THREE.WebGLRenderer;

  #markerMeshes: THREE.Mesh[] = [];
  #dotSphereMesh: THREE.Mesh | null = null;
  #atmosphere: THREE.Mesh;

  readonly globeConfig: GlobeConfig;
  readonly container: string;

  constructor(
    container: string,
    globeConfig: GlobeConfig = globeDefaults,
    antialias = true,
    alpha = true,
  ) {
    this.#clock = new THREE.Clock();
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
    this.camera = new GlobeCamera(
      this.#camera,
      this.#clock,
      0.05,
      500,
      this.globeConfig.cameraAnimation,
    );

    this.drawGlobe();
    this.init();
  }

  private init(): void {
    const container = document.getElementById(this.container);

    if (container === null) {
      throw Error('GlobeKit - No container found');
    }

    this.#camera.fov = 45;
    this.#camera.aspect = container.clientWidth / container.clientHeight;
    this.#camera.near = 200;
    this.#camera.far = 4000;

    this.#camera.position.set(0, 0, 1800);
    this.#camera.updateProjectionMatrix();

    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.#renderer.domElement);

    this.camera.pivot.add(this.#camera);
    this.#scene.add(this.camera.pivot);

    this.render();
  }

  private drawGlobe(): void {
    const globe = new Globe(this.globeConfig, this.#camera);

    const baseSphere = globe.drawBaseSphere();
    this.#scene.add(baseSphere);

    if (this.globeConfig.atmosphere?.render) {
      this.#atmosphere = globe.drawAtmosphere();
      this.#scene.add(this.#atmosphere);
    }

    globe.drawDotSphere().then((dotSphere) => {
      this.#dotSphereMesh = dotSphere;
      this.#scene.add(dotSphere);
    });
  }

  private animate(): void {
    const delta = this.#clock.getDelta();

    this.#atmosphere.material.uniforms.viewVector.value = this.#camera.position;

    if (this.globeConfig.cameraAnimation.enabled) {
      const { damping, speed } = this.globeConfig.cameraAnimation;
      const step = speed * delta * damping;

      if (!this.camera.pivot.quaternion.equals(this.camera.targetQuaternion)) {
        this.camera.pivot.quaternion.slerp(this.camera.targetQuaternion, step);
      }

      if (!this.camera.camera.position.equals(this.camera.targetPosition)) {
        this.camera.camera.position
          .lerp(this.camera.targetPosition, step)
          // NOTE: Set a max the camera can zoom, as the threejs lerp function
          // will continue on lerping if the tab is left unattended,
          .max(new THREE.Vector3(0, 0, 1000));
      }
    } else {
      this.camera.pivot.quaternion.copy(this.camera.targetQuaternion);
      this.camera.camera.position.copy(this.camera.targetPosition);
    }


    this.#markerMeshes.forEach((marker) => {
      const currentTime = marker.material.uniforms.time.value;
      marker.material.uniforms.time.value = (currentTime - 0.015) % 1024;
    });

    if (this.#dotSphereMesh && this.globeConfig.animates) {
      const currentTime = this.#dotSphereMesh.material.uniforms.time.value;
      this.#dotSphereMesh.material.uniforms.time.value = (currentTime + 0.01) % 1024;
    }
  }

  private render(): void {
    requestAnimationFrame(() => this.render());

    this.animate();

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

  removeAllMarkers(): void {
    this.#markerMeshes.forEach((marker) => {
      this.#scene.remove(marker);
    });
  }

  addBar(bar: Bar): void {
    const barMesh = bar.draw();
    this.#scene.add(barMesh);
  }
}
