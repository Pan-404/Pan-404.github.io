
let angles = [];
let angleV = [];
let r = 4;
let slider = document.getElementById("SRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

function setup() {
  createCanvas(1920, 960);
  let total = floor(width / (r * 2));
  for (let i = 0; i < total + 1; i++) {
    angles[i] = map(i, 0, total, 0, TWO_PI);
    // angleV[i] = 0.01 + i / 100;
  }
}

function draw() {
  background(0);
  translate(1920 / 2, 650 / 2);
  noFill(252, 238, 33);
  stroke(252, 238, 33);
  beginShape();
  for (let i = 0; i < angles.length; i++) {
    let y = map(sin(angles[i]), -1, 1, -50, 150);
    strokeWeight(4);
    let x = map(i, 0, angles.length, -700, 650);
    // line(x, 0, x, y);
    // circle(x, y, r * 2);
    vertex(x,y);
    angles[i] += slider.value/1000;
    // angles[i] += angleV[i];
  }
  endShape();
}
