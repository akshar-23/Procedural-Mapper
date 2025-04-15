varying vec2 vUv;
varying float vHeight;

uniform sampler2D displacementMap;
uniform sampler2D textureWater;
uniform sampler2D textureGrass;
uniform sampler2D textureRock;
uniform sampler2D textureSnow;

void main() {
    vec4 texWater = texture2D(textureWater, vUv * 10.0);
    vec4 texGrass = texture2D(textureGrass, vUv * 10.0);
    vec4 texRock  = texture2D(textureRock, vUv * 10.0);
    vec4 texSnow  = texture2D(textureSnow, vUv * 10.0);

    vec4 finalColor;

    if (vHeight < 0.3) {
        finalColor = texWater;
    } else if (vHeight < 0.6) {
        float blend = smoothstep(0.3, 0.6, vHeight);
        finalColor = mix(texWater, texGrass, blend);
    } else if (vHeight < 0.8) {
        float blend = smoothstep(0.6, 0.8, vHeight);
        finalColor = mix(texGrass, texRock, blend);
    } else {
        float blend = smoothstep(0.8, 1.0, vHeight);
        finalColor = mix(texRock, texSnow, blend);
    }

    gl_FragColor = finalColor;
}
