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
  readonly container: HTMLCanvasElement;

  constructor(
    globeConfig: GlobeConfig = globeDefaults,
    antialias = true,
    alpha = true,
  ) {
    this.globeConfig = {
      ...globeDefaults,
      ...globeConfig,
      cameraAnimation: {
        ...globeDefaults.cameraAnimation,
        ...globeConfig.cameraAnimation,
      },
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

    this.container = this.getContainer(globeConfig.container);

    this.#clock = new THREE.Clock();
    this.#scene = new THREE.Scene();
    this.#camera = new THREE.PerspectiveCamera();
    this.#renderer = new THREE.WebGLRenderer({
      alpha,
      antialias,
      canvas: this.container,
    });

    this.camera = new GlobeCamera(
      this.#camera,
      this.#clock,
      0.05,
      500,
      this.globeConfig.cameraAnimation,
    );

    window.addEventListener("resize", this.handleResize);

    this.drawGlobe();
    this.init();
  }

  /**
   * Return the element for the HTMLCanvasElement
   * @param {string | HTMLCanvasElement} container - Globe target container
   * @returns {HTMLCanvasElement} - Globe container
   */
  private getContainer(container: string | HTMLCanvasElement): HTMLCanvasElement {
    if (typeof container === "string") {
      const element = document.querySelector(container);

      if (!(element instanceof HTMLCanvasElement)) {
        throw new Error("globe container was not found");
      }

      return element;
    }

    return container;
  }

  private handleResize = (_: UIEvent): void => {
    this.#renderer.setSize(window.innerWidth, window.innerHeight);

    this.#camera.aspect = window.innerWidth / window.innerHeight;
    this.#camera.updateProjectionMatrix();
  }

  private init(): void {
    this.#camera.fov = 45;
    this.#camera.aspect = (
      this.container.clientWidth / this.container.clientHeight
    );
    this.#camera.near = 200;
    this.#camera.far = 4000;

    this.#camera.position.set(0, 0, 2000);
    this.#camera.updateProjectionMatrix();

    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );

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

    if (
      this.globeConfig.cameraAnimation.enabled &&
      document.visibilityState !== "hidden"
    ) {
      const { damping, speed } = this.globeConfig.cameraAnimation;
      const step = speed * delta * damping;

      if (!this.camera.pivot.quaternion.equals(this.camera.targetQuaternion)) {
        this.camera.pivot.quaternion.slerp(this.camera.targetQuaternion, step);
      }

      if (!this.camera.camera.position.equals(this.camera.targetPosition)) {
        this.camera.camera.position.lerp(this.camera.targetPosition, step);
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
    markers = Array.isArray(markers) ? markers : [markers];

    for (const marker of markers) {
      const mesh = marker.draw();
      this.#markerMeshes.push(mesh);
      this.#scene.add(mesh);
    }
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
