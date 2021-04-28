class Circle {
  constructor(x, y, r,color) {
    let options = {
      friction: 0.3,
      restitution: 0.6
    };
    this.body = Bodies.circle(x, y, r, options);
    this.r = r;
    this.color = color;
    World.add(world, this.body);
  }

  show() {
    let pos = this.body.position;
    let angle = this.body.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    strokeWeight(0);
    stroke(255);
    fill(this.color);
    ellipse(0, 0, this.r * 2);
    fill(0,0,0);
    noStroke();
    ellipse(-1*this.r*0.3,-1*this.r*0.2,this.r/5, this.r/3);
    ellipse(1*this.r*0.3,-1*this.r*0.2,this.r/5, this.r/3);
    arc(0,this.r*0.2, this.r*0.8, this.r*0.8, 0-PI/20, PI+PI/20, CHORD);
    pop();
  }
}