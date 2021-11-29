import * as THREE from 'three';
import { getImageData } from '../utils/image-data';
import configureDotMatrix from '../utils/globe-dots';

import baseSphereVertexShader from '../shaders/baseSphere.vert.glsl';
import baseSphereFragmentShader from '../shaders/baseSphere.frag.glsl';

import atmosphereVertexShader from '../shaders/atmosphere.vert.glsl';
import atmosphereFragmentShader from '../shaders/atmosphere.frag.glsl';

import dotsVertexShader from '../shaders/dots.vert.glsl';
import dotsFragmentShader from '../shaders/dots.frag.glsl';

export default class Globe {
  drawBaseSphere(): THREE.Mesh {
    const geometry = new THREE.IcosahedronGeometry(600, 11);
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

    return baseSphere;
  }

  drawAtmosphere(): THREE.Mesh {
    const atmosphereGeometry = new THREE.IcosahedronGeometry(600, 11);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0.215, 0.450, 0.725),
        },
      },
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.2, 1.2, 1.2);

    return atmosphere;
  }

  async drawDotSphere(): Promise<THREE.Mesh> {
    const imageData = await getImageData('https://i.imgur.com/7e2kNjf.png');

    if (!imageData) { throw Error('Globe - no image data'); }

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
      60000, // this.globeConfig.dotSphere.numberOfDots,
    );

    const color = new THREE.Color();

    for (let i = 0; i < /* this.globeConfig.dotSphere.numberOfDots */ 60000; i += 1) {
      const configuredMatrix = configureDotMatrix(
        imageData,
        i,
        matrix,
        instancedMesh,
      );

      instancedMesh.setColorAt(i, color.setHex(Math.random() * 0xffffff));
      instancedMesh.setMatrixAt(i, configuredMatrix);
    }

    return instancedMesh;
  }
}
