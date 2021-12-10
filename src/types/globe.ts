export interface GlobeConfig {
  radius?: number,
  animates?: boolean,
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
