export const FIELD_WIDTH = 300;
export const FIELD_HEIGHT = 160;
export const PADDLE_STEP = 18;

const PADDLE_WIDTH = 56;
const PADDLE_HEIGHT = 6;
const PADDLE_Y = FIELD_HEIGHT - 14;
const BALL_RADIUS = 3;
const BRICK_COLS = 10;
const BRICK_ROWS = 5;
const BRICK_W = 28;
const BRICK_H = 8;
const BRICK_PITCH_X = 30;
const BRICK_PITCH_Y = 11;
const BRICK_TOP = 20;
const LIVES = 3;

const BRICK_ROW_COLORS = ['#8fd8ff', '#4aa8f0', '#5fe3b5', '#b5f26b', '#f7c95a'];

export interface Brick {
  x: number;
  y: number;
  row: number;
  alive: boolean;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface BrickGame {
  bricks: Brick[];
  ball: Ball;
  paddleX: number;
  launched: boolean;
  lives: number;
  score: number;
  level: number;
  over: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ballSpeed = (level: number) => 2.4 + (level - 1) * 0.3;

function createBricks(): Brick[] {
  const bricks: Brick[] = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({ x: col * BRICK_PITCH_X + 1, y: BRICK_TOP + row * BRICK_PITCH_Y, row, alive: true });
    }
  }
  return bricks;
}

function ballOnPaddle(paddleX: number): Ball {
  return { x: paddleX + PADDLE_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS - 1, dx: 0, dy: 0 };
}

export function createBrickGame(): BrickGame {
  const paddleX = (FIELD_WIDTH - PADDLE_WIDTH) / 2;
  return {
    bricks: createBricks(),
    ball: ballOnPaddle(paddleX),
    paddleX,
    launched: false,
    lives: LIVES,
    score: 0,
    level: 1,
    over: false,
  };
}

export function movePaddle(game: BrickGame, delta: number): BrickGame {
  if (game.over) return game;
  const paddleX = clamp(game.paddleX + delta, 0, FIELD_WIDTH - PADDLE_WIDTH);
  return { ...game, paddleX, ball: game.launched ? game.ball : ballOnPaddle(paddleX) };
}

export function launchBall(game: BrickGame): BrickGame {
  if (game.over || game.launched) return game;
  const speed = ballSpeed(game.level);
  const dx = speed * 0.4;
  const dy = -Math.sqrt(speed * speed - dx * dx);
  return { ...game, launched: true, ball: { ...game.ball, dx, dy } };
}

export function stepBrickGame(game: BrickGame): BrickGame {
  if (game.over || !game.launched) return game;

  let { x, y, dx, dy } = game.ball;
  x += dx;
  y += dy;

  if (x - BALL_RADIUS < 0) {
    x = BALL_RADIUS;
    dx = Math.abs(dx);
  } else if (x + BALL_RADIUS > FIELD_WIDTH) {
    x = FIELD_WIDTH - BALL_RADIUS;
    dx = -Math.abs(dx);
  }
  if (y - BALL_RADIUS < 0) {
    y = BALL_RADIUS;
    dy = Math.abs(dy);
  }

  const onPaddle =
    dy > 0 &&
    y + BALL_RADIUS >= PADDLE_Y &&
    y - BALL_RADIUS <= PADDLE_Y + PADDLE_HEIGHT &&
    x >= game.paddleX - BALL_RADIUS &&
    x <= game.paddleX + PADDLE_WIDTH + BALL_RADIUS;
  if (onPaddle) {
    const speed = ballSpeed(game.level);
    const offset = clamp((x - (game.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2), -0.9, 0.9);
    dx = speed * offset;
    dy = -Math.sqrt(speed * speed - dx * dx);
    y = PADDLE_Y - BALL_RADIUS;
  }

  let score = game.score;
  let bricks = game.bricks;
  const hitIndex = bricks.findIndex(
    (brick) =>
      brick.alive &&
      x + BALL_RADIUS > brick.x &&
      x - BALL_RADIUS < brick.x + BRICK_W &&
      y + BALL_RADIUS > brick.y &&
      y - BALL_RADIUS < brick.y + BRICK_H,
  );
  if (hitIndex >= 0) {
    const hit = bricks[hitIndex];
    const previousY = y - dy;
    if (previousY + BALL_RADIUS <= hit.y || previousY - BALL_RADIUS >= hit.y + BRICK_H) dy = -dy;
    else dx = -dx;
    bricks = bricks.map((brick, index) => (index === hitIndex ? { ...brick, alive: false } : brick));
    score += 10 * (BRICK_ROWS - hit.row);
  }

  if (y - BALL_RADIUS > FIELD_HEIGHT) {
    const lives = game.lives - 1;
    return {
      ...game,
      bricks,
      score,
      lives,
      over: lives <= 0,
      launched: false,
      ball: ballOnPaddle(game.paddleX),
    };
  }

  if (bricks.every((brick) => !brick.alive)) {
    return {
      ...game,
      bricks: createBricks(),
      score,
      level: game.level + 1,
      launched: false,
      ball: ballOnPaddle(game.paddleX),
    };
  }

  return { ...game, bricks, score, ball: { x, y, dx, dy } };
}

export function drawBrickGame(ctx: CanvasRenderingContext2D, game: BrickGame): void {
  const background = ctx.createLinearGradient(0, 0, 0, FIELD_HEIGHT);
  background.addColorStop(0, '#0b1626');
  background.addColorStop(1, '#050a12');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

  for (const brick of game.bricks) {
    if (!brick.alive) continue;
    ctx.fillStyle = BRICK_ROW_COLORS[brick.row];
    ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(brick.x, brick.y, BRICK_W, 2);
  }

  const paddle = ctx.createLinearGradient(0, PADDLE_Y, 0, PADDLE_Y + PADDLE_HEIGHT);
  paddle.addColorStop(0, '#f2f5f9');
  paddle.addColorStop(1, '#7d8794');
  ctx.fillStyle = paddle;
  ctx.fillRect(game.paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(game.ball.x, game.ball.y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}
