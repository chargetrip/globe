import * as THREE from 'three'

import { calculateVec3FromLatLon } from '../utils/threejs'
import type { MarkerConfig } from '../types/marker'
import markerDefaults from '../defaults/marker-defaults'

import markerVertexShader from '../shaders/marker.vert.glsl'
import markerFragmentShader from '../shaders/marker.frag.glsl'
import randMinMax from '../utils/time'

export default class Marker {
  readonly config: MarkerConfig

  constructor(config: MarkerConfig) {
    this.config = {
      ...markerDefaults,
      ...config,
    }
  }

  draw(): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(this.config.size, this.config.size)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        circleRadius: { value: this.config.circleRadius },
        borderInnerRadius: { value: this.config.borderInnerRadius },
        borderOuterRadius: { value: this.config.borderOuterRadius },
        time: { value: randMinMax(0, 10) },
        animates: { value: this.config.animates },
        ringColor: { value: new THREE.Color(this.config.color) },
      },
      fragmentShader: markerFragmentShader,
      vertexShader: markerVertexShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
    })

    const [lng, lat] = this.config.location.geometry.coordinates

    if (!lng || !lat) throw Error('Invalid coordinates.')

    const position = calculateVec3FromLatLon(lng, lat, 600)

    const mesh = new THREE.Mesh(geometry, material)

    // Offset position to prevent shader intersection with globe dots
    mesh.position.copy(position).multiplyScalar(1.0025)
    mesh.lookAt(position.multiplyScalar(2))

    return mesh
  }
}
