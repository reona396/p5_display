let shapes = [];
const shapesNum = 30;
let pg;
let s;
let bloom;

let blocks = [];
const blocksNum = 10;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  bloom = createFilterShader(fip.bloom);

  angleMode(DEGREES);
  pg = createGraphics(20, 20);
  pg.colorMode(HSB, 360, 100, 100, 100);
  pg.angleMode(DEGREES);
  pg.rectMode(CENTER);

  for (let i = 0; i < shapesNum; i++) {
    shapes.push(new Shape());
  }

  for (let i = 0; i < blocksNum; i++) {
    blocks.push(new Block());
  }

  texture(pg);
  noStroke();
  s = min(width, height) * 0.475;
}

function draw() {
  background(0);

  pg.blendMode(BLEND);
  pg.background(0);
  pg.blendMode(ADD);

  for (let i = 0; i < shapes.length; i++) {
    shapes[i].move();
    shapes[i].display();
  }

  for (let i = 0; i < blocks.length; i++) {
    blocks[i].move();
    blocks[i].display();
  }

  filter(bloom);
  bloom.setUniform("intensity", 2);
  bloom.setUniform("glow", 8.0);
}

class Block {
  constructor() {
    this.rot = createVector(
      random(-360, 360),
      random(-360, 360),
      random(-360, 360)
    );
    this.rotSpeed = createVector(
      random(0.1, 0.5) * random([-1, 1]),
      random(0.1, 0.5) * random([-1, 1]),
      random(0.1, 0.5) * random([-1, 1])
    );
  }

  move() {
    this.rot.x += this.rotSpeed.x;
    this.rot.y += this.rotSpeed.y;
    this.rot.z += this.rotSpeed.z;
  }

  display() {
    push();
    rotateX(this.rot.x);
    rotateY(this.rot.y);
    rotateZ(this.rot.z);
    box(s);
    pop();
  }
}

class Shape {
  constructor() {
    this.r = random(0, pg.width * 0.7);
    this.init();
  }

  init() {
    this.c =
      random(1) > 0.3
        ? pg.color(random(360), 100, random(70, 100), 50)
        : color(0);
    this.t = random(360);
    this.speed = random(0.1, 0.3) * 2;
    this.s = random(2, 8);
  }

  move() {
    this.r += this.speed;
    if (this.r > pg.width * 0.7) {
      this.r = 0;
      this.init();
    }
  }

  display() {
    pg.push();
    pg.translate(pg.width / 2, pg.height / 2);
    pg.fill(this.c);
    pg.noStroke();
    let x = this.r * cos(this.t);
    let y = this.r * sin(this.t);
    pg.square(x, y, this.s);
    pg.pop();
  }
}
