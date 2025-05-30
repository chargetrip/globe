import type { GeoJSON } from './geojson'

export interface MarkerConfig {
  location: GeoJSON
  color?: string
  size?: number
  circleRadius?: number
  borderInnerRadius?: number
  borderOuterRadius?: number
  animates?: boolean
}
