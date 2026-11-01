export function drawDemoScene(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#0f3d5e');
  sky.addColorStop(1, '#f2b880');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const sunX = width * (0.2 + 0.6 * ((Math.sin(time / 4000) + 1) / 2));
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(sunX, height * 0.45, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2d5a3d';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.7);
  ctx.quadraticCurveTo(width * 0.3, height * 0.5 + Math.sin(time / 1500) * 6, width * 0.6, height * 0.68);
  ctx.quadraticCurveTo(width * 0.85, height * 0.58, width, height * 0.7);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();

  ctx.fillStyle = '#16301f';
  ctx.fillRect(0, height * 0.85, width, height * 0.15);

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '12px sans-serif';
  ctx.fillText('DEMO', 8, height - 8);
}
