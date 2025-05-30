import type { GlobeConfig } from '../types/globe'

const globeDefaults: GlobeConfig = {
  radius: 600,
  animates: true,
  container: 'globe-container',
  cameraAnimation: {
    enabled: true,
    damping: 0.05,
    speed: 50,
    offsetAzimuth: 0,
    offsetPolar: 0,
  },
  baseSphere: {
    transparent: false,
    colorDay: '#606263',
    colorNight: '#0E0E11',
  },
  atmosphere: {
    render: true,
    color: '#FFFFFF',
    transparent: false,
  },
  dotSphere: {
    numberOfDots: 60_000,
    dotSize: 2,
    alphaMap: 'https://i.imgur.com/OpzAqvM.png',
    color: '#97979F',
    opacity: 0.8,
    transparent: false,
  },
}

export default globeDefaults
