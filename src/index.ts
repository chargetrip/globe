import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Vector3 } from 'three';

import baseSphereVertexShader from './shaders/baseSphere.vert.glsl';
import baseSphereFragmentShader from './shaders/baseSphere.frag.glsl';

import atmosphereVertexShader from './shaders/atmosphere.vert.glsl';
import atmosphereFragmentShader from './shaders/atmosphere.frag.glsl';

import dotsVertexShader from './shaders/dots.vert.glsl';
import dotsFragmentShader from './shaders/dots.frag.glsl';

import locationVertexShader from './shaders/location.vert.glsl';
import locationFragmentShader from './shaders/location.frag.glsl';

const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);

export interface GlobeConfig {
    container: string;
    radius: number;
    baseSphere: {
      color: number;
      opacity: number;
      transparent: boolean;
    };
    dotSphere: {
      numberOfDots: number;
      alphaMap: string;
      color: number;
      opacity: number;
      transparent: boolean;
    };
    showDebugger: boolean;
}

class Globe {
  globeConfig: GlobeConfig = {
    container: 'globe-container',
    radius: 600,
    baseSphere: {
      color: 0x1c335a,
      opacity: 1,
      transparent: true,
    },
    dotSphere: {
      numberOfDots: 60000,
      alphaMap:
        'https://images.ctfassets.net/fzn2n1nzq965/11064gUb2CgTJXKVwAt5J9/297a98a65d04d4fbb979072ce60466ab/map_fill-a78643e8.png',
      color: 0x3d689c,
      opacity: 0.8,
      transparent: true,
    },
    showDebugger: false,
  };

  imageData: ImageData | undefined;

  scene: THREE.Scene = new THREE.Scene();

  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();

  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  constructor(
    globeConfig: GlobeConfig = {
      container: 'globe-container',
      radius: 600,
      baseSphere: {
        color: 0x1c335a,
        opacity: 1,
        transparent: true,
      },
      dotSphere: {
        numberOfDots: 60000,
        alphaMap:
          'https://images.ctfassets.net/fzn2n1nzq965/11064gUb2CgTJXKVwAt5J9/297a98a65d04d4fbb979072ce60466ab/map_fill-a78643e8.png',
        color: 0x3d689c,
        opacity: 0.8,
        transparent: true,
      },
      showDebugger: false,
    },
  ) {
    this.globeConfig = globeConfig;

    this.init();
  }

  init() {
    this.getImageData();

    setTimeout(() => {
      this.configureScene();
      this.drawAtmosphere();
      this.drawBaseSphere();
      this.drawDotSphere();

      this.drawPoint();

      this.animate();
    }, 1000);
  }

  configureScene = () => {
    const container = document.getElementById(this.globeConfig.container);

    this.camera.fov = 45;
    this.camera.aspect = container!.clientWidth / container!.clientHeight;
    this.camera.near = 100;
    this.camera.far = 4000;

    this.camera.position.set(0, 0, 1800);
    this.camera.updateProjectionMatrix();

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.autoRotate = true;

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container!.clientWidth, container!.clientHeight);

    container!.appendChild(this.renderer.domElement);
  };

  drawBaseSphere = () => {
    const geometry = new THREE.SphereGeometry(this.globeConfig.radius, 50, 50);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0.11, 0.2, 0.353),
        },
      },
      vertexShader: baseSphereVertexShader,
      fragmentShader: baseSphereFragmentShader,
    });

    const baseSphere = new THREE.Mesh(geometry, material);

    this.scene.add(baseSphere);
  };

  drawAtmosphere = () => {
    const atmosphereGeometry = new THREE.SphereGeometry(this.globeConfig.radius, 50, 50);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0.215, 0.450, 0.725),
        },
      },
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.2, 1.2, 1.2);

    this.scene.add(atmosphere);
  }

  drawDotSphere = () => {
    const geometry = new THREE.CircleGeometry(2, 12);
    const matrix = new THREE.Matrix4();
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
      },
      fragmentShader: dotsFragmentShader,
      vertexShader: dotsVertexShader,
    });

    const instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      this.globeConfig.dotSphere.numberOfDots,
    );

    // Offset to longitudally align with Prime Meridian
    instancedMesh.rotation.y -= (Math.PI / 2) - 0.02;

    const color = new THREE.Color();

    for (let i = 0; i < this.globeConfig.dotSphere.numberOfDots; i += 1) {
      const configuredMatrix = this.configureDotMatrix(
        i,
        matrix,
        instancedMesh,
      );

      instancedMesh.setColorAt(i, color.setHex(Math.random() * 0xffffff));
      instancedMesh.setMatrixAt(i, configuredMatrix);
    }

    this.scene.add(instancedMesh);
  };

  configureDotMatrix = (
    i: number,
    matrix: THREE.Matrix4,
    instancedMesh: THREE.InstancedMesh,
  ) => {
    const { radius } = this.globeConfig;
    const { numberOfDots } = this.globeConfig.dotSphere;

    const targetVector = new THREE.Vector3(0, 0, 0);

    const position = new THREE.Vector3();
    const alphaPosition = new THREE.Vector3();
    const rotationMatrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    const phi = Math.acos(-1 + (2 * i) / numberOfDots);
    const theta = Math.sqrt(numberOfDots * Math.PI) * phi;

    position.setFromSphericalCoords(radius, phi, theta);

    // Set rotation on the dots to face the center of the sphere to make a nice smooth globe surface
    rotationMatrix.lookAt(position, targetVector, instancedMesh.up);
    quaternion.setFromRotationMatrix(rotationMatrix);

    // Fetch alpha from the alphaMap based on dot location
    alphaPosition.copy(position);
    const alpha = this.getImageAlphaSample(alphaPosition);

    // First dot is at the bottom of the mesh and is off-centered due to the pattern.
    // Therefore exclude the point by setting scale to 0.
    if (i === 0 || alpha < 128) {
      scale.x = 0;
      scale.y = 0;
      scale.z = 0;
    } else {
      scale.x = 1;
      scale.y = 1;
      scale.z = 1;
    }

    return matrix.compose(position, quaternion, scale);
  };

  getImageAlphaSample = (alphaPosition: THREE.Vector3): number => {
    const nPosition = alphaPosition.normalize();

    const u = 0.5 + Math.atan2(nPosition.x, nPosition.z) / (2 * Math.PI);
    const v = 1 - (0.5 + Math.asin(nPosition.y) / Math.PI);

    const tx = Math.min(
      // eslint-disable-next-line no-bitwise
      (this.emod(u, 1) * this.imageData.width) | 0,
      this.imageData.width - 1,
    );
    const ty = Math.min(
      // eslint-disable-next-line no-bitwise
      (this.emod(v, 1) * this.imageData.height) | 0,
      this.imageData.height - 1,
    );
    const offset = (ty * this.imageData.width + tx) * 4;

    // Offset + 3 to get the alpha channel which we are interested in
    return this.imageData!.data[offset + 3];
  };

  emod = (n: number, m: number): number => ((n % m) + m) % m;

  getImageData = () => {
    this.fetchAlphaMapImage().then(
      (result) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;

        canvas.width = result.width;
        canvas.height = result.height;

        context.drawImage(result, 0, 0);

        this.imageData = context.getImageData(
          0,
          0,
          result.width,
          result.height,
        );
      },
      (error) => {
        console.error('Globe', error);
      },
    );
  };

  fetchAlphaMapImage = (): Promise<HTMLImageElement> => {
    const { alphaMap } = this.globeConfig.dotSphere;
    const loader = new THREE.ImageLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        alphaMap,
        (alphaMapImage: HTMLImageElement) => {
          resolve(alphaMapImage);
        },
        undefined,
        (error: Event) => {
          reject(error);
        },
      );
    });
  };

  calculateXYZFromLatLon = (lat: number, lon: number): Vector3 => {
    const phi = degreesToRadians(90 - lat);
    const theta = degreesToRadians(lon + 180);
    const rho = this.globeConfig.radius;

    const x = -(Math.sin(phi) * Math.cos(theta) * rho);
    const y = Math.cos(phi) * rho;
    const z = Math.sin(phi) * Math.sin(theta) * rho;

    return new Vector3(x, y, z);
  }

  drawPoint = () => {
    const targetVector = new THREE.Vector3(0, 0, 0);
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        circleRadius: { value: 0.04 },
        borderInnerRadius: { value: 0.2 },
        borderOuterRadius: { value: 0.25 },
        time: { value: 1.0 },
      },
      fragmentShader: locationFragmentShader,
      vertexShader: locationVertexShader,
      transparent: true,
      side: THREE.BackSide,
    });

    const locations = [
      {
        lat: 52.3676,
        lon: 4.9041,
      },
      {
        lat: -34.6037,
        lon: -58.3816,
      },
      {
        lat: -33.8688,
        lon: 151.2093,
      },
    ];

    locations.forEach((location) => {
      const position = this.calculateXYZFromLatLon(location.lat, location.lon);

      const mesh = new THREE.Mesh(geometry, material);

      // Offset position to prevent shader intersection with globe dots
      mesh.position.copy(position).multiplyScalar(1.0025);
      mesh.lookAt(targetVector);

      this.scene.add(mesh);
    });
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    // TODO: Dot layer should be accessible using `this` within the loop

    // @ts-ignore
    const currentTime = this.scene.children[2].material.uniforms.time.value;
    // @ts-ignore
    this.scene.children[2].material.uniforms.time.value = (currentTime + 0.01) % 1024;
    // @ts-ignore
    this.scene.children[4].material.uniforms.time.value = -1 * ((currentTime + 0.01) % 1024);

    this.render();
  };

  render = () => {
    this.renderer.render(this.scene, this.camera);
  };
}

new Globe();
