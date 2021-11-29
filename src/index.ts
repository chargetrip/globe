import GlobeScene from './components/scene';
import Arc from './components/arc';
import { GeoJSONType } from './enums/geojson';
import Marker from './components/marker';

const container = 'globe-container';

const globe = new GlobeScene(container);

const arc = new Arc({
  startLocation: {
    type: 'Feature',
    geometry: {
      type: GeoJSONType.Point,
      coordinates: [
        -58.3816, -34.6037,
      ],
    },
  },
  endLocation: {
    type: 'Feature',
    geometry: {
      type: GeoJSONType.Point,
      coordinates: [
        4.9041, 52.3676,
      ],
    },
  },
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

globe.addMarker(marker);
