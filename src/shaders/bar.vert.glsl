uniform vec3 bboxMin;
uniform vec3 bboxMax;

varying vec3 vUv;

void main() {
    vUv.z = (position.z - bboxMin.z) / (bboxMax.z - bboxMin.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}