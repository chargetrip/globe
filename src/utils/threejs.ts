import { Color, Vector3 } from 'three';

export const X_AXIS = new Vector3(1, 0, 0);
export const Y_AXIS = new Vector3(0, 1, 0);
export const Z_AXIS = new Vector3(0, 0, 1);

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export const calculateVec3FromLatLon = (lat: number, lon: number, radius: number): Vector3 => {
  const phi = degreesToRadians(90 - lat);
  const theta = degreesToRadians(lon + 90);
  const rho = radius;

  const x = -(Math.sin(phi) * Math.cos(theta) * rho);
  const y = Math.cos(phi) * rho;
  const z = Math.sin(phi) * Math.sin(theta) * rho;

  return new Vector3(x, y, z);
};

export const hexToVec3 = (hexString: string): Vector3 | null => {
  if (/^#([0-9A-F]{3}){1,2}$/i.test(hexString)) {
    const color = new Color(hexString);
    const rgb = color.toArray().map((_color) => Math.round(_color * 1000) / 1000);
    return new Vector3(rgb[0], rgb[1], rgb[2]);
  }

  throw Error('Invalid hex string added. Did you forget to add #?');
};
