// uniform vec3 color;

// varying float intensity;
// uniform vec3 viewVector;

// void main() {
	// vec3 glow = color * intensity
	// vec3 glow = vec3(1.0, 0.0, 0.0) * intensity;

  // float zoomFactor = clamp(0.4, 0.7, smoothstep(800.0, 2000.0, viewVector.z));
  // float zoomFactor = smoothstep(800.0, 2000.0, viewVector.z);

	// float  = vec3(1.0, 0.0, 0.0) * zoomFactor;

  // gl_FragColor = vec4( color, 1.0 );
// }

uniform vec3 color;
varying vec3 vertexNormal;
uniform vec3 viewVector;

void main() {
    float atmoFade = dot(vertexNormal, vec3(0.0, 0.0, 1.0));

    float zoomFactor = ( 1.0 - smoothstep(800.0, 2000.0, viewVector.z) ) / 4.0;

    // float upperAtmosphere = pow(0.75 - atmoFade, 2.0) / 2.0;
    float upperAtmosphere = pow(0.75 + zoomFactor - atmoFade, 2.0) / 2.0;
    float lowerAtmosphere = smoothstep(0.0, 1.0, pow(0.82 - atmoFade , 48.0) / 120.0);

    // float atmosphere = clamp(0.0, 1.0, lowerAtmosphere + upperAtmosphere + zoomFactor / 8.0);
    float atmosphere = clamp(0.0, 1.0, lowerAtmosphere + upperAtmosphere);

    float edgeFade = dot(vertexNormal.xy, vec2(-1.0, 1.0)) + 0.25;

    gl_FragColor = vec4(color * edgeFade, 1.0) * atmosphere;
}
