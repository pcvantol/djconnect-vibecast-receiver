export function chooseEffects({ supported, reduced, highContrast, frames = [] }) {
  if (!supported || reduced || highContrast || frames.length < 30) return 'solid';
  const sorted = frames.slice().sort((a,b) => a-b);
  const p95 = sorted[Math.floor(sorted.length * .95)];
  // Bounded local observation, not a device identity or hardware qualification.
  return p95 <= 22 ? 'glass' : p95 <= 35 ? 'soft' : 'solid';
}
export async function sampleFrames(win = window) {
  const frames = []; let previous;
  for (let i=0; i<45; i++) {
    const time = await new Promise(resolve => win.requestAnimationFrame(resolve));
    if (previous !== undefined) frames.push(time - previous);
    previous = time;
  }
  return frames;
}
