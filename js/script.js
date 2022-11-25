var data = [
  {name: "Pink", color: 0xff2c55, mass: 0.00075, radius: 0.6, sMin: -1/2, sMax: 1/2},
  {name: "Smashing Pumpkins", color: 0xff0000, mass: 0.0015, radius: 0.75, sMin: -1.5, sMax: 1.5},
  {name: "Weezer", color: 0x006400, mass: 0.001, radius: 0.65, sMin: -1, sMax: 1},
  {name: "Blue", color: 0x0000ff, mass: 0.0005, radius: 0.5, sMin: -1/3, sMax: 1/3},
  {name: "Yellow", color: 0xffff00, mass: 0.0005, radius: 0.5, sMin: -1/3, sMax: 1/3},
  {name: "Sigur Ros", color: 0xff00ff, mass: 0.001, radius: 0.65, sMin: -1, sMax: 1},
  {name: "Radiohead", color: 0x00ffff, mass: 0.001, radius: 0.65, sMin: -1, sMax: 1},
  {name: "Chartreuse", color: 0x7fff00, mass: 0.0015, radius: 0.75, sMin: -1.5, sMax: 1.5},
  {name: "Godspeed!", color: 0xa52a2a, mass: 0.0025, radius: 1, sMin: -3, sMax: 3}
];

const scale = (number, inMin, inMax, outMin, outMax) => {
	return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

var zoom = 100;
var balls = [];

var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {
  transparent: true, antialias: true
});
document.body.appendChild(renderer.view);

let movement = {};
const onMousemove = (event) => {
  movement.x = event.movementX;
  movement.y = event.movementY;
}

const canvas = document.querySelector("canvas");
canvas.addEventListener("mousemove", onMousemove, false);

var world = new p2.World({gravity: [1, 1]});
var stage = new PIXI.Container();
stage.position.x =  renderer.width/2; // center at origin
stage.position.y =  renderer.height/2;
stage.scale.x =  zoom;  // zoom in
stage.scale.y = -zoom; // Note: we flip the y axis to make "up" the physics "up"

//floor
planeShape = new p2.Plane();
planeBody = new p2.Body({ position:[0,-1] });
planeBody.addShape(planeShape);
world.addBody(planeBody);

var Ball = function (t, c, m, r, sMin, sMax, x) {
  this.init = function () {
    this.el = new PIXI.Container();
    this.radius = r;

    this.circle = new PIXI.Graphics();
    this.circle.beginFill(c);
    this.circle.drawCircle(0, 0, 0.99);
    this.circle.endFill();
    this.circle.interactive = true;
    this.circle.hitArea = new PIXI.Circle(0, 0, 1);
    this.circle.scale.x = this.circle.scale.y = this.radius;
    this.el.addChild(this.circle);

    stage.addChild(this.el);

    let text = new PIXI.Text(t, {
      fontFamily : 'Arial',
      fontSize: 14,
      fill : 0x000,
      align : 'center',
      wordWrap: true
    });
    text.anchor.x = 0.5;
    text.anchor.y = 0.5;
    text.position.x = 0;
    text.scale.x = 0.01;
    text.scale.y = -0.01;
    this.el.addChild(text);

    this.shape = new p2.Circle({radius: this.radius});

    let startX = x % 2 === 0 ? 2 + r : -2 - r;
    let startY = r - Math.random() * (r * 2);
    this.body = new p2.Body({
      mass: m,
      position: [startX, startY],
      angularVelocity: 0,
      fixedRotation: true
    });
    this.body.addShape(this.shape);
    world.addBody(this.body);
    this.timer = null;
  }

  this.update = function () {
    this.body.applyForce([-this.body.position[0] / 100, -this.body.position[1] / 100]);

    this.el.position.x = this.body.position[0];
    this.el.position.y = this.body.position[1];
    this.el.rotation = this.body.angle;
  }

  this.mouseover = function () {
    if (!this.timer) {
      let movementX = movement.x;
      let movementY = movement.y;
      if (movementX > 50) {
        movementX = 50;
      } else if (movementX < -50) {
        movementX = -50;
      }

      if (movementY > 50) {
        movementY = 50;
      } else if (movementY < -50) {
        movementY = -50;
      }

      let forceX, forceY;
      forceX = scale(movementX, -50, 50, -Math.abs(sMin * this.body.position[0]), Math.abs(sMax * this.body.position[0]));
      forceY = scale(movementY, -50, 50, Math.abs(sMin * this.body.position[1]), -Math.abs(sMax * this.body.position[1]));
      console.log("Name: " + t + ", x: " + movementX + ", y: " + movementY + ", forceX: " + forceX + ", forceY: " + forceY);

      this.body.applyForce([forceX, forceY]);
      this.timer = setTimeout(() => {
        clearTimeout(this.timer);
        this.timer = null;
      }, 500);
    }
  }

  // this.mouseout = function () {
  // }

  // this.click = function () {
  //   this.radius = this.baseRadius + 0.2;

  //   TweenMax.to(this.circle.scale, 0.2, {
  //     x: this.radius,
  //     y: this.radius,
  //     onUpdate: this.updateRadius.bind(this),
  //     onComplete: this.updateRadius.bind(this)
  //   });
  // }

  // this.updateRadius = function () {
  //   this.shape.radius = this.circle.scale.x;
  //   this.body.updateBoundingRadius();
  // }

  this.init.call(this);
  this.circle.mouseover = this.mouseover.bind(this);
  // this.circle.mouseout = this.mouseout.bind(this);
  // this.circle.click = this.click.bind(this);
}

for (var i = 0; i < data.length; i ++) {
  var ball = new Ball(data[i].name, data[i].color, data[i].mass, data[i].radius, data[i].sMin, data[i].sMax, i);
  balls.push(ball);
}

function animate() {
  world.step(1/60);

  for (var i = 0; i < balls.length; i ++) {
    balls[i].update();
  }

  renderer.render(stage);
  requestAnimationFrame(animate);
}

animate();