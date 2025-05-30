import type { GeoJSON } from './geojson'

export interface BarConfig {
  location: GeoJSON
  startColor?: string
  startColorOpacity?: number
  endColor?: string
  endColorOpacity?: number
  radiusTop?: number
  radiusBottom?: number
  height?: number
}
