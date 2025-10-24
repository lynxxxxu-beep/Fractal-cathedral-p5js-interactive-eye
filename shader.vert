#version 300 es

in vec3 aPosition;
in vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vUv;

void main(){
  vUv = aTexCoord;
  vec3 myP = aPosition;
  
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(myP, 1.0);       //give the correct scale to UVs
}