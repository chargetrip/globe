import * as THREE from 'three'

/**
 * Parse a CSS color (hex, rgb(), hsl() or a named color) into a THREE.Color holding plain sRGB values.
 *
 * The shaders write colors to the canvas as is, without a linear to sRGB conversion, so the
 * color management of THREE.Color (which converts to linear) must be undone to match the CSS color.
 */
export const parseColor = (value: string): THREE.Color => new THREE.Color(value).convertLinearToSRGB()
