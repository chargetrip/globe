import type { Feature, Point } from 'geojson';

export interface MarkerConfig {
  location: Feature<Point>
  color?: string
  size?: number
  circleRadius?: number
  borderInnerRadius?: number
  borderOuterRadius?: number
  animates?: boolean
}
