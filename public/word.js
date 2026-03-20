class Word {
  constructor(x, y, txt, color) {
    let isMobile = window.innerWidth < 768;
    let fontSize = min(
      random(12, 20) * (isMobile ? 9 : 1),
      (window.innerWidth * 0.85) / (txt.length * 0.65)
    );
    let w = txt.length * fontSize * 0.65;
    let h = fontSize * 1.2;

    let options = { friction: 0.3, restitution: 0.5, angle: random(-PI / 12, PI / 12) };
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.txt = txt;
    this.color = color;
    this.fontSize = fontSize;
    this.w = w;
    this.h = h;
    World.add(world, this.body);
  }

  show() {
    let pos = this.body.position;
    let angle = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    textFont('Modak');
    textSize(this.fontSize);
    textAlign(CENTER, CENTER);
    noStroke();
    fill(this.color);
    text(this.txt, 0, 0);
    pop();
  }
}
