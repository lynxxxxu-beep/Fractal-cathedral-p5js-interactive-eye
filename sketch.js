let sh0;
let eye0, eye1, eye2, outFrame;
let overlay;
let font;
let faceX = 0.0,
  faceY = 0.0;
let yaw = 0,
  pitch = 0;
let targetYaw = 0,
  targetPitch = 0;
let faceMesh;
let predictions = [];

function preload() {
  let options = {
    maxFaces: 1,
    refineLandmarks: false,
    flipped: false,
  };
  faceMesh = ml5.faceMesh(options);
  eye0 = loadImage("eye-frame.png");
  eye1 = loadImage("eye-pupil.png");
  eye2 = loadImage("eye-close.png");
  outFrame = loadImage("frame.png");
  font = loadFont("Courier Prime Bold Italic.ttf");
  sh0 = loadShader("shader.vert", "shader.frag");
}

function gotResults(results) {
  predictions = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  overlay = createGraphics(732, 740);

  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();
  faceMesh.detectStart(video, gotResults);
}

function findFace() {
  for (let face of predictions) {
    findX = (face.box.xMin + face.box.xMax) / 2.0;
    findY = (face.box.yMin + face.box.yMax) / 2.0;
    faceX = map(findX, 0, 320, width, -width);
    faceY = map(findY, 0, 240, -height, height);
  }
}

function draw() {
  findFace();
  background(0);
  noStroke();
  fill(255);
  plane(500, 500);

  const MAX_YAW = PI * 0.1;
  const MAX_PITCH = PI * 0.05;

  targetYaw = faceX * MAX_YAW;
  targetPitch = faceY * MAX_PITCH;

  const SMOOTH = 0.15; // 0.1~0.25
  yaw = lerp(yaw, targetYaw, SMOOTH);
  pitch = lerp(pitch, targetPitch, SMOOTH);

  push();
  shader(sh0);
  sh0.setUniform("uResolution", [width, height]);
  sh0.setUniform("uTime", millis() / 1000.0);
  sh0.setUniform("iMouse", [mouseX, map(mouseY, 0, height, height, 0)]);

  translate(120, -200, 210);

  rotateX(HALF_PI - pitch * 0.001);
  rotateZ(-yaw * 0.001);

  if (frameCount % 120 === 0) {
    console.log(predictions[0]);
    console.log(pitch);
    console.log(yaw);
  }

  translate(-120, 200, -210);

  sphere(50.0);

  pop();

  const t = millis() % 10000;
  const flashDuration = 200;
  let currentEye = eye0;
  if (t < flashDuration) {
    currentEye = eye2;
  }

  overlay.clear();
  overlay.imageMode(CENTER);
  overlay.image(currentEye, overlay.width / 2, overlay.height / 2, 500, 500);
  overlay.image(outFrame, overlay.width / 2, overlay.height / 2, 732, 740);

  push();
  resetMatrix();
  drawingContext.disable(drawingContext.DEPTH_TEST);
  image(overlay, -250, -250, 500, 500);
  drawingContext.enable(drawingContext.DEPTH_TEST);
  pop();

  //text
  push();
  resetMatrix();
  drawingContext.disable(drawingContext.DEPTH_TEST);
  textAlign(CENTER, CENTER);
  textFont(font, 50);
  fill("blue");
  text("i", -210, -210);
  text("N", 0, -210);
  fill("magenta");
  text("f", 210, -210);
  fill("blue");
  text("i", 210, 0);
  text("N", 210, 210);
  text("I", 0, 210);
  fill("greenyellow");
  text("t", -210, 210);
  fill("magenta");
  text("Y", -210, 0);
  fill("black");
  text("?", 0, 0);
  drawingContext.enable(drawingContext.DEPTH_TEST);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
