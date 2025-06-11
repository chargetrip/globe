import { Vector3 } from 'three'
import type { Feature, Point } from 'geojson'

export interface ArcConfig {
  startLocation: Feature<Point>
  endLocation: Feature<Point>
  startColor?: string
  startColorOpacity?: number
  endColor?: string
  endColorOpacity?: number
  height?: number
  radius?: number
}

export interface ControlPoints {
  start: Vector3
  midStart: Vector3
  midEnd: Vector3
  end: Vector3
}
