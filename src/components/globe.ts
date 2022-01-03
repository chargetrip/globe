/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as THREE from 'three';
import { getImageData } from '../utils/image-data';
import configureDotMatrix from '../utils/globe-dots';
import type { GlobeConfig } from '../types/globe';

import baseSphereVertexShader from '../shaders/baseSphere.vert.glsl';
import baseSphereFragmentShader from '../shaders/baseSphere.frag.glsl';

import atmosphereVertexShader from '../shaders/atmosphere.vert.glsl';
import atmosphereFragmentShader from '../shaders/atmosphere.frag.glsl';

import dotsVertexShader from '../shaders/dots.vert.glsl';
import dotsFragmentShader from '../shaders/dots.frag.glsl';

export default class Globe {
  readonly config: GlobeConfig;

  isAnimating = true;
  #camera: THREE.PerspectiveCamera;

  constructor(config: GlobeConfig, camera: THREE.PerspectiveCamera) {
    this.config = config;
    this.#camera = camera;
  }

  drawBaseSphere(): THREE.Mesh {
    const geometry = new THREE.IcosahedronGeometry(this.config.radius, 11);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        colorDay: {
          value: new THREE.Color(this.config.baseSphere!.colorDay!),
        },
        colorNight: {
          value: new THREE.Color(this.config.baseSphere!.colorNight!),
        },
      },
      vertexShader: baseSphereVertexShader,
      fragmentShader: baseSphereFragmentShader,
      transparent: true,
    });

    const baseSphere = new THREE.Mesh(geometry, material);

    return baseSphere;
  }

  drawAtmosphere(): THREE.Mesh {
    const atmosphereGeometry = new THREE.IcosahedronGeometry(this.config.radius, 11);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(this.config.atmosphere!.color!) },
        viewVector: { value: this.#camera.position },
      },
      // blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      transparent: true,
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.2, 1.2, 1.2);

    return atmosphere;
  }

  async drawDotSphere(): Promise<THREE.Mesh> {
    const imageData = await getImageData(this.config.dotSphere!.alphaMap!);

    if (!imageData) { throw Error('Globe - no image data'); }

    const geometry = new THREE.CircleGeometry(this.config.dotSphere!.dotSize, 12);
    const matrix = new THREE.Matrix4();
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          value: 5.0,
        },
        color: {
          value: new THREE.Color(this.config.dotSphere!.color!),
        },
      },
      transparent: true,
      fragmentShader: dotsFragmentShader,
      vertexShader: dotsVertexShader,
    });

    const instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      this.config.dotSphere!.numberOfDots!,
    );

    const color = new THREE.Color();

    for (let i = 0; i < this.config.dotSphere!.numberOfDots!; i += 1) {
      const configuredMatrix = configureDotMatrix(
        imageData,
        i,
        matrix,
        instancedMesh,
      );

      instancedMesh.setColorAt(i, color.setHex(Math.floor(Math.random() * 0xffffff)));
      instancedMesh.setMatrixAt(i, configuredMatrix);
    }

    return instancedMesh;
  }
}
