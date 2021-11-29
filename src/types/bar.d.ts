import { GeoJSON } from './geojson';

export interface BarConfig {
    location: GeoJSON,
    startColor?: string,
    endColor?: string
}
