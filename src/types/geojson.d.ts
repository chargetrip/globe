export enum GeoJSONType {
    Point,
    Linestring,
    Polygon,
    MultiPoint,
    MultiLineString,
    MultiPolygon
}

declare interface Geometry {
    type: GeoJSONType,
    coordinates: Array<number>
}

export interface GeoJSON {
    type: string,
    geometry: Geometry,
    properties?: object
}
