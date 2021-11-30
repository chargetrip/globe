import GlobeScene from './components/scene';
import Arc from './components/arc';
import { GeoJSONType } from './enums/geojson';
import Marker from './components/marker';
import Bar from './components/bar';

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
  startColor: '#FF0000',
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
  height: 125,
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

// globe.addArc(arc);
globe.addMarkers([marker, marker2]);
globe.addBar(bar);
globe.addBar(bar2);
// globe.addArc(arc);
