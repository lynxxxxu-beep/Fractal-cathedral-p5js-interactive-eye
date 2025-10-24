#version 300 es
precision mediump float;

in vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 iMouse;
out vec4 fragColor;

#define S smoothstep
#define PI 3.141592653589793

float Mandelbrot(
  vec2 uv, 
  float zoom, 
  vec2 scale, 
  vec2 cOffset){
  
  const float MAX_IT = 100.0;
  float iter = 0.0;
  vec2 z = uv * zoom;
  vec2 c = cOffset;

  for (float n = 0.0; n < MAX_IT; n++) {
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
    if (length(z) > 4.0) break;
    iter += 1.0;
  }
  float bright = iter / MAX_IT;
  return pow(bright, 0.75);
}

float mirrorRepeat1D(float x, float s) {
    float p = mod(x, 2.0*s);
    return (p < s) ? p : (2.0*s - p);
}

void main(){
  
  float t = uTime * 0.5;
  
  // float ca = iMouse.x / uResolution.x;
  // float cb = iMouse.y / uResolution.y;
  float ca = cos(0.3 * t);
  float cb = sin(t);
  vec2 CHOICE = vec2(ca, cb);
  vec2 scale  = vec2(1.0, 1.0);
  
  vec2 uv = vUv * 2.0 - 1.0;       // sphere's UV
  uv.x *= uResolution.x / uResolution.y;
  const int NUM_DIVISIONS = 9;    // reflection nums in pupil
  float stepX = 2.0 / float(NUM_DIVISIONS);
  float x_fold = mirrorRepeat1D(uv.x, stepX);
  float x_local = x_fold - 0.5 * stepX;
  vec2 uv_mir = vec2(x_local, uv.y);
  
  float brightness = Mandelbrot(uv_mir, 1.5, scale, CHOICE);
  float s = S(0.0, 2.0 / uResolution.y, brightness);

  vec3 colorJu = vec3(      // cosine color control
    0.1 - 0.9 * cos(brightness * 30.0),
    0.1 - 0.9 * cos(brightness * 20.0),
    0.1 - 0.9 * cos(brightness * 40.0)
  );

  colorJu *= s;
  fragColor = vec4(colorJu, 1.0);
}