import type { GlobeConfig } from '../types/globe';

const globeDefaults: GlobeConfig = {
  radius: 600,
  animates: true,
  cameraAnimation: {
    enabled: true,
    damping: 0.05,
    speed: 50,
  },
  baseSphere: {
    colorDay: '#606263', // vec3(0.137, 0.290, 0.454)
    colorNight: '#0E0E11', // vec3(0.050, 0.058, 0.074)
  },
  atmosphere: {
    render: true,
    color: '#666667',
  },
  dotSphere: {
    numberOfDots: 60_000,
    dotSize: 2,
    alphaMap: 'https://i.imgur.com/OpzAqvM.png',
    color: '#97979F',
    opacity: 0.8,
  },
};

export default globeDefaults;
