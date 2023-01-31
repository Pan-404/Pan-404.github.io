
let angles = [];
let angleV = [];
let r = 4;
let SSlider = document.getElementById("SRange");
var output = document.getElementById("demo");
output.innerHTML = SSlider.value;

SSlider.oninput = function() {
  output.innerHTML = this.value;
}

function setup() {
  createCanvas(1800, 650);
  let total = floor(width / (r * 2));
  for (let i = 0; i < total + 1; i++) {
    angles[i] = map(i, 0, total, 0, 2 * TWO_PI);
    // angleV[i] = 0.01 + i / 100;
  }
}

function draw() {
  
  background(0);
  translate(1800 / 3, 800 / 2);
  noFill(252, 238, 33);
  stroke(255, 255, 255);
  beginShape();
  for (let i = 0; i < angles.length; i++) {
    let y = map(sin(angles[i]), -1, 1, -200, 200);
    strokeWeight(4);
    let x = map(i, 0, angles.length, -200, 900);
    //line(x, 0, x, y);
    //circle(x, y, r * 2);
    vertex(x,y);
    angles[i] += SSlider.value/1000;
    // angles[i] += angleV[i];
  }
  endShape();
}
