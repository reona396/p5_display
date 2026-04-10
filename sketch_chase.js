let objs = [];
let targetObjs = [];
const objsNum = 100;
const targetNum = 2;

let isMove = false;

const palette = ["#CE9DD4", "#EFD26C", "#E2B6B7", "#71C3E1", "#9FD4DD"];
const LIMIT_DIST = 20;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  for (let i = 0; i < targetNum; i++) {
    targetObjs.push(new TargetObj());
  }

  for (let i = 0; i < objsNum; i++) {
    objs.push(new MovingObj());
  }

  background("#E7ECF2");
}

function draw() {
  for (let i = 0; i < objs.length; i++) {
    objs[i].seek();
    objs[i].move();
    objs[i].display();
  }

  for (let j = 0; j < targetObjs.length; j++) {
    targetObjs[j].move();
  }
}

//Steering Behavior（操舵行動）を扱うクラス
class MovingObj {
  constructor() {
    this.init();
  }

  init() {
    this.pos = createVector(
      random(-width * 0.1, width * 1.1),
      random(-height * 0.1, height * 1.1),
    ); //位置
    while (
      this.pos.x >= 0 &&
      this.pos.x <= width &&
      this.pos.y >= 0 &&
      this.pos.y <= height
    ) {
      this.pos = createVector(
        random(-width * 0.1, width * 1.1),
        random(-height * 0.1, height * 1.1),
      ); //位置
    }
    this.vel = createVector(0, 0); //速度
    this.acc = createVector(0, 0); //加速度
    this.maxspeed = random(8, 15); //最大スピード
    this.maxsteer = random(0.1, 0.75); //旋回力 大きいほど舵を切りやすい
    this.desired = createVector();

    // targetObjsの中で一番近いものを探す
    this.targetObj = this.findNearestTarget();

    this.shapeScale = random(1, 4);
    this.c = color(random(palette));
    this.c.setAlpha(50);
    this.c = random(100) < 25 ? color("#E7ECF2") : this.c;
    this.lifeCount = random([1, 2, 3]);
  }

  move() {
    this.targetObj = this.findNearestTarget();

    this.vel.add(this.acc); //速度に加速度をプラス
    this.pos.add(this.vel); //位置に速度をプラス
    this.acc.mult(0);
  }

  //操舵行動 追跡(seek)
  seek() {
    let target = this.targetObj.pos;
    //希望ベクトル = 目標位置 - 現在位置
    this.desired = p5.Vector.sub(target, this.pos);

    //希望ベクトルをノーマライズ
    this.desired.normalize();

    //希望ベクトルのマグニチュードをmaxに
    this.desired.setMag(this.maxspeed);

    //ステアリングベクトル（速度） = 希望ベクトル - 現在のベクトル（速度）
    var steer = p5.Vector.sub(this.desired, this.vel);

    //速度を限る
    steer.limit(this.maxsteer);

    //適用
    this.applyForce(steer);
  }

  display() {
    strokeWeight(5);
    stroke(this.c);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.desired.heading() + PI / 2);
    line(0, -10 * this.shapeScale, 0, 10 * this.shapeScale);
    pop();
  }

  applyForce(force) {
    this.acc.add(force);
  }

  // targetObjsの中で一番近いものを探す
  findNearestTarget() {
    // targetObjsの中で一番近いものを探す
    let minDist = 100000;
    let minIndex = 0;
    for (let i = 0; i < targetObjs.length; i++) {
      let dist = targetObjs[i].pos.dist(this.pos);
      if (dist < minDist) {
        minDist = dist;
        minIndex = i;
      }
    }
    const targetObj = targetObjs[minIndex];
    return targetObj;
  }
}

class TargetObj {
  constructor() {
    this.init();
    this.pos = createVector(0, 0);
  }

  init() {
    this.nX = random(1000);
    this.nY = random(1000);
  }

  move() {
    this.pos.set(
      map(
        noise(frameCount * 0.0075 + this.nX),
        0,
        1,
        -width * 0.25,
        width * 1.25,
      ),
      map(
        noise(frameCount * 0.0075 + this.nY),
        0,
        1,
        -height * 0.25,
        height * 1.25,
      ),
    );
  }
}
