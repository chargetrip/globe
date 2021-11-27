import GlobeScene from './globe-scene';
import Arc from './arc';
import { GeoJSONType } from './types/geojson';

const container = 'globe-container';

const globe = new GlobeScene(container);
const arc = new Arc({
  startLocation: {
    type: 'Feature',
    geometry: {
      type: GeoJSONType.Point,
      coordinates: [

      ],
    },
  },
  endLocation: {
    type: 'Feature',
    geometry: {
      type: GeoJSONType.Point,
      coordinates: [

      ],
    },
  },
});

globe.addArc(arc);
