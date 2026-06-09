export class Paddle {
  constructor(canvasWidth, canvasHeight) {
    this.width = 100;
    this.height = 15;
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - 30;
    this.speed = 8;
  }

  draw(ctx) {
    ctx.fillStyle = "#0095DD";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(keys, canvasWidth) {
    if ((keys['ArrowRight'] || keys['d']) && this.x < canvasWidth - this.width) {
      this.x += this.speed;
    }
    if ((keys['ArrowLeft'] || keys['a']) && this.x > 0) {
      this.x -= this.speed;
    }
  }
}

export class Ball {
  constructor(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 50;
    this.radius = 8;
    this.dx = 4;
    this.dy = -4;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF";
    ctx.fill();
    ctx.closePath();
  }

  update(canvasWidth, canvasHeight, paddle, onGameOver) {
    this.x += this.dx;
    this.y += this.dy;

    // Bounce off walls (left/right)
    if (this.x + this.radius > canvasWidth || this.x - this.radius < 0) {
      this.dx = -this.dx;
    }
    // Bounce off ceiling
    if (this.y - this.radius < 0) {
      this.dy = -this.dy;
    }

    // Bounce off paddle
    if (
      this.y + this.radius > paddle.y &&
      this.x > paddle.x &&
      this.x < paddle.x + paddle.width
    ) {
      this.dy = -Math.abs(this.dy); // Force up
    }

    // Floor collision
    if (this.y + this.radius > canvasHeight) {
      onGameOver();
    }
  }

  checkBrickCollision(bricks, onBrickDestroyed) {
    for (let brick of bricks) {
      if (brick.status === 1) {
        if (
          this.x > brick.x &&
          this.x < brick.x + brick.width &&
          this.y > brick.y &&
          this.y < brick.y + brick.height
        ) {
          this.dy = -this.dy; 
          
          // Apply damage
          const destroyed = brick.hit(); 
          if (destroyed) {
             // Pass back the brick data
            onBrickDestroyed(brick);
          }
          return true;
        }
      }
    }
    return false;
  }
}

export class Brick {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type; // 1 = normal, 2 = hard, 3 = powerup
    
    // Assign Hit Points based on type
    this.hp = type === 2 ? 2 : 1; 
    this.status = 1; // 1 = active, 0 = broken
  }

  draw(ctx) {
    if (this.status === 1) {
      // Change color based on remaining HP or Type
      if (this.type === 3) {
        ctx.fillStyle = "#FFD700"; // Gold for Power Up brick
      } else if (this.hp === 2) {
        ctx.fillStyle = "#888888"; // Grey for Hard brick
      } else {
        ctx.fillStyle = "#FF5733"; // Vibrant orange/red for standard
      }
      
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }

  // Method to handle taking damage
  hit() {
    this.hp -= 1;
    if (this.hp <= 0) {
      this.status = 0;
      return true; // Returns true if destroyed completely
    }
    return false; // Returns false if it just took damage but survived
  }
}

export class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.radius = 8;
    this.dy = 3; // Falls downwards
    this.type = type;
    this.active = true;
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#00FF00"; // Green pill
    ctx.fill();
    ctx.closePath();
    
    // Draw a little 'L' for Life or 'M' for multiball
    ctx.fillStyle = "#000";
    ctx.font = "10px Arial";
    ctx.fillText(this.type === "life" ? "L" : "M", this.x - 3, this.y + 3);
  }

  update() {
    if (this.active) {
      this.y += this.dy;
    }
  }
}