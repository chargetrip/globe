uniform float circleRadius;
uniform float borderInnerRadius;
uniform float borderOuterRadius;
uniform float time;
uniform bool animates;
uniform vec3 ringColor;

varying vec2 vUv;

const float PI = 3.14;
const float TAU = 6.28;

void main() {
    vec2 uv = vec2((vUv.x - 0.5), (vUv.y - 0.5));
    
    // Base color    
    vec4 color = vec4( 1.0, 1.0, 1.0, 0.0 );
    
    float dist = distance( vec2(0.0, 0.0), uv );
        
    // Angle [0, 1]
    float angle = ( atan( uv.y, uv.x ) + PI ) / TAU;

    // Inner circle
    if ( dist < circleRadius ) {
        color = vec4(ringColor, 1.0);
    }

    if ( animates ) {
        // Animate angle over time
        angle = mod( angle + time, 1.0 );
        
        // Draw faded ring
        if ( dist > borderInnerRadius && dist < borderOuterRadius ) {
        
            // Combine an angular and radial fade
            float fade = mix( 0.0, angle, smoothstep( borderOuterRadius, borderInnerRadius, dist ) );
            
            color = mix( color, vec4( ringColor, 1.0 ), fade );
        }
    } else {
        if ( dist > borderInnerRadius && dist < borderOuterRadius ) {
            color = vec4(ringColor, 1.0);
        }
    }

    // Output to screen
    gl_FragColor = color;
}