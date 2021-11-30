import * as THREE from 'three';
import { getImageAlphaSample } from './image-data';

export default function configureDotMatrix(
  imageData: ImageData,
  i: number,
  matrix: THREE.Matrix4,
  instancedMesh: THREE.InstancedMesh,
): THREE.Matrix4 {
  const radius = 600;
  const numberOfDots = 60000;
  //   const { radius } = this.globeConfig;
  //   const { numberOfDots } = this.globeConfig.dotSphere;

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
  const alpha = getImageAlphaSample(imageData, alphaPosition);

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
}
