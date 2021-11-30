import * as THREE from 'three';

export default async function fetchImage(imageUrl: string): Promise<HTMLImageElement> {
  const loader = new THREE.ImageLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      imageUrl,
      (alphaMapImage: HTMLImageElement) => {
        resolve(alphaMapImage);
      },
      undefined,
      (error: Event) => {
        reject(error);
      },
    );
  });
}
