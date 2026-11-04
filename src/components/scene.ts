import * as THREE from 'three'
import { parseColor } from '../utils/color'
import GlobeCamera from '../controllers/camera'
import globeDefaults from '../defaults/globe-defaults'
import type { GlobalConfigInput, GlobeColors, GlobeConfig } from '../types/globe'
import Arc from './arc'
import Bar from './bar'
import Globe from './globe'
import Marker from './marker'
import { merge } from 'ts-deepmerge'

export default class GlobeScene {
  #clock: THREE.Clock
  #scene: THREE.Scene

  #camera: THREE.PerspectiveCamera
  camera: GlobeCamera

  #renderer: THREE.WebGLRenderer

  #markerMeshes: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = []
  #barMeshes: THREE.Mesh[] = []
  #arcMeshes: THREE.Mesh[] = []
  #dotSphereMesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null
  #atmosphere: THREE.Mesh<THREE.IcosahedronGeometry, THREE.ShaderMaterial> | undefined
  #baseSphere: THREE.Mesh<THREE.IcosahedronGeometry, THREE.ShaderMaterial> | undefined

  #frameId = 0
  #isDisposed = false
  #resizeObserver: ResizeObserver | undefined

  readonly globeConfig: GlobeConfig
  readonly container: HTMLCanvasElement

  constructor(globeConfig: GlobalConfigInput, antialias = true, alpha = true) {
    this.globeConfig = merge.withOptions(
      { mergeArrays: false, allowUndefinedOverrides: false },
      globeDefaults,
      globeConfig,
    ) as GlobeConfig

    this.container = this.getContainer(this.globeConfig.container)

    this.#clock = new THREE.Clock()
    this.#scene = new THREE.Scene()
    this.#camera = new THREE.PerspectiveCamera()
    this.#renderer = new THREE.WebGLRenderer({
      alpha,
      antialias,
      canvas: this.container,
    })

    this.camera = new GlobeCamera(
      this.#camera,
      this.#clock,
      0.05,
      500,
      this.globeConfig.cameraAnimation,
    )

    this.#resizeObserver = new ResizeObserver(this.handleResize)
    this.#resizeObserver.observe(this.container)
    this.handleResize()

    this.drawGlobe()
    this.init()
  }

  /**
   * Return the element for the HTMLCanvasElement
   * @param {string | HTMLCanvasElement} container - Globe target container
   * @returns {HTMLCanvasElement} - Globe container
   */
  private getContainer(container: string | HTMLCanvasElement): HTMLCanvasElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container)

      if (!(element instanceof HTMLCanvasElement)) {
        throw new Error('globe container was not found')
      }

      return element
    }

    return container
  }

  private handleResize = (): void => {
    const canvas = this.#renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    if (canvas.width !== width || canvas.height !== height) {
      this.#renderer.setSize(width, height, false)
      this.#camera.aspect = width / height
      this.#camera.updateProjectionMatrix()
    }
  }

  private init(): void {
    this.#camera.fov = 45
    this.#camera.aspect = this.container.clientWidth / this.container.clientHeight
    this.#camera.near = 200
    this.#camera.far = 4000

    this.#camera.position.set(0, 0, 2000)
    this.#camera.updateProjectionMatrix()

    this.#renderer.setPixelRatio(window.devicePixelRatio)

    this.camera.pivot.add(this.#camera)
    this.#scene.add(this.camera.pivot)

    this.render()
  }

  private drawGlobe(): void {
    const globe = new Globe(this.globeConfig, this.#camera)

    this.#baseSphere = globe.drawBaseSphere()
    this.#scene.add(this.#baseSphere)

    if (this.globeConfig.atmosphere?.render) {
      this.#atmosphere = globe.drawAtmosphere()
      this.#scene.add(this.#atmosphere)
    }

    globe.drawDotSphere().then((dotSphere) => {
      if (this.#isDisposed) {
        this.#disposeMesh(dotSphere)
        return
      }

      this.#dotSphereMesh = dotSphere
      this.#scene.add(dotSphere)
    })
  }

  private animate(): void {
    const delta = this.#clock.getDelta()

    if (this.#atmosphere?.material.uniforms.viewVector) {
      this.#atmosphere.material.uniforms.viewVector.value = this.#camera.position
    }

    if (this.globeConfig.cameraAnimation?.enabled && document.visibilityState !== 'hidden') {
      const { damping, speed } = this.globeConfig.cameraAnimation
      const step = speed * delta * damping

      if (!this.camera.pivot.quaternion.equals(this.camera.targetQuaternion)) {
        this.camera.pivot.quaternion.slerp(this.camera.targetQuaternion, step)
      }

      if (!this.camera.camera.position.equals(this.camera.targetPosition)) {
        this.camera.camera.position.lerp(this.camera.targetPosition, step)
      }
    } else {
      this.camera.pivot.quaternion.copy(this.camera.targetQuaternion)
      this.camera.camera.position.copy(this.camera.targetPosition)
    }

    this.#markerMeshes.forEach((marker) => {
      const currentTime = marker.material.uniforms?.time?.value
      marker.material.uniforms.time!.value = (currentTime - 0.015) % 1024
    })

    if (this.#dotSphereMesh && this.globeConfig.animates) {
      const currentTime = this.#dotSphereMesh.material.uniforms?.time?.value
      this.#dotSphereMesh.material.uniforms.time!.value = (currentTime + 0.01) % 1024
    }
  }

  private render(): void {
    if (this.#isDisposed) return

    this.#frameId = requestAnimationFrame(() => this.render())

    this.animate()

    this.#renderer.render(this.#scene, this.#camera)
  }

  addArc(arc: Arc): void {
    const arcMesh = arc.draw()
    this.#scene.add(arcMesh)

    this.#arcMeshes.push(arcMesh)
  }

  addMarkers(markers: Marker | Marker[]): void {
    markers = Array.isArray(markers) ? markers : [markers]

    for (const marker of markers) {
      const mesh = marker.draw()
      this.#markerMeshes.push(mesh)
      this.#scene.add(mesh)
    }
  }

  addBars(bars: Bar | Bar[]): void {
    bars = Array.isArray(bars) ? bars : [bars]

    for (const bar of bars) {
      const mesh = bar.draw()
      this.#barMeshes.push(mesh)
      this.#scene.add(mesh)
    }
  }

  /**
   * Update the globe colors in place, e.g. when switching between a light and dark theme.
   * Annotations (arcs, markers, bars) are configured per instance and need to be re-added.
   */
  setColors({ baseDay, baseNight, atmosphere, dots }: GlobeColors): void {
    if (baseDay) {
      this.globeConfig.baseSphere.colorDay = baseDay
      this.#baseSphere?.material.uniforms.colorDay?.value.copy(parseColor(baseDay))
    }

    if (baseNight) {
      this.globeConfig.baseSphere.colorNight = baseNight
      this.#baseSphere?.material.uniforms.colorNight?.value.copy(parseColor(baseNight))
    }

    if (atmosphere) {
      this.globeConfig.atmosphere.color = atmosphere
      this.#atmosphere?.material.uniforms.color?.value.copy(parseColor(atmosphere))
    }

    if (dots) {
      this.globeConfig.dotSphere.color = dots
      this.#dotSphereMesh?.material.uniforms.color?.value.copy(parseColor(dots))
    }
  }

  /**
   * Stop rendering and release all GPU resources. The scene can't be used afterwards.
   */
  dispose(): void {
    if (this.#isDisposed) return

    this.#isDisposed = true
    cancelAnimationFrame(this.#frameId)
    this.#resizeObserver?.disconnect()

    this.removeAllAnnotations()

    for (const mesh of [this.#baseSphere, this.#atmosphere, this.#dotSphereMesh]) {
      if (mesh) this.#disposeMesh(mesh)
    }

    this.#renderer.dispose()
    this.#renderer.forceContextLoss()
  }

  #disposeMesh(mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>): void {
    this.#scene.remove(mesh)
    mesh.geometry.dispose()

    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      material.dispose()
    }
  }

  #removeMeshes(
    meshes: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>[],
  ): void {
    for (const mesh of meshes) {
      this.#disposeMesh(mesh)
    }

    meshes.length = 0
  }

  removeAllMarkers(): void {
    this.#removeMeshes(this.#markerMeshes)
  }

  removeAllBars(): void {
    this.#removeMeshes(this.#barMeshes)
  }

  removeAllArcs(): void {
    this.#removeMeshes(this.#arcMeshes)
  }

  removeAllAnnotations(): void {
    this.removeAllMarkers()
    this.removeAllBars()
    this.removeAllArcs()
  }
}
