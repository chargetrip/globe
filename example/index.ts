import GlobeScene from '../src/components/scene';
import { GeoJSONType } from '../src/types/geojson';
import Marker from '../src/components/marker';
import Bar from '../src/components/bar';

const container = "globe-container";

const globe = new GlobeScene(container);

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

globe.camera.moveTo(59.9139, 10.7522, 1200);
