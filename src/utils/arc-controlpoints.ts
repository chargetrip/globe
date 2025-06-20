import { geoInterpolate } from 'd3-geo'
import type { ArcConfig, ControlPoints } from '../types/arc'
import { calculateVec3FromLatLon } from './threejs'

export default function calculateArcControlPoints(config: ArcConfig): ControlPoints {
  const startCoords = {
    lon: config.startLocation.geometry.coordinates[0],
    lat: config.startLocation.geometry.coordinates[1],
  }

  const endCoords = {
    lon: config.endLocation.geometry.coordinates[0],
    lat: config.endLocation.geometry.coordinates[1],
  }

  if (!startCoords.lat || !startCoords.lon || !endCoords.lat || !endCoords.lon)
    throw Error('Invalid coordinates')

  const startVec3 = calculateVec3FromLatLon(startCoords.lon, startCoords.lat, 600)
  const endVec3 = calculateVec3FromLatLon(endCoords.lon, endCoords.lat, 600)
  const arcHeight = startVec3.distanceTo(endVec3) * config.height! + 600

  const interpolate = geoInterpolate(
    [startCoords.lon, startCoords.lat],
    [endCoords.lon, endCoords.lat],
  )

  const midCoords = {
    start: interpolate(0.25),
    end: interpolate(0.75),
  }

  const midStartVec3 = calculateVec3FromLatLon(midCoords.start[0], midCoords.start[1], arcHeight)
  const midEndVec3 = calculateVec3FromLatLon(midCoords.end[0], midCoords.end[1], arcHeight)

  return {
    start: startVec3,
    midStart: midStartVec3,
    midEnd: midEndVec3,
    end: endVec3,
  }
}
