const config = {
    gameHeight: 600,
    gameWidth: 900,
    get blockWidth() {
        return (this.gameWidth - this.margin * 2 - this.blockGap) / this.blocksX;
    },
    blockHeight: 25,
    margin: 100,
    blockGap: 2,
    blocksX: 10,
    blocksY: 4,
    ballSpeed: 6,
    ballRadius: 6,
    batHeight: 13,
    batWidth: 80,
    frameRate: 60,
};
class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.x = x;
        this.y = y;
    }
}
class Ball {
    constructor(pos, angle, radius, speed, colour) {
        this.pos = pos;
        this.angle = angle;
        this.radius = radius;
        this.speed = speed;
        this.colour = colour;
        this.pos = pos;
        this.radius = radius;
        this.speed = speed;
        this.angle = angle;
    }
    // take the ctx from the game class and render the ball onto it
    render(ctx) {
        ctx.fillStyle = this.colour;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
// class representing a block i.e. a brick or the bat
class Block {
    constructor(pos, size, colour) {
        this.pos = pos;
        this.size = size;
        this.colour = colour;
        this.pos = pos;
        this.size = size;
        this.colour = colour;
    }
    render(ctx) {
        const gap = config.blockGap;
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.pos.x + gap, this.pos.y + gap, this.size.x - gap, this.size.y - gap);
    }
    // check if the ball is touching the block
    touching(ball) {
        return ball.pos.x + ball.radius >= this.pos.x &&
            ball.pos.x - ball.radius <= this.pos.x + this.size.x &&
            ball.pos.y + ball.radius >= this.pos.y &&
            ball.pos.y - ball.radius <= this.pos.y + this.size.y;
    }
    // calculate the angle of the ball after it hits the block
    bounceAngle(ball) {
        const ballCenter = new Vec(ball.pos.x, ball.pos.y);
        const blockCenter = new Vec(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        const angle = Math.atan2(ballCenter.y - blockCenter.y, ballCenter.x - blockCenter.x);
        return angle;
    }
}
class Game {
    constructor() {
        // initialise the canvas with the game dimensions
        this.canvas = document.querySelector("canvas");
        this.canvas.width = config.gameWidth;
        this.canvas.height = config.gameHeight;
        this.ctx = this.canvas.getContext("2d");
        this.blocks = [];
        // create a matrix of blocks in brick wall formation
        for (let i = 0; i < config.blocksY; i++) {
            this.blocks[i] = [];
            for (let j = 0; j < (config.blocksX - i % 2); j++) {
                this.blocks[i][j] = new Block(new Vec(j * config.blockWidth + (i % 2) * config.blockWidth / 2 + config.margin, i * config.blockHeight + config.margin / 2), new Vec(config.blockWidth, config.blockHeight), "#f24dee");
            }
        }
        // initialise the ball with a random angle
        this.ball = new Ball(new Vec(450, 350), Math.random() * Math.PI / 2 + Math.PI / 4, config.ballRadius, config.ballSpeed, "#fff");
        // initialise the bat in the middle of the bottom of the screen
        this.bat = new Block(new Vec(config.gameWidth / 2 - config.batWidth / 2, this.canvas.height - config.batHeight - config.blockGap), new Vec(config.batWidth, config.batHeight), "#4ec2f0");
        // move the bat with the mouse
        document.addEventListener("mousemove", e => {
            this.bat.pos.x = e.clientX - this.canvas.offsetLeft - config.batWidth / 2;
        });
        // re-render the game every frame
        this.gameLoop = setInterval(() => this.render(this.ctx), 1000 / config.frameRate);
    }
    gameOver(message) {
        setTimeout(() => {
            this.ctx.clearRect(0, 0, config.gameWidth, config.gameHeight); // clear the whole canvas
            this.ctx.font = "60px system-ui";
            this.ctx.fillStyle = "#fff";
            this.ctx.textAlign = "center";
            this.ctx.fillText(message, config.gameWidth / 2, config.gameHeight / 2);
            this.ctx.font = "20px system-ui";
            this.ctx.fillText("Click to play again", config.gameWidth / 2, config.gameHeight / 2 + 40);
            clearInterval(this.gameLoop); // exit the game loop
            this.canvas.onclick = () => location.reload(); // reload the page on click
        }, 1000);
    }
    render(ctx) {
        // start on a blank canvas
        ctx.clearRect(0, 0, config.gameWidth, config.gameHeight);
        for (const row of this.blocks) {
            for (const block of row) {
                block.render(ctx);
            }
        }
        this.ball.render(ctx);
        this.bat.render(ctx);
        // move the ball at the current angle
        this.ball.pos.x += Math.cos(this.ball.angle) * config.ballSpeed;
        this.ball.pos.y += Math.sin(this.ball.angle) * config.ballSpeed;
        if (this.ball.pos.y + this.ball.radius >= config.gameHeight) { // if the ball has hit the bottom
            this.gameOver("Game over");
        }
        if (this.ball.pos.y - this.ball.radius <= 0) { // if the ball has hit the top
            if (!this.blocks.flat().length) { // if the all the blocks are gone
                this.gameOver("You win!");
            }
            else { // otherwise bounce the ball off the top
                this.ball.angle = Math.PI * 2 - this.ball.angle;
            }
            // if the ball hits one of the sides
        }
        if (this.ball.pos.x + this.ball.radius >= config.gameWidth || this.ball.pos.x - this.ball.radius <= 0) {
            this.ball.angle = Math.PI - this.ball.angle;
        }
        this.blocks.forEach((row, i) => {
            row.forEach((block, j) => {
                if (block.touching(this.ball)) {
                    this.ball.angle = block.bounceAngle(this.ball);
                    this.blocks[i].splice(j, 1); // remove the block if it's hit
                }
            });
        });
        // bounce the ball off the bat if it's touching it
        this.ball.angle = this.bat.touching(this.ball)
            ? this.bat.bounceAngle(this.ball)
            : this.ball.angle;
    }
}
const game = new Game();
