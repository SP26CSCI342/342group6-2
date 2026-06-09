const TURN_SPEED = 0.08;
const THRUST = 0.12;
const FRICTION = 0.99;
const MAX_SPEED = 7;
const BULLET_SPEED = 7;
const BULLET_LIFE = 60;
const SHOT_COOLDOWN = 10;

function wrap(value, max) {
  if (value < 0) return value + max;
  if (value > max) return value - max;
  return value;
}

export class Player {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.radius = 12;
    this.reset();
  }

  reset() {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight / 2;
    this.angle = -Math.PI / 2;
    this.velocity = { x: 0, y: 0 };
    this.cooldown = 0;
    this.invulnFrames = 120;
  }

  draw(ctx) {
    if (this.invulnFrames > 0 && Math.floor(this.invulnFrames / 6) % 2 === 0) {
      return;
    }
    const noseX = this.x + Math.cos(this.angle) * this.radius * 1.4;
    const noseY = this.y + Math.sin(this.angle) * this.radius * 1.4;
    const leftX = this.x + Math.cos(this.angle + 2.5) * this.radius;
    const leftY = this.y + Math.sin(this.angle + 2.5) * this.radius;
    const rightX = this.x + Math.cos(this.angle - 2.5) * this.radius;
    const rightY = this.y + Math.sin(this.angle - 2.5) * this.radius;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(noseX, noseY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.stroke();

    if (this.thrusting) {
      const flameX = this.x - Math.cos(this.angle) * this.radius * 0.9;
      const flameY = this.y - Math.sin(this.angle) * this.radius * 0.9;
      const tipX = this.x - Math.cos(this.angle) * this.radius * 1.8;
      const tipY = this.y - Math.sin(this.angle) * this.radius * 1.8;
      ctx.strokeStyle = "orange";
      ctx.beginPath();
      ctx.moveTo(leftX * 0.5 + flameX * 0.5, leftY * 0.5 + flameY * 0.5);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(rightX * 0.5 + flameX * 0.5, rightY * 0.5 + flameY * 0.5);
      ctx.stroke();
    }
  }

  update(keys) {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) this.angle -= TURN_SPEED;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) this.angle += TURN_SPEED;

    this.thrusting = keys['ArrowUp'] || keys['w'] || keys['W'];
    if (this.thrusting) {
      this.velocity.x += Math.cos(this.angle) * THRUST;
      this.velocity.y += Math.sin(this.angle) * THRUST;
      const speed = Math.hypot(this.velocity.x, this.velocity.y);
      if (speed > MAX_SPEED) {
        this.velocity.x = (this.velocity.x / speed) * MAX_SPEED;
        this.velocity.y = (this.velocity.y / speed) * MAX_SPEED;
      }
    } else {
      this.velocity.x *= FRICTION;
      this.velocity.y *= FRICTION;
    }

    this.x = wrap(this.x + this.velocity.x, this.canvasWidth);
    this.y = wrap(this.y + this.velocity.y, this.canvasHeight);

    if (this.cooldown > 0) this.cooldown--;
    if (this.invulnFrames > 0) this.invulnFrames--;
  }

  tryShoot(keys) {
    if (this.cooldown > 0) return null;
    if (!(keys[' '] || keys['Spacebar'] || keys['Space'])) return null;
    this.cooldown = SHOT_COOLDOWN;
    const noseX = this.x + Math.cos(this.angle) * this.radius * 1.4;
    const noseY = this.y + Math.sin(this.angle) * this.radius * 1.4;
    return new Bullet(
      noseX,
      noseY,
      Math.cos(this.angle) * BULLET_SPEED,
      Math.sin(this.angle) * BULLET_SPEED,
      this.canvasWidth,
      this.canvasHeight
    );
  }
}

export class Bullet {
  constructor(x, y, vx, vy, canvasWidth, canvasHeight) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.life = BULLET_LIFE;
    this.radius = 2;
  }

  update() {
    this.x = wrap(this.x + this.vx, this.canvasWidth);
    this.y = wrap(this.y + this.vy, this.canvasHeight);
    this.life--;
  }

  draw(ctx) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  isDead() {
    return this.life <= 0;
  }
}

export class Asteroid {
  constructor(canvasWidth, canvasHeight, opts = {}) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.size = opts.size ?? 3;
    this.radius = this.size === 3 ? 40 : this.size === 2 ? 22 : 12;

    if (opts.x !== undefined && opts.y !== undefined) {
      this.x = opts.x;
      this.y = opts.y;
    } else {
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0)      { this.x = Math.random() * canvasWidth; this.y = -this.radius; }
      else if (edge === 1) { this.x = canvasWidth + this.radius;   this.y = Math.random() * canvasHeight; }
      else if (edge === 2) { this.x = Math.random() * canvasWidth; this.y = canvasHeight + this.radius; }
      else                 { this.x = -this.radius;                this.y = Math.random() * canvasHeight; }
    }

    const speed = (1 + Math.random() * 1.5) * (4 - this.size) * 0.6;
    const dir = Math.random() * Math.PI * 2;
    this.velocity = { x: Math.cos(dir) * speed, y: Math.sin(dir) * speed };

    const verts = 8 + Math.floor(Math.random() * 4);
    this.shape = [];
    for (let i = 0; i < verts; i++) {
      const jitter = 0.75 + Math.random() * 0.5;
      this.shape.push(jitter);
    }
  }

  draw(ctx) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < this.shape.length; i++) {
      const a = (i / this.shape.length) * Math.PI * 2;
      const r = this.radius * this.shape[i];
      const px = this.x + Math.cos(a) * r;
      const py = this.y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  update() {
    this.x = wrap(this.x + this.velocity.x, this.canvasWidth);
    this.y = wrap(this.y + this.velocity.y, this.canvasHeight);
  }

  collidesWith(obj) {
    const dx = this.x - obj.x;
    const dy = this.y - obj.y;
    return Math.hypot(dx, dy) < this.radius + obj.radius;
  }

  split() {
    if (this.size <= 1) return [];
    const next = [];
    for (let i = 0; i < 2; i++) {
      next.push(new Asteroid(this.canvasWidth, this.canvasHeight, {
        x: this.x,
        y: this.y,
        size: this.size - 1,
      }));
    }
    return next;
  }

  scoreValue() {
    return this.size === 3 ? 20 : this.size === 2 ? 50 : 100;
  }
}