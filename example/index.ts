import GlobeScene from '../src/components/scene';
import { GeoJSONType } from '../src/types/geojson';
import Marker from '../src/components/marker';
import Bar from '../src/components/bar';

const container = document.querySelector("#globe-container") as HTMLCanvasElement;

// Instantanous camera move from point A to point B.
// const globe = new GlobeScene(container, { cameraAnimation: { enabled: false }});
//
// By default, animated camera move from point A to point B.
const globe = new GlobeScene({
  container,
  cameraAnimation: {
    enabled: true,
    damping: 0.01,
    speed: 50.0,
  },
});

const bar = new Bar({
  location: {
    type: 'Feature',
    geometry: {
      type: GeoJSONType.Point,
      coordinates: [
        52.3676, 4.9041,
      ],
    },
  },
  height: 75,
});

const marker = new Marker({
  location: {
    type: 'Feature',
    geometry: {
      type: GeoJSONType.Point,
      coordinates: [
        52.3676, 4.9041,
      ],
    },
  },
});

const bar2 = new Bar({
  location: {
    type: 'Feature',
    geometry: {
      type: GeoJSONType.Point,
      coordinates: [
        59.9139, 10.7522,
      ],
    },
  },
  height: 200,
});

const marker2 = new Marker({
  location: {
    type: 'Feature',
    geometry: {
      type: GeoJSONType.Point,
      coordinates: [
        59.9139, 10.7522,
      ],
    },
  },
});

globe.addMarkers([marker, marker2]);
globe.addBar(bar);
globe.addBar(bar2);

const locations = [
  { lat: 52.3545828, lng: 4.9041, location: 'The Netherlands, Amsterdam' },
  { lat: 59.9139, lng: 10.7522, location: 'Norway, Oslo' },
  { lat: -25.904868, lng: 133.417652, location: 'Australia' },
  { lat: 41.678839, lng: -102.795717, location: 'United States' },
  { lat: -25.582567, lng: -68.976621, location: 'Chile' },
  { lat: 33.1926767, lng: 128.1527297, location: 'Japan' },
  { lat: 46.1390319, lng: -2.4351483, location: 'France' },
  { lat: 40.1301532, lng: -8.201886, location: 'Spain' },
  { lat: -29.754299, lng: 24.497087, location: 'South Africa' },
  { lat: 54.7226517, lng: -113.7225747, location: 'Canada' },
];

function randomInteger(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min));
}

setInterval(() => {
  const { lat, lng, location } = locations[randomInteger(0, locations.length)];

  globe.camera.lookAt(lat, lng, randomInteger(1000, 2000));
}, 5000);
