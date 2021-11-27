import { Vector3 } from 'three';
import { GeoJSON } from './geojson';

export interface ArcConfig {
    startLocation: GeoJSON,
    endLocation: GeoJSON,
    startColor?: string,
    endColor?: string
}

export interface ControlPoints {
    start: Vector3,
    midStart: Vector3,
    midEnd: Vector3,
    end: Vector3
}
