export class Paddle {
  constructor(type, canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.width = 15;
    this.height = 100;
    this.type = type;
    this.x = type === "player" ? canvasWidth - 30 : 15;
    this.y = (canvasHeight - this.height) / 2;
    this.speed = 8;
    this.offset = Math.random() * 60 - 30;
  }

  draw(ctx) {
    ctx.fillStyle = "#FFF";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  reset() {
    this.x = this.type === "player" ? this.canvasWidth - 30 : 15;
    this.y = (this.canvasHeight - this.height) / 2;  
    this.offset = Math.random() * 60 - 30;
  }
}

export class UserPaddle extends Paddle {
  update(keys) {
    // Move up
    if ((keys['ArrowUp'] || keys['w']) && this.y > 0) {
      this.y -= this.speed;
    }
    // Move down
    if ( (keys['ArrowDown'] || keys['s']) && this.y < this.canvasHeight - this.height){
      this.y += this.speed;
    }
  }
}

export class OppPaddle extends Paddle {
  update(ball) {
    const paddleCenter = this.y + this.height / 2;
    const deadZone = 15;
    const targetY = ball.y + this.offset;
    const boundary = (this.canvasWidth / 2) - 80;
    if (ball.x < boundary && ball.dx < 0){
      if (targetY < paddleCenter - deadZone){
        this.y -= this.speed;
        // make sure paddle doesn't go off screen
        if (this.y < 0) { 
          this.y = 0;
        }
      } else if (targetY > paddleCenter + deadZone){
        this.y += this.speed;
        // make sure paddle doesn't go off screen
        if (this.y + this.height > this.canvasHeight) {
          this.y = this.canvasHeight - this.height;
        }
      }
    }
  }
}


export class Ball {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.radius = 8;
    this.dx = 4;
    const range = [-4, -3, -2, -1, 1, 2, 3, 4];
    this.dy = range[Math.floor(Math.random() * range.length)];
    this.speed = 2;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF";
    ctx.fill();
    ctx.closePath();
  }

  reset() {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight / 2;
    this.dx = 4;
    const range = [-4, -3, -2, -1, 1, 2, 3, 4];
    this.dy = range[Math.floor(Math.random() * range.length)];
  }

  update(userPaddle, oppPaddle, onScore) {
    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;

    // Bounce off top or bottom walls
    if (this.y + this.radius > this.canvasHeight || this.y - this.radius < 0) {
      this.dy = -this.dy;
    }
    
    // Bounce off user paddle
    if (
      this.x + this.radius > userPaddle.x &&
      this.y > userPaddle.y &&
      this.y < userPaddle.y + userPaddle.height
    ) {
      this.dx = -Math.abs(this.dx);
    }
    // Bounce of opponent paddle
    if (
      this.x - this.radius < oppPaddle.x + oppPaddle.width &&
      this.y > oppPaddle.y &&
      this.y < oppPaddle.y + oppPaddle.height
    ) {
      this.dx = Math.abs(this.dx);
    }

    // If the paddle hits the right wall
    if (this.x + this.radius > this.canvasWidth) {
      onScore("right");
    }
    // if the paddle hits the left wall
    if (this.x - this.radius < 0) {
      onScore("left");
    }
  }
  
}