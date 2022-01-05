export interface GlobeConfig {
  radius?: number,
  animates?: boolean,
  container?: string | HTMLCanvasElement,
  cameraAnimation?: {
    enabled?: boolean,
    damping?: number,
    speed?: number,
    offsetAzimuth?: number,
    offsetPolar?: number,
  },
  baseSphere?: {
    colorDay?: string,
    colorNight?: string,
    transparent?: boolean,
  },
  atmosphere?: {
    render?: boolean,
    color?: string,
    transparent?: boolean,
  },
  dotSphere?: {
    numberOfDots?: number,
    dotSize?: number,
    alphaMap?: string,
    color?: string,
    opacity?: number,
    transparent?: boolean,
  },
}
