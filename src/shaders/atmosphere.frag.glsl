uniform vec3 color;
varying vec3 vertexNormal;

void main() {
    float atmoFade = dot(vertexNormal, vec3(0.0, 0.0, 1.0));

    float upperAtmosphere = pow(0.75 - atmoFade, 2.0) / 2.0;
    float lowerAtmosphere = smoothstep(0.0, 1.0, pow(0.82 - atmoFade , 48.0) / 120.0);
    float atmosphere = lowerAtmosphere + upperAtmosphere;

    float edgeFade = dot(vertexNormal.xy, vec2(-1.0, 1.0)) + 0.25;

    gl_FragColor = vec4(color * edgeFade, 1.0) * atmosphere;
}
