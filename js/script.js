var data = [
  {name: "Nine Inch Nails", color: 0xff2c55},
  {name: "Smashing Pumpkins", color: 0xff0000},
  {name: "Weezer", color: 0x006400},
  {name: "Pearl Jam", color: 0x0000ff},
  {name: "American Analog Set", color: 0xffff00},
  {name: "Sigur Ros", color: 0xff00ff},
  {name: "Radiohead", color: 0x00ffff},
  {name: "Do Make Say Think", color: 0x7fff00},
  {name: "Godspeed!", color: 0xa52a2a}
]

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


var Ball = function (t, c, r, x) {

  this.init = function () {
    this.el = new PIXI.Container();
    this.baseRadius = this.radius = r;

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
      fill : 0xffffff,
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
      mass: 0.001,
      position: [startX, startY],
      angularVelocity: 0,
      fixedRotation: true
    });
    this.body.addShape(this.shape);
    world.addBody(this.body);
  }

  this.update = function () {
    this.body.applyForce([-this.body.position[0] / 100, -this.body.position[1] / 100]);

    this.el.position.x = this.body.position[0];
    this.el.position.y = this.body.position[1];
    this.el.rotation = this.body.angle;
  }

  this.mouseover = function () {
    const movementX = movement.x;
    const movementY = movement.y;
    // console.log("x: " + movementX + ",y: " + movementY);

    let forceX, forceY;
    
    if (movementX < 0) {
      forceX = -this.body.position[0] / 2;
    } else if (movementX == 0) {
      forceX = 0;
    } else {
      forceX = this.body.position[0] / 2;
    }

    if (movementY < 0) {
      forceY = this.body.position[1] / 2;
    } else if (movementY == 0) {
      forceY = 0;
    } else {
      forceY = -this.body.position[1] / 2;
    }

    this.body.applyForce([forceX, forceY]);
  }

  this.mouseout = function () {
  }

  this.click = function () {
    this.radius = this.baseRadius + 0.2;

    TweenMax.to(this.circle.scale, 0.2, {
      x: this.radius,
      y: this.radius,
      onUpdate: this.updateRadius.bind(this),
      onComplete: this.updateRadius.bind(this)
    });
  }

  this.updateRadius = function () {
    this.shape.radius = this.circle.scale.x;
    this.body.updateBoundingRadius();
  }

  this.init.call(this);
  this.circle.mouseover = this.mouseover.bind(this);
  this.circle.mouseout = this.mouseout.bind(this);
  this.circle.click = this.click.bind(this);
}


for (var i = 0; i < data.length; i ++) {
  var ball = new Ball(data[i].name, data[i].color, 0.5, i);
  this.balls.push(ball);
}

function animate() {
  world.step(1/60);

  for (var i = 0; i < this.balls.length; i ++) {
    balls[i].update();
  }

  renderer.render(stage);
  requestAnimationFrame(animate);
}

animate();