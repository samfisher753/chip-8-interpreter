import { KEYS } from "../consts/Consts";

const keysDown: Record<string, boolean> = {};

window.addEventListener('keydown', (event) => {
  keysDown[event.code] = true;
});

window.addEventListener('keyup', (event) => {
  keysDown[event.code] = false;
});

export function isKeyDown(keyValue: number): boolean {
  const key = KEYS.find(k => k.value === keyValue);
  if (!key) {
    console.warn(`Key with value ${keyValue} not found`);
    return false;
  }
  return !!keysDown[key.code];
}

export function getFirstKeyDownValue(): number | null {
  for (const key of KEYS) {
    if (keysDown[key.code]) {
      return key.value;
    }
  }
  return null;
}

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export function beep(frequency = 440, duration = 200, volume = 0.5) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration / 1000);
}
