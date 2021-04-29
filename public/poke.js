class Poke {
  constructor(x, y, r, color) {
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
    
    stroke(0);
    fill(this.color);
    // palm

    //finger1

    strokeWeight(0);
    rect(this.r / 2 + 0.1 * this.r, -0.75 * this.r, 1.25 * this.r, this.r / 2);//finger1
    rect(this.r / 2 - 0.15 * this.r, -0.25 * this.r, 0.75 * this.r, this.r / 2);//finger2
    rect(this.r / 2 - 0.15 * this.r, 0.25 * this.r, 0.75 * this.r, this.r / 2); //finger3
    rect(this.r / 2 - 0.26 * this.r, 0.75 * this.r, 0.53 * this.r, this.r / 2);//finger4
    ellipse(this.r * 1.25, -0.75 * this.r, this.r / 2);//finger 1
    ellipse(this.r - 0.25 * this.r, -0.25 * this.r, this.r / 2);//finger2
    ellipse(this.r - 0.25 * this.r, 0.25 * this.r, this.r / 2);//finger3
    ellipse(this.r - 0.5 * this.r, 0.75 * this.r, this.r / 2);//finger4
    arc(0.15, 0, this.r * 2, this.r * 2, PI - HALF_PI, PI + HALF_PI,OPEN);//palm
    strokeWeight(1);
    line(0,-0.5*this.r,this.r,-0.5*this.r);
    line(0,0,this.r,0);
    line(0,0.5*this.r,this.r,0.5*this.r);
    //fill(255)
    ellipse(this.r * 1.25, -0.75 * this.r, this.r / 2.6);//finger 1
    
    pop();
  }
}
