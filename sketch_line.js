let objs = [];
let objsNum = 100;

const palette = [
  "#FF00D8",
  "#FFB201",
  "#98FF00",
  "#00FFC4",
  "#0082FE",
  "#B733FF",
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  angleMode(DEGREES);
  frameRate(60);
  noFill();

  background(0);

  for (let i = 0; i < objsNum; i++) {
    objs.push(new Obj(i));
  }
}

function draw() {
  blendMode(BLEND);
  background("#111111");

  blendMode(SCREEN);

  for (let i = 0; i < objs.length; i++) {
    objs[i].move();
    objs[i].display();
  }
}

class Obj {
  constructor(tmpIndex) {
    this.index = tmpIndex;
    this.startX = random(width);
    this.init();
    this.goalX = this.startX + this.rangeX;
  }

  init() {
    this.rangeX = random([
      5, 5, 5, 5, 5, 5, 10, 10, 10, 20, 20, 100, 100, 100, 100, 200, 300
    ]);
    this.step = map(this.rangeX, 5, 200, 5, 30); //random(1, 20);
    this.strWeight = random(3, 30);
    this.c = color(random(palette));
    if (this.rangeX < 100) {
      this.c.setAlpha(150);
    }
    this.isOut = random(100) < 10 ? true : false;
  }

  move() {
    this.startX += this.step;
    this.goalX = this.startX + this.rangeX;

    if (this.startX > width) {
      this.init();
      this.startX = -this.rangeX;
      this.goalX = this.startX + this.rangeX;
    }
  }

  display() {
    strokeWeight(this.strWeight);
    stroke(this.c);
    noFill();
    beginShape();
    for (let x = this.startX; x <= this.goalX; x++) {
      let y = map(
        noise(
          x * 0.001,
          this.isOut ? this.index * 0.025 : this.index * 0.005,
          frameCount * 0.003
        ),
        0,
        1,
        -height * 0.25,
        height * 1.25
      );
      vertex(x, y);
    }
    endShape();
  }
}
