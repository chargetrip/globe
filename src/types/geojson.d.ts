import GeoJSONType from '../enums/geojson';

export interface Geometry {
    type: GeoJSONType,
    coordinates: Array<number>
}

export interface GeoJSON {
    type: string,
    geometry: Geometry,
    properties?: object
}
