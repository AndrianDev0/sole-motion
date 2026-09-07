export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => { const t = clamp01(value); return t * t * (3 - 2 * t); };
/** A short lift, controlled descent, one small settling bounce, then a stable pose. */
export function flightPose(progress: number, pointerX = 0, pointerY = 0) {
  const p = clamp01(progress), turn = smooth(p / .78), settle = smooth((p - .76) / .24);
  const lift = Math.sin(smooth(p / .2) * Math.PI) * .13;
  const descent = smooth((p - .15) / .63);
  const bounce = p > .78 ? Math.sin((p - .78) / .22 * Math.PI) * .065 * (1 - settle) : 0;
  return { x: Math.sin(turn * Math.PI) * .1, y: .22 + lift - descent * .64 + bounce,
    rx: .10 + (1 - turn) * .12 + pointerY * .045, ry: -.48 + turn * .7 + pointerX * .09,
    rz: -.26 * (1 - turn) + pointerX * .025 * (1 - settle), scale: 1 - .035 * descent,
    shadow: .08 + .2 * descent };
}
