import fetchImage from './image-loader';

async function getImageData(imageUrl: string): Promise<ImageData | null> {
  let image;

  try {
    image = await fetchImage(imageUrl);
  } catch (error) {
    throw Error(`Globe - ${error}`);
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;

  canvas.width = image.width;
  canvas.height = image.height;

  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(
    0,
    0,
    image.width,
    image.height,
  );

  return imageData;
}

function emod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export default function getImageAlphaSample(
  imageData: ImageData,
  alphaPosition: THREE.Vector3,
): number {
  if (!imageData) { throw Error('Globe - Could not load alpha sample image'); }

  const nPosition = alphaPosition.normalize();

  const u = 0.5 + Math.atan2(nPosition.x, nPosition.z) / (2 * Math.PI);
  const v = 1 - (0.5 + Math.asin(nPosition.y) / Math.PI);

  const tx = Math.min(
    // eslint-disable-next-line no-bitwise
    (emod(u, 1) * imageData.width) | 0,
    imageData.width - 1,
  );

  const ty = Math.min(
    // eslint-disable-next-line no-bitwise
    (emod(v, 1) * imageData.height) | 0,
    imageData.height - 1,
  );

  const offset = (ty * imageData.width + tx) * 4;

  return imageData.data[offset];
}

export { getImageData, getImageAlphaSample };
