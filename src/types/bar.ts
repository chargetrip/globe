import type { Feature, Point } from 'geojson';

export interface BarConfig {
  location: Feature<Point>
  startColor?: string
  startColorOpacity?: number
  endColor?: string
  endColorOpacity?: number
  radiusTop?: number
  radiusBottom?: number
  height?: number
}
